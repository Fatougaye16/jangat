<script setup lang="ts">
defineProps<{
  comparisons: Array<{
    itemA: string
    itemB: string
    aspectA: string
    aspectB: string
    aspect: string
  }>
}>()
</script>

<template>
  <div class="comparison-charts">
    <div v-for="(c, i) in comparisons" :key="i" class="comparison-card glass-card">
      <h4 class="comp-aspect font-mono text-xs text-ink-faint text-center mb-3">{{ c.aspect }}</h4>
      <div class="comp-row">
        <div class="comp-side side-a">
          <div class="comp-label font-display">{{ c.itemA }}</div>
          <p class="comp-desc">{{ c.aspectA }}</p>
        </div>
        <div class="comp-divider">
          <span class="vs font-mono">VS</span>
        </div>
        <div class="comp-side side-b">
          <div class="comp-label font-display">{{ c.itemB }}</div>
          <p class="comp-desc">{{ c.aspectB }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comparison-card {
  padding: 24px;
  overflow: hidden;
}

.comp-aspect {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.comp-row {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.comp-side {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
}

.side-a {
  background: rgba(212, 160, 23, 0.06);
  border: 1px solid rgba(212, 160, 23, 0.15);
}

.side-b {
  background: rgba(46, 74, 122, 0.06);
  border: 1px solid rgba(46, 74, 122, 0.15);
}

.comp-label {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.side-a .comp-label { color: var(--kente-gold); }
.side-b .comp-label { color: var(--adire-light); }

.comp-desc {
  font-size: 0.82rem;
  color: var(--ink-muted);
  line-height: 1.5;
}

.comp-divider {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.vs {
  font-size: 0.7rem;
  color: var(--ink-faint);
  background: var(--surface-raised);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 768px) {
  .comparison-card {
    padding: 16px;
  }

  .comp-row {
    flex-direction: column;
    gap: 0;
  }

  .comp-side {
    padding: 12px;
    border-radius: 8px;
  }

  .comp-divider {
    padding: 8px 0;
    justify-content: center;
  }

  .comp-label {
    font-size: 0.9rem;
  }

  .comp-desc {
    font-size: 0.8rem;
  }
}
</style>
