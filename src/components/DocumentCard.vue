<script setup lang="ts">
import type { Document } from '@/services/db'

defineProps<{
  doc: Document
}>()

defineEmits<{
  click: []
  remove: []
}>()

function getTypeLabel(type: string) {
  return type.toUpperCase()
}

function getTypeColor(type: string) {
  switch (type) {
    case 'pdf': return 'var(--terra)'
    case 'epub': return 'var(--adire-light)'
    case 'url': return 'var(--baobab-light)'
    default: return 'var(--ink-muted)'
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getPreview(content: string) {
  return content.slice(0, 120).trim() + (content.length > 120 ? '...' : '')
}
</script>

<template>
  <div class="doc-card glass-card" @click="$emit('click')">
    <!-- Kente stripe accent -->
    <div class="card-accent" :style="{ background: getTypeColor(doc.type) }"></div>

    <div class="card-body">
      <div class="card-header">
        <span class="type-badge font-mono" :style="{ color: getTypeColor(doc.type), borderColor: getTypeColor(doc.type) }">
          {{ getTypeLabel(doc.type) }}
        </span>
        <button class="remove-btn" @click.stop="$emit('remove')" title="Remove">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
            <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      </div>

      <h3 class="card-title font-display">{{ doc.title }}</h3>
      <p class="card-preview text-ink-muted">{{ getPreview(doc.content) }}</p>

      <div class="card-footer">
        <span class="card-date font-mono text-ink-faint">{{ formatDate(doc.createdAt) }}</span>
      </div>
    </div>

    <!-- Decorative Adinkra pattern corner -->
    <div class="card-pattern"></div>
  </div>
</template>

<style scoped>
.doc-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
}

.card-accent {
  width: 4px;
  flex-shrink: 0;
  border-radius: 20px 0 0 20px;
}

.card-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-badge {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 6px;
  opacity: 0.8;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--ink-faint);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 6px;
}

.doc-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--terra);
  background: rgba(199, 91, 57, 0.1);
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.3;
}

.card-preview {
  font-size: 0.8rem;
  line-height: 1.5;
  flex: 1;
}

.card-footer {
  margin-top: 4px;
}

.card-date {
  font-size: 0.7rem;
}

/* Decorative corner pattern */
.card-pattern {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 48px;
  height: 48px;
  opacity: 0.04;
  background: repeating-conic-gradient(
    var(--kente-gold) 0% 25%,
    transparent 0% 50%
  );
  background-size: 8px 8px;
  border-radius: 50%;
  transition: opacity 0.3s;
}

.doc-card:hover .card-pattern {
  opacity: 0.08;
}
</style>
