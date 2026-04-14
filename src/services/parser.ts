import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export async function parsePDF(file: File): Promise<{ title: string; content: string }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const items = textContent.items as any[]

    if (items.length === 0) {
      pages.push('')
      continue
    }

    // Use y-coordinate changes to detect line breaks.
    // PDF space has y increasing upward, so consecutive lines have different y values.
    let pageText = items[0].str
    let lastY: number = items[0].transform?.[5] ?? 0

    for (let j = 1; j < items.length; j++) {
      const item = items[j]
      const y: number = item.transform?.[5] ?? lastY
      if (Math.abs(y - lastY) > 2) {
        pageText += '\n'
      } else if (item.str && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
        pageText += ' '
      }
      pageText += item.str
      lastY = y
    }
    pages.push(pageText)
  }

  const title = file.name.replace(/\.pdf$/i, '')
  return { title, content: pages.join('\n\n') }
}

// Walk a DOM element and preserve block-level newlines so chapter headings
// (h1–h6, p, div, li, etc.) appear on their own lines for pattern matching.
function extractTextWithNewlines(element: Element): string {
  const BLOCK = new Set(['p','div','h1','h2','h3','h4','h5','h6','li','br','tr','td','section','article','header','footer','blockquote'])
  let text = ''
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()
      const inner = extractTextWithNewlines(el)
      text += BLOCK.has(tag) ? '\n' + inner.trim() + '\n' : inner
    }
  }
  return text
}

export async function parseEPUB(file: File): Promise<{ title: string; content: string }> {
  const ePub = (await import('epubjs')).default
  const arrayBuffer = await file.arrayBuffer()
  const book = ePub(arrayBuffer)
  await book.ready

  const title = book.packaging?.metadata?.title || file.name.replace(/\.epub$/i, '')

  const spine = book.spine as any
  const sections: string[] = []

  for (const section of spine.items || spine) {
    try {
      const doc = await section.load(book.load.bind(book))
      if (doc && doc.body) {
        sections.push(extractTextWithNewlines(doc.body).trim())
      }
    } catch {
      // Skip unloadable sections
    }
  }

  return { title, content: sections.join('\n\n') }
}

export async function parseURL(url: string): Promise<{ title: string; content: string }> {
  // Use a CORS proxy approach — in dev, Vite proxy handles this
  // In production, you'd need a proxy service
  const response = await fetch(url)
  const html = await response.text()

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const { Readability } = await import('@mozilla/readability')
  const reader = new Readability(doc)
  const article = reader.parse()

  if (!article) {
    throw new Error('Could not extract article content from this URL')
  }

  // Strip HTML tags from content to get plain text
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = article.content
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  return {
    title: article.title || url,
    content: textContent.trim(),
  }
}

export function detectFileType(file: File): 'pdf' | 'epub' | null {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'epub') return 'epub'
  return null
}

export interface Chapter {
  title: string
  content: string
  startIndex: number
}

export function detectChapters(text: string): Chapter[] {
  // Regex patterns for common chapter headings
  const patterns = [
    /^(chapter\s+\d+[^\n]*)/gim,
    /^(chapter\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)[^\n]*)/gim,
    /^(part\s+(?:\d+|[ivxlc]+)[^\n]*)/gim,
    /^(section\s+\d+[^\n]*)/gim,
    /^(\d+\.\s+[A-Z][^\n]{3,80})$/gm,
    /^([A-Z][A-Z\s]{5,80})$/gm,  // ALL CAPS lines (min 5 chars)
  ]

  interface Match { title: string; index: number }
  const matches: Match[] = []
  const usedIndices = new Set<number>()

  for (const pattern of patterns) {
    let m: RegExpExecArray | null
    while ((m = pattern.exec(text)) !== null) {
      // Avoid duplicates at the same position
      if (!usedIndices.has(m.index)) {
        const title = m[1].trim()
        // Filter out ALL CAPS lines that are too short or look like noise
        if (title.length >= 5 && title.length <= 120) {
          matches.push({ title, index: m.index })
          usedIndices.add(m.index)
        }
      }
    }
  }

  if (matches.length < 2) return []

  // Sort by position in text
  matches.sort((a, b) => a.index - b.index)

  // Build chapters
  const chapters: Chapter[] = []
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    chapters.push({
      title: matches[i].title,
      content: text.slice(start, end).trim(),
      startIndex: start,
    })
  }

  return chapters
}
