# Jàngat — Knowledge, Illuminated

> *"Jàng nga, xam nga"* — You have read, you have known (Wolof proverb)

Jàngat is a document reader and knowledge tool with an African-inspired design. Upload PDFs, EPUBs, or web articles and generate AI-powered infographics, mind maps, summaries, and insights — all powered by a local Ollama model. Installable as a PWA.

## Features

### Document Management
- **Upload & parse** PDF and EPUB files directly in the browser
- **Import web articles** by URL (extracted via Mozilla Readability)
- **Library view** with search, type filtering (PDF / EPUB / URL), and document cards
- **Offline storage** — all documents persist locally in IndexedDB via Dexie

### Reader
- **Chapter detection** — automatic chapter/section parsing with navigation
- **Text highlighting** — select text and save highlights with color coding and notes
- **AI Summarization** — generate streaming summaries of full documents or individual chapters
- **Quick Facts** — extract key facts from any selected text passage

### AI Chat
- **Contextual Q&A** — ask questions about your document and get answers grounded in the text
- **Streaming responses** — real-time token-by-token output from your local LLM
- **Markdown rendering** — responses are formatted with full Markdown support

### Infographics (8 types)
Generate visual knowledge cards from your documents, per-chapter or for the full text:

| Type | Description |
|------|-------------|
| **Key Facts** | Important facts, statistics, and claims with categories |
| **Timeline** | Chronological events or logical sequence of ideas |
| **Comparison Chart** | Contrasts, pros/cons, and opposing perspectives |
| **Takeaways Poster** | Top insights with brief explanations |
| **Quotes Gallery** | Significant passages with context and themes |
| **Action Plan** | Actionable steps, habits, and exercises from the text |
| **Glossary** | Key terms, definitions, and technical jargon |
| **Study Guide** | Comprehension questions with answers and difficulty levels |

- **Batch generation** — generate a chosen infographic type across all chapters at once
- **Export as image** — download any infographic as a PNG via html2canvas

### Mind Map
- **Concept extraction** — automatically identifies key concepts and their relationships
- **Interactive visualization** — node-based graph with selectable concept details

### Progressive Web App
- Installable on desktop and mobile
- Offline-capable with Workbox service worker caching
- Standalone display mode with custom theme color

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Vue 3](https://vuejs.org/) (Composition API) + TypeScript |
| Build | [Vite 5](https://vitejs.dev/) |
| Styling | [UnoCSS](https://unocss.dev/) (utility-first CSS) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router 4](https://router.vuejs.org/) |
| Database | [Dexie](https://dexie.org/) (IndexedDB wrapper) |
| AI | [Ollama](https://ollama.com/) (local LLM via HTTP) |
| PDF Parsing | [PDF.js](https://mozilla.github.io/pdf.js/) |
| EPUB Parsing | [EPUB.js](https://github.com/futurepress/epub.js) |
| URL Parsing | [@mozilla/readability](https://github.com/mozilla/readability) |
| Markdown | [markdown-it](https://github.com/markdown-it/markdown-it) |
| Export | [html2canvas](https://html2canvas.hertzen.com/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) |

## Prerequisites

- **Node.js** 18+
- **Ollama** running locally on port `11434` (or a remote Ollama instance with an API key)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fatougaye16/jangat.git
   cd jangat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional, for remote Ollama)

   Create a `.env` file in the project root:
   ```
   VITE_OLLAMA_API_KEY=your_api_key_here
   ```
   If running Ollama locally on the default port, no configuration is needed.

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. **Open in browser** — navigate to the URL shown in the terminal (default: `http://localhost:5173`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── views/                  # Page-level components
│   ├── HomeView.vue        #   Landing page with upload zone
│   ├── LibraryView.vue     #   Document library with search & filters
│   └── ReaderView.vue      #   Reader with highlights, chat, summaries
├── components/             # Reusable UI components
│   ├── AdinkraIcon.vue     #   SVG icon system (Adinkra-inspired)
│   ├── AiChat.vue          #   Document Q&A chat interface
│   ├── DocumentCard.vue    #   Library document card
│   ├── HighlightPopover.vue#   Text selection highlight tool
│   ├── InfographicsPanel.vue#  Infographic generation & display
│   ├── MindMapPanel.vue    #   Concept mind map visualization
│   ├── ToastContainer.vue  #   Notification toasts
│   ├── UploadZone.vue      #   Drag-and-drop file / URL upload
│   └── infographics/       #   Infographic type components
│       ├── ActionPlan.vue
│       ├── ComparisonChart.vue
│       ├── FactCards.vue
│       ├── Glossary.vue
│       ├── QuotesGallery.vue
│       ├── StudyGuide.vue
│       ├── TakeawaysPoster.vue
│       └── Timeline.vue
├── stores/                 # Pinia state management
│   ├── library.ts          #   Document CRUD & filtering
│   ├── reader.ts           #   Active document & chapter state
│   ├── infographic.ts      #   Infographic generation & caching
│   ├── settings.ts         #   Model selection & Ollama connection
│   └── toast.ts            #   Notification state
├── services/               # Business logic
│   ├── ai.ts               #   Ollama API: chat, summarize, extract
│   ├── db.ts               #   Dexie/IndexedDB schema & operations
│   └── parser.ts           #   PDF, EPUB, URL parsing & chapter detection
├── router/                 # Vue Router configuration
│   └── index.ts
└── assets/
    ├── icons/              # Adinkra symbol SVGs
    └── styles/
        └── theme.css       # CSS custom properties & global styles
```

## Design

Jàngat features an African-inspired visual identity:

- **Adinkra icons** — custom SVG icon system inspired by Akan symbols of wisdom
- **Kente palette** — gold, terracotta, adire blue, and baobab green on a deep indigo background (`#0d0d2b`)
- **Typography** — Playfair Display (headings), Inter (body), JetBrains Mono (UI labels)
- **Kente stripe** — decorative gradient dividers throughout the interface

## License

This project is private.