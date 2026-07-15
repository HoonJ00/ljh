<script setup>
import { RouterLink } from 'vue-router'
import { categories } from '@/data/categories'
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">
        LocalHub
      </RouterLink>

      <nav class="navigation">
        <RouterLink
          v-for="category in categories"
          :key="category.key"
          :to="`/category/${category.key}`"
          class="navigation-link"
        >
          {{ category.name }}
        </RouterLink>

        <RouterLink
          to="/board"
          class="navigation-link community-link"
        >
          커뮤니티
        </RouterLink>

        <RouterLink
          to="/favorites"
          class="navigation-link favorite-link"
        >
          찜해부렀어<span class="favorite-heart">♥</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1480px, 94%);
  min-height: 72px;
  margin: 0 auto;
}

.logo {
  flex-shrink: 0;
  color: #2563eb;
  font-size: 27px;
  font-weight: 800;
  text-decoration: none;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-left: auto;
  padding-left: 70px;
  overflow-x: auto;
  white-space: nowrap;
}

.navigation-link {
  flex-shrink: 0;
  padding: 25px 0;
  color: #374151;
  font-size: 15px;
  text-decoration: none;
}

.navigation-link:hover {
  color: #2563eb;
}

.navigation-link.router-link-active {
  color: #2563eb;
  font-weight: 700;
}

.community-link {
  font-weight: 700;
}

.favorite-link {
  color: #f43f5e;
  font-weight: 700;
}

.favorite-link:hover {
  color: #e11d48;
}

.favorite-link.router-link-active {
  color: #e11d48;
  font-weight: 800;
}

.favorite-heart {
  display: inline-block;
  margin-left: 3px;
  color: #f43f5e;
  font-size: 14px;
  line-height: 1;
  vertical-align: middle;
}

.favorite-link:hover .favorite-heart,
.favorite-link.router-link-active .favorite-heart {
  color: #e11d48;
}

@media (max-width: 1200px) {
  .header-inner {
    width: 96%;
  }

  .navigation {
    gap: 18px;
    padding-left: 35px;
  }

  .navigation-link {
    font-size: 14px;
  }
}

@media (max-width: 900px) {
  .header-inner {
    display: block;
    padding: 14px 0;
  }

  .logo {
    display: inline-block;
    margin-bottom: 12px;
  }

  .navigation {
    margin-left: 0;
    padding-left: 0;
    gap: 20px;
  }

  .navigation-link {
    padding: 8px 0;
  }
}
</style>