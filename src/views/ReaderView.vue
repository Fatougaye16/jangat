<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import AiChat from '@/components/AiChat.vue'
import HighlightPopover from '@/components/HighlightPopover.vue'
import InfographicsPanel from '@/components/InfographicsPanel.vue'
import MindMapPanel from '@/components/MindMapPanel.vue'

const route = useRoute()
const router = useRouter()
const reader = useReaderStore()
const settings = useSettingsStore()

const docId = computed(() => Number(route.params.id))
const showHighlighter = ref(false)
const highlightPosition = ref({ top: 0, left: 0 })
const selectedText = ref('')
const summaryText = ref('')
const isSummarizing = ref(false)
const activeTab = ref<'chat' | 'highlights' | 'summary'>('chat')
const activeView = ref<'reading' | 'infographics' | 'mindmap'>('reading')

const highlightColors = [
  '#D4A017', // kente gold
  '#C75B39', // terracotta
  '#2E4A7A', // adire
  '#2D6A4F', // baobab
  '#E8C547', // gold light
]

onMounted(async () => {
  await reader.loadDocument(docId.value)
  // Support ?tab= query param for deep linking
  const tab = route.query.tab as string
  if (tab === 'infographics') activeView.value = 'infographics'
  else if (tab === 'mindmap') activeView.value = 'mindmap'
})

function handleTextSelect() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.toString().trim()) {
    showHighlighter.value = false
    return
  }

  selectedText.value = selection.toString().trim()
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  highlightPosition.value = {
    top: rect.top - 60,
    left: rect.left + rect.width / 2 - 110,
  }
  showHighlighter.value = true
}

async function saveHighlight(color: string, note: string) {
  if (!selectedText.value) return
  await reader.addHighlight({
    docId: docId.value,
    text: selectedText.value,
    note,
    color,
    position: 0,
    createdAt: new Date(),
  })
  showHighlighter.value = false
  window.getSelection()?.removeAllRanges()
}

async function generateSummary(content?: string) {
  const text = content || reader.activeContent
  if (!text || isSummarizing.value) return
  isSummarizing.value = true
  summaryText.value = ''
  activeTab.value = 'summary'

  try {
    const { summarize } = await import('@/services/ai')
    const stream = summarize(text, { model: settings.selectedModel })
    for await (const chunk of stream) {
      summaryText.value += chunk
    }
  } catch {
    summaryText.value = '⚠ Could not generate summary. Ensure Ollama is running.'
  } finally {
    isSummarizing.value = false
  }
}

async function quickSummarize(text: string) {
  activeView.value = 'reading'
  await generateSummary(text)
  showHighlighter.value = false
  window.getSelection()?.removeAllRanges()
}

async function quickFacts(text: string) {
  if (!text || isSummarizing.value) return
  activeView.value = 'reading'
  isSummarizing.value = true
  summaryText.value = ''
  activeTab.value = 'summary'
  showHighlighter.value = false
  window.getSelection()?.removeAllRanges()

  try {
    const { extractFacts } = await import('@/services/ai')
    const facts = await extractFacts(text, { model: settings.selectedModel })
    summaryText.value = '<h3 style="color: var(--kente-gold); margin-bottom: 12px;">Key Facts</h3><ul>'
      + facts.map((f: any) => `<li><strong>${f.category || 'Fact'}:</strong> ${f.fact}</li>`).join('')
      + '</ul>'
  } catch {
    summaryText.value = '⚠ Could not extract facts. Ensure Ollama is running.'
  } finally {
    isSummarizing.value = false
  }
}

function goBack() {
  router.push('/library')
}
</script>

