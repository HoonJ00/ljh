<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { categories } from '@/data/categories'

const seasonImages = [
  {
    season: '봄',
    src: '/season/spring.jpg',

    // 벚꽃과 고분이 함께 보이도록 왼쪽 중앙 기준
    position: 'center 55%',
  },
  {
    season: '여름',
    src: '/season/summer.jpg',

    // 대나무 길의 중심이 잘 보이도록 중앙 배치
    position: 'center 52%',
  },
  {
    season: '가을',
    src: '/season/fall.jpg',

    // 정자와 산, 반영이 함께 보이도록 중앙 배치
    position: 'center 55%',
  },
  {
    season: '겨울',
    src: '/season/winter.jpg',

    // 성곽과 누각이 잘 보이도록 중앙보다 약간 위쪽 배치
    position: 'center 45%',
  },
]

const currentSlide = ref(0)
let slideTimer = null

function showNextSlide() {
  currentSlide.value =
    (currentSlide.value + 1) % seasonImages.length
}

function selectSlide(index) {
  currentSlide.value = index
  restartSlideTimer()
}

function startSlideTimer() {
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

onMounted(() => {
  startSlideTimer()
})

onBeforeUnmount(() => {
  stopSlideTimer()
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
              active: currentSlide === index,
            },
          ]"
        />
      </div>

      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="region">광주·전라권</p>

        <h1>
          지역의 매력을 한곳에서 만나는<br />
          공공데이터 기반 LocalHub
        </h1>

        <p class="description">
          관광지, 문화시설, 음식점, 축제 등 광주·전라권의 다양한 정보를
          확인해 보세요.
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
              active: currentSlide === index,
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
          <p class="section-label">EXPLORE</p>
          <h2>카테고리별 지역 정보</h2>
        </div>
      </div>

      <div class="category-grid">
        <RouterLink
          v-for="category in categories"
          :key="category.key"
          :to="`/category/${category.key}`"
          class="category-card"
        >
          <h3>{{ category.name }}</h3>

          <p>
            광주·전라권 {{ category.name }} 정보 보기
          </p>

          <span>바로가기 →</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  /*
   * PC에서는 화면 너비에 따라 높이가 증가하지만,
   * 최소 600px, 최대 760px까지만 커집니다.
   */
  min-height: clamp(600px, 42vw, 760px);

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

  /*
   * 영역 전체를 채우되 사진마다 지정한
   * object-position을 기준으로 잘립니다.
   */
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

  /*
   * 글자가 잘 보이도록 중앙은 비교적 밝고
   * 좌우는 조금 더 어둡게 처리합니다.
   */
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
    0 2px 8px rgb(15 23 42 / 70%),
    0 4px 18px rgb(15 23 42 / 45%);
}

.region {
  margin: 0 0 16px;
  color: #e0f2fe;
  font-size: 17px;
  font-weight: 800;
}

.hero h1 {
  margin: 0;
  font-size: clamp(38px, 4.5vw, 62px);
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
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 999px;
  color: #ffffff;
  background: rgb(15 23 42 / 36%);
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
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 999px;
  background: rgb(255 255 255 / 45%);
  cursor: pointer;

  transition:
    width 0.25s,
    border-color 0.25s,
    background 0.25s;
}

.slide-indicator:hover {
  background: rgb(255 255 255 / 85%);
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
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 32px;
}

.category-card {
  padding: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  color: inherit;
  background: white;
  text-decoration: none;

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgb(15 23 42 / 10%);
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

.category-card span {
  color: #2563eb;
  font-weight: 700;
}

@media (max-width: 900px) {
  .hero {
    min-height: 560px;
  }

  .hero-content {
    padding: 80px 20px;
  }

  .hero h1 {
    font-size: clamp(34px, 6vw, 48px);
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
    grid-template-columns: repeat(2, 1fr);
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