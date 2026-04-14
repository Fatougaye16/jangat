<script setup lang="ts">
defineProps<{
  facts: Array<{ fact: string; category: string }>
}>()

function getCategoryColor(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'statistic': return 'var(--kente-gold)'
    case 'claim': return 'var(--terra)'
    case 'definition': return 'var(--adire-light)'
    case 'date': return 'var(--baobab-light)'
    default: return 'var(--ink-muted)'
  }
}

function getCategoryIcon(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'statistic': return '#'
    case 'claim': return '!'
    case 'definition': return '≡'
    case 'date': return '◷'
    default: return '•'
  }
}
</script>

<template>
  <div class="fact-cards">
    <div
      v-for="(f, i) in facts"
      :key="i"
      class="fact-card glass-card"
      :style="{ '--accent': getCategoryColor(f.category) }"
    >
      <div class="fact-icon" :style="{ background: getCategoryColor(f.category) }">
        {{ getCategoryIcon(f.category) }}
      </div>
      <div class="fact-body">
        <span class="fact-category font-mono">{{ f.category || 'Fact' }}</span>
        <p class="fact-text">{{ f.fact }}</p>
      </div>
      <!-- Decorative corner -->
      <div class="fact-corner"></div>
    </div>
  </div>
</template>

<style scoped>
.fact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.fact-card {
  position: relative;
  display: flex;
  gap: 14px;
  padding: 20px;
  overflow: hidden;
  border-left: 3px solid var(--accent);
}

.fact-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: var(--surface);
  flex-shrink: 0;
}

.fact-body {
  flex: 1;
}

.fact-category {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.fact-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--ink);
  margin-top: 4px;
}

.fact-corner {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  opacity: 0.06;
  background: var(--accent);
  border-radius: 50%;
}

@media (max-width: 768px) {
  .fact-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .fact-card {
    padding: 14px;
    gap: 10px;
  }

  .fact-icon {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
  }

  .fact-text {
    font-size: 0.82rem;
  }
}
</style>
