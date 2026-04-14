<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  terms: { term: string; definition: string; category: string }[]
}>()

const search = ref('')

const categoryColors: Record<string, string> = {
  concept: 'var(--kente-gold)',
  acronym: 'var(--terra)',
  technique: 'var(--adire-light)',
  framework: 'var(--baobab-light)',
  theory: 'var(--kente-gold-light)',
  tool: 'var(--terra-light)',
}

function getCatColor(cat: string) {
  return categoryColors[cat?.toLowerCase()] || 'var(--ink-muted)'
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  const list = q
    ? props.terms.filter(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
    : props.terms
  return [...list].sort((a, b) => a.term.localeCompare(b.term))
})

const letterGroups = computed(() => {
  const groups: Record<string, typeof props.terms> = {}
  for (const t of filtered.value) {
    const letter = t.term[0]?.toUpperCase() || '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(t)
  }
  return groups
})
</script>

<template>
  <div class="glossary">
    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Search terms..."
        class="search-input font-mono"
      />
    </div>

    <div v-for="(items, letter) in letterGroups" :key="letter" class="letter-group">
      <div class="letter-heading font-display">{{ letter }}</div>
      <div v-for="(item, i) in items" :key="i" class="term-card glass-card">
        <div class="term-header">
          <h4 class="term-name font-display">{{ item.term }}</h4>
          <span class="cat-badge font-mono" :style="{ color: getCatColor(item.category), borderColor: getCatColor(item.category) }">
            {{ item.category }}
          </span>
        </div>
        <p class="term-def font-mono">{{ item.definition }}</p>
      </div>
    </div>

    <p v-if="filtered.length === 0" class="no-results font-mono">No matching terms found.</p>
  </div>
</template>

<style scoped>
.glossary {
  display: grid;
  gap: 16px;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 4px 0 12px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink);
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--kente-gold);
}

.letter-heading {
  font-size: 1.2rem;
  color: var(--kente-gold);
  margin: 8px 0 4px;
  opacity: 0.6;
}

.term-card {
  padding: 14px 16px;
}

.term-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.term-name {
  font-size: 0.95rem;
  color: var(--ink);
}

.cat-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border: 1px solid;
  border-radius: 3px;
}

.term-def {
  font-size: 0.78rem;
  color: var(--ink-muted);
  line-height: 1.5;
}

.no-results {
  text-align: center;
  color: var(--ink-faint);
  font-size: 0.82rem;
  padding: 32px;
}
</style>
