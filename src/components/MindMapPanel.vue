<script setup lang="ts">
import { ref } from 'vue'
import { extractConcepts } from '@/services/ai'
import AdinkraIcon from '@/components/AdinkraIcon.vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  content: string
  model?: string
}>()

const toastStore = useToastStore()
const loading = ref(false)
const conceptData = ref<{ nodes: any[]; edges: any[] } | null>(null)
const selectedNode = ref<any>(null)

const nodeColors = [
  'var(--kente-gold)',
  'var(--terra)',
  'var(--adire-light)',
  'var(--baobab-light)',
  'var(--kente-gold-light)',
  'var(--terra-light)',
]

async function generateMap() {
  if (!props.content) return
  loading.value = true
  selectedNode.value = null
  try {
    conceptData.value = await extractConcepts(
      props.content,
      { model: props.model }
    )
  } catch {
    toastStore.add('Could not extract concepts for the mind map.', 'error')
    conceptData.value = { nodes: [], edges: [] }
  } finally {
    loading.value = false
  }
}

function getNodeColor(index: number) {
  return nodeColors[index % nodeColors.length]
}

function getNodePosition(index: number, total: number) {
  const centerX = 600
  const centerY = 450
  const radius = 350
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  }
}
</script>

<template>
  <div class="mindmap-panel">
    <div class="map-actions" v-if="conceptData">
      <button class="btn-ghost text-xs" @click="generateMap">Regenerate</button>
    </div>

    <div class="map-content">
      <!-- Generate prompt -->
      <div v-if="!conceptData && !loading" class="generate-prompt">
        <AdinkraIcon name="mindmap" size="3em" />
        <p class="font-display text-ink-muted mt-4">Generate Concept Map</p>
        <p class="font-mono text-xs text-ink-faint mt-1">AI will extract key concepts and their connections</p>
        <button class="btn-primary mt-4" @click="generateMap">Generate</button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="generating">
        <div class="processing-spinner"></div>
        <p class="font-mono text-ink-muted text-sm">Extracting concepts...</p>
      </div>

      <!-- SVG Mind Map -->
      <div v-else-if="conceptData" class="map-container">
        <svg viewBox="0 0 1200 900" class="concept-svg">
          <!-- Edges -->
          <g v-for="(edge, i) in conceptData.edges" :key="'e' + i">
            <line
              v-if="conceptData.nodes.findIndex(n => n.id === edge.source) >= 0 && conceptData.nodes.findIndex(n => n.id === edge.target) >= 0"
              :x1="getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.source), conceptData.nodes.length).x"
              :y1="getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.source), conceptData.nodes.length).y"
              :x2="getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.target), conceptData.nodes.length).x"
              :y2="getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.target), conceptData.nodes.length).y"
              stroke="rgba(212, 160, 23, 0.2)"
              stroke-width="1.5"
            />
            <text
              v-if="conceptData.nodes.findIndex(n => n.id === edge.source) >= 0 && conceptData.nodes.findIndex(n => n.id === edge.target) >= 0"
              :x="(getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.source), conceptData.nodes.length).x + getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.target), conceptData.nodes.length).x) / 2"
              :y="(getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.source), conceptData.nodes.length).y + getNodePosition(conceptData.nodes.findIndex(n => n.id === edge.target), conceptData.nodes.length).y) / 2 - 6"
              text-anchor="middle"
              fill="#6B6560"
              font-size="8"
              font-family="JetBrains Mono, monospace"
            >
              {{ edge.label }}
            </text>
          </g>

          <!-- Nodes -->
          <g
            v-for="(node, i) in conceptData.nodes"
            :key="node.id"
            class="concept-node"
            :transform="`translate(${getNodePosition(i, conceptData.nodes.length).x}, ${getNodePosition(i, conceptData.nodes.length).y})`"
            @click="selectedNode = selectedNode?.id === node.id ? null : node"
            style="cursor: pointer"
          >
            <circle r="28" :fill="getNodeColor(i)" opacity="0.08" />
            <circle
              r="24"
              fill="#161638"
              :stroke="getNodeColor(i)"
              stroke-width="1.5"
              :opacity="selectedNode?.id === node.id ? 1 : 0.7"
            />
            <circle r="18" fill="none" :stroke="getNodeColor(i)" stroke-width="0.5" opacity="0.3" />
            <text
              text-anchor="middle"
              dy="3"
              fill="#F5F0E8"
              font-size="7"
              font-family="Playfair Display, serif"
              font-weight="600"
            >
              {{ node.label?.length > 8 ? node.label.slice(0, 7) + '…' : node.label }}
            </text>
          </g>
        </svg>

        <!-- Selected node detail -->
        <div v-if="selectedNode" class="node-detail glass-card">
          <h3 class="font-display text-kente-gold">{{ selectedNode.label }}</h3>
          <p class="text-sm text-ink-muted mt-2 leading-relaxed">{{ selectedNode.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mindmap-panel {
  padding: 16px 32px;
}

.map-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.map-content {
  padding: 0;
}

.generate-prompt {
  text-align: center;
  padding: 80px 0;
  color: var(--ink-faint);
}

.generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 12px;
}

.processing-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(212, 160, 23, 0.15);
  border-top-color: var(--kente-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.map-container {
  position: relative;
}

.concept-svg {
  width: 100%;
  max-height: 600px;
}

.concept-node {
  transition: transform 0.2s;
}
.concept-node:hover circle {
  opacity: 1 !important;
}

.node-detail {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 20px;
  max-width: 300px;
}

@media (max-width: 768px) {
  .mindmap-panel {
    padding: 12px 14px;
  }

  .generate-prompt {
    padding: 48px 16px;
  }

  .generating {
    padding: 48px 16px;
  }

  .concept-svg {
    max-height: 400px;
  }

  .node-detail {
    position: relative;
    bottom: auto;
    right: auto;
    max-width: 100%;
    margin-top: 12px;
    padding: 14px;
  }
}
</style>
