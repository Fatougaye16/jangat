import Dexie, { type EntityTable } from 'dexie'

export interface DocumentChapter {
  title: string
  content: string
  startIndex: number
}

export interface Document {
  id?: number
  title: string
  type: 'pdf' | 'epub' | 'url'
  content: string
  source: string
  createdAt: Date
  thumbnail?: string
  chapters?: DocumentChapter[]
}

export interface Highlight {
  id?: number
  docId: number
  text: string
  note: string
  color: string
  position: number
  createdAt: Date
}

export interface Conversation {
  id?: number
  docId: number
  messages: ChatMessage[]
  createdAt: Date
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Infographic {
  id?: number
  docId: number
  type: 'facts' | 'timeline' | 'comparison' | 'takeaways' | 'quotes' | 'actions' | 'glossary' | 'study'
  data: any
  chapterIndex?: number | null
  createdAt: Date
}

class JangatDB extends Dexie {
  documents!: EntityTable<Document, 'id'>
  highlights!: EntityTable<Highlight, 'id'>
  conversations!: EntityTable<Conversation, 'id'>
  infographics!: EntityTable<Infographic, 'id'>

  constructor() {
    super('jangat')
    this.version(1).stores({
      documents: '++id, title, type, createdAt',
      highlights: '++id, docId, createdAt',
      conversations: '++id, docId, createdAt',
      infographics: '++id, docId, type, createdAt',
    })
    this.version(2).stores({
      documents: '++id, title, type, createdAt',
      highlights: '++id, docId, createdAt',
      conversations: '++id, docId, createdAt',
      infographics: '++id, docId, type, createdAt',
    })
    this.version(3).stores({
      documents: '++id, title, type, createdAt',
      highlights: '++id, docId, createdAt',
      conversations: '++id, docId, createdAt',
      infographics: '++id, docId, type, chapterIndex, createdAt',
    })
  }
}

export const db = new JangatDB()
