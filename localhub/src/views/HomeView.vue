<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'
import { categories } from '@/data/categories'
import { extractAreaName } from '@/utils/regionUtils'

const router = useRouter()

/* 계절별 메인 배경 이미지 */
const seasonImages = [
  {
    season: '봄',
    src: '/season/spring.jpg',
    position: 'center 55%',
  },
  {
    season: '여름',
    src: '/season/summer.jpg',
    position: 'center 52%',
  },
  {
    season: '가을',
    src: '/season/fall.jpg',
    position: 'center 55%',
  },
  {
    season: '겨울',
    src: '/season/winter.jpg',
    position: 'center 45%',
  },
]

/* jeolla-map.jpg 전체 이미지 기준 지역별 포인트 좌표 */
const regionPoints = [
  /* 전북 지역 */
  {
    name: '군산시',
    top: '13.8%',
    left: '44.2%',
  },
  {
    name: '익산시',
    top: '10.7%',
    left: '48.5%',
  },
  {
    name: '완주군',
    top: '11.1%',
    left: '53.4%',
  },
  {
    name: '무주군',
    top: '13.6%',
    left: '63.1%',
  },
  {
    name: '김제시',
    top: '20.6%',
    left: '46.4%',
  },
  {
    name: '전주시',
    top: '19.9%',
    left: '50.4%',
  },
  {
    name: '진안군',
    top: '19.3%',
    left: '57.5%',
  },
  {
    name: '부안군',
    top: '26.5%',
    left: '41.2%',
  },
  {
    name: '정읍시',
    top: '29%',
    left: '46.3%',
  },
  {
    name: '임실군',
    top: '28.5%',
    left: '53.5%',
  },
  {
    name: '장수군',
    top: '26.1%',
    left: '60.9%',
  },
  {
    name: '고창군',
    top: '37.4%',
    left: '40.1%',
  },
  {
    name: '순창군',
    top: '39%',
    left: '51.6%',
  },
  {
    name: '남원시',
    top: '37.6%',
    left: '58.8%',
  },

  /* 광주·전남 지역 */
  {
    name: '장성군',
    top: '42.1%',
    left: '43.8%',
  },
  {
    name: '영광군',
    top: '45.1%',
    left: '37%',
  },
  {
    name: '담양군',
    top: '44.4%',
    left: '48.3%',
  },
  {
    name: '곡성군',
    top: '47.6%',
    left: '54.5%',
  },
  {
    name: '구례군',
    top: '46.9%',
    left: '59.2%',
  },
  {
    name: '함평군',
    top: '50.5%',
    left: '38.4%',
  },
  {
    name: '광주광역시',
    top: '50.1%',
    left: '45.2%',
  },
  {
    name: '나주시',
    top: '58.5%',
    left: '42.6%',
  },
  {
    name: '화순군',
    top: '57.3%',
    left: '48.5%',
  },
  {
    name: '순천시',
    top: '57.3%',
    left: '57%',
  },
  {
    name: '광양시',
    top: '55.5%',
    left: '62.8%',
  },
  {
    name: '무안군',
    top: '61.2%',
    left: '37.2%',
  },
  {
    name: '목포시',
    top: '67.3%',
    left: '34.2%',
  },
  {
    name: '영암군',
    top: '66.4%',
    left: '42.3%',
  },
  {
    name: '강진군',
    top: '72.7%',
    left: '43.1%',
  },
  {
    name: '장흥군',
    top: '68.2%',
    left: '46.6%',
  },
  {
    name: '보성군',
    top: '65.5%',
    left: '52.2%',
  },
  {
    name: '고흥군',
    top: '75.7%',
    left: '56.3%',
  },
  {
    name: '여수시',
    top: '68.2%',
    left: '63.2%',
  },
  {
    name: '신안군',
    top: '75.9%',
    left: '25.4%',
  },
  {
    name: '진도군',
    top: '83.8%',
    left: '31.9%',
  },
  {
    name: '해남군',
    top: '83.1%',
    left: '39.2%',
  },
]

/* 계절 슬라이드 상태 */
const currentSlide = ref(0)
let slideTimer = null

