<script setup lang="ts">
defineProps<{
  actions: { action: string; category: string; difficulty: string }[]
}>()

const categoryIcons: Record<string, string> = {
  exercise: '🏋️',
  habit: '🔄',
  'mindset-shift': '🧠',
  practice: '🎯',
  technique: '⚙️',
  step: '👣',
}

const difficultyColors: Record<string, string> = {
  easy: 'var(--baobab-light)',
  medium: 'var(--kente-gold)',
  advanced: 'var(--terra)',
}

function getIcon(category: string) {
  return categoryIcons[category?.toLowerCase()] || '📌'
}

function getDiffColor(diff: string) {
  return difficultyColors[diff?.toLowerCase()] || 'var(--ink-muted)'
}

// Group actions by category
function groupByCategory(actions: { action: string; category: string; difficulty: string }[]) {
  const groups: Record<string, typeof actions> = {}
  for (const a of actions) {
    const cat = a.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(a)
  }
  return groups
}
</script>

<template>
  <div class="action-plan">
    <div v-for="(items, category) in groupByCategory(actions)" :key="category" class="category-group">
      <h3 class="category-title font-display">
        <span class="category-icon">{{ getIcon(category as string) }}</span>
        {{ (category as string).replace('-', ' ') }}
      </h3>
      <div class="action-list">
        <div v-for="(item, i) in items" :key="i" class="action-item glass-card">
          <div class="action-check">
            <input type="checkbox" class="action-checkbox" />
          </div>
          <div class="action-body">
            <p class="action-text font-mono">{{ item.action }}</p>
            <span class="diff-badge font-mono" :style="{ color: getDiffColor(item.difficulty), borderColor: getDiffColor(item.difficulty) }">
              {{ item.difficulty }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-plan {
  display: grid;
  gap: 24px;
}

.category-title {
  font-size: 0.95rem;
  color: var(--kente-gold);
  text-transform: capitalize;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 1.1rem;
}

.action-list {
  display: grid;
  gap: 8px;
}

.action-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
}

.action-checkbox {
  margin-top: 3px;
  accent-color: var(--kente-gold);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.action-body {
  flex: 1;
}

.action-text {
  font-size: 0.82rem;
  color: var(--ink);
  line-height: 1.5;
  margin-bottom: 6px;
}

.diff-badge {
  display: inline-block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border: 1px solid;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .action-item {
    padding: 12px 14px;
    gap: 10px;
  }

  .action-checkbox {
    width: 20px;
    height: 20px;
    margin-top: 1px;
  }

  .action-text {
    font-size: 0.78rem;
  }

  .category-title {
    font-size: 0.88rem;
  }
}
</style>
