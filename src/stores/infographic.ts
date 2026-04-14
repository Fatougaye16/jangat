import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, type Infographic, type DocumentChapter } from '@/services/db'
import { useToastStore } from '@/stores/toast'
import {
  extractFacts, extractTimeline, extractComparisons, extractTakeaways,
  extractQuotes, extractActions, extractGlossary, generateStudyGuide,
  type ProgressCallback
} from '@/services/ai'

let _cancelBatch = false

export const useInfographicStore = defineStore('infographic', () => {
  const infographics = ref<Infographic[]>([])
  const generating = ref(false)
  const generatingType = ref<string | null>(null)
  const progress = ref<{ current: number; total: number } | null>(null)
  const batchProgress = ref<{ current: number; total: number; chapterTitle: string } | null>(null)

  async function loadForDocument(docId: number) {
    infographics.value = await db.infographics.where('docId').equals(docId).toArray()
  }

  async function generateInfographic(
    docId: number,
    type: Infographic['type'],
    content: string,
    chapterIndex?: number | null,
    model?: string
  ) {
    generating.value = true
    generatingType.value = type
    progress.value = null
    const chIdx = chapterIndex ?? null
    try {
      const options = model ? { model } : undefined
      const onProgress: ProgressCallback = (current, total) => {
        progress.value = { current, total }
      }
      let data: any

      switch (type) {
        case 'facts':
          data = await extractFacts(content, options, onProgress)
          break
        case 'timeline':
          data = await extractTimeline(content, options, onProgress)
          break
        case 'comparison':
          data = await extractComparisons(content, options, onProgress)
          break
        case 'takeaways':
          data = await extractTakeaways(content, options, onProgress)
          break
        case 'quotes':
          data = await extractQuotes(content, options, onProgress)
          break
        case 'actions':
          data = await extractActions(content, options, onProgress)
          break
        case 'glossary':
          data = await extractGlossary(content, options, onProgress)
          break
        case 'study':
          data = await generateStudyGuide(content, options, onProgress)
          break
      }

      // Remove old one of same type + scope for this doc
      const existing = infographics.value.find(
        i => i.docId === docId && i.type === type && (i.chapterIndex ?? null) === chIdx
      )
      if (existing?.id) {
        await db.infographics.delete(existing.id)
      }

      const infographic: Omit<Infographic, 'id'> = {
        docId,
        type,
        data,
        chapterIndex: chIdx,
        createdAt: new Date(),
      }

      const id = await db.infographics.add(infographic as Infographic)
      const saved = await db.infographics.get(id)
      if (saved) {
        infographics.value = infographics.value.filter(
          i => !(i.docId === docId && i.type === type && (i.chapterIndex ?? null) === chIdx)
        )
        infographics.value.push(saved)
      }

      return saved
    } catch (err) {
      useToastStore().add(`Failed to generate ${type}. Make sure Ollama is running.`, 'error')
    } finally {
      generating.value = false
      generatingType.value = null
      progress.value = null
    }
  }

  async function generateAllChapters(
    docId: number,
    type: Infographic['type'],
    chapters: DocumentChapter[],
    model?: string
  ) {
    _cancelBatch = false
    for (let i = 0; i < chapters.length; i++) {
      if (_cancelBatch) break
      batchProgress.value = { current: i + 1, total: chapters.length, chapterTitle: chapters[i].title }
      await generateInfographic(docId, type, chapters[i].content, i, model)
    }
    batchProgress.value = null
  }

  function cancelBatchGeneration() {
    _cancelBatch = true
  }

  function getByType(type: Infographic['type'], chapterIndex?: number | null) {
    const chIdx = chapterIndex ?? null
    return infographics.value.find(
      i => i.type === type && (i.chapterIndex ?? null) === chIdx
    )
  }

  function hasDataForScope(chapterIndex: number | null) {
    return infographics.value.some(i => (i.chapterIndex ?? null) === chapterIndex)
  }

  return {
    infographics,
    generating,
    generatingType,
    progress,
    batchProgress,
    loadForDocument,
    generateInfographic,
    generateAllChapters,
    cancelBatchGeneration,
    getByType,
    hasDataForScope,
  }
})
