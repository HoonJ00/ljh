import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import CategoryListView from '@/views/CategoryListView.vue'
import PlaceDetailView from '@/views/PlaceDetailView.vue'
import BoardListView from '@/views/BoardListView.vue'
import BoardFormView from '@/views/BoardFormView.vue'
import BoardDetailView from '@/views/BoardDetailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/category/:category',
      name: 'category-list',
      component: CategoryListView,
    },
    {
      path: '/detail/:category/:contentId',
      name: 'place-detail',
      component: PlaceDetailView,
    },
    {
      path: '/board',
      name: 'board-list',
      component: BoardListView,
    },
    {
      path: '/board/write',
      name: 'board-write',
      component: BoardFormView,
    },
    {
      path: '/board/:id',
      name: 'board-detail',
      component: BoardDetailView,
    },
    {
      path: '/board/:id/edit',
      name: 'board-edit',
      component: BoardFormView,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

export default router