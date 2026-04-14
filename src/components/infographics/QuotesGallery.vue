<script setup lang="ts">
defineProps<{
  quotes: { quote: string; context: string; theme: string }[]
}>()

const themeColors: Record<string, string> = {
  motivation: 'var(--kente-gold)',
  insight: 'var(--adire-light)',
  warning: 'var(--terra)',
  principle: 'var(--baobab-light)',
  technique: 'var(--kente-gold-light)',
  wisdom: 'var(--terra-light)',
}

function getColor(theme: string) {
  return themeColors[theme?.toLowerCase()] || 'var(--kente-gold)'
}
</script>

<template>
  <div class="quotes-gallery">
    <div v-for="(q, i) in quotes" :key="i" class="quote-card glass-card">
      <div class="quote-accent" :style="{ background: getColor(q.theme) }"></div>
      <div class="quote-body">
        <svg class="quote-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" opacity="0.3">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
        <p class="quote-text font-display">"{{ q.quote }}"</p>
        <p class="quote-context font-mono">{{ q.context }}</p>
        <span class="theme-badge font-mono" :style="{ color: getColor(q.theme), borderColor: getColor(q.theme) }">
          {{ q.theme }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quotes-gallery {
  display: grid;
  gap: 16px;
}

.quote-card {
  display: flex;
  overflow: hidden;
}

.quote-accent {
  width: 4px;
  flex-shrink: 0;
}

.quote-body {
  padding: 20px;
  flex: 1;
}

.quote-icon {
  color: var(--kente-gold);
  margin-bottom: 8px;
}

.quote-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ink);
  margin-bottom: 10px;
  font-style: italic;
}

.quote-context {
  font-size: 0.75rem;
  color: var(--ink-muted);
  margin-bottom: 10px;
  line-height: 1.5;
}

.theme-badge {
  display: inline-block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .quote-body {
    padding: 14px;
  }

  .quote-text {
    font-size: 0.92rem;
  }

  .quote-context {
    font-size: 0.72rem;
  }
}
</style>
