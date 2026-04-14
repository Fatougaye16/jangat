const OLLAMA_LOCAL = 'http://localhost:11434'
const OLLAMA_PROXY = '/ollama-api'

let apiKey = import.meta.env.VITE_OLLAMA_API_KEY || ''

function getBase(): string {
  return apiKey ? OLLAMA_PROXY : OLLAMA_LOCAL
}

export function setApiKey(key: string) {
  apiKey = key
}

export function getApiKey(): string {
  return apiKey
}

interface GenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ProgressCallback {
  (current: number, total: number): void
}

// --- Text chunking for long documents ---

const CHUNK_SIZE = 10000
const CHUNK_OVERLAP = 500

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text]

  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    let end = start + CHUNK_SIZE
    // Try to break at a paragraph or sentence boundary
    if (end < text.length) {
      const para = text.lastIndexOf('\n\n', end)
      if (para > start + CHUNK_SIZE * 0.7) {
        end = para
      } else {
        const sentence = text.lastIndexOf('. ', end)
        if (sentence > start + CHUNK_SIZE * 0.7) {
          end = sentence + 1
        }
      }
    }
    chunks.push(text.slice(start, end))
    start = end - CHUNK_OVERLAP
    if (start < 0) start = 0
    if (end >= text.length) break
  }
  return chunks
}

async function generateChunked(
  text: string,
  promptFn: (chunk: string) => string,
  system: string,
  options: GenerateOptions = {},
  onProgress?: ProgressCallback,
): Promise<string[]> {
  const chunks = chunkText(text)
  const results: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length)
    const result = await generate(promptFn(chunks[i]), system, options)
    results.push(result)
  }
  return results
}

function mergeJsonArrays(results: string[]): any[] {
  const all: any[] = []
  for (const r of results) {
    try {
      const match = r.match(/\[[\s\S]*\]/)
      if (match) all.push(...JSON.parse(match[0]))
    } catch { /* skip */ }
  }
  return all
}

async function* streamGenerate(
  prompt: string,
  system: string,
  options: GenerateOptions = {}
): AsyncGenerator<string, void, unknown> {
  const { model = 'granite-3.2-dense', temperature = 0.7 } = options

  const response = await fetch(`${getBase()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      system,
      stream: true,
      options: { temperature },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.response) yield json.response
      } catch {
        // skip malformed lines
      }
    }
  }
}

async function generate(
  prompt: string,
  system: string,
  options: GenerateOptions = {}
): Promise<string> {
  let result = ''
  for await (const chunk of streamGenerate(prompt, system, options)) {
    result += chunk
  }
  return result
}

export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${getBase()}/api/tags`)
    return res.ok
  } catch {
    return false
  }
}

export async function listModels(): Promise<string[]> {
  try {
    const res = await fetch(`${getBase()}/api/tags`)
    const data = await res.json()
    return (data.models || []).map((m: any) => m.name)
  } catch {
    return []
  }
}

// --- Core AI features ---

export function askQuestion(context: string, question: string, options?: GenerateOptions) {
  const truncated = context.slice(0, 12000)
  return streamGenerate(
    `Based on the following text, answer this question: "${question}"\n\n---\nTEXT:\n${truncated}\n---\n\nAnswer concisely and accurately based only on the provided text.`,
    'You are Jàngat, a knowledgeable and thoughtful reading assistant. You help users understand texts deeply. Answer based only on the provided text. If the answer is not in the text, say so.',
    options
  )
}

export async function* summarize(text: string, options?: GenerateOptions, onProgress?: ProgressCallback) {
  const chunks = chunkText(text)

  if (chunks.length === 1) {
    yield* streamGenerate(
      `Summarize the following text. Provide a clear, structured summary with key points:\n\n${chunks[0]}`,
      'You are Jàngat, a reading assistant. Create clear, well-organized summaries. Use bullet points for key ideas. Keep it concise but comprehensive.',
      options
    )
    return
  }

  // Multi-chunk: summarize each, then synthesize
  const partialSummaries: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length)
    const partial = await generate(
      `Summarize this section of a larger text. Be concise but capture all key points:\n\n${chunks[i]}`,
      'You are Jàngat, a reading assistant. Summarize concisely with bullet points.',
      options
    )
    partialSummaries.push(partial)
  }

  onProgress?.(chunks.length, chunks.length)
  yield* streamGenerate(
    `Below are summaries of different sections of a document. Create a single comprehensive, well-organized summary that combines all sections. Use clear headings and bullet points:\n\n${partialSummaries.map((s, i) => `--- Section ${i + 1} ---\n${s}`).join('\n\n')}`,
    'You are Jàngat, a reading assistant. Create clear, well-organized summaries. Combine the section summaries into one cohesive summary. Use headings and bullet points.',
    options
  )
}

