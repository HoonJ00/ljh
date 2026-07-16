<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findCategory } from '@/data/categories'
import {
  addFavorite,
  isFavorite,
} from '@/utils/favoriteStorage'

const route = useRoute()

const place = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 현재 장소가 이미 찜 목록에 들어 있는지 여부
const favoriteAdded = ref(false)

const category = computed(() => {
  return findCategory(route.params.category)
})

// 현재 카테고리가 축제공연행사인지 확인
const isFestival = computed(() => {
  return category.value?.key === 'festival'
})

function formatEventDate(dateString) {
  if (
    !dateString ||
    !/^\d{8}$/.test(String(dateString))
  ) {
    return '정보 없음'
  }

  const value = String(dateString)
  const year = value.slice(0, 4)
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))

  return `${year}년 ${month}월 ${day}일`
}

function cleanText(value) {
  if (!value) {
    return '정보 없음'
  }

  return String(value)
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 원본 이미지 주소가 깨진 경우
 * 대체 이미지로 한 번만 변경합니다.
 */
function handleImageError(event) {
  const imageElement = event.currentTarget

  if (
    imageElement.dataset.fallbackApplied ===
    'true'
  ) {
    return
  }

  imageElement.dataset.fallbackApplied = 'true'
  imageElement.src =
    '/images/image-preparing.jpg'
  imageElement.classList.add(
    'fallback-image',
  )
}

async function loadPlace() {
  if (!category.value) {
    errorMessage.value =
      '존재하지 않는 카테고리입니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  place.value = null
  favoriteAdded.value = false

  try {
    const response = await fetch(
      category.value.file,
    )

    if (!response.ok) {
      throw new Error(
        '데이터를 불러오지 못했습니다.',
      )
    }

    const data = await response.json()

    if (!Array.isArray(data.items)) {
      throw new Error(
        'JSON의 items 배열을 찾을 수 없습니다.',
      )
    }

    const selectedPlace = data.items.find(
      (item) =>
        String(item.contentid) ===
        String(route.params.contentId),
    )

    if (!selectedPlace) {
      throw new Error(
        '해당 장소를 찾을 수 없습니다.',
      )
    }

    place.value = selectedPlace

    favoriteAdded.value = isFavorite(
      category.value.key,
      selectedPlace.contentid,
    )
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : '장소 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

function handleFavorite() {
  if (!place.value || !category.value) {
    return
  }

  const result = addFavorite({
    categoryKey: category.value.key,
    categoryName: category.value.name,
    place: place.value,
  })

  alert(result.message)

  if (result.success) {
    favoriteAdded.value = true
  }
}

watch(
  () => [
    route.params.category,
    route.params.contentId,
  ],
  () => {
    loadPlace()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="detail-container">
    <p
      v-if="loading"
      class="status-message"
    >
      장소 정보를 불러오는 중입니다.
    </p>

    <p
      v-else-if="errorMessage"
      class="status-message error"
    >
      {{ errorMessage }}
    </p>

    <template v-else-if="place && category">
      <div class="breadcrumb">
        <RouterLink to="/">
          홈
        </RouterLink>

        <span>›</span>

        <RouterLink
          :to="`/category/${category.key}`"
        >
          {{ category.name }}
        </RouterLink>

        <span>›</span>

        <span>
          {{ place.title }}
        </span>
      </div>

      <section class="detail-card">
        <div class="image-area">
          <img
            :src="
              place.firstimage ||
              '/images/image-preparing.jpg'
            "
            :alt="
              place.firstimage
                ? place.title
                : `${place.title} 이미지 준비 중`
            "
            :class="{
              'fallback-image':
                !place.firstimage,
            }"
            @error="handleImageError"
          />
        </div>

        <div class="detail-content">
          <span class="category-badge">
            {{ category.name }}
          </span>

          <h1>
            {{ place.title }}
          </h1>

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

              <dd>
                {{
                  place.tel ||
                  place.sponsor1tel ||
                  '전화번호 정보 없음'
                }}
              </dd>
            </div>

            <template v-if="isFestival">
              <div>
                <dt>시작 날짜</dt>

                <dd>
                  {{
                    formatEventDate(
                      place.eventstartdate,
                    )
                  }}
                </dd>
              </div>

              <div>
                <dt>종료 날짜</dt>

                <dd>
                  {{
                    formatEventDate(
                      place.eventenddate,
                    )
                  }}
                </dd>
              </div>

              <div>
                <dt>행사 장소</dt>

                <dd>
                  {{
                    place.eventplace ||
                    '정보 없음'
                  }}
                </dd>
              </div>

              <div>
                <dt>운영 시간</dt>

                <dd>
                  {{
                    cleanText(
                      place.playtime,
                    )
                  }}
                </dd>
              </div>

              <div>
                <dt>이용 요금</dt>

                <dd>
                  {{
                    cleanText(
                      place.usetimefestival,
                    )
                  }}
                </dd>
              </div>

              <div v-if="place.agelimit">
                <dt>이용 연령</dt>

                <dd>
                  {{
                    cleanText(
                      place.agelimit,
                    )
                  }}
                </dd>
              </div>

              <div v-if="place.program">
                <dt>프로그램</dt>

                <dd>
                  {{
                    cleanText(
                      place.program,
                    )
                  }}
                </dd>
              </div>

              <div v-if="place.sponsor1">
                <dt>주최 기관</dt>

                <dd>
                  {{ place.sponsor1 }}
                </dd>
              </div>
            </template>
          </dl>

          <div class="button-group">
            <button
              type="button"
              :class="[
                'favorite-button',
                {
                  active: favoriteAdded,
                },
              ]"
              @click="handleFavorite"
            >
              <span class="favorite-heart">
                {{
                  favoriteAdded
                    ? '♥'
                    : '♡'
                }}
              </span>

              <span>
                {{
                  favoriteAdded
                    ? '관심 목록에 추가됨'
                    : '관심 목록에 추가'
                }}
              </span>
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
  color: inherit;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #2563eb;
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
  overflow: hidden;
  background: #e2e8f0;
}

.image-area img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 500px;
  object-fit: cover;
}

/*
 * 이미지가 없거나 로딩에 실패한 경우 사용하는
 * 대체 이미지 전용 스타일입니다.
 */
.image-area img.fallback-image {
  box-sizing: border-box;
  object-fit: contain;
  padding: 40px;
  background: #ffffff;
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
  line-height: 1.35;
}

dl {
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0 16px;
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
  word-break: keep-all;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  color: white;
  background: #2563eb;

  transition:
    color 0.2s,
    background 0.2s,
    transform 0.2s;
}

.favorite-button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.favorite-button.active {
  color: #e11d48;
  background: #fff1f2;
  box-shadow:
    inset 0 0 0 1px #fda4af;
}

.favorite-button.active:hover {
  background: #ffe4e6;
}

.favorite-heart {
  font-size: 22px;
  line-height: 1;
}

.list-button {
  border: 1px solid #cbd5e1;
  color: #334155;
  background: white;
}

.list-button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.status-message {
  padding: 100px 0;
  text-align: center;
}

.error {
  color: #dc2626;
}

@media (max-width: 1000px) {
  .detail-content {
    padding: 38px 30px;
  }

  dl div {
    grid-template-columns: 90px 1fr;
  }
}

@media (max-width: 800px) {
  .detail-card {
    grid-template-columns: 1fr;
  }

  .image-area {
    min-height: 300px;
  }

  .image-area img {
    min-height: 300px;
  }

  .image-area img.fallback-image {
    padding: 24px;
  }

  .detail-content {
    padding: 30px 22px;
  }
}

@media (max-width: 520px) {
  .detail-content h1 {
    font-size: 29px;
  }

  dl div {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .button-group {
    flex-direction: column;
  }

  .favorite-button,
  .list-button {
    box-sizing: border-box;
    width: 100%;
    text-align: center;
  }
}
</style>