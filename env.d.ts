/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'epubjs' {
  const ePub: any
  export default ePub
}

declare module '@mozilla/readability' {
  export class Readability {
    constructor(doc: Document)
    parse(): { title: string; content: string; textContent: string; excerpt: string } | null
  }
}
