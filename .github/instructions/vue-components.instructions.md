---
description: "Vue 3 component conventions for Jàngat — Composition API, UnoCSS, Adinkra design system, Pinia store usage"
applyTo: "**/*.vue"
---

# Vue Component Conventions

- Use `<script setup lang="ts">` — no Options API
- Import stores with `use{Name}Store()` from `@/stores/`
- Import components with `@/` alias
- Use `ref()`, `computed()`, `watch()` for reactivity — no `reactive()` for top-level state
- Emit types: `defineEmits<{ eventName: [payload: Type] }>()`
- Props types: `defineProps<{ prop: Type }>()`

## Styling

- Prefer UnoCSS utility classes in templates
- Use `<style scoped>` for component-specific styles
- Use CSS custom properties from `theme.css` (e.g. `var(--kente-gold)`, `var(--surface)`)
- Font classes: `font-display` (headings), `font-body` (text), `font-mono` (labels)
- Use `text-gradient` class for highlighted headings
- Use `kente-stripe` class for decorative dividers

## Error Handling

- Use `useToastStore().add(message, type)` for user-facing errors
- Wrap async operations in try/catch
- Show loading states with `ref<boolean>` flags
