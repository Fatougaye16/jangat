import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Document, type Highlight, type Conversation, type ChatMessage, type DocumentChapter } from '@/services/db'
import { detectChapters } from '@/services/parser'

export const useReaderStore = defineStore('reader', () => {
  const currentDoc = ref<Document | null>(null)
  const highlights = ref<Highlight[]>([])
  const conversation = ref<Conversation | null>(null)
  const isAiPanelOpen = ref(true)
  const currentChapterIndex = ref<number | null>(null)

  const chapters = computed<DocumentChapter[]>(() => {
    return currentDoc.value?.chapters || []
  })

  const currentChapter = computed<DocumentChapter | null>(() => {
    if (currentChapterIndex.value === null || !chapters.value.length) return null
    return chapters.value[currentChapterIndex.value] || null
  })

  const activeContent = computed<string>(() => {
    if (currentChapter.value) return currentChapter.value.content
    return currentDoc.value?.content || ''
  })

  async function loadDocument(id: number) {
    currentDoc.value = (await db.documents.get(id)) || null
    currentChapterIndex.value = null
    if (currentDoc.value) {
      highlights.value = await db.highlights.where('docId').equals(id).toArray()
      const convos = await db.conversations.where('docId').equals(id).toArray()
      conversation.value = convos[0] || null

      // Detect chapters if not already stored
      if (!currentDoc.value.chapters || currentDoc.value.chapters.length === 0) {
        const detected = detectChapters(currentDoc.value.content)
        if (detected.length > 0) {
          currentDoc.value.chapters = detected
          await db.documents.update(id, { chapters: detected })
        }
      }
    }
  }

  function selectChapter(index: number | null) {
    currentChapterIndex.value = index
  }

  async function addHighlight(highlight: Omit<Highlight, 'id'>) {
    const id = await db.highlights.add(highlight as Highlight)
    const saved = await db.highlights.get(id)
    if (saved) highlights.value.push(saved)
    return id
  }

  async function removeHighlight(id: number) {
    await db.highlights.delete(id)
    highlights.value = highlights.value.filter(h => h.id !== id)
  }

  async function addMessage(message: ChatMessage) {
    if (!currentDoc.value?.id) return

    if (!conversation.value) {
      const id = await db.conversations.add({
        docId: currentDoc.value.id,
        messages: [message],
        createdAt: new Date(),
      } as Conversation)
      conversation.value = (await db.conversations.get(id)) || null
    } else {
      conversation.value.messages.push(message)
      await db.conversations.update(conversation.value.id!, {
        messages: conversation.value.messages,
      })
    }
  }

  function clear() {
    currentDoc.value = null
    highlights.value = []
    conversation.value = null
  }

  return {
    currentDoc,
    highlights,
    conversation,
    isAiPanelOpen,
    chapters,
    currentChapter,
    currentChapterIndex,
    activeContent,
    loadDocument,
    selectChapter,
    addHighlight,
    removeHighlight,
    addMessage,
    clear,
  }
})
