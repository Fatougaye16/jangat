<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()
const settings = useSettingsStore()

const navItems = [
  { name: 'home' as const, label: 'Home', to: '/' },
  { name: 'library' as const, label: 'Library', to: '/library' },
]

const isReaderPage = computed(() => route.name === 'reader')


onMounted(() => {
  settings.refreshStatus()
})

</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': settings.sidebarCollapsed }">
    <!-- Sidebar -->
    <aside v-if="!isReaderPage" class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo font-display">
          <span class="text-gradient">Jàngat</span>
        </h1>
        <p class="tagline font-mono text-ink-faint text-xs">Knowledge, Illuminated</p>
      </div>

      <div class="kente-stripe mx-4 my-4"></div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ active: route.path === item.to }"
        >
          <AdinkraIcon :name="item.name" size="1.25em" />
          <span class="nav-label font-mono">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="kente-stripe mx-4 mb-4"></div>
        <div class="status-badge" :class="settings.ollamaConnected ? 'connected' : 'disconnected'">
          <span class="status-dot"></span>
          <span class="font-mono text-xs">
            {{ settings.ollamaConnected ? 'Ollama Connected' : 'Ollama Offline' }}
          </span>
        </div>
        <p class="proverb font-display text-ink-faint text-xs italic px-4 mt-3">
          "Ku am xam-xam, am na leer"<br/>
          <span class="text-ink-faint/60">— Who has knowledge, has light</span>
        </p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content mudcloth-bg" :class="{ 'full-width': isReaderPage }">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>

  <ToastContainer />
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: rgba(13, 13, 43, 0.9);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
}

.sidebar-header {
  padding: 28px 24px 0;
}

.logo {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.tagline {
  margin-top: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  color: var(--ink-muted);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink);
}

.nav-item.active {
  background: rgba(212, 160, 23, 0.1);
  color: var(--kente-gold);
  border-left: 2px solid var(--kente-gold);
}

.sidebar-footer {
  padding-bottom: 20px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  margin: 0 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.connected .status-dot {
  background: var(--baobab-light);
  box-shadow: 0 0 8px rgba(64, 145, 108, 0.5);
}

.disconnected .status-dot {
  background: var(--terra);
  box-shadow: 0 0 8px rgba(199, 91, 57, 0.5);
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  position: relative;
}

.main-content.full-width {
  margin-left: 0;
}

.proverb {
  line-height: 1.6;
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    min-height: auto;
    height: auto;
    flex-direction: row;
    align-items: center;
    border-right: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    z-index: 100;
    padding: 0;
  }

  .sidebar-header,
  .sidebar-footer,
  .sidebar .kente-stripe {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-around;
    flex: 1;
    padding: 0;
    gap: 0;
  }

  .nav-item {
    flex-direction: column;
    gap: 4px;
    padding: 10px 16px;
    border-radius: 0;
    font-size: 0.7rem;
    text-align: center;
  }

  .nav-item.active {
    border-left: none;
    border-top: 2px solid var(--kente-gold);
  }

  .main-content {
    margin-left: 0;
    padding-bottom: 64px;
  }
}
</style>
