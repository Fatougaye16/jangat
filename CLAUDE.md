cl# Jàngat

A document reader and knowledge tool. Upload PDFs/EPUBs, generate AI-powered infographics, mind maps, and insights via a local Ollama model. PWA-enabled.

## Tech Stack

- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build**: Vite 5
- **Styling**: UnoCSS (utility-first)
- **State**: Pinia
- **Routing**: Vue Router 4
- **Database**: Dexie (IndexedDB)
- **AI**: Ollama (local LLM via HTTP proxy)
- **PWA**: vite-plugin-pwa

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |

No test framework configured. No formatter configured.

## Architecture

```
src/
├── views/          # Page-level components (HomeView, LibraryView, ReaderView)
├── components/     # Reusable UI components
│   └── infographics/  # Infographic types (Timeline, Glossary, MindMap, etc.)
├── stores/         # Pinia stores (library, settings, reader, infographic)
├── services/       # Business logic (ai.ts, parser.ts, db.ts)
├── router/         # Vue Router config
└── assets/         # Icons (Adinkra SVGs), global styles
```

## Key Patterns

- `@/` alias maps to `src/`
- Ollama API proxied via `/ollama-api` in dev (configured in vite.config.ts)
- Documents stored in IndexedDB via Dexie (src/services/db.ts)
- AI service in src/services/ai.ts uses the Ollama client
- Infographic components live in src/components/infographics/
