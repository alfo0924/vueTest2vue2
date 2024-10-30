// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首頁 - 市民卡系統'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登入 - 市民卡系統',
      guest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      title: '註冊 - 市民卡系統',
      guest: true
    }
  },
  {
    path: '/member',
    name: 'member',
    component: () => import('@/views/MemberView.vue'),
    meta: {
      title: '會員中心 - 市民卡系統',
      requiresAuth: true
    }
  },
  {
    path: '/movies',
    name: 'movies',
    component: () => import('@/views/MovieView.vue'),
    meta: {
      title: '電影列表 - 市民卡系統'
    }
  },
  {
    path: '/booking',
    name: 'booking',
    component: () => import('@/views/BookingView.vue'),
    meta: {
      title: '訂票 - 市民卡系統',
      requiresAuth: true
    }
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('@/views/WalletView.vue'),
    meta: {
      title: '電子錢包 - 市民卡系統',
      requiresAuth: true
    }
  },
  {
    path: '/discounts',
    name: 'discounts',
    component: () => import('@/views/DiscountView.vue'),
    meta: {
      title: '優惠資訊 - 市民卡系統'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '頁面不存在 - 市民卡系統'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 導航守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 設置頁面標題
  document.title = to.meta.title || '市民卡系統'

  try {
    // 檢查登入狀態
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 已登入用戶不能訪問登入/註冊頁面
    if (to.meta.guest && authStore.isLoggedIn) {
      next({ name: 'home' })
      return
    }

    next()
  } catch (error) {
    console.error('Navigation error:', error)
    next('/login')
  }
})

export default router