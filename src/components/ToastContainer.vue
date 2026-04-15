<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast-list">
    <div
      v-for="t in toast.toasts"
      :key="t.id"
      class="toast-item"
      :class="`toast-${t.type}`"
      role="alert"
    >
      <span class="toast-message font-mono">{{ t.message }}</span>
      <button class="toast-close" @click="toast.remove(t.id)" aria-label="Dismiss">×</button>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toast-list {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  width: calc(100vw - 40px);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(22, 22, 56, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left-width: 3px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.toast-error   { border-left-color: #C75B39; }
.toast-success { border-left-color: #40916C; }
.toast-warning { border-left-color: #D4A017; }
.toast-info    { border-left-color: #7EB8D4; }

.toast-message {
  flex: 1;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--ink);
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--ink-faint);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.15s;
  margin-top: -1px;
}

.toast-close:hover {
  color: var(--ink);
}

.toast-enter-active {
  transition: all 0.25s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (max-width: 768px) {
  .toast-list {
    top: auto;
    bottom: calc(60px + env(safe-area-inset-bottom));
    right: 12px;
    left: 12px;
    width: auto;
    max-width: none;
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateY(24px);
  }
  .toast-leave-to {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