/* 지도 모달 상태 */
const isMapOpen = ref(false)
const selectedCategory = ref(null)
const availableRegions = ref([])
const isMapLoading = ref(false)
const mapError = ref('')

/*
 * 현재 선택한 카테고리의 JSON 데이터에 존재하는 지역만
 * 지도에 표시하고 가나다순으로 정렬합니다.
 */
const visibleRegionPoints = computed(() => {
  return regionPoints
    .filter((region) => {
      return availableRegions.value.includes(region.name)
    })
    .sort((a, b) => {
      return a.name.localeCompare(b.name, 'ko')
    })
})

function showNextSlide() {
  currentSlide.value =
    (currentSlide.value + 1) % seasonImages.length
}

function selectSlide(index) {
  currentSlide.value = index
  restartSlideTimer()
}

function startSlideTimer() {
  if (slideTimer) {
    return
  }

  slideTimer = setInterval(() => {
    showNextSlide()
  }, 4000)
}

function stopSlideTimer() {
  if (!slideTimer) {
    return
  }

  clearInterval(slideTimer)
  slideTimer = null
}

function restartSlideTimer() {
  stopSlideTimer()
  startSlideTimer()
}

/*
 * 선택한 카테고리의 JSON 파일을 불러온 뒤
 * 실제 데이터가 존재하는 지역만 추출합니다.
 */
async function openRegionMap(category) {
  selectedCategory.value = category
  availableRegions.value = []
  mapError.value = ''
  isMapLoading.value = true
  isMapOpen.value = true

  stopSlideTimer()
  document.body.style.overflow = 'hidden'

  try {
    if (!category.file) {
      throw new Error(
        `${category.name} 데이터 파일 경로가 설정되지 않았습니다.`,
      )
    }

    const response = await fetch(
      category.file,
    )

    if (!response.ok) {
      throw new Error(
        `${category.name} 데이터를 불러오지 못했습니다.`,
      )
    }

    const data = await response.json()

    const items = Array.isArray(data.items)
      ? data.items
      : []

    const extractedRegions = items
      .map((item) => {
        return extractAreaName(item.addr1)
      })
      .filter(Boolean)

    availableRegions.value = [
      ...new Set(extractedRegions),
    ].sort((a, b) => {
      return a.localeCompare(b, 'ko')
    })

    console.log(
      `${category.name} 데이터 지역:`,
      availableRegions.value,
    )
  } catch (error) {
    console.error(error)

    mapError.value =
      error instanceof Error
        ? error.message
        : '지역 데이터를 불러오지 못했습니다.'
  } finally {
    isMapLoading.value = false
  }
}

function closeRegionMap() {
  isMapOpen.value = false
  selectedCategory.value = null
  availableRegions.value = []
  mapError.value = ''
  isMapLoading.value = false

  document.body.style.overflow = ''
  startSlideTimer()
}

function selectRegion(regionName) {
  if (!selectedCategory.value) {
    return
  }

  const categoryKey =
    selectedCategory.value.key

  closeRegionMap()

  router.push({
    path: `/category/${categoryKey}`,
    query: {
      area: regionName,
    },
  })
}

function handleKeydown(event) {
  if (
    event.key === 'Escape' &&
    isMapOpen.value
  ) {
    closeRegionMap()
  }
}

onMounted(() => {
  startSlideTimer()

  window.addEventListener(
    'keydown',
    handleKeydown,
  )
})

onBeforeUnmount(() => {
  stopSlideTimer()

  window.removeEventListener(
    'keydown',
    handleKeydown,
  )

  document.body.style.overflow = ''
})
</script>

