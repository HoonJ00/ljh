<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
} from '@/utils/favoriteStorage'

const favorites = ref([])

function loadFavorites() {
  favorites.value = getFavorites()
}

function deleteFavorite(favorite) {
  const confirmed = confirm(
    `${favorite.title}을(를) 찜 목록에서 삭제하시겠습니까?`,
  )

  if (!confirmed) {
    return
  }

  removeFavorite(
    favorite.categoryKey,
    favorite.contentid,
  )

  loadFavorites()
}

function deleteAllFavorites() {
  if (favorites.value.length === 0) {
    return
  }

  const confirmed = confirm(
    '찜한 장소를 모두 삭제하시겠습니까?',
  )

  if (!confirmed) {
    return
  }

  clearFavorites()
  loadFavorites()
}

/**
 * 실제 이미지 주소가 깨졌을 때
 * 대체 이미지를 한 번만 적용합니다.
 */
function handleImageError(event) {
  if (event.target.dataset.fallbackApplied === 'true') {
    return
  }

  event.target.dataset.fallbackApplied = 'true'
  event.target.src = '/images/image-preparing.jpg'
  event.target.classList.add('fallback-image')
}

onMounted(() => {
  loadFavorites()
})
</script>

<template>
  <main class="favorites-container">
    <section class="page-heading">
      <div>
        <p>MY FAVORITES</p>

        <h1>찜해부렀어</h1>

        <span>
          관심 있는 장소를 누른 순서대로 확인할 수 있습니다.
        </span>
      </div>

      <button
        v-if="favorites.length > 0"
        type="button"
        class="clear-button"
        @click="deleteAllFavorites"
      >
        전체 삭제
      </button>
    </section>

    <section class="count-section">
      <strong>총 {{ favorites.length }}개</strong>
    </section>

    <section
      v-if="favorites.length === 0"
      class="empty-section"
    >
      <div class="empty-heart">♡</div>

      <h2>아직 찜한 장소가 없습니다.</h2>

      <p>
        관광지, 음식점, 숙박 등의 하트를 눌러
        관심 장소를 추가해 보세요.
      </p>

      <RouterLink
        to="/category/tourist"
        class="explore-button"
      >
        관광지 둘러보기
      </RouterLink>
    </section>

    <section v-else class="favorite-grid">
      <article
        v-for="(favorite, index) in favorites"
        :key="`${favorite.categoryKey}-${favorite.contentid}`"
        class="favorite-card"
      >
        <div class="image-area">
          <RouterLink
            :to="`/detail/${favorite.categoryKey}/${favorite.contentid}`"
            class="image-link"
          >
            <img
              :src="
                favorite.firstimage ||
                '/images/image-preparing.jpg'
              "
              :alt="
                favorite.firstimage
                  ? favorite.title
                  : `${favorite.title} 이미지 준비 중`
              "
              :class="{
                'fallback-image': !favorite.firstimage,
              }"
              @error="handleImageError"
            />
          </RouterLink>

          <span class="order-badge">
            {{ index + 1 }}
          </span>

          <button
            type="button"
            class="remove-heart"
            :aria-label="`${favorite.title} 찜 삭제`"
            @click="deleteFavorite(favorite)"
          >
            ♥
          </button>
        </div>

        <RouterLink
          :to="`/detail/${favorite.categoryKey}/${favorite.contentid}`"
          class="card-content-link"
        >
          <div class="card-content">
            <span class="category-badge">
              {{ favorite.categoryName }}
            </span>

            <h2>{{ favorite.title }}</h2>

            <p class="address">
              {{ favorite.addr1 || '주소 정보 없음' }}
              {{ favorite.addr2 }}
            </p>

            <span class="detail-link">
              상세보기 →
            </span>
          </div>
        </RouterLink>
      </article>
    </section>
  </main>
</template>

<style scoped>
.favorites-container {
  width: min(1300px, 92%);
  margin: 45px auto 80px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-heading p {
  margin: 0 0 8px;
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

.clear-button {
  padding: 11px 18px;
  border: 1px solid #dc2626;
  border-radius: 9px;
  color: #dc2626;
  background: white;
  cursor: pointer;
}

.clear-button:hover {
  color: white;
  background: #dc2626;
}

.count-section {
  margin: 32px 0 22px;
  color: #475569;
}

.empty-section {
  padding: 100px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  text-align: center;
  background: white;
}

.empty-heart {
  color: #f43f5e;
  font-size: 65px;
}

.empty-section h2 {
  margin: 10px 0;
}

.empty-section p {
  margin-bottom: 28px;
  color: #64748b;
  line-height: 1.7;
}

.explore-button {
  display: inline-block;
  padding: 13px 20px;
  border-radius: 9px;
  color: white;
  background: #2563eb;
  text-decoration: none;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.favorite-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgb(15 23 42 / 10%);
}

.image-area {
  position: relative;
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

/* 이미지가 없거나 깨졌을 때 적용 */
.image-area img.fallback-image {
  box-sizing: border-box;
  object-fit: contain;
  padding: 10px;
  background: #ffffff;
}

.order-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 33px;
  height: 33px;
  padding: 0 9px;
  border-radius: 999px;
  color: white;
  background: rgb(15 23 42 / 78%);
  font-size: 13px;
  font-weight: 700;
}

.remove-heart {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #f43f5e;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 4px 12px rgb(15 23 42 / 18%);
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.2s,
    background 0.2s;
}

.remove-heart:hover {
  background: #fff1f2;
  transform: scale(1.08);
}

.card-content-link {
  display: block;
  color: inherit;
  text-decoration: none;
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

@media (max-width: 1100px) {
  .favorite-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .favorite-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .favorite-grid {
    grid-template-columns: 1fr;
  }

  .page-heading h1 {
    font-size: 30px;
  }
}
</style>