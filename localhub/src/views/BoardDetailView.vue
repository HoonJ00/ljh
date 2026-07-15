<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  deletePost,
  getPostById,
} from '@/utils/boardStorage'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const showPasswordModal = ref(false)
const deletePassword = ref('')
const errorMessage = ref('')

onMounted(() => {
  post.value = getPostById(route.params.id)

  if (!post.value) {
    alert('게시글을 찾을 수 없습니다.')
    router.push('/board')
  }
})

function openDeleteModal() {
  deletePassword.value = ''
  errorMessage.value = ''
  showPasswordModal.value = true
}

function closeDeleteModal() {
  showPasswordModal.value = false
}

function confirmDelete() {
  if (!post.value) {
    return
  }

  if (deletePassword.value !== post.value.password) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  const confirmed = confirm('게시글을 삭제하시겠습니까?')

  if (!confirmed) {
    return
  }

  deletePost(post.value.id)

  alert('게시글이 삭제되었습니다.')
  router.push('/board')
}
</script>

<template>
  <main v-if="post" class="detail-container">
    <div class="breadcrumb">
      <RouterLink to="/">홈</RouterLink>
      <span>›</span>
      <RouterLink to="/board">커뮤니티</RouterLink>
      <span>›</span>
      <span>게시글 상세</span>
    </div>

    <article class="post">
      <header class="post-header">
        <h1>{{ post.title }}</h1>

        <div class="date">
          <span>작성일: {{ post.createdAt }}</span>

          <span v-if="post.updatedAt">
            수정일: {{ post.updatedAt }}
          </span>
        </div>
      </header>

      <div class="post-content">
        {{ post.content }}
      </div>
    </article>

    <div class="button-group">
      <RouterLink to="/board" class="list-button">
        목록으로
      </RouterLink>

      <div>
        <RouterLink
          :to="`/board/${post.id}/edit`"
          class="edit-button"
        >
          수정
        </RouterLink>

        <button
          type="button"
          class="delete-button"
          @click="openDeleteModal"
        >
          삭제
        </button>
      </div>
    </div>

    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <section class="modal">
        <h2>비밀번호 확인</h2>

        <p>게시글 작성 시 입력한 비밀번호를 입력하세요.</p>

        <input
          v-model="deletePassword"
          type="password"
          placeholder="비밀번호 입력"
          @keyup.enter="confirmDelete"
        />

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <div class="modal-buttons">
          <button type="button" @click="confirmDelete">
            확인
          </button>

          <button type="button" @click="closeDeleteModal">
            취소
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.detail-container {
  width: min(1000px, 92%);
  margin: 45px auto 90px;
}

.breadcrumb {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  color: #64748b;
  font-size: 14px;
}

.breadcrumb a {
  text-decoration: none;
}

.post {
  border-top: 2px solid #334155;
  border-bottom: 1px solid #cbd5e1;
  background: white;
}

.post-header {
  padding: 28px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.post-header h1 {
  margin: 0 0 16px;
  font-size: 30px;
}

.date {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: #64748b;
  font-size: 14px;
}

.post-content {
  min-height: 350px;
  padding: 35px 30px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.button-group div {
  display: flex;
  gap: 10px;
}

.list-button,
.edit-button,
.delete-button {
  padding: 11px 19px;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
}

.list-button,
.edit-button {
  border: 1px solid #cbd5e1;
  color: #334155;
  background: white;
}

.delete-button {
  border: 1px solid #dc2626;
  color: #dc2626;
  background: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(15 23 42 / 55%);
}

.modal {
  width: min(430px, 100%);
  padding: 30px;
  border-radius: 16px;
  background: white;
}

.modal h2 {
  margin-top: 0;
}

.modal p {
  color: #64748b;
}

.modal input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.error-message {
  color: #dc2626 !important;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.modal-buttons button {
  padding: 10px 18px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.modal-buttons button:first-child {
  border-color: #dc2626;
  color: white;
  background: #dc2626;
}
</style>