<template>
  <main>
    <section class="hero">
      <div class="hero-backgrounds">
        <img
          v-for="(image, index) in seasonImages"
          :key="image.src"
          :src="image.src"
          :alt="`${image.season} 광주·전라권 풍경`"
          :style="{
            objectPosition: image.position,
          }"
          :class="[
            'hero-background',
            {
              active:
                currentSlide === index,
            },
          ]"
        />
      </div>

      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="region">
          광주·전라권
        </p>

        <h1>
          지역의 매력을 한곳에서 만나는<br />
          공공데이터 기반 LocalHub
        </h1>

        <p class="description">
          관광지, 문화시설, 음식점, 축제 등
          광주·전라권의 다양한 정보를 확인해 보세요.
        </p>
      </div>

      <div class="season-label">
        {{ seasonImages[currentSlide].season }}
      </div>

      <div class="slide-indicators">
        <button
          v-for="(image, index) in seasonImages"
          :key="`indicator-${image.src}`"
          type="button"
          :class="[
            'slide-indicator',
            {
              active:
                currentSlide === index,
            },
          ]"
          :aria-label="`${image.season} 배경 이미지 보기`"
          :title="image.season"
          @click="selectSlide(index)"
        ></button>
      </div>
    </section>

    <section class="category-section">
      <div class="section-heading">
        <div>
          <p class="section-label">
            EXPLORE
          </p>

          <h2>
            카테고리별 지역 정보
          </h2>
        </div>
      </div>

      <div class="category-grid">
        <article
          v-for="category in categories"
          :key="category.key"
          class="category-card"
        >
          <h3>
            {{ category.name }}
          </h3>

          <p>
            광주·전라권
            {{ category.name }}
            정보 보기
          </p>

          <button
            type="button"
            class="category-map-button"
            @click="openRegionMap(category)"
          >
            바로가기 →
          </button>
        </article>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isMapOpen"
        class="map-modal-backdrop"
        @click.self="closeRegionMap"
      >
        <section
          class="map-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
        >
          <div class="map-modal-heading">
            <div>
              <p class="map-modal-label">
                지역 선택
              </p>

              <h2 id="map-modal-title">
                {{ selectedCategory?.name }}
                지역을 선택하세요
              </h2>
            </div>

            <button
              type="button"
              class="map-close-button"
              aria-label="지도 닫기"
              @click="closeRegionMap"
            >
              ×
            </button>
          </div>

          <p class="map-description">
            현재 카테고리에 데이터가 존재하는
            지역만 선택할 수 있습니다.
          </p>

          <div
            v-if="isMapLoading"
            class="map-status"
          >
            <div class="loading-spinner"></div>

            <p>
              {{ selectedCategory?.name }}
              지역 데이터를 확인하고 있습니다.
            </p>
          </div>

          <div
            v-else-if="mapError"
            class="map-status map-status-error"
          >
            <p>
              {{ mapError }}
            </p>

            <button
              type="button"
              class="retry-button"
              @click="
                openRegionMap(
                  selectedCategory,
                )
              "
            >
              다시 불러오기
            </button>
          </div>

          <div
            v-else-if="
              visibleRegionPoints.length === 0
            "
            class="map-status"
          >
            <p>
              지도에서 선택할 수 있는 지역이 없습니다.
            </p>

            <p class="map-status-subtext">
              JSON 주소와 지도 지역명이 일치하는지
              확인해 주세요.
            </p>
          </div>

          <div
            v-else
            class="map-wrapper"
          >
            <img
              src="/images/jeolla-map.jpg"
              alt="광주·전라권 지역 선택 지도"
              class="region-map"
              draggable="false"
            />

            <button
              v-for="region in visibleRegionPoints"
              :key="region.name"
              type="button"
              class="map-point"
              :style="{
                top: region.top,
                left: region.left,
              }"
              :aria-label="`${region.name} 선택`"
              @click.stop="
                selectRegion(region.name)
              "
            >
              <span class="point-pulse"></span>

              <span class="point-circle"></span>

              <span class="point-label">
                {{ region.name }}
              </span>
            </button>
          </div>

          <div
            v-if="
              !isMapLoading &&
              !mapError &&
              visibleRegionPoints.length > 0
            "
            class="map-summary"
          >
            <strong>
              선택 가능 지역
              {{ visibleRegionPoints.length }}곳
            </strong>

            <p>
              {{
                visibleRegionPoints
                  .map(
                    (region) =>
                      region.name,
                  )
                  .join(', ')
              }}
            </p>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(
    600px,
    42vw,
    760px
  );
  overflow: hidden;
  text-align: center;
  background: #dbeafe;
}

.hero-backgrounds {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  object-fit: cover;
  transform: scale(1.06);

  transition:
    opacity 1.4s ease-in-out,
    transform 5.5s ease-out;
}

