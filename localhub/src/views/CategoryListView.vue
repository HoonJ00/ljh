<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { findCategory } from '@/data/categories'
import {
  addFavorite,
  getFavorites,
} from '@/utils/favoriteStorage'
import { extractAreaName } from '@/utils/regionUtils'

const route = useRoute()

const places = ref([])
const favorites = ref(getFavorites())
const loading = ref(false)
const errorMessage = ref('')
const searchKeyword = ref('')

// 현재 선택한 지역
const selectedArea = ref('전체')

const category = computed(() => {
  return findCategory(route.params.category)
})

/**
 * 현재 카테고리 데이터에 실제로 존재하는 지역 목록
 */
const areaList = computed(() => {
  const areas = places.value
    .map((place) => extractAreaName(place.addr1))
    .filter(Boolean)

  const uniqueAreas = [...new Set(areas)]

  uniqueAreas.sort((a, b) =>
    a.localeCompare(b, 'ko'),
  )

  return ['전체', ...uniqueAreas]
})

/**
 * 검색어와 선택 지역을 동시에 반영합니다.
 */
const filteredPlaces = computed(() => {
  const keyword =
    searchKeyword.value.trim().toLowerCase()

  return places.value.filter((place) => {
    const title = String(
      place.title || '',
    ).toLowerCase()

    const address =
      `${place.addr1 || ''} ${place.addr2 || ''}`
        .trim()
        .toLowerCase()

    const placeArea =
      extractAreaName(place.addr1)

    const matchesKeyword =
      !keyword ||
      title.includes(keyword) ||
      address.includes(keyword)

    const matchesArea =
      selectedArea.value === '전체' ||
      placeArea === selectedArea.value

    return matchesKeyword && matchesArea
  })
})

/**
 * URL query의 area 값을 확인하여
 * 해당 지역을 자동 선택합니다.
 *
 * 예:
 * /category/restaurant?area=전주시
 * → 전주시 자동 선택
 */
function applyAreaFromQuery() {
  const requestedArea = String(
    route.query.area || '',
  ).trim()

  if (
    requestedArea &&
    areaList.value.includes(requestedArea)
  ) {
    selectedArea.value = requestedArea
    return
  }

  selectedArea.value = '전체'
}

/**
 * 해당 장소가 이미 찜 목록에 들어 있는지 확인합니다.
 */
function isPlaceFavorite(place) {
  if (!category.value) {
    return false
  }

  return favorites.value.some(
    (favorite) =>
      favorite.categoryKey ===
        category.value.key &&
      String(favorite.contentid) ===
        String(place.contentid),
  )
}

/**
 * 하트 클릭 시 관심 장소에 추가합니다.
 */
function handleFavorite(place) {
  if (!category.value) {
    return
  }

  const result = addFavorite({
    categoryKey: category.value.key,
    categoryName: category.value.name,
    place,
  })

  alert(result.message)

  if (result.success) {
    favorites.value = getFavorites()
  }
}

/**
 * 실제 이미지 주소가 깨졌을 때
 * 대체 이미지를 적용합니다.
 */
function handleImageError(event) {
  if (
    event.target.dataset.fallbackApplied ===
    'true'
  ) {
    return
  }

  event.target.dataset.fallbackApplied = 'true'
  event.target.src =
    '/images/image-preparing.jpg'
  event.target.classList.add(
    'fallback-image',
  )
}

/**
 * 카테고리 데이터를 불러옵니다.
 */
async function loadPlaces() {
  if (!category.value) {
    errorMessage.value =
      '존재하지 않는 카테고리입니다.'
    places.value = []
    selectedArea.value = '전체'
    return
  }

  loading.value = true
  errorMessage.value = ''
  searchKeyword.value = ''

  try {
    const response = await fetch(
      category.value.file,
    )

    if (!response.ok) {
      throw new Error(
        '데이터 파일을 불러오지 못했습니다.',
      )
    }

    const data = await response.json()

    if (!Array.isArray(data.items)) {
      throw new Error(
        'JSON의 items 배열을 찾을 수 없습니다.',
      )
    }

    places.value = data.items

    /*
     * places에 데이터가 저장된 뒤
     * URL의 area 값을 확인해야 areaList와 비교할 수 있습니다.
     */
    applyAreaFromQuery()

    // 다른 화면에서 찜 목록이 변경됐을 수 있으므로 다시 불러옵니다.
    favorites.value = getFavorites()
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : '데이터를 불러오지 못했습니다.'

    places.value = []
    selectedArea.value = '전체'
  } finally {
    loading.value = false
  }
}

/**
 * 지역 버튼을 직접 클릭했을 때 선택합니다.
 */
function selectArea(area) {
  selectedArea.value = area
}

/**
 * 카테고리 또는 URL의 area 값이 바뀌면
 * 데이터를 다시 불러옵니다.
 */
