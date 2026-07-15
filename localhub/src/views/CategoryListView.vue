<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findCategory } from '@/data/categories'

const route = useRoute()

const places = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchKeyword = ref('')

const category = computed(() => {
  return findCategory(route.params.category)
})

const filteredPlaces = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return places.value
  }

  return places.value.filter((place) => {
    const title = place.title?.toLowerCase() || ''
    const address = `${place.addr1 || ''} ${place.addr2 || ''}`.toLowerCase()

    return title.includes(keyword) || address.includes(keyword)
  })
})

async function loadPlaces() {
  if (!category.value) {
    errorMessage.value = '존재하지 않는 카테고리입니다.'
    places.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''
  searchKeyword.value = ''

  try {
    const response = await fetch(category.value.file)

    if (!response.ok) {
      throw new Error('데이터 파일을 불러오지 못했습니다.')
    }

    const data = await response.json()

    if (!Array.isArray(data.items)) {
      throw new Error('JSON의 items 배열을 찾을 수 없습니다.')
    }

    places.value = data.items
  } catch (error) {
    console.error(error)
    errorMessage.value = error.message
    places.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.category,
  () => {
    loadPlaces()
  },
  { immediate: true },
)
</script>

<template>
  <main class="page-container">
    <template v-if="category">
      <section class="page-heading">
        <p>광주·전라권 지역 정보</p>
        <h1>{{ category.name }}</h1>
        <span>총 {{ places.length }}개의 장소가 있습니다.</span>
      </section>

      <section class="search-section">
        <input
          v-model="searchKeyword"
          type="search"
          :placeholder="`${category.name} 이름 또는 주소를 검색하세요`"
        />
      </section>

      <p v-if="loading" class="status-message">
        데이터를 불러오는 중입니다.
      </p>

      <p v-else-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </p>

      <p
        v-else-if="filteredPlaces.length === 0"
        class="status-message"
      >
        검색 결과가 없습니다.
      </p>

      <section v-else class="place-grid">
        <RouterLink
          v-for="place in filteredPlaces"
          :key="place.contentid"
          :to="`/detail/${category.key}/${place.contentid}`"
          class="place-card"
        >
          <div class="image-area">
            <img
              v-if="place.firstimage"
              :src="place.firstimage"
              :alt="place.title"
            />

            <div v-else class="no-image">
              이미지 없음
            </div>
          </div>

          <div class="card-content">
            <span class="category-badge">
              {{ category.name }}
            </span>

            <h2>{{ place.title }}</h2>

            <p class="address">
              {{ place.addr1 || '주소 정보 없음' }}
              {{ place.addr2 }}
            </p>

            <span class="detail-link">상세보기 →</span>
          </div>
        </RouterLink>
      </section>
    </template>

    <p v-else class="status-message error">
      존재하지 않는 카테고리입니다.
    </p>
  </main>
</template>

<style scoped>
.page-container {
  width: min(1300px, 92%);
  margin: 45px auto 80px;
}

.page-heading p {
  margin: 0 0 7px;
  color: #2563eb;
  font-weight: 700;
}

.page-heading h1 {
  margin: 0 0 10px;
  font-size: 38px;
}

.page-heading span {
  color: #64748b;
}

.search-section {
  margin: 32px 0;
}

.search-section input {
  width: min(600px, 100%);
  padding: 15px 18px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
}

.search-section input:focus {
  border-color: #2563eb;
}

.place-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.place-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgb(15 23 42 / 10%);
}

.image-area {
  height: 190px;
  background: #e2e8f0;
}

.image-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.card-content {
  padding: 20px;
}

.category-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  color: #2563eb;
  background: #eff6ff;
  font-size: 12px;
  font-weight: 700;
}

.card-content h2 {
  margin: 14px 0 10px;
  font-size: 19px;
}

.address {
  min-height: 44px;
  margin-bottom: 18px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.detail-link {
  color: #2563eb;
  font-weight: 700;
}

.status-message {
  padding: 60px 0;
  text-align: center;
}

.error {
  color: #dc2626;
}

@media (max-width: 1100px) {
  .place-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .place-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .place-grid {
    grid-template-columns: 1fr;
  }
}
</style>