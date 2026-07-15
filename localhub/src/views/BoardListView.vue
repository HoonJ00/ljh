<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getPosts } from '@/utils/boardStorage'

const posts = ref([])
const searchKeyword = ref('')

onMounted(() => {
  posts.value = getPosts()
})

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return posts.value
  }

  return posts.value.filter((post) => {
    const title = post.title.toLowerCase()
    const content = post.content.toLowerCase()

    return title.includes(keyword) || content.includes(keyword)
  })
})
</script>

<template>
  <main class="board-container">
    <section class="board-heading">
      <div>
        <p>LOCAL COMMUNITY</p>
        <h1>광주·전라 익명 커뮤니티</h1>
        <span>지역 정보를 자유롭게 공유해 보세요.</span>
      </div>

      <RouterLink to="/board/write" class="write-button">
        글쓰기
      </RouterLink>
    </section>

    <section class="search-section">
      <input
        v-model="searchKeyword"
        type="search"
        placeholder="제목 또는 내용을 검색하세요"
      />
    </section>

    <section class="board-table">
      <div class="table-header">
        <span class="number">번호</span>
        <span class="title">제목</span>
        <span class="date">작성일</span>
      </div>

      <p v-if="filteredPosts.length === 0" class="empty-message">
        등록된 게시글이 없습니다.
      </p>

      <RouterLink
        v-for="(post, index) in filteredPosts"
        v-else
        :key="post.id"
        :to="`/board/${post.id}`"
        class="table-row"
      >
        <span class="number">
          {{ filteredPosts.length - index }}
        </span>

        <span class="title">
          {{ post.title }}
        </span>

        <span class="date">
          {{ post.createdAt }}
        </span>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.board-container {
  width: min(1100px, 92%);
  margin: 50px auto 90px;
}

.board-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.board-heading p {
  margin: 0 0 8px;
  color: #2563eb;
  font-weight: 700;
}

.board-heading h1 {
  margin: 0 0 10px;
  font-size: 38px;
}

.board-heading span {
  color: #64748b;
}

.write-button {
  padding: 12px 20px;
  border-radius: 9px;
  color: white;
  background: #2563eb;
  text-decoration: none;
}

.search-section {
  margin: 35px 0 20px;
}

.search-section input {
  width: min(600px, 100%);
  padding: 14px 17px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
}

.search-section input:focus {
  border-color: #2563eb;
}

.board-table {
  overflow: hidden;
  border-top: 2px solid #334155;
  border-bottom: 1px solid #cbd5e1;
  background: white;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 220px;
  align-items: center;
  min-height: 58px;
  padding: 0 20px;
}

.table-header {
  background: #f1f5f9;
  font-weight: 700;
}

.table-row {
  border-top: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
}

.table-row:hover {
  background: #f8fafc;
}

.number {
  text-align: center;
}

.date {
  color: #64748b;
  text-align: center;
  font-size: 14px;
}

.empty-message {
  padding: 70px 20px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 700px) {
  .board-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .table-header,
  .table-row {
    grid-template-columns: 55px 1fr;
  }

  .date {
    display: none;
  }

  .board-heading h1 {
    font-size: 30px;
  }
}
</style>