# Jàngat — Project Context

## Tech Stack
- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build**: Vite 5 (`npm run dev`, `npm run build`, `npm run preview`)
- **Styling**: UnoCSS (utility-first) with CSS custom properties in `src/assets/styles/theme.css`
- **State**: Pinia stores in `src/stores/`
- **Routing**: Vue Router 4 (`src/router/index.ts`)
- **Database**: Dexie (IndexedDB) — schema in `src/services/db.ts`
- **AI**: Ollama (local LLM) — service in `src/services/ai.ts`, proxied via `/ollama-api` in dev
- **PWA**: vite-plugin-pwa with Workbox caching

## Architecture
```
src/
├── views/          # Page components (HomeView, LibraryView, ReaderView)
├── components/     # Reusable UI + infographics/ subfolder (8 types)
├── stores/         # Pinia: library, reader, infographic, settings, toast
├── services/       # ai.ts (Ollama), db.ts (Dexie), parser.ts (PDF/EPUB/URL)
├── router/         # Vue Router config
└── assets/         # Adinkra SVG icons, theme.css
```

## Conventions
- `@/` alias → `src/`
- Vue 3 `<script setup lang="ts">` for all components
- Pinia stores use Composition API (`defineStore` with `setup` function)
- No test framework — validate with `npm run build` (vue-tsc + vite build)
- No formatter — match existing code style in surrounding files
- Environment variables prefixed with `VITE_` (e.g. `VITE_OLLAMA_API_KEY`)
- Never hardcode secrets — use `.env` (gitignored)

## Design System
- African-inspired: Adinkra icons, Kente color palette (gold, terracotta, adire blue, baobab green)
- Dark theme: deep indigo background (`#0d0d2b`)
- Fonts: Playfair Display (headings), Inter (body), JetBrains Mono (UI labels)
- CSS classes: `font-display`, `font-body`, `font-mono`, `text-gradient`, `kente-stripe`

## Key Files
- `vite.config.ts` — Ollama proxy, PWA manifest, UnoCSS plugin
- `src/services/ai.ts` — all AI extraction functions (facts, timeline, glossary, etc.)
- `src/services/db.ts` — Dexie schema (documents, highlights, conversations, infographics)
- `src/services/parser.ts` — PDF.js, EPUB.js, Readability parsers + chapter detection
