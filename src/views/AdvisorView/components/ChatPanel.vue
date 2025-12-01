<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { chatStore } from '@/stores/chat.store'
import { useBusinessStore } from '@/stores/business.store'

const props = defineProps<{ canStartChat: boolean }>()
const emit = defineEmits<{ (e: 'start-chat'): void }>()

const toast = useToast()
const chat = chatStore()
const business = useBusinessStore()

const input = ref('')
const messages = computed(() => chat.messages)
const isSending = computed(() => chat.loading.sending)
const isReplying = computed(() => chat.loading.replying)
const currentChatId = computed(() => chat.currentChatId)

// Scroll handling
const streamEl = ref<HTMLElement | null>(null)
function scrollToBottom() {
  const el = streamEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

onMounted(async () => {
  await nextTick()
  scrollToBottom()
})

// Auto-scroll when messages change or when typing state toggles
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})
watch(isReplying, async () => {
  await nextTick()
  scrollToBottom()
})

function formatDate(value?: string): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}

async function ensureConversation() {
  if (!currentChatId.value) {
    if (!props.canStartChat) {
      toast.triggerToast('Selecciona un negocio para iniciar el chat', 'info')
      return false
    }
    emit('start-chat')
    // Esperamos a que el store cargue el chat actual
    // Nota: en una implementación real, podríamos escuchar cambios del store o await explícito del padre
  }
  return true
}

async function sendMessage() {
  const content = input.value.trim()
  if (!content) {
    toast.triggerToast('Escribe un mensaje antes de enviar', 'info')
    return
  }
  const ok = await ensureConversation()
  if (!ok) return

  const sent = await chat.addUserMessage(content)
  if (!sent) return

  input.value = ''
  await nextTick()
  scrollToBottom()

  // Generar respuesta del asistente automáticamente
  await chat.generateAssistantReply()
}

