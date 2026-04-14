<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useInfographicStore } from '@/stores/infographic'
import { useReaderStore } from '@/stores/reader'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import FactCards from '@/components/infographics/FactCards.vue'
import Timeline from '@/components/infographics/Timeline.vue'
import ComparisonChart from '@/components/infographics/ComparisonChart.vue'
import TakeawaysPoster from '@/components/infographics/TakeawaysPoster.vue'
import QuotesGallery from '@/components/infographics/QuotesGallery.vue'
import ActionPlan from '@/components/infographics/ActionPlan.vue'
import Glossary from '@/components/infographics/Glossary.vue'
import StudyGuide from '@/components/infographics/StudyGuide.vue'
import html2canvas from 'html2canvas'

const props = defineProps<{
  docId: number
  content: string
  model?: string
  title?: string
}>()

const reader = useReaderStore()
const infographics = useInfographicStore()

type InfographicType = 'facts' | 'timeline' | 'comparison' | 'takeaways' | 'quotes' | 'actions' | 'glossary' | 'study'

const activeType = ref<InfographicType>('facts')
const showChapterPicker = ref(true)

const types = [
  { value: 'facts' as const, label: 'Key Facts', icon: 'infographic' as const },
  { value: 'timeline' as const, label: 'Timeline', icon: 'reader' as const },
  { value: 'comparison' as const, label: 'Compare', icon: 'library' as const },
  { value: 'takeaways' as const, label: 'Takeaways', icon: 'highlight' as const },
  { value: 'quotes' as const, label: 'Quotes', icon: 'highlight' as const },
  { value: 'actions' as const, label: 'Actions', icon: 'infographic' as const },
  { value: 'glossary' as const, label: 'Glossary', icon: 'library' as const },
  { value: 'study' as const, label: 'Study Guide', icon: 'reader' as const },
]

const hasChapters = computed(() => reader.chapters.length > 0)
const showingPicker = computed(() => hasChapters.value && showChapterPicker.value)

const currentChapterIndex = computed(() => reader.currentChapterIndex)

const scopeLabel = computed(() => {
  if (currentChapterIndex.value === null) return 'Full Document'
  const ch = reader.chapters[currentChapterIndex.value]
  return ch
    ? `Chapter ${currentChapterIndex.value + 1} of ${reader.chapters.length}`
    : `Chapter ${currentChapterIndex.value + 1}`
})

const batchPercent = computed(() => {
  const bp = infographics.batchProgress
  if (!bp) return 0
  return Math.round((bp.current / bp.total) * 100)
})

function currentInfographic(type: InfographicType) {
  return infographics.getByType(type, currentChapterIndex.value)
}

