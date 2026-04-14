import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Document } from '@/services/db'
import { useToastStore } from '@/stores/toast'

export const useLibraryStore = defineStore('library', () => {
  const documents = ref<Document[]>([])
  const searchQuery = ref('')
  const filterType = ref<'all' | 'pdf' | 'epub' | 'url'>('all')
  const loading = ref(false)

  const filtered = computed(() => {
    let docs = documents.value
    if (filterType.value !== 'all') {
      docs = docs.filter(d => d.type === filterType.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
      )
    }
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const recentDocuments = computed(() => filtered.value.slice(0, 5))

  async function loadAll() {
    loading.value = true
    try {
      documents.value = await db.documents.toArray()
    } catch {
      useToastStore().add('Could not load your library. Check browser storage settings.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function addDocument(doc: Omit<Document, 'id'>) {
    const id = await db.documents.add(doc as Document)
    const saved = await db.documents.get(id)
    if (saved) documents.value.unshift(saved)
    return id
  }

  async function removeDocument(id: number) {
    await db.documents.delete(id)
    await db.highlights.where('docId').equals(id).delete()
    await db.conversations.where('docId').equals(id).delete()
    await db.infographics.where('docId').equals(id).delete()
    documents.value = documents.value.filter(d => d.id !== id)
  }

  async function getDocument(id: number): Promise<Document | undefined> {
    return db.documents.get(id)
  }

  return {
    documents,
    searchQuery,
    filterType,
    loading,
    filtered,
    recentDocuments,
    loadAll,
    addDocument,
    removeDocument,
    getDocument,
  }
})