// Minimal Markdown renderer for assistant replies (bold, italics, lists, paragraphs, links)
function renderMarkdown(md: string): string {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const formatInline = (s: string) => {
    let t = escapeHtml(s)
    t = t.replace(/`+\s*(https?:\/\/[^\s`]+)\s*`+/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    t = t.replace(/(https?:\/\/[^\s<]+)(?![^<]*>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    t = t.replace(/(^|\s)\*(.+?)\*(\s|$)/g, '$1<em>$2</em>$3')
    return t
  }

  const lines = md.split(/\r?\n/)
  let html = ''
  let inOl = false
  let inUl = false

  const closeLists = () => {
    if (inOl) { html += '</ol>'; inOl = false }
    if (inUl) { html += '</ul>'; inUl = false }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (/^\s*$/.test(line)) {
      // Blank line: close lists, paragraph break handled implicitly
      closeLists()
      continue
    }
    if (/^[-]{3,}$/.test(line)) {
      closeLists()
      html += '<hr />'
      continue
    }
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/)
    const ulMatch = line.match(/^\s*[-*]\s+(.*)$/)

    if (olMatch) {
      if (!inOl) { closeLists(); html += '<ol>'; inOl = true }
      html += `<li>${formatInline(olMatch[2])}</li>`
      continue
    }
    if (ulMatch) {
      if (!inUl) { closeLists(); html += '<ul>'; inUl = true }
      html += `<li>${formatInline(ulMatch[1])}</li>`
      continue
    }

    // Default paragraph
    closeLists()
    html += `<p>${formatInline(line)}</p>`
  }

  closeLists()
  return html
}
</script>

<template>
  <section class="chat-panel">
    <h2 class="chat-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="chat-title__icon">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Conversación
    </h2>
    <div class="chat-stream" ref="streamEl">
      <div v-if="messages.length === 0" class="empty">
        <p>
          {{ currentChatId ? 'Aún no hay mensajes en esta conversación.' : 'Inicia una nueva conversación para comenzar.' }}
        </p>
      </div>
      <div v-else>
        <div v-for="(m, idx) in messages" :key="idx" class="chat-bubble" :class="m.role">
          <div class="bubble-text" v-if="m.role === 'assistant'" v-html="renderMarkdown(m.content)"></div>
          <div class="bubble-text" v-else>{{ m.content }}</div>
          <div class="bubble-meta">{{ formatDate(m.createdAt) }}</div>
        </div>
        <!-- Typing indicator as assistant bubble -->
        <div v-if="isReplying" class="chat-bubble assistant typing">
          <div class="bubble-text">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
          <div class="bubble-meta">Escribiendo…</div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="input"
        type="text"
        placeholder="Escribe tu mensaje"
        :disabled="isSending || isReplying"
        @keydown.enter.prevent="sendMessage"
      />
      <button class="btn btn-primary" :disabled="isSending || isReplying" @click="sendMessage">
        <span class="btn-loader" v-if="isSending || isReplying"></span>
        <i v-else class="fas fa-paper-plane"></i>
        <span class="btn-text">{{ isSending || isReplying ? 'Enviando…' : 'Enviar' }}</span>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.chat-panel {
  background: white;
  border: 1px solid lighten($BAKANO-DARK, 78%);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: $BAKANO-DARK;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.chat-title__icon {
  color: lighten($BAKANO-DARK, 20%);
}

.chat-stream {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  max-height: 480px;
  overflow: auto;
  background: lighten($BAKANO-DARK, 97%);
  border: 1px solid lighten($BAKANO-DARK, 83%);
  border-radius: 12px;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

.empty {
  color: lighten($BAKANO-DARK, 35%);
  font-size: 0.9rem;
}

.chat-bubble {
  max-width: 85%;
  border-radius: 16px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
  animation: bubbleIn 160ms ease-out;
}

.chat-bubble.user {
  align-self: flex-end;
  background: lighten($BAKANO-PINK, 48%);
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-PINK, 30%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border-top-right-radius: 4px;
}

.chat-bubble.assistant {
  align-self: flex-start;
  background: white;
  color: $BAKANO-DARK;
  border: 1px solid lighten($BAKANO-DARK, 83%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 4px;
}

.chat-bubble.assistant.typing {
  .bubble-text {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

/* Better readability for Markdown inside assistant bubble */
.chat-bubble.assistant .bubble-text {
  p {
    margin: 0.25rem 0;
  }

  ul,
  ol {
    margin: 0.375rem 0 0.375rem 1rem;
  }

  li {
    margin: 0.25rem 0;
  }

  strong {
    font-weight: 700;
    color: darken($BAKANO-DARK, 5%);
  }

  em {
    font-style: italic;
  }

  a {
    color: $BAKANO-PINK;
    text-decoration: underline;
    word-break: break-all;
  }

  code {
    background: lighten($BAKANO-DARK, 94%);
    border: 1px solid lighten($BAKANO-DARK, 85%);
    border-radius: 6px;
    padding: 0 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.8125rem;
  }
}

.bubble-meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: lighten($BAKANO-DARK, 40%);
}

.chat-bubble.user .bubble-meta {
  text-align: right;
}

.chat-bubble.assistant .bubble-meta {
  text-align: left;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: center;
  padding-top: 0.25rem;
}

.chat-input input::placeholder {
  color: lighten($BAKANO-DARK, 45%);
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;

  input {
    flex: 1;
    border: 1px solid lighten($BAKANO-DARK, 75%);
    border-radius: 12px;
    padding: 0.625rem 0.875rem;
    background: lighten($BAKANO-DARK, 98%);
    transition: border-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: lighten($BAKANO-PINK, 20%);
      box-shadow: 0 0 0 2px lighten($BAKANO-PINK, 40%);
    }

    &:disabled {
      opacity: 0.8;
      background: lighten($BAKANO-DARK, 98.5%);
    }
  }
}

.btn {
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: $BAKANO-PINK;
  color: white;
  transition: background 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    background: darken($BAKANO-PINK, 5%);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.btn-loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-top-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: lighten($BAKANO-DARK, 20%);
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.2s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  40% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes bubbleIn {
  from {
    transform: translateY(4px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
