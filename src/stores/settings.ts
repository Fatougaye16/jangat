import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkOllamaStatus, listModels, setApiKey, getApiKey } from '@/services/ai'

export const useSettingsStore = defineStore('settings', () => {
  const selectedModel = ref('granite-3.2-dense')
  const availableModels = ref<string[]>([])
  const ollamaConnected = ref(false)
  const sidebarCollapsed = ref(false)
  const ollamaApiKey = ref(getApiKey())

  async function refreshStatus() {
    ollamaConnected.value = await checkOllamaStatus()
    if (ollamaConnected.value) {
      availableModels.value = await listModels()
      if (availableModels.value.length && !availableModels.value.includes(selectedModel.value)) {
        selectedModel.value = availableModels.value[0]
      }
    }
  }

  async function updateApiKey(key: string) {
    setApiKey(key)
    ollamaApiKey.value = key
    await refreshStatus()
  }

  return {
    selectedModel,
    availableModels,
    ollamaConnected,
    sidebarCollapsed,
    ollamaApiKey,
    refreshStatus,
    updateApiKey,
  }
})