<template>
  <div class="reader-view" v-if="reader.currentDoc">
    <!-- Top bar -->
    <header class="reader-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path d="M12.7 15.3l-5-5a1 1 0 010-1.4l5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="header-info">
        <h1 class="font-display text-base">{{ reader.currentDoc.title }}</h1>
        <span class="font-mono text-xs text-ink-faint">{{ reader.currentDoc.type.toUpperCase() }}</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="generateSummary()" title="Generate Summary">
          <AdinkraIcon name="reader" size="1.1em" />
          <span class="font-mono text-xs">Summary</span>
        </button>
      </div>
    </header>

    <div class="kente-stripe"></div>

    <!-- View tab bar -->
    <div class="view-tabs">
      <button
        class="view-tab font-mono"
        :class="{ active: activeView === 'reading' }"
        @click="activeView = 'reading'"
      >
        <AdinkraIcon name="reader" size="1em" />
        Reading
      </button>
      <button
        class="view-tab font-mono"
        :class="{ active: activeView === 'infographics' }"
        @click="activeView = 'infographics'"
      >
        <AdinkraIcon name="infographic" size="1em" />
        Infographics
      </button>
      <button
        class="view-tab font-mono"
        :class="{ active: activeView === 'mindmap' }"
        @click="activeView = 'mindmap'"
      >
        <AdinkraIcon name="mindmap" size="1em" />
        Mind Map
      </button>
    </div>

    <!-- Chapter navigation (shown for reading tab) -->
    <div v-if="reader.chapters.length > 0 && activeView === 'reading'" class="chapter-nav">
      <select
        class="chapter-select font-mono"
        :value="reader.currentChapterIndex ?? ''"
        @change="reader.selectChapter(($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
      >
        <option value="">Full Document</option>
        <option v-for="(ch, i) in reader.chapters" :key="i" :value="i">
          {{ ch.title }}
        </option>
      </select>
      <span class="font-mono text-xs text-ink-faint">{{ reader.chapters.length }} chapters detected</span>
    </div>

    <!-- === READING TAB === -->
    <div v-show="activeView === 'reading'" class="reader-body">
      <!-- Document panel -->
      <div class="doc-panel" @mouseup="handleTextSelect">
        <div class="doc-content font-body">
          <p v-for="(para, i) in reader.activeContent.split('\n\n').filter(Boolean)" :key="i" class="doc-paragraph">
            {{ para }}
          </p>
        </div>

        <!-- Inline highlights -->
        <div v-if="reader.highlights.length" class="highlights-inline">
          <div class="kente-stripe my-4"></div>
          <h3 class="font-display text-sm text-ink-muted mb-3">Saved Highlights</h3>
          <div
            v-for="h in reader.highlights"
            :key="h.id"
            class="highlight-item"
            :style="{ borderLeftColor: h.color }"
          >
            <p class="highlight-text">"{{ h.text }}"</p>
            <p v-if="h.note" class="highlight-note font-mono text-xs text-ink-faint">{{ h.note }}</p>
            <button class="remove-hl" @click="h.id && reader.removeHighlight(h.id)">×</button>
          </div>
        </div>
      </div>

      <!-- Right panel: Chat / Highlights / Summary -->
      <aside v-if="reader.isAiPanelOpen" class="ai-panel">
        <div class="panel-tabs">
          <button
            v-for="tab in (['chat', 'highlights', 'summary'] as const)"
            :key="tab"
            class="tab-btn font-mono"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>

        <!-- Chat tab -->
        <div v-show="activeTab === 'chat'" class="panel-content">
          <AiChat
            :context="reader.activeContent"
            :model="settings.selectedModel"
            @message-sent="(msg) => reader.addMessage({ ...msg, timestamp: new Date() })"
          />
        </div>

        <!-- Highlights tab -->
        <div v-show="activeTab === 'highlights'" class="panel-content highlights-list">
          <div v-if="!reader.highlights.length" class="empty-panel">
            <AdinkraIcon name="highlight" size="2em" />
            <p class="font-mono text-xs text-ink-faint mt-2">Select text to highlight</p>
          </div>
          <div
            v-for="h in reader.highlights"
            :key="h.id"
            class="hl-card"
            :style="{ borderLeftColor: h.color }"
          >
            <p class="text-sm">"{{ h.text }}"</p>
            <p v-if="h.note" class="font-mono text-xs text-ink-faint mt-1">{{ h.note }}</p>
          </div>
        </div>

        <!-- Summary tab -->
        <div v-show="activeTab === 'summary'" class="panel-content summary-panel">
          <div v-if="isSummarizing" class="summary-loading">
            <div class="processing-spinner"></div>
            <p class="font-mono text-xs text-ink-muted">Generating summary...</p>
          </div>
          <div v-else-if="summaryText" class="summary-content" v-html="summaryText"></div>
          <div v-else class="empty-panel">
            <AdinkraIcon name="reader" size="2em" />
            <p class="font-mono text-xs text-ink-faint mt-2">Click "Summary" to generate</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- === INFOGRAPHICS TAB === -->
    <div v-if="activeView === 'infographics'" class="full-panel">
      <InfographicsPanel
        :doc-id="docId"
        :content="reader.activeContent"
        :model="settings.selectedModel"
        :title="reader.currentDoc.title"
      />
    </div>

    <!-- === MIND MAP TAB === -->
    <div v-if="activeView === 'mindmap'" class="full-panel">
      <MindMapPanel
        :content="reader.activeContent"
        :model="settings.selectedModel"
      />
    </div>

    <!-- Highlight popover (floating) -->
    <Teleport to="body">
      <div
        v-if="showHighlighter"
        class="popover-anchor"
        :style="{ top: highlightPosition.top + 'px', left: highlightPosition.left + 'px' }"
      >
        <HighlightPopover
          :colors="highlightColors"
          :selected-text="selectedText"
          @highlight="saveHighlight"
          @cancel="showHighlighter = false"
          @quick-summarize="quickSummarize"
          @quick-facts="quickFacts"
        />
      </div>
    </Teleport>
  </div>

  <!-- Loading -->
  <div v-else class="reader-loading">
    <div class="processing-spinner"></div>
    <p class="font-mono text-ink-muted">Loading document...</p>
  </div>
