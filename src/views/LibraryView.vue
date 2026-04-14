<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import DocumentCard from '@/components/DocumentCard.vue'

const router = useRouter()
const library = useLibraryStore()

onMounted(() => {
  library.loadAll()
})

function openDoc(id: number | undefined) {
  if (id) router.push(`/reader/${id}`)
}

const typeFilters: Array<{ value: 'all' | 'pdf' | 'epub' | 'url'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pdf', label: 'PDF' },
  { value: 'epub', label: 'EPUB' },
  { value: 'url', label: 'URL' },
]
</script>

<template>
  <div class="library-view">
    <header class="library-header">
      <h1 class="font-display text-2xl">Library</h1>
      <p class="font-mono text-xs text-ink-faint mt-1">
        {{ library.filtered.length }} document{{ library.filtered.length !== 1 ? 's' : '' }}
      </p>
    </header>

    <div class="kente-stripe mb-6"></div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-bar">
        <AdinkraIcon name="search" size="1em" />
        <input
          v-model="library.searchQuery"
          type="text"
          placeholder="Search your library..."
          class="search-input font-mono"
        />
      </div>
      <div class="type-filters">
        <button
          v-for="f in typeFilters"
          :key="f.value"
          class="filter-btn font-mono"
          :class="{ active: library.filterType === f.value }"
          @click="library.filterType = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Documents grid -->
    <div v-if="library.loading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="shimmer card-skeleton"></div>
    </div>

    <div v-else-if="library.filtered.length" class="doc-grid">
      <DocumentCard
        v-for="doc in library.filtered"
        :key="doc.id"
        :doc="doc"
        @click="openDoc(doc.id)"
        @remove="doc.id && library.removeDocument(doc.id)"
      />
    </div>

    <!-- Empty -->
    <div v-else class="empty">
      <p class="font-display text-ink-muted italic text-lg">
        "Jàng nga, xam nga"
      </p>
      <p class="font-mono text-ink-faint text-xs mt-1">
        You have read, you have known — Add your first document
      </p>
      <router-link to="/" class="btn-primary mt-4 inline-block text-sm no-underline">
        Upload Something
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.library-view {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.library-header {
  margin-bottom: 8px;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 16px;
  flex: 1;
  min-width: 200px;
  color: var(--ink-muted);
}

.search-input {
  background: none;
  border: none;
  color: var(--ink);
  font-size: 0.85rem;
  outline: none;
  width: 100%;
}
.search-input::placeholder {
  color: var(--ink-faint);
}

.type-filters {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

.filter-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.03);
}

.doc-grid,
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.card-skeleton {
  height: 160px;
  border-radius: 20px;
}

.empty {
  text-align: center;
  padding: 80px 0;
}

.inline-block {
  display: inline-block;
}

.no-underline {
  text-decoration: none;
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .library-view {
    padding: 20px 16px;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .search-bar {
    min-width: 0;
    width: 100%;
  }

  .type-filters {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }

  .doc-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }

  .empty {
    padding: 48px 0;
  }
}
</style>
