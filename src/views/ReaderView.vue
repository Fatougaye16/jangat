<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import AiChat from '@/components/AiChat.vue'
import InfographicsPanel from '@/components/InfographicsPanel.vue'
import MindMapPanel from '@/components/MindMapPanel.vue'

const route = useRoute()
const router = useRouter()
const reader = useReaderStore()
const settings = useSettingsStore()

const docId = computed(() => Number(route.params.id))
const summaryText = ref('')
const isSummarizing = ref(false)
const activeView = ref<'chat' | 'infographics' | 'mindmap'>('chat')

onMounted(async () => {
  await reader.loadDocument(docId.value)
  const tab = route.query.tab as string
  if (tab === 'infographics') activeView.value = 'infographics'
  else if (tab === 'mindmap') activeView.value = 'mindmap'
})

async function generateSummary() {
  const text = reader.activeContent
  if (!text || isSummarizing.value) return
  isSummarizing.value = true
  summaryText.value = ''

  try {
    const { summarize } = await import('@/services/ai')
    const stream = summarize(text, { model: settings.selectedModel })
    for await (const chunk of stream) {
      summaryText.value += chunk
    }
  } catch {
    summaryText.value = 'Could not generate summary. Ensure Ollama is running.'
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
        :class="{ active: activeView === 'chat' }"
        @click="activeView = 'chat'"
      >
        <AdinkraIcon name="chat" size="1em" />
        <span class="tab-label">AI Chat</span>
        <span class="tab-label-short">Chat</span>
      </button>
      <button
        class="view-tab font-mono"
        :class="{ active: activeView === 'infographics' }"
        @click="activeView = 'infographics'"
      >
        <AdinkraIcon name="infographic" size="1em" />
        <span class="tab-label">Infographics</span>
        <span class="tab-label-short">Infos</span>
      </button>
      <button
        class="view-tab font-mono"
        :class="{ active: activeView === 'mindmap' }"
        @click="activeView = 'mindmap'"
      >
        <AdinkraIcon name="mindmap" size="1em" />
        <span class="tab-label">Mind Map</span>
        <span class="tab-label-short">Map</span>
      </button>
    </div>

    <!-- Chapter navigation -->
    <div v-if="reader.chapters.length > 0" class="chapter-nav">
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

    <!-- Summary banner -->
    <div v-if="isSummarizing || summaryText" class="summary-banner">
      <div v-if="isSummarizing" class="summary-loading">
        <div class="processing-spinner"></div>
        <p class="font-mono text-xs text-ink-muted">Generating summary...</p>
      </div>
      <div v-else class="summary-content">
        <div class="summary-header">
          <h3 class="font-display text-sm text-kente-gold">Summary</h3>
          <button class="close-summary" @click="summaryText = ''">&times;</button>
        </div>
        <div class="summary-text" v-html="summaryText"></div>
      </div>
    </div>

    <!-- === AI CHAT TAB === -->
    <div v-show="activeView === 'chat'" class="full-panel">
      <AiChat
        :context="reader.activeContent"
        :model="settings.selectedModel"
        @message-sent="(msg) => reader.addMessage({ ...msg, timestamp: new Date() })"
      />
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

.tab-label-short {
  display: none;
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

/* Summary banner */
.summary-banner {
  padding: 16px 24px;
  background: rgba(212, 160, 23, 0.04);
  border-bottom: 1px solid rgba(212, 160, 23, 0.15);
  max-height: 300px;
  overflow-y: auto;
}

.summary-loading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.close-summary {
  background: none;
  border: none;
  color: var(--ink-faint);
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}
.close-summary:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.05);
}

.summary-content {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--ink-muted);
}
.summary-content :deep(ul),
.summary-content :deep(ol) {
  padding-left: 18px;
}

/* Full-width panels */
.full-panel {
  flex: 1;
  overflow-y: auto;
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
    max-width: 100vw;
    width: 100%;
  }

  .reader-header {
    padding: 10px 12px;
    gap: 8px;
    max-width: 100vw;
  }

  .header-info {
    flex: 1;
    min-width: 0;
    gap: 4px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info h1 {
    font-size: 0.85rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 100%;
    white-space: normal;
  }

  .header-actions .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 6px 10px;
    min-height: 44px;
  }

  .view-tabs {
    overflow-x: hidden;
    max-width: 100vw;
  }

  .view-tab {
    padding: 8px 6px;
    font-size: 0.72rem;
    white-space: nowrap;
    flex: 1;
    justify-content: center;
    gap: 4px;
    min-width: 0;
    min-height: 44px;
  }

  .tab-label {
    display: none;
  }

  .tab-label-short {
    display: inline;
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
    font-size: 16px;
    min-height: 44px;
  }

  .summary-banner {
    padding: 12px 14px;
    max-height: 200px;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .full-panel {
    padding: 0;
    overflow-x: hidden;
    max-width: 100vw;
  }
}

@media (max-width: 380px) {
  .tab-label-short {
    display: none;
  }

  .view-tab {
    padding: 10px 4px;
  }
}
</style>
