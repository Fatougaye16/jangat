<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  colors: string[]
  selectedText?: string
}>()

const emit = defineEmits<{
  highlight: [color: string, note: string]
  cancel: []
  quickSummarize: [text: string]
  quickFacts: [text: string]
}>()

const selectedColor = ref('')
const note = ref('')

function submit() {
  if (selectedColor.value) {
    emit('highlight', selectedColor.value, note.value)
    note.value = ''
    selectedColor.value = ''
  }
}
</script>

<template>
  <div class="highlight-popover glass-card">
    <div class="color-row">
      <button
        v-for="c in colors"
        :key="c"
        class="color-dot"
        :class="{ active: selectedColor === c }"
        :style="{ background: c }"
        @click="selectedColor = c"
      />
      <div class="quick-divider"></div>
      <button
        class="quick-btn"
        title="Summarize selection"
        @click="$emit('quickSummarize', selectedText || '')"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <path d="M4 5h12M4 8h10M4 11h8M4 14h6" stroke-linecap="round"/>
        </svg>
      </button>
      <button
        class="quick-btn"
        title="Extract key facts"
        @click="$emit('quickFacts', selectedText || '')"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
          <path d="M10 2l2.4 4.8L18 7.6l-4 3.9.9 5.5L10 14.5 5.1 17l.9-5.5-4-3.9 5.6-.8L10 2z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <input
      v-model="note"
      type="text"
      placeholder="Add a note..."
      class="note-input font-mono"
      @keyup.enter="submit"
    />
    <div class="actions">
      <button class="btn-ghost text-xs" @click="$emit('cancel')">Cancel</button>
      <button class="btn-primary text-xs" :disabled="!selectedColor" @click="submit">Save</button>
    </div>
  </div>
</template>

<style scoped>
.highlight-popover {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
}

.color-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-dot.active {
  border-color: var(--ink);
  transform: scale(1.15);
}

.color-dot:hover {
  transform: scale(1.1);
}

.quick-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
}

.quick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  border-color: var(--kente-gold);
  color: var(--kente-gold);
  background: rgba(212, 160, 23, 0.1);
}

.note-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--ink);
  font-size: 0.75rem;
  outline: none;
}
.note-input::placeholder {
  color: var(--ink-faint);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .highlight-popover {
    min-width: 0;
    width: 100%;
    padding: 12px;
  }

  .color-dot {
    width: 32px;
    height: 32px;
  }

  .quick-btn {
    width: 36px;
    height: 36px;
  }

  .note-input {
    font-size: 16px; /* prevents iOS zoom on focus */
  }
}
</style>