function scopeHasData(chapterIndex: number | null) {
  return infographics.hasDataForScope(chapterIndex)
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

function selectScope(chapterIndex: number | null) {
  reader.selectChapter(chapterIndex)
  showChapterPicker.value = false
}

function backToChapters() {
  showChapterPicker.value = true
}

onMounted(async () => {
  await infographics.loadForDocument(props.docId)
  // If no chapters, skip picker
  if (!hasChapters.value) {
    showChapterPicker.value = false
  }
})

async function generateAll() {
  await infographics.generateAllChapters(props.docId, activeType.value, reader.chapters, props.model)
}

async function generate(type: InfographicType) {
  if (!props.content) return
  activeType.value = type
  await infographics.generateInfographic(
    props.docId,
    type,
    props.content,
    currentChapterIndex.value,
    props.model
  )
}

async function exportImage() {
  const el = document.querySelector('.poster') as HTMLElement
  if (!el) return
  const canvas = await html2canvas(el, { backgroundColor: '#0d0d2b' })
  const link = document.createElement('a')
  link.download = `jangat-takeaways-${props.title || 'export'}.png`
  link.href = canvas.toDataURL()
  link.click()
}
</script>

<template>
  <div class="infographics-panel">
    <!-- Chapter picker -->
    <div v-if="showingPicker" class="chapter-picker">
      <h2 class="font-display text-base text-ink-muted mb-2">Choose scope</h2>
      <p class="font-mono text-xs text-ink-faint mb-4">Select a chapter for focused analysis, or analyze the full document</p>

      <div class="scope-grid">
        <!-- Full document card -->
        <button class="scope-card glass-card" @click="selectScope(null)">
          <div class="scope-card-header">
            <AdinkraIcon name="library" size="1.2em" />
            <span class="font-display">Full Document</span>
            <span v-if="scopeHasData(null)" class="scope-badge">✓</span>
          </div>
          <span class="font-mono text-xs text-ink-faint">{{ wordCount(reader.currentDoc?.content || '') }} words</span>
        </button>

        <!-- Chapter cards -->
        <button
          v-for="(ch, i) in reader.chapters"
          :key="i"
          class="scope-card glass-card"
          @click="selectScope(i)"
        >
          <div class="scope-card-header">
            <span class="chapter-num font-mono">{{ i + 1 }}</span>
            <span class="font-display scope-title">{{ ch.title }}</span>
            <span v-if="scopeHasData(i)" class="scope-badge">✓</span>
          </div>
          <span class="font-mono text-xs text-ink-faint">{{ wordCount(ch.content) }} words</span>
        </button>
      </div>
    </div>

    <!-- Type selector + content -->
    <div v-else>
      <!-- Back to chapters link -->
      <div v-if="hasChapters" class="scope-bar">
        <button class="back-to-chapters font-mono text-xs" @click="backToChapters">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12">
            <path d="M12.7 15.3l-5-5a1 1 0 010-1.4l5-5" />
          </svg>
          Chapters
        </button>
        <span class="font-mono text-xs text-kente-gold">{{ scopeLabel }}</span>
      </div>

      <!-- Type selector -->
      <div class="type-selector">
        <button
          v-for="t in types"
          :key="t.value"
          class="type-btn font-mono"
          :class="{ active: activeType === t.value, 'has-data': !!currentInfographic(t.value) }"
          @click="activeType = t.value"
        >
          <AdinkraIcon :name="t.icon" size="1em" />
          {{ t.label }}
          <span v-if="currentInfographic(t.value)" class="type-dot"></span>
        </button>
      </div>

      <!-- Batch generation progress -->
      <div v-if="infographics.batchProgress" class="batch-progress">
        <div class="batch-bar">
          <div class="batch-fill" :style="{ width: batchPercent + '%' }"></div>
        </div>
        <div class="batch-status">
          <p class="font-mono text-xs text-ink-muted">
            Generating chapter {{ infographics.batchProgress.current }} of {{ infographics.batchProgress.total }}
            — {{ infographics.batchProgress.chapterTitle }}
          </p>
          <button class="btn-ghost text-xs" @click="infographics.cancelBatchGeneration()">Cancel</button>
        </div>
      </div>

      <!-- Content area -->
      <div class="info-content">
        <!-- Generate button if no data -->
        <div v-if="!currentInfographic(activeType) && !infographics.generating" class="generate-prompt">
          <div class="prompt-icon">
            <AdinkraIcon name="infographic" size="3em" />
          </div>
          <p class="font-display text-ink-muted">Generate {{ activeType }} infographic</p>
          <p class="font-mono text-xs text-ink-faint mt-1">
            AI will analyze {{ currentChapterIndex !== null ? 'this chapter' : 'your document' }}
          </p>
          <div class="generate-actions">
            <button class="btn-primary" @click="generate(activeType)">Generate</button>
            <button v-if="hasChapters" class="btn-ghost" @click="generateAll">
              Generate All Chapters
            </button>
          </div>
        </div>

        <!-- Loading with progress -->
        <div v-else-if="infographics.generating && infographics.generatingType === activeType" class="generating">
          <div class="processing-spinner"></div>
          <p class="font-mono text-ink-muted text-sm">Analyzing...</p>
          <p v-if="infographics.progress" class="font-mono text-kente-gold text-xs mt-1">
            Processing section {{ infographics.progress.current }} of {{ infographics.progress.total }}
          </p>
          <p v-else class="font-mono text-ink-faint text-xs mt-1">This may take a moment</p>
        </div>

        <!-- Rendered infographics -->
        <div v-else-if="activeType === 'facts' && currentInfographic('facts')">
          <FactCards :facts="currentInfographic('facts')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('facts')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'timeline' && currentInfographic('timeline')">
          <Timeline :events="currentInfographic('timeline')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('timeline')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'comparison' && currentInfographic('comparison')">
          <ComparisonChart :comparisons="currentInfographic('comparison')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('comparison')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'takeaways' && currentInfographic('takeaways')">
          <TakeawaysPoster
            :takeaways="currentInfographic('takeaways')!.data"
            :title="title || ''"
            @export-image="exportImage"
          />
          <button class="btn-ghost mt-4 text-xs" @click="generate('takeaways')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'quotes' && currentInfographic('quotes')">
          <QuotesGallery :quotes="currentInfographic('quotes')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('quotes')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'actions' && currentInfographic('actions')">
          <ActionPlan :actions="currentInfographic('actions')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('actions')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'glossary' && currentInfographic('glossary')">
          <Glossary :terms="currentInfographic('glossary')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('glossary')">Regenerate</button>
        </div>

        <div v-else-if="activeType === 'study' && currentInfographic('study')">
          <StudyGuide :questions="currentInfographic('study')!.data" />
          <button class="btn-ghost mt-4 text-xs" @click="generate('study')">Regenerate</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.infographics-panel {
  padding: 16px 32px 48px;
}

/* Chapter picker */
.chapter-picker {
  padding: 32px 0;
}

.scope-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.scope-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
}