</template>

<style scoped>
.reader-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.reader-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: rgba(13, 13, 43, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.back-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--ink-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

.header-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--ink-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

/* View tab bar */
.view-tabs {
  display: flex;
  gap: 0;
  background: rgba(13, 13, 43, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ink-faint);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}
.view-tab.active {
  color: var(--kente-gold);
  border-bottom-color: var(--kente-gold);
  background: rgba(212, 160, 23, 0.04);
}
.view-tab:hover:not(.active) {
  color: var(--ink-muted);
  background: rgba(255, 255, 255, 0.02);
}

.chapter-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.chapter-select {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(13, 13, 43, 0.6);
  color: var(--ink);
  font-size: 0.78rem;
  outline: none;
  cursor: pointer;
  max-width: 400px;
}

.chapter-select:focus {
  border-color: var(--kente-gold);
}

/* Reading tab layout */
.reader-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.doc-panel {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
}

.doc-paragraph {
  margin-bottom: 16px;
  line-height: 1.8;
  font-size: 0.95rem;
  color: var(--ink);
}

.highlights-inline {
  margin-top: 32px;
}

.highlight-item {
  position: relative;
  border-left: 3px solid;
  padding: 10px 14px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 8px 8px 0;
}

.highlight-text {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink-muted);
}

.remove-hl {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  color: var(--ink-faint);
  cursor: pointer;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
}
.highlight-item:hover .remove-hl {
  opacity: 1;
}

/* AI Panel */
.ai-panel {
  width: 380px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  background: rgba(13, 13, 43, 0.3);
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ink-faint);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  color: var(--kente-gold);
  border-bottom-color: var(--kente-gold);
}
.tab-btn:hover:not(.active) {
  color: var(--ink-muted);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.highlights-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hl-card {
  border-left: 3px solid;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 8px 8px 0;
}

.summary-panel {
  padding: 20px;
}

.summary-content {
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--ink);
}
.summary-content :deep(ul),
.summary-content :deep(ol) {
  padding-left: 18px;
}

.summary-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
}

.empty-panel {
  text-align: center;
  padding: 48px 20px;
  color: var(--ink-faint);
}

/* Full-width panels for Infographics / Mind Map */
.full-panel {
  flex: 1;
  overflow-y: auto;
}

/* Popover */
.popover-anchor {
  position: fixed;
  z-index: 1000;
}

/* Loading state */
.reader-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.processing-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(212, 160, 23, 0.15);
  border-top-color: var(--kente-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .reader-view {
    height: 100vh;
    height: 100dvh;
    overflow-x: hidden;
  }

  .reader-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .header-info {
    flex: 1;
    min-width: 0;
    gap: 4px;
  }

  .header-info h1 {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45vw;
  }

  .header-actions .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 6px 10px;
  }

  .view-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .view-tabs::-webkit-scrollbar {
    display: none;
  }

  .view-tab {
    padding: 8px 14px;
    font-size: 0.72rem;
    white-space: nowrap;
    flex: 1;
    justify-content: center;
  }

  .chapter-nav {
    padding: 6px 12px;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chapter-select {
    max-width: 100%;
    flex: 1;
    min-width: 0;
  }

  /* Reading tab - stacked layout */
  .reader-body {
    flex-direction: column;
    overflow-y: auto;
  }

  .doc-panel {
    padding: 16px;
    flex: none;
    overflow-y: visible;
  }

  .doc-paragraph {
    font-size: 0.88rem;
    line-height: 1.7;
    word-break: break-word;
  }

  .ai-panel {
    width: 100%;
    height: auto;
    max-height: none;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex: none;
    min-height: 300px;
  }

  .panel-content {
    max-height: 50vh;
  }

  .highlights-list {
    padding: 12px;
  }

  .summary-panel {
    padding: 14px;
  }

  /* Full-width panels (Infographics / Mind Map) */
  .full-panel {
    padding: 0;
    overflow-x: hidden;
  }

  /* Popover - keep on screen */
  .popover-anchor {
    left: 50% !important;
    transform: translateX(-50%);
    max-width: calc(100vw - 32px);
  }

  .empty-panel {
    padding: 32px 16px;
  }
}
</style>