.hero-background.active {
  opacity: 1;
  transform: scale(1);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;

  background:
    linear-gradient(
      90deg,
      rgb(15 23 42 / 48%),
      rgb(15 23 42 / 24%),
      rgb(15 23 42 / 48%)
    );
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(950px, 90%);
  padding: 100px 20px;
  color: #ffffff;

  text-shadow:
    0 2px 8px
      rgb(15 23 42 / 70%),
    0 4px 18px
      rgb(15 23 42 / 45%);
}

.region {
  margin: 0 0 16px;
  color: #e0f2fe;
  font-size: 17px;
  font-weight: 800;
}

.hero h1 {
  margin: 0;
  font-size: clamp(
    38px,
    4.5vw,
    62px
  );
  line-height: 1.3;
  letter-spacing: -1.5px;
}

.description {
  margin: 26px 0 0;
  color: #f8fafc;
  font-size: 18px;
  line-height: 1.7;
}

.season-label {
  position: absolute;
  right: 30px;
  bottom: 26px;
  z-index: 3;
  padding: 7px 14px;
  border: 1px solid
    rgb(255 255 255 / 45%);
  border-radius: 999px;
  color: #ffffff;
  background:
    rgb(15 23 42 / 36%);
  backdrop-filter: blur(6px);
  font-size: 14px;
  font-weight: 700;
}

.slide-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(-50%);
}

.slide-indicator {
  width: 11px;
  height: 11px;
  padding: 0;
  border: 1px solid
    rgb(255 255 255 / 65%);
  border-radius: 999px;
  background:
    rgb(255 255 255 / 45%);
  cursor: pointer;

  transition:
    width 0.25s,
    border-color 0.25s,
    background 0.25s;
}

.slide-indicator:hover {
  background:
    rgb(255 255 255 / 85%);
}

.slide-indicator.active {
  width: 34px;
  border-color: #ffffff;
  background: #ffffff;
}

.category-section {
  width: min(1200px, 92%);
  margin: 70px auto;
}

.section-label {
  margin: 0 0 8px;
  color: #2563eb;
  font-weight: 700;
}

.section-heading h2 {
  margin: 0;
  font-size: 32px;
}

.category-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 20px;
  margin-top: 32px;
}

.category-card {
  padding: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  color: inherit;
  background: #ffffff;
  text-align: left;

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-5px);

  box-shadow:
    0 12px 30px
    rgb(15 23 42 / 10%);
}

.category-card h3 {
  margin: 0 0 12px;
  font-size: 22px;
}

.category-card p {
  min-height: 48px;
  color: #64748b;
  line-height: 1.6;
}

.category-map-button {
  padding: 0;
  border: 0;
  color: #2563eb;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  transition:
    color 0.2s,
    transform 0.2s;
}

.category-map-button:hover {
  color: #1d4ed8;
  text-decoration: underline;
  transform: translateX(3px);
}

.map-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    rgb(15 23 42 / 76%);
  backdrop-filter: blur(6px);
}

.map-modal {
  width: min(1050px, 96vw);
  max-height: 92vh;
  overflow-y: auto;
  padding: 28px;
  border: 1px solid
    rgb(255 255 255 / 20%);
  border-radius: 24px;
  background: #ffffff;

  box-shadow:
    0 30px 80px
      rgb(15 23 42 / 45%),
    0 0 0 1px
      rgb(255 255 255 / 12%);
}

.map-modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.map-modal-label {
  margin: 0 0 7px;
  color: #2563eb;
  font-weight: 700;
}

.map-modal-heading h2 {
  margin: 0;
  font-size: 28px;
}

.map-description {
  margin: 12px 0 24px;
  color: #64748b;
  line-height: 1.6;
}

.map-close-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #475569;
  background: #f1f5f9;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;

  transition:
    color 0.2s,
    background 0.2s,
    transform 0.2s;
}

.map-close-button:hover {
  color: #ffffff;
  background: #2563eb;
  transform: rotate(90deg);
}

.map-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #475569;
  background: #f8fafc;
  font-weight: 700;
  text-align: center;
}

.map-status p {
  margin: 14px 0 0;
}