.scope-card:hover {
  border-color: var(--kente-gold);
  background: rgba(212, 160, 23, 0.05);
}

.scope-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
}

.chapter-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(212, 160, 23, 0.1);
  color: var(--kente-gold);
  font-size: 0.7rem;
  flex-shrink: 0;
}

.scope-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.scope-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(45, 106, 79, 0.2);
  color: var(--baobab-light);
  font-size: 0.65rem;
  flex-shrink: 0;
}

/* Scope bar */
.scope-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 0 16px;
}

.back-to-chapters {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 4px 10px;
  color: var(--ink-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.back-to-chapters:hover {
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

/* Type selector */
.type-selector {
  display: flex;
  gap: 8px;
  padding-bottom: 20px;
  flex-wrap: wrap;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.type-btn.active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

.type-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.03);
}

.type-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--baobab-light);
}

/* Content area */
.info-content {
  padding: 0;
}

/* Batch progress */
.batch-progress {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(212, 160, 23, 0.05);
  border: 1px solid rgba(212, 160, 23, 0.15);
}

.batch-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-bottom: 8px;
}

.batch-fill {
  height: 100%;
  background: var(--kente-gold);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.batch-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* Generate actions */
.generate-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.generate-prompt {
  text-align: center;
  padding: 64px 0;
}

.prompt-icon {
  color: var(--kente-gold);
  opacity: 0.4;
  margin-bottom: 16px;
}

.generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 12px;
}

.processing-spinner {
  width: 36px;
  height: 36px;
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
  .infographics-panel {
    padding: 12px 14px 32px;
  }

  .chapter-picker {
    padding: 16px 0;
  }

  .scope-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .scope-card {
    padding: 14px 16px;
  }

  .scope-title {
    font-size: 0.82rem;
  }

  .scope-bar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 0 12px;
  }

  .type-selector {
    gap: 6px;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 12px;
    scrollbar-width: none;
  }
  .type-selector::-webkit-scrollbar {
    display: none;
  }

  .type-btn {
    white-space: nowrap;
    padding: 6px 12px;
    font-size: 0.72rem;
    flex-shrink: 0;
  }

  .generate-prompt {
    padding: 40px 16px;
  }

  .generating {
    padding: 40px 16px;
  }
}
</style>
