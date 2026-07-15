<script setup>
import { onMounted, ref } from 'vue'

const places = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const response = await fetch('/data/광주_전라권_관광지.json')

    if (!response.ok) {
      throw new Error('관광지 데이터를 불러오지 못했습니다.')
    }

    const data = await response.json()

    console.log('관광지 JSON:', data)

    if (Array.isArray(data)) {
      places.value = data
    } else if (Array.isArray(data.items)) {
      places.value = data.items
    } else if (Array.isArray(data.response?.body?.items?.item)) {
      places.value = data.response.body.items.item
    } else {
      errorMessage.value = 'JSON 구조를 확인해야 합니다.'
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container">
    <h1>광주·전라 관광지</h1>

    <p v-if="loading">데이터를 불러오는 중입니다.</p>

    <p v-else-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <div v-else class="card-grid">
      <article
        v-for="(place, index) in places"
        :key="place.contentid || place.id || index"
        class="card"
      >
        <img
          v-if="place.firstimage || place.image"
          :src="place.firstimage || place.image"
          :alt="place.title || place.name"
        />

        <div class="card-content">
          <h2>{{ place.title || place.name || '이름 없음' }}</h2>

          <p>
            {{ place.addr1 || place.address || '주소 정보 없음' }}
          </p>

          <button type="button">관심 목록 추가</button>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.container {
  width: min(1200px, 92%);
  margin: 40px auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.card {
  overflow: hidden;
  border: 1px solid #dddddd;
  border-radius: 12px;
  background: white;
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.card-content h2 {
  font-size: 20px;
}

.card-content button {
  margin-top: 12px;
  padding: 10px 14px;
  cursor: pointer;
}

.error {
  color: red;
}
</style>