watch(
  () => [
    route.params.category,
    route.query.area,
  ],
  () => {
    loadPlaces()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="page-container">
    <template v-if="category">
      <section class="page-heading">
        <p>광주·전라권 지역 정보</p>

        <h1>{{ category.name }}</h1>

        <span>
          총 {{ places.length }}개의 장소가 있습니다.
        </span>
      </section>

      <section class="search-section">
        <input
          v-model="searchKeyword"
          type="search"
          :placeholder="`${category.name} 이름 또는 주소를 검색하세요`"
        />
      </section>

      <section
        v-if="!loading && !errorMessage"
        class="area-filter-section"
      >
        <div class="area-filter-heading">
          <h2>지역별 보기</h2>

          <span>
            {{
              selectedArea === '전체'
                ? '전체 지역'
                : selectedArea
            }}
            · {{ filteredPlaces.length }}개
          </span>
        </div>

        <div class="area-buttons">
          <button
            v-for="area in areaList"
            :key="area"
            type="button"
            :class="[
              'area-button',
              {
                active:
                  selectedArea === area,
              },
            ]"
            @click="selectArea(area)"
          >
            {{ area }}
          </button>
        </div>
      </section>

      <p
        v-if="loading"
        class="status-message"
      >
        데이터를 불러오는 중입니다.
      </p>

      <p
        v-else-if="errorMessage"
        class="status-message error"
      >
        {{ errorMessage }}
      </p>

      <p
        v-else-if="
          filteredPlaces.length === 0
        "
        class="status-message"
      >
        조건에 해당하는 장소가 없습니다.
      </p>

      <section
        v-else
        class="place-grid"
      >
        <article
          v-for="place in filteredPlaces"
          :key="place.contentid"
          class="place-card"
        >
          <div class="image-area">
            <RouterLink
              :to="`/detail/${category.key}/${place.contentid}`"
              class="image-link"
            >
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
            </RouterLink>

            <button
              type="button"
              :class="[
                'heart-button',
                {
                  active:
                    isPlaceFavorite(place),
                },
              ]"
              :aria-label="`${place.title} 관심 장소 추가`"
              @click="handleFavorite(place)"
            >
              {{
                isPlaceFavorite(place)
                  ? '♥'
                  : '♡'
              }}
            </button>
          </div>

          <RouterLink
            :to="`/detail/${category.key}/${place.contentid}`"
            class="card-content-link"
          >
            <div class="card-content">
              <span class="category-badge">
                {{ category.name }}
              </span>

              <h2>{{ place.title }}</h2>

              <p class="address">
                {{
                  place.addr1 ||
                  '주소 정보 없음'
                }}
                {{ place.addr2 }}
              </p>

              <span class="detail-link">
                상세보기 →
              </span>
            </div>
          </RouterLink>
        </article>
      </section>
    </template>

    <p
      v-else
      class="status-message error"
    >
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
  margin: 32px 0 22px;
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

.area-filter-section {
  margin-bottom: 36px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
}

.area-filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.area-filter-heading h2 {
  margin: 0;
  font-size: 20px;
}

.area-filter-heading span {
  color: #64748b;
  font-size: 14px;
}

.area-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.area-button {
  min-width: 92px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  color: #334155;
  background: #ffffff;
  cursor: pointer;

  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;
}

.area-button:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.area-button.active {
  border-color: #2563eb;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
}

.place-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 22px;

  /*
   * 같은 행에 있는 카드들의 높이를
   * 가장 긴 카드 높이에 맞춥니다.
   */
  align-items: stretch;
}

.place-card {
  /*
   * 카드 내부를 세로 방향 Flex 구조로 만듭니다.
   */
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.place-card:hover {
  transform: translateY(-4px);

  box-shadow:
    0 12px 30px
    rgb(15 23 42 / 10%);
}

.image-area {
  position: relative;
  flex-shrink: 0;
  height: 190px;
  overflow: hidden;
  background: #e2e8f0;
}

.image-link {
  display: block;
  width: 100%;
  height: 100%;
}

.image-area img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-area img.fallback-image {
  box-sizing: border-box;
  object-fit: contain;
  padding: 10px;
  background: #ffffff;
}

.heart-button {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #475569;
  background:
    rgb(255 255 255 / 92%);
  box-shadow:
    0 4px 12px
    rgb(15 23 42 / 18%);
  font-size: 25px;
  line-height: 1;
  cursor: pointer;

  transition:
    color 0.2s,
    transform 0.2s,
    background 0.2s;
}

.heart-button:hover {
  color: #f43f5e;
  background: #fff1f2;
  transform: scale(1.08);
}

.heart-button.active {
  color: #f43f5e;
  background: #fff1f2;
}

/*
 * 이미지 아래의 링크 영역이
 * 카드의 남은 높이를 전부 차지합니다.
 */
.card-content-link {
  display: flex;
  flex: 1;
  min-height: 0;
  color: inherit;
  text-decoration: none;
}

/*
 * 제목과 주소가 짧더라도 상세보기 버튼이
 * 항상 하단으로 내려가도록 세로 Flex를 적용합니다.
 */
.card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
}

.category-badge {
  display: inline-block;
  flex-shrink: 0;
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
  line-height: 1.5;
  word-break: keep-all;
}

.address {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;
}

/*
 * 남아 있는 공간을 위쪽 여백으로 사용해서
 * 상세보기 링크를 카드 하단에 고정합니다.
 */
.detail-link {
  display: inline-block;
  margin-top: auto;
  padding-top: 22px;
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
    grid-template-columns:
      repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .place-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .area-filter-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .area-button {
    min-width:
      calc(33.333% - 7px);
    padding: 10px 8px;
  }

  .heart-button {
    width: 40px;
    height: 40px;
    font-size: 23px;
  }
}

@media (max-width: 520px) {
  .place-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .area-button {
    min-width:
      calc(50% - 5px);
  }
}
</style>