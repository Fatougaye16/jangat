<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import { useToastStore } from '@/stores/toast'
import { parsePDF, parseEPUB, parseURL, detectFileType } from '@/services/parser'
import UploadZone from '@/components/UploadZone.vue'
import DocumentCard from '@/components/DocumentCard.vue'

const router = useRouter()
const library = useLibraryStore()
const toastStore = useToastStore()
const isProcessing = ref(false)
const processingLabel = ref('')

onMounted(() => {
  library.loadAll()
})

async function handleFile(file: File) {
  const type = detectFileType(file)
  if (!type) return

  isProcessing.value = true
  processingLabel.value = `Reading ${file.name}...`

  try {
    const result = type === 'pdf' ? await parsePDF(file) : await parseEPUB(file)
    const id = await library.addDocument({
      title: result.title,
      type,
      content: result.content,
      source: file.name,
      createdAt: new Date(),
    })
    router.push(`/reader/${id}`)
  } catch (err) {
    toastStore.add(`Failed to parse "${file.name}". Check it's a valid PDF or EPUB.`, 'error')
  } finally {
    isProcessing.value = false
  }
}

async function handleUrl(url: string) {
  isProcessing.value = true
  processingLabel.value = 'Fetching article...'

  try {
    const result = await parseURL(url)
    const id = await library.addDocument({
      title: result.title,
      type: 'url',
      content: result.content,
      source: url,
      createdAt: new Date(),
    })
    router.push(`/reader/${id}`)
  } catch (err) {
    toastStore.add('Could not fetch that URL. Check your connection or try a different address.', 'error')
  } finally {
    isProcessing.value = false
  }
}

function openDoc(id: number | undefined) {
  if (id) router.push(`/reader/${id}`)
}
</script>

<template>
  <div class="home-view">
    <!-- Hero section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title font-display">
          <span class="text-gradient">Jàngat</span>
        </h1>
        <p class="hero-subtitle font-display">
          Knowledge, Illuminated
        </p>
        <p class="hero-desc text-ink-muted">
          Upload a book or article, and let AI help you discover insights, generate infographics, and build concept maps.
        </p>
      </div>

      <!-- Decorative mesh -->
      <div class="hero-mesh"></div>
    </section>

    <!-- Upload section -->
    <section class="upload-section">
      <div v-if="isProcessing" class="processing-state">
        <div class="processing-spinner"></div>
        <p class="font-mono text-ink-muted">{{ processingLabel }}</p>
      </div>
      <UploadZone v-else @file-selected="handleFile" @url-submitted="handleUrl" />
    </section>

    <!-- Recent documents -->
    <section v-if="library.recentDocuments.length" class="recent-section">
      <div class="section-header">
        <h2 class="font-display text-lg">Recent Readings</h2>
        <router-link to="/library" class="view-all font-mono text-xs text-kente-gold">
          View all →
        </router-link>
      </div>
      <div class="kente-stripe mb-4"></div>
      <div class="recent-grid">
        <DocumentCard
          v-for="doc in library.recentDocuments"
          :key="doc.id"
          :doc="doc"
          @click="openDoc(doc.id)"
          @remove="doc.id && library.removeDocument(doc.id)"
        />
      </div>
    </section>

    <!-- Empty state with Wolof proverb -->
    <section v-else class="empty-state">
      <div class="empty-adinkra">
        <!-- Mate Masie (wisdom) symbol simplified -->
        <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1" width="80" height="80" opacity="0.2">
          <circle cx="28" cy="28" r="14" />
          <circle cx="52" cy="28" r="14" />
          <circle cx="28" cy="52" r="14" />
          <circle cx="52" cy="52" r="14" />
        </svg>
      </div>
      <p class="font-display text-ink-muted text-lg italic mt-4">
        "Ligéeyu ndey, añub doom"
      </p>
      <p class="font-mono text-ink-faint text-xs mt-1">
        The mother's work is the child's harvest — Start building your knowledge
      </p>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

/* Hero */
.hero {
  position: relative;
  padding: 48px 0 32px;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--ink-muted);
  margin-top: 8px;
  font-style: italic;
}

.hero-desc {
  font-size: 0.9rem;
  max-width: 480px;
  margin: 16px auto 0;
  line-height: 1.6;
}

.hero-mesh {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 300px;
  background: radial-gradient(
    ellipse at center,
    rgba(212, 160, 23, 0.06) 0%,
    rgba(199, 91, 57, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}

/* Upload */
.upload-section {
  margin: 32px 0;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
}

.processing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 160, 23, 0.15);
  border-top-color: var(--kente-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Recent */
.recent-section {
  margin-top: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.view-all {
  text-decoration: none;
  transition: opacity 0.2s;
}
.view-all:hover {
  opacity: 0.8;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 64px 0;
}

.empty-adinkra {
  color: var(--kente-gold);
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .home-view {
    padding: 20px 16px;
  }

  .hero {
    padding: 24px 0 20px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .hero-desc {
    font-size: 0.82rem;
  }

  .hero-mesh {
    width: 300px;
    height: 200px;
  }

  .upload-section {
    margin: 20px 0;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    padding: 40px 0;
  }
}
</style>
