<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createPost,
  getPostById,
  updatePost,
} from '@/utils/boardStorage'

const route = useRoute()
const router = useRouter()

const title = ref('')
const content = ref('')
const password = ref('')
const errorMessage = ref('')

const isEditMode = computed(() => {
  return Boolean(route.params.id)
})

const pageTitle = computed(() => {
  return isEditMode.value ? '게시글 수정' : '게시글 작성'
})

onMounted(() => {
  if (!isEditMode.value) {
    return
  }

  const post = getPostById(route.params.id)

  if (!post) {
    alert('게시글을 찾을 수 없습니다.')
    router.push('/board')
    return
  }

  title.value = post.title
  content.value = post.content
})

function submitPost() {
  errorMessage.value = ''

  if (!title.value.trim()) {
    errorMessage.value = '제목을 입력해 주세요.'
    return
  }

  if (!content.value.trim()) {
    errorMessage.value = '내용을 입력해 주세요.'
    return
  }

  if (password.value.length < 4) {
    errorMessage.value = '비밀번호는 4자리 이상 입력해 주세요.'
    return
  }

  if (isEditMode.value) {
    const post = getPostById(route.params.id)

    if (!post) {
      errorMessage.value = '게시글을 찾을 수 없습니다.'
      return
    }

    if (post.password !== password.value) {
      errorMessage.value = '비밀번호가 일치하지 않습니다.'
      return
    }

    updatePost(route.params.id, {
      title: title.value.trim(),
      content: content.value.trim(),
      password: password.value,
    })

    alert('게시글이 수정되었습니다.')
    router.push(`/board/${route.params.id}`)
    return
  }

  const newPost = createPost({
    title: title.value.trim(),
    content: content.value.trim(),
    password: password.value,
  })

  alert('게시글이 등록되었습니다.')
  router.push(`/board/${newPost.id}`)
}

function cancel() {
  if (isEditMode.value) {
    router.push(`/board/${route.params.id}`)
  } else {
    router.push('/board')
  }
}
</script>

<template>
  <main class="form-container">
    <section class="heading">
      <p>LOCAL COMMUNITY</p>
      <h1>{{ pageTitle }}</h1>
    </section>

    <form class="post-form" @submit.prevent="submitPost">
      <label>
        제목

        <input
          v-model="title"
          type="text"
          maxlength="100"
          placeholder="제목을 입력하세요"
        />
      </label>

      <label>
        내용

        <textarea
          v-model="content"
          rows="15"
          placeholder="내용을 입력하세요"
        ></textarea>
      </label>

      <label>
        수정용 비밀번호

        <input
          v-model="password"
          type="password"
          minlength="4"
          placeholder="4자리 이상 입력하세요"
        />
      </label>

      <p v-if="isEditMode" class="password-info">
        작성할 때 입력한 비밀번호를 입력해야 수정할 수 있습니다.
      </p>

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div class="button-group">
        <button type="submit" class="submit-button">
          {{ isEditMode ? '수정' : '등록' }}
        </button>

        <button type="button" class="cancel-button" @click="cancel">
          취소
        </button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.form-container {
  width: min(950px, 92%);
  margin: 50px auto 90px;
}

.heading p {
  margin: 0 0 8px;
  color: #2563eb;
  font-weight: 700;
}

.heading h1 {
  margin: 0 0 30px;
  font-size: 38px;
}

.post-form {
  padding: 35px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: white;
}

.post-form label {
  display: block;
  margin-bottom: 25px;
  font-weight: 700;
}

.post-form input,
.post-form textarea {
  width: 100%;
  margin-top: 10px;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
  resize: vertical;
}

.post-form input:focus,
.post-form textarea:focus {
  border-color: #2563eb;
}

.password-info {
  margin-top: -12px;
  color: #64748b;
  font-size: 14px;
}

.error-message {
  color: #dc2626;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.button-group button {
  padding: 12px 22px;
  border-radius: 9px;
  cursor: pointer;
}

.submit-button {
  border: 0;
  color: white;
  background: #2563eb;
}

.cancel-button {
  border: 1px solid #cbd5e1;
  background: white;
}
</style>