export async function extractFacts(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract 4-6 key facts, statistics, or notable claims from this text. Return as JSON array with objects having "fact" (string) and "category" (string like "statistic", "claim", "definition", "date") fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a data extraction assistant. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractTimeline(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract chronological events, milestones, or sequential steps from this text. Return as JSON array with objects having "date" (string, can be approximate), "event" (string), "detail" (short string) fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a data extraction assistant. Return only valid JSON arrays. If no clear timeline exists, extract the logical sequence of ideas.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractComparisons(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Identify 2-4 comparisons, contrasts, pros/cons, or opposing ideas in this text. Return as JSON array of objects with "itemA" (string), "itemB" (string), "aspectA" (string description), "aspectB" (string description), "aspect" (what is being compared) fields. Only valid JSON.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a data extraction assistant. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractTakeaways(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract the 5-7 most important takeaways from this text. Return as JSON array of objects with "takeaway" (concise string), "explanation" (1 sentence elaboration) fields. Only valid JSON.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a data extraction assistant. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractConcepts(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<{ nodes: any[]; edges: any[] }> {
  const chunks = chunkText(text)
  const allNodes: any[] = []
  const allEdges: any[] = []

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length)
    const result = await generate(
      `Extract 6-10 key concepts from this text and their relationships. Return as JSON with "nodes" (array of {id: string, label: string, description: string}) and "edges" (array of {source: string, target: string, label: string}). Only valid JSON.\n\n${chunks[i]}`,
      'You are a concept extraction assistant. Return only valid JSON.',
      { ...options, temperature: 0.3 }
    )
    try {
      const match = result.match(/\{[\s\S]*\}/)
      const parsed = match ? JSON.parse(match[0]) : { nodes: [], edges: [] }
      allNodes.push(...(parsed.nodes || []))
      allEdges.push(...(parsed.edges || []))
    } catch { /* skip */ }
  }

  // Deduplicate nodes by label
  const seenLabels = new Set<string>()
  const uniqueNodes = allNodes.filter(n => {
    const key = n.label?.toLowerCase()
    if (seenLabels.has(key)) return false
    seenLabels.add(key)
    return true
  })
  const nodeIds = new Set(uniqueNodes.map(n => n.id))
  const uniqueEdges = allEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))

  return { nodes: uniqueNodes, edges: uniqueEdges }
}

// --- New extraction features ---

export async function extractQuotes(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract 4-6 of the most significant, impactful, or memorable quotes/passages from this text. Return as JSON array with objects having "quote" (the exact text), "context" (1 sentence: why this quote matters), "theme" (one of: "motivation", "insight", "warning", "principle", "technique", "wisdom") fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a literary analysis assistant. Extract exact quotes from the text. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractActions(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract actionable items, exercises, practices, habits, or steps the author recommends in this text. Return as JSON array with objects having "action" (what to do, concise), "category" (one of: "exercise", "habit", "mindset-shift", "practice", "technique", "step"), "difficulty" (one of: "easy", "medium", "advanced") fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are an action extraction assistant focused on self-improvement content. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function extractGlossary(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Extract key terms, definitions, acronyms, and technical jargon from this text. Return as JSON array with objects having "term" (string), "definition" (clear 1-2 sentence definition), "category" (one of: "concept", "acronym", "technique", "framework", "theory", "tool") fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are a glossary extraction assistant. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  // Deduplicate by term
  const seen = new Set<string>()
  return mergeJsonArrays(results).filter(item => {
    const key = item.term?.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function generateStudyGuide(text: string, options?: GenerateOptions, onProgress?: ProgressCallback): Promise<any[]> {
  const prompt = (chunk: string) =>
    `Generate 4-6 study questions based on this text to test understanding. Return as JSON array with objects having "question" (string), "answer" (string, 1-3 sentences), "type" (one of: "recall", "comprehension", "application", "analysis"), "difficulty" (1, 2, or 3) fields. Only valid JSON, no other text.\n\n${chunk}`
  const results = await generateChunked(text, prompt, 'You are an educational assessment assistant. Create questions that test real understanding, not just memorization. Return only valid JSON arrays.', { ...options, temperature: 0.3 }, onProgress)
  return mergeJsonArrays(results)
}

export async function summarizeChapter(chapterContent: string, chapterTitle: string, options?: GenerateOptions): Promise<string> {
  return generate(
    `Summarize this chapter titled "${chapterTitle}" in 2-3 sentences:\n\n${chapterContent.slice(0, 12000)}`,
    'You are Jàngat, a reading assistant. Provide a brief but complete chapter summary.',
    options
  )
}

export async function generateBookOverview(chapters: { title: string; content: string }[], options?: GenerateOptions, onProgress?: ProgressCallback): Promise<string[]> {
  const summaries: string[] = []
  for (let i = 0; i < chapters.length; i++) {
    onProgress?.(i + 1, chapters.length)
    const summary = await summarizeChapter(chapters[i].content, chapters[i].title, options)
    summaries.push(summary)
  }
  return summaries
}
