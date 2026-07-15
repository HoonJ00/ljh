<script setup>
import { nextTick, ref } from 'vue'
import { askLocalHubChatbot } from '@/services/openai'
import { findRelevantPlaces } from '@/services/localData'

const isOpen = ref(false)
const userInput = ref('')
const isLoading = ref(false)
const chatBody = ref(null)

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content:
      '안녕하세요. 광주·전라권 관광지, 음식점, 숙박, 문화시설, 축제 등을 물어보세요.',
  },
])

function toggleChat() {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()

  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

async function sendMessage() {
  const question = userInput.value.trim()

  if (!question || isLoading.value) {
    return
  }

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: question,
  })

  userInput.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const relevantPlaces = await findRelevantPlaces(question)

    const history = messages.value
      .slice(0, -1)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }))

    const answer = await askLocalHubChatbot(
      question,
      relevantPlaces,
      history,
    )

    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: answer,
    })
  } catch (error) {
    console.error(error)

    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: `오류가 발생했습니다: ${error.message}`,
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<template>
  <div class="chatbot">
    <button
      v-if="!isOpen"
      type="button"
      class="floating-button"
      aria-label="LocalHub 챗봇 열기"
      @click="toggleChat"
    >
      <span>💬</span>
      <strong>챗봇</strong>
    </button>

    <section v-else class="chat-window">
      <header class="chat-header">
        <div>
          <strong>LocalHub 챗봇</strong>
          <span>광주·전라 지역 정보 안내</span>
        </div>

        <button
          type="button"
          class="close-button"
          aria-label="챗봇 닫기"
          @click="toggleChat"
        >
          ×
        </button>
      </header>

      <div ref="chatBody" class="chat-body">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'message-row',
            message.role === 'user'
              ? 'user-row'
              : 'assistant-row',
          ]"
        >
          <div class="message-bubble">
            {{ message.content }}
          </div>
        </div>

        <div v-if="isLoading" class="message-row assistant-row">
          <div class="message-bubble loading-message">
            답변을 작성하고 있습니다...
          </div>
        </div>
      </div>

      <form class="chat-input-area" @submit.prevent="sendMessage">
        <input
          v-model="userInput"
          type="text"
          placeholder="예: 광주 맛집 추천해줘"
          :disabled="isLoading"
        />

        <button
          type="submit"
          :disabled="isLoading || !userInput.trim()"
        >
          전송
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.chatbot {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.floating-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 19px;
  border: 0;
  border-radius: 999px;
  color: white;
  background: #2563eb;
  box-shadow: 0 12px 30px rgb(37 99 235 / 30%);
  cursor: pointer;
}

.floating-button span {
  font-size: 20px;
}

.chat-window {
  display: flex;
  flex-direction: column;
  width: min(390px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 48px));
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 18px;
  background: white;
  box-shadow: 0 20px 55px rgb(15 23 42 / 24%);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 19px;
  color: white;
  background: #2563eb;
}

.chat-header div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chat-header span {
  color: #dbeafe;
  font-size: 12px;
}

.close-button {
  border: 0;
  color: white;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background: #f8fafc;
}

.message-row {
  display: flex;
  margin-bottom: 13px;
}

.user-row {
  justify-content: flex-end;
}

.assistant-row {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 82%;
  padding: 11px 14px;
  border-radius: 15px;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.user-row .message-bubble {
  color: white;
  background: #2563eb;
  border-bottom-right-radius: 4px;
}

.assistant-row .message-bubble {
  color: #334155;
  background: white;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.loading-message {
  color: #64748b;
}

.chat-input-area {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 13px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.chat-input-area input {
  min-width: 0;
  padding: 12px 13px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
}

.chat-input-area input:focus {
  border-color: #2563eb;
}

.chat-input-area button {
  padding: 0 16px;
  border: 0;
  border-radius: 9px;
  color: white;
  background: #2563eb;
  cursor: pointer;
}

.chat-input-area button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .chatbot {
    right: 0;
    bottom: 0;
  }

  .floating-button {
    margin: 0 16px 16px 0;
  }

  .chat-window {
    width: 100vw;
    height: 100dvh;
    border: 0;
    border-radius: 0;
  }
}
</style>