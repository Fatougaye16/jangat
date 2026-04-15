---
description: "Service layer conventions for Jàngat — Ollama AI integration, Dexie database operations, document parsing patterns"
applyTo: "src/services/**"
---

# Service Layer Conventions

## AI Service (ai.ts)

- Base URL switches between local Ollama (`localhost:11434`) and proxied (`/ollama-api`) based on API key presence
- Use `generateChunked()` for long documents — it splits text, processes chunks, and merges results
- Extraction functions return parsed JSON arrays via `mergeJsonArrays()`
- Streaming functions use `async function*` generators yielding string chunks
- Use `ProgressCallback` for multi-chunk operations to report progress
- Default model: `granite-3.2-dense`, temperature: `0.3` for extraction, `0.7` for generation
- System prompts: always identify as "Jàngat, a reading assistant"

## Database (db.ts)

- Dexie schema with auto-increment `++id` primary keys
- Tables: `documents`, `highlights`, `conversations`, `infographics`
- Use compound indexes for common queries (e.g. `docId` + `type`)
- Version migrations: increment version number, keep all previous stores

## Parser (parser.ts)

- `parsePDF()` — uses PDF.js, extracts text with y-coordinate line break detection
- `parseEPUB()` — uses EPUB.js, walks DOM to extract text preserving block structure
- `parseURL()` — uses Readability, strips HTML to plain text
- `detectChapters()` — regex-based heading detection on extracted text
- All parsers return `{ title: string; content: string }`
