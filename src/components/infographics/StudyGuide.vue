<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  questions: { question: string; answer: string; type: string; difficulty: number }[]
}>()

const revealedAnswers = ref<Set<number>>(new Set())
const score = ref(0)
const filterDifficulty = ref<number | null>(null)

const typeColors: Record<string, string> = {
  recall: 'var(--kente-gold-light)',
  comprehension: 'var(--kente-gold)',
  application: 'var(--adire-light)',
  analysis: 'var(--terra)',
}

function getTypeColor(type: string) {
  return typeColors[type?.toLowerCase()] || 'var(--ink-muted)'
}

const filtered = computed(() => {
  if (filterDifficulty.value === null) return props.questions
  return props.questions.filter(q => q.difficulty === filterDifficulty.value)
})

function toggleAnswer(index: number) {
  if (revealedAnswers.value.has(index)) {
    revealedAnswers.value.delete(index)
  } else {
    revealedAnswers.value.add(index)
  }
  // Force reactivity
  revealedAnswers.value = new Set(revealedAnswers.value)
}

function markCorrect(index: number) {
  if (!revealedAnswers.value.has(index)) toggleAnswer(index)
  score.value++
}

function resetQuiz() {
  revealedAnswers.value = new Set()
  score.value = 0
}
</script>

<template>
  <div class="study-guide">
    <div class="guide-header">
      <div class="score-display glass-card">
        <span class="font-mono text-xs text-ink-faint">Score</span>
        <span class="score-value font-display">{{ score }} / {{ questions.length }}</span>
      </div>
      <div class="filter-bar">
        <button
          class="filter-btn font-mono"
          :class="{ active: filterDifficulty === null }"
          @click="filterDifficulty = null"
        >All</button>
        <button
          v-for="d in [1, 2, 3]"
          :key="d"
          class="filter-btn font-mono"
          :class="{ active: filterDifficulty === d }"
          @click="filterDifficulty = d"
        >
          {{ '★'.repeat(d) }}
        </button>
        <button class="filter-btn font-mono reset-btn" @click="resetQuiz">Reset</button>
      </div>
    </div>

    <div class="questions-list">
      <div v-for="(q, i) in filtered" :key="i" class="question-card glass-card">
        <div class="q-header">
          <span class="q-number font-display">Q{{ i + 1 }}</span>
          <span class="q-type font-mono" :style="{ color: getTypeColor(q.type), borderColor: getTypeColor(q.type) }">
            {{ q.type }}
          </span>
          <span class="q-diff font-mono">{{ '★'.repeat(q.difficulty || 1) }}</span>
        </div>
        <p class="q-text font-mono">{{ q.question }}</p>
        <div v-if="revealedAnswers.has(i)" class="answer-box">
          <p class="answer-text font-mono">{{ q.answer }}</p>
        </div>
        <div class="q-actions">
          <button class="btn-ghost text-xs" @click="toggleAnswer(i)">
            {{ revealedAnswers.has(i) ? 'Hide Answer' : 'Show Answer' }}
          </button>
          <button v-if="!revealedAnswers.has(i)" class="btn-ghost text-xs correct-btn" @click="markCorrect(i)">
            ✓ I knew it
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.study-guide {
  display: grid;
  gap: 16px;
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
}

.score-value {
  font-size: 1.2rem;
  color: var(--kente-gold);
}

.filter-bar {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: rgba(212, 160, 23, 0.1);
  border-color: var(--kente-gold);
  color: var(--kente-gold);
}

.reset-btn {
  color: var(--terra);
  border-color: rgba(199, 91, 57, 0.3);
}

.questions-list {
  display: grid;
  gap: 12px;
}

.question-card {
  padding: 16px;
}

.q-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.q-number {
  font-size: 0.9rem;
  color: var(--kente-gold);
  font-weight: 700;
}

.q-type {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border: 1px solid;
  border-radius: 3px;
}

.q-diff {
  color: var(--kente-gold);
  font-size: 0.7rem;
  margin-left: auto;
}

.q-text {
  font-size: 0.85rem;
  color: var(--ink);
  line-height: 1.5;
  margin-bottom: 10px;
}

.answer-box {
  background: rgba(212, 160, 23, 0.05);
  border-left: 3px solid var(--kente-gold);
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 10px;
}

.answer-text {
  font-size: 0.8rem;
  color: var(--ink-muted);
  line-height: 1.5;
}

.q-actions {
  display: flex;
  gap: 8px;
}

.correct-btn {
  color: var(--baobab-light) !important;
}

@media (max-width: 768px) {
  .guide-header {
    flex-direction: column;
    align-items: stretch;
  }

  .score-display {
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
  }

  .filter-bar {
    flex-wrap: wrap;
    justify-content: center;
  }

  .question-card {
    padding: 14px;
  }

  .q-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .q-text {
    font-size: 0.82rem;
  }

  .q-actions {
    flex-wrap: wrap;
  }
}
</style>
