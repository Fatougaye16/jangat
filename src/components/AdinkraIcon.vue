<script setup lang="ts">
defineProps<{
  name: 'home' | 'library' | 'reader' | 'mindmap' | 'infographic' | 'settings' | 'upload' | 'search' | 'highlight' | 'chat'
  size?: string
}>()
</script>

<template>
  <!-- Adinkra-inspired geometric icons -->
  <span class="adinkra-icon" :style="{ fontSize: size || '1.5em' }">
    <!-- Home: Aban (fortress/home) -->
    <svg v-if="name === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12L12 4l9 8" />
      <path d="M5 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h4a1 1 0 011 1v5h3a1 1 0 001-1v-9" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>

    <!-- Library: Nea Onnim (knowledge) -->
    <svg v-else-if="name === 'library'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <rect x="3" y="4" width="4" height="16" rx="1" />
      <rect x="8.5" y="3" width="4" height="17" rx="1" transform="rotate(3 10.5 11.5)" />
      <rect x="14" y="5" width="4" height="15" rx="1" transform="rotate(-2 16 12.5)" />
      <line x1="20" y1="4" x2="20" y2="20" stroke-width="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" />
    </svg>

    <!-- Reader -->
    <svg v-else-if="name === 'reader'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <path d="M2 4c2-1 4-1 6 0s4 1 6 0v14c-2 1-4 1-6 0s-4-1-6 0V4z" />
      <path d="M14 4c2-1 4-1 6 0s2 0 2 0v14s0 0-2 0c-2-1-4-1-6 0" />
      <path d="M8 8h-2m2 3h-2m12-3h-2m2 3h-2" stroke-width="1" opacity="0.5" />
    </svg>

    <!-- Mind Map: Funtunfunefu (unity of relations) -->
    <svg v-else-if="name === 'mindmap'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="10" y1="10" x2="6.5" y2="6.5" />
      <line x1="14" y1="10" x2="17.5" y2="6.5" />
      <line x1="10" y1="14" x2="6.5" y2="17.5" />
      <line x1="14" y1="14" x2="17.5" y2="17.5" />
    </svg>

    <!-- Infographic: Nsaa (excellence, pattern) -->
    <svg v-else-if="name === 'infographic'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <rect x="3" y="14" width="4" height="6" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="17" y="4" width="4" height="16" rx="1" fill="currentColor" opacity="0.3" />
      <path d="M5 12l7-6 7-2" stroke-width="2" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="19" cy="4" r="1.5" fill="currentColor" />
    </svg>

    <!-- Settings: Dwennimmen (humility and strength) -->
    <svg v-else-if="name === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5.6 5.6l1.4 1.4m9.9 9.9l1.4 1.4M18.4 5.6l-1.4 1.4M6.6 16.6l-1.4 1.4" />
    </svg>

    <!-- Upload -->
    <svg v-else-if="name === 'upload'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
    </svg>

    <!-- Search -->
    <svg v-else-if="name === 'search'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" stroke-width="2" />
    </svg>

    <!-- Highlight -->
    <svg v-else-if="name === 'highlight'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <path d="M15.2 3.8l5 5L9 20H4v-5L15.2 3.8z" />
      <path d="M4 20h16" opacity="0.4" />
    </svg>

    <!-- Chat -->
    <svg v-else-if="name === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <path d="M21 12c0 4.4-4 8-9 8-1.6 0-3-.3-4.3-.9L3 21l1.5-4C3.5 15.5 3 13.8 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
      <path d="M9 12h.01M12 12h.01M15 12h.01" stroke-width="2" />
    </svg>
  </span>
</template>
