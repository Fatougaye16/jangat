<script setup lang="ts">
defineProps<{
  events: Array<{ date: string; event: string; detail: string }>
}>()
</script>

<template>
  <div class="timeline">
    <div class="timeline-line"></div>
    <div
      v-for="(e, i) in events"
      :key="i"
      class="timeline-item"
      :class="{ even: i % 2 === 1 }"
    >
      <div class="timeline-node">
        <div class="node-dot"></div>
      </div>
      <div class="timeline-card glass-card">
        <span class="timeline-date font-mono">{{ e.date }}</span>
        <h4 class="timeline-event font-display">{{ e.event }}</h4>
        <p class="timeline-detail">{{ e.detail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--kente-gold),
    var(--terra),
    var(--adire),
    var(--baobab)
  );
  transform: translateX(-50%);
  opacity: 0.4;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32px;
  position: relative;
}

.timeline-item:not(.even) {
  flex-direction: row;
  padding-right: 52%;
}

.timeline-item.even {
  flex-direction: row-reverse;
  padding-left: 52%;
}

.timeline-node {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--terra);
  border: 3px solid var(--surface);
  box-shadow: 0 0 12px rgba(199, 91, 57, 0.4);
}

.timeline-card {
  padding: 18px;
  flex: 1;
  position: relative;
}

.timeline-item:not(.even) .timeline-card {
  margin-right: 28px;
  text-align: right;
}

.timeline-item.even .timeline-card {
  margin-left: 28px;
}

.timeline-date {
  font-size: 0.7rem;
  color: var(--kente-gold);
  letter-spacing: 0.05em;
}

.timeline-event {
  font-size: 0.95rem;
  color: var(--ink);
  margin-top: 4px;
}

.timeline-detail {
  font-size: 0.8rem;
  color: var(--ink-muted);
  margin-top: 4px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }
  .timeline-item,
  .timeline-item.even {
    flex-direction: row;
    padding-left: 48px;
    padding-right: 0;
    margin-bottom: 20px;
  }
  .timeline-node {
    left: 20px;
  }
  .timeline-card,
  .timeline-item:not(.even) .timeline-card {
    text-align: left;
    margin-left: 0;
    margin-right: 0;
    padding: 14px;
  }
  .timeline-event {
    font-size: 0.88rem;
  }
  .timeline-detail {
    font-size: 0.78rem;
  }
}
</style>
