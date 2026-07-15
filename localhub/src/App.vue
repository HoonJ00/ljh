<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ChatbotWidget from '@/components/ChatbotWidget.vue'
</script>

<template>
  <AppHeader />

  <RouterView />

  <ChatbotWidget />
</template>

<style>
* {
  box-sizing: border-box;
}

html {
  overflow-y: scroll;
}

body {
  min-width: 320px;
  margin: 0;
  color: #1f2937;
  background: #f8fafc;
  font-family:
    Pretendard,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

button,
input,
textarea {
  font: inherit;
}

a {
  color: inherit;
}
</style>