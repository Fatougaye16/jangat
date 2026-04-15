<script setup lang="ts">
import { ref } from 'vue'
import AdinkraIcon from './AdinkraIcon.vue'
import { useToastStore } from '@/stores/toast'

const emit = defineEmits<{
  fileSelected: [file: File]
  urlSubmitted: [url: string]
}>()

const toastStore = useToastStore()
const isDragging = ref(false)
const urlInput = ref('')
const mode = ref<'file' | 'url'>('file')

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) emit('fileSelected', file)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('fileSelected', file)
  input.value = ''
}

function submitUrl() {
  const url = urlInput.value.trim()
  if (!url) return
  try {
    new URL(url) // validate
    emit('urlSubmitted', url)
    urlInput.value = ''
  } catch {
    toastStore.add('Please enter a valid URL starting with http:// or https://', 'warning')
  }
}
</script>

<template>
  <div class="upload-zone">
    <!-- Mode toggle -->
    <div class="mode-toggle">
      <button
        class="toggle-btn font-mono"
        :class="{ active: mode === 'file' }"
        @click="mode = 'file'"
      >
        <AdinkraIcon name="upload" size="1em" />
        Upload File
      </button>
      <button
        class="toggle-btn font-mono"
        :class="{ active: mode === 'url' }"
        @click="mode = 'url'"
      >
        <AdinkraIcon name="search" size="1em" />
        Paste URL
      </button>
    </div>

    <!-- File drop zone -->
    <div
      v-if="mode === 'file'"
      class="drop-area"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="($refs.fileInput as HTMLInputElement).click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.epub"
        class="hidden"
        @change="onFileInput"
      />
      <div class="drop-content">
        <div class="drop-icon">
          <AdinkraIcon name="upload" size="2.5em" />
        </div>
        <p class="font-display text-lg">Drop your book here</p>
        <p class="font-mono text-xs text-ink-muted mt-1">PDF or EPUB files supported</p>
      </div>
    </div>

    <!-- URL input -->
    <div v-else class="url-area">
      <form @submit.prevent="submitUrl" class="url-form">
        <input
          v-model="urlInput"
          type="url"
          placeholder="https://example.com/article..."
          class="url-input font-mono"
        />
        <button type="submit" class="url-btn">
          <AdinkraIcon name="search" size="1.2em" />
        </button>
      </form>
      <p class="font-mono text-xs text-ink-faint mt-2">Paste an article URL to extract its content</p>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  width: 100%;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--ink-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

.toggle-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.03);
}

.drop-area {
  border: 2px dashed rgba(212, 160, 23, 0.25);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drop-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(212, 160, 23, 0.03), rgba(199, 91, 57, 0.02));
  opacity: 0;
  transition: opacity 0.3s;
}

.drop-area:hover,
.drop-area.dragging {
  border-color: var(--kente-gold);
  box-shadow: 0 0 32px rgba(212, 160, 23, 0.1);
}

.drop-area:hover::before,
.drop-area.dragging::before {
  opacity: 1;
}

.drop-content {
  position: relative;
  z-index: 1;
}

.drop-icon {
  color: var(--kente-gold);
  margin-bottom: 12px;
  opacity: 0.7;
}

.url-area {
  padding: 24px;
}

.url-form {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--ink);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: var(--kente-gold);
}

.url-input::placeholder {
  color: var(--ink-faint);
}

.url-btn {
  background: linear-gradient(135deg, var(--kente-gold), var(--terra));
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
}

.url-btn:hover {
  box-shadow: 0 4px 16px rgba(212, 160, 23, 0.3);
}

.hidden {
  display: none;
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .mode-toggle {
    width: 100%;
  }

  .toggle-btn {
    flex: 1;
    justify-content: center;
    min-height: 48px;
  }

  .drop-area {
    padding: 32px 16px;
  }

  .url-area {
    padding: 16px 0;
  }

  .url-form {
    flex-direction: column;
  }

  .url-input {
    font-size: 16px;
  }

  .url-btn {
    width: 100%;
    min-height: 48px;
  }
}
</style>
