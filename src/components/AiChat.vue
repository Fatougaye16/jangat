<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import AdinkraIcon from './AdinkraIcon.vue'

const props = defineProps<{
  context: string
  model?: string
}>()

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const emit = defineEmits<{
  messageSent: [msg: Message]
}>()

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const messages = ref<Message[]>([])
const input = ref('')
const isStreaming = ref(false)
const chatContainer = ref<HTMLElement>()

function renderMarkdown(text: string) {
  return md.render(text)
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return

  const userMsg: Message = { role: 'user', content: text }
  messages.value.push(userMsg)
  emit('messageSent', userMsg)
  input.value = ''

  isStreaming.value = true
  const assistantMsg: Message = { role: 'assistant', content: '' }
  messages.value.push(assistantMsg)

  try {
    const { askQuestion } = await import('@/services/ai')
    const stream = askQuestion(props.context, text, { model: props.model })

    for await (const chunk of stream) {
      assistantMsg.content += chunk
      await nextTick()
      scrollToBottom()
    }

    emit('messageSent', assistantMsg)
  } catch (err) {
    assistantMsg.content = '⚠ Could not connect to Ollama. Make sure it is running on localhost:11434.'
  } finally {
    isStreaming.value = false
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, () => nextTick(scrollToBottom), { deep: true })
</script>

<template>
  <div class="ai-chat">
    <div class="chat-header">
      <AdinkraIcon name="chat" size="1.2em" />
      <span class="font-mono text-sm">Ask Jàngat</span>
    </div>

    <div class="kente-stripe"></div>

    <div ref="chatContainer" class="chat-messages">
      <!-- Welcome -->
      <div v-if="!messages.length" class="chat-welcome">
        <p class="font-display text-ink-muted italic">
          "Laaj, nga xam"
        </p>
        <p class="font-mono text-ink-faint text-xs mt-1">
          Ask, and you shall know
        </p>
        <div class="suggestions mt-4">
          <button
            v-for="q in ['Summarize the main ideas', 'What are the key arguments?', 'Explain the core concepts']"
            :key="q"
            class="suggestion-chip font-mono"
            @click="input = q; sendMessage()"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="chat-bubble"
        :class="msg.role"
      >
        <div v-if="msg.role === 'assistant'" class="bubble-content" v-html="renderMarkdown(msg.content)"></div>
        <div v-else class="bubble-content">{{ msg.content }}</div>
      </div>

      <!-- Streaming indicator -->
      <div v-if="isStreaming && messages[messages.length - 1]?.content === ''" class="streaming-dots">
        <span></span><span></span><span></span>
      </div>
    </div>

    <form class="chat-input-area" @submit.prevent="sendMessage">
      <input
        v-model="input"
        type="text"
        placeholder="Ask a question about this text..."
        class="chat-input font-mono"
        :disabled="isStreaming"
      />
      <button type="submit" class="send-btn" :disabled="isStreaming || !input.trim()">
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path d="M2.5 2.5l15 7.5-15 7.5v-6l10-1.5-10-1.5v-6z" />
        </svg>
      </button>
    </form>
  </div>
</template>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(13, 13, 43, 0.5);
  backdrop-filter: blur(12px);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  color: var(--kente-gold);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-welcome {
  text-align: center;
  padding: 32px 0;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-chip {
  background: rgba(212, 160, 23, 0.08);
  border: 1px solid rgba(212, 160, 23, 0.2);
  border-radius: 10px;
  padding: 8px 14px;
  color: var(--ink-muted);
  font-size: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: rgba(212, 160, 23, 0.15);
  color: var(--kente-gold);
}

.chat-bubble {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.6;
}

.chat-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--kente-gold-dark), var(--terra-dark));
  color: var(--ink);
  border-bottom-right-radius: 4px;
}

.chat-bubble.assistant {
  align-self: flex-start;
  background: var(--surface-raised);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--ink);
  border-bottom-left-radius: 4px;
}

.bubble-content :deep(p) {
  margin: 0 0 8px;
}
.bubble-content :deep(p:last-child) {
  margin-bottom: 0;
}
.bubble-content :deep(ul),
.bubble-content :deep(ol) {
  padding-left: 18px;
  margin: 4px 0;
}
.bubble-content :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8em;
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 4px;
}

.streaming-dots {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  align-self: flex-start;
}
.streaming-dots span {
  width: 6px;
  height: 6px;
  background: var(--kente-gold);
  border-radius: 50%;
  animation: bounce 1.2s infinite;
}
.streaming-dots span:nth-child(2) { animation-delay: 0.2s; }
.streaming-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--ink);
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: var(--kente-gold);
}
.chat-input::placeholder {
  color: var(--ink-faint);
}

.send-btn {
  background: linear-gradient(135deg, var(--kente-gold), var(--terra));
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
}
.send-btn:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(212, 160, 23, 0.3);
}
.send-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ---- Mobile responsive ---- */
@media (max-width: 768px) {
  .ai-chat {
    height: 100%;
    min-height: 0;
  }

  .chat-header {
    padding: 12px 14px;
  }

  .chat-messages {
    padding: 12px 14px;
    gap: 10px;
    overscroll-behavior: contain;
  }

  .chat-welcome {
    padding: 20px 8px;
  }

  .suggestions {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 8px;
    padding-bottom: 4px;
  }
  .suggestions::-webkit-scrollbar {
    display: none;
  }

  .suggestion-chip {
    padding: 12px 14px;
    font-size: 0.78rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .chat-bubble {
    max-width: 88%;
    padding: 10px 12px;
    font-size: 0.82rem;
    word-break: break-word;
  }

  .bubble-content :deep(pre) {
    overflow-x: auto;
    max-width: calc(100vw - 80px);
  }

  .bubble-content :deep(code) {
    font-size: 0.75em;
    word-break: break-all;
  }

  .chat-input-area {
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    position: sticky;
    bottom: 0;
    background: rgba(13, 13, 43, 0.95);
    backdrop-filter: blur(12px);
  }

  .chat-input {
    font-size: 16px;
    padding: 10px 12px;
    min-height: 44px;
  }

  .send-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
}
</style>