.map-status-error {
  color: #dc2626;
  background: #fef2f2;
}

.map-status-subtext {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation:
    loading-rotate 0.8s
    linear infinite;
}

.retry-button {
  margin-top: 18px;
  padding: 10px 18px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
  cursor: pointer;
}

.map-wrapper {
  position: relative;
  width: min(850px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #334155;
  border-radius: 20px;
  background: #ffffff;
  cursor: default;
  user-select: none;

  box-shadow:
    inset 0 0 30px
      rgb(15 23 42 / 8%),
    0 18px 40px
      rgb(15 23 42 / 18%);
}

.region-map {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.map-point {
  position: absolute;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  transform:
    translate(-50%, -50%);
}

.point-circle {
  position: relative;
  z-index: 2;
  display: block;
  width: 11px;
  height: 11px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #2563eb;

  box-shadow:
    0 0 0 3px
      rgb(37 99 235 / 28%),
    0 3px 9px
      rgb(15 23 42 / 40%);

  transition:
    background 0.2s,
    transform 0.2s;
}

.point-pulse {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid
    rgb(37 99 235 / 65%);
  border-radius: 50%;

  animation:
    point-pulse 1.8s infinite;
}

.point-label {
  position: absolute;
  top: 21px;
  left: 50%;
  z-index: 4;
  padding: 6px 9px;
  border-radius: 7px;
  color: #ffffff;
  background:
    rgb(15 23 42 / 90%);

  box-shadow:
    0 5px 16px
    rgb(15 23 42 / 35%);

  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;

  transform:
    translateX(-50%)
    translateY(-5px);

  transition:
    opacity 0.2s,
    transform 0.2s;
}

.map-point:hover .point-circle,
.map-point:focus-visible
  .point-circle {
  background: #f43f5e;
  transform: scale(1.35);
}

.map-point:hover .point-label,
.map-point:focus-visible
  .point-label {
  opacity: 1;

  transform:
    translateX(-50%)
    translateY(0);
}

.map-point:focus-visible {
  outline: none;
}

.map-summary {
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: #eff6ff;
}

.map-summary strong {
  color: #1d4ed8;
}

.map-summary p {
  margin: 7px 0 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

@keyframes point-pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.65);
  }

  70%,
  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .hero {
    min-height: 560px;
  }

  .hero-content {
    padding: 80px 20px;
  }

  .hero h1 {
    font-size: clamp(
      34px,
      6vw,
      48px
    );
  }

  .description {
    font-size: 16px;
  }

  .season-label {
    right: 20px;
    bottom: 22px;
  }

  .slide-indicators {
    bottom: 26px;
  }

  .category-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .map-modal {
    padding: 22px;
  }
}

@media (max-width: 600px) {
  .map-modal-backdrop {
    align-items: flex-start;
    padding: 12px;
    overflow-y: auto;
  }

  .map-modal {
    max-height: none;
    margin: 12px 0;
    padding: 18px;
    border-radius: 18px;
  }

  .map-modal-heading h2 {
    font-size: 22px;
  }

  .map-description {
    font-size: 14px;
  }

  .map-close-button {
    width: 38px;
    height: 38px;
    font-size: 24px;
  }

  .map-status {
    min-height: 260px;
  }

  .point-circle {
    width: 9px;
    height: 9px;
    border-width: 2px;
  }

  .point-pulse {
    width: 18px;
    height: 18px;
  }

  .point-label {
    display: none;
  }

  .map-summary {
    font-size: 13px;
  }
}

@media (max-width: 520px) {
  .hero {
    min-height: 470px;
  }

  .hero-content {
    width: 92%;
    padding: 70px 16px;
  }

  .hero h1 {
    font-size: 30px;
    line-height: 1.4;
    letter-spacing: -1px;
  }

  .hero h1 br {
    display: none;
  }

  .region {
    font-size: 15px;
  }

  .description {
    font-size: 14px;
  }

  .slide-indicators {
    bottom: 20px;
  }

  .slide-indicator {
    width: 9px;
    height: 9px;
  }

  .slide-indicator.active {
    width: 26px;
  }

  .season-label {
    display: none;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>