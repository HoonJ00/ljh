<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findCategory } from '@/data/categories'

const route = useRoute()

const place = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const category = computed(() => {
  return findCategory(route.params.category)
})

async function loadPlace() {
  if (!category.value) {
    errorMessage.value = '존재하지 않는 카테고리입니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  place.value = null

  try {
    const response = await fetch(category.value.file)

    if (!response.ok) {
      throw new Error('데이터를 불러오지 못했습니다.')
    }

    const data = await response.json()

    const selectedPlace = data.items.find(
      (item) => String(item.contentid) === String(route.params.contentId),
    )

    if (!selectedPlace) {
      throw new Error('해당 장소를 찾을 수 없습니다.')
    }

    place.value = selectedPlace
  } catch (error) {
    console.error(error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.category, route.params.contentId],
  () => {
    loadPlace()
  },
  { immediate: true },
)
</script>

<template>
  <main class="detail-container">
    <p v-if="loading" class="status-message">
      장소 정보를 불러오는 중입니다.
    </p>

    <p v-else-if="errorMessage" class="status-message error">
      {{ errorMessage }}
    </p>

    <template v-else-if="place && category">
      <div class="breadcrumb">
        <RouterLink to="/">홈</RouterLink>
        <span>›</span>
        <RouterLink :to="`/category/${category.key}`">
          {{ category.name }}
        </RouterLink>
        <span>›</span>
        <span>{{ place.title }}</span>
      </div>

      <section class="detail-card">
        <div class="image-area">
          <img
            v-if="place.firstimage"
            :src="place.firstimage"
            :alt="place.title"
          />

          <div v-else class="no-image">
            등록된 이미지가 없습니다.
          </div>
        </div>

        <div class="detail-content">
          <span class="category-badge">
            {{ category.name }}
          </span>

          <h1>{{ place.title }}</h1>

          <dl>
            <div>
              <dt>주소</dt>
              <dd>
                {{ place.addr1 || '주소 정보 없음' }}
                {{ place.addr2 }}
              </dd>
            </div>

            <div>
              <dt>전화번호</dt>
              <dd>{{ place.tel || '전화번호 정보 없음' }}</dd>
            </div>

            <div>
              <dt>우편번호</dt>
              <dd>{{ place.zipcode || '정보 없음' }}</dd>
            </div>

            <div>
              <dt>위도</dt>
              <dd>{{ place.mapy || '정보 없음' }}</dd>
            </div>

            <div>
              <dt>경도</dt>
              <dd>{{ place.mapx || '정보 없음' }}</dd>
            </div>
          </dl>

          <div class="button-group">
            <button type="button" class="favorite-button">
              관심 목록에 추가
            </button>

            <RouterLink
              :to="`/category/${category.key}`"
              class="list-button"
            >
              목록으로
            </RouterLink>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detail-container {
  width: min(1200px, 92%);
  margin: 40px auto 80px;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
  color: #64748b;
  font-size: 14px;
}

.breadcrumb a {
  text-decoration: none;
}

.detail-card {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
}

.image-area {
  min-height: 500px;
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

.detail-content {
  padding: 50px;
}

.category-badge {
  display: inline-block;
  padding: 6px 11px;
  border-radius: 20px;
  color: #2563eb;
  background: #eff6ff;
  font-weight: 700;
}

.detail-content h1 {
  margin: 18px 0 35px;
  font-size: 36px;
}

dl {
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 100px 1fr;
  padding: 17px 0;
  border-bottom: 1px solid #e2e8f0;
}

dt {
  font-weight: 700;
}

dd {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}

.favorite-button,
.list-button {
  padding: 13px 20px;
  border-radius: 9px;
  cursor: pointer;
  text-decoration: none;
}

.favorite-button {
  border: 0;
  color: white;
  background: #2563eb;
}

.list-button {
  border: 1px solid #cbd5e1;
  color: #334155;
  background: white;
}

.status-message {
  padding: 100px 0;
  text-align: center;
}

.error {
  color: #dc2626;
}

@media (max-width: 800px) {
  .detail-card {
    grid-template-columns: 1fr;
  }

  .image-area {
    min-height: 300px;
  }

  .detail-content {
    padding: 30px 22px;
  }
}
</style>