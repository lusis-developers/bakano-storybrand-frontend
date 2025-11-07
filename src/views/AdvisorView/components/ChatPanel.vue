<script setup lang="ts">
import { computed, ref } from 'vue'
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

  // Generar respuesta del asistente automáticamente
  await chat.generateAssistantReply()
}

// Minimal Markdown renderer for assistant replies (bold, italics, lists, paragraphs)
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
    // Bold **text**
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
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
    <h2>Chat</h2>
    <div class="chat-stream">
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
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="input"
        type="text"
        placeholder="Escribe tu mensaje"
        :disabled="isSending || isReplying"
      />
      <button class="btn btn-primary" :disabled="isSending || isReplying" @click="sendMessage">
        <i class="fas fa-paper-plane"></i>
        {{ isSending || isReplying ? 'Enviando...' : 'Enviar' }}
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

.chat-panel h2 {
  font-size: 1rem;
  color: $BAKANO-DARK;
  margin-bottom: 0.5rem;
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

/* Better readability for Markdown inside assistant bubble */
.chat-bubble.assistant .bubble-text {
  p {
    margin: 0.25rem 0;
  }
  ul, ol {
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
  }
}

.btn {
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
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
</style>