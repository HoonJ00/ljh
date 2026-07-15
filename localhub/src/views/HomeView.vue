<script setup>
import { categories } from '@/data/categories'
</script>

<template>
  <main>
    <section class="hero">
      <p class="region">광주·전라권</p>

      <h1>
        지역의 매력을 한곳에서 만나는<br />
        공공데이터 기반 LocalHub
      </h1>

      <p class="description">
        관광지, 문화시설, 음식점, 축제 등 광주·전라권의 다양한 정보를
        확인해 보세요.
      </p>
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
          <p>광주·전라권 {{ category.name }} 정보 보기</p>
          <span>바로가기 →</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  padding: 100px 20px;
  text-align: center;
  background: linear-gradient(135deg, #eff6ff, #ecfeff);
}

.region {
  margin: 0 0 15px;
  color: #2563eb;
  font-weight: 700;
}

.hero h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1.3;
}

.description {
  margin: 24px 0 0;
  color: #64748b;
  font-size: 18px;
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
}

.category-card span {
  color: #2563eb;
  font-weight: 700;
}

@media (max-width: 900px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>