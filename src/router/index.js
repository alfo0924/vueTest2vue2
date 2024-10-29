// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 頁面組件
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MemberView from '@/views/MemberView.vue'
import MovieView from '@/views/MovieView.vue'
import BookingView from '@/views/BookingView.vue'
import WalletView from '@/views/WalletView.vue'
import DiscountView from '@/views/DiscountView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首頁 - 市民卡系統'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: '登入 - 市民卡系統',
      guest: true // 只有未登入用戶可以訪問
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: '註冊 - 市民卡系統',
      guest: true
    }
  },
  {
    path: '/member',
    name: 'member',
    component: MemberView,
    meta: {
      title: '會員中心 - 市民卡系統',
      requiresAuth: true // 需要登入才能訪問
    },
    children: [
      {
        path: 'profile',
        name: 'member-profile',
        component: () => import('@/components/member/ProfileForm.vue'),
        meta: {
          title: '個人資料 - 市民卡系統'
        }
      },
      {
        path: 'card',
        name: 'member-card',
        component: () => import('@/components/member/CitizenCard.vue'),
        meta: {
          title: '市民卡資訊 - 市民卡系統'
        }
      },
      {
        path: 'verification',
        name: 'member-verification',
        component: () => import('@/components/member/VerificationForm.vue'),
        meta: {
          title: '身份驗證 - 市民卡系統'
        }
      }
    ]
  },
  {
    path: '/movies',
    name: 'movies',
    component: MovieView,
    meta: {
      title: '電影列表 - 市民卡系統'
    },
    children: [
      {
        path: ':id',
        name: 'movie-detail',
        component: () => import('@/components/movie/MovieDetail.vue'),
        props: true,
        meta: {
          title: '電影詳情 - 市民卡系統'
        }
      }
    ]
  },
  {
    path: '/booking',
    name: 'booking',
    component: BookingView,
    meta: {
      title: '訂票 - 市民卡系統',
      requiresAuth: true
    },
    children: [
      {
        path: ':movieId',
        name: 'booking-movie',
        component: () => import('@/components/booking/MovieBooking.vue'),
        props: true
      },
      {
        path: 'showing/:showingId',
        name: 'booking-seats',
        component: () => import('@/components/booking/SeatSelection.vue'),
        props: true
      },
      {
        path: 'confirm',
        name: 'booking-confirm',
        component: () => import('@/components/booking/BookingConfirm.vue')
      }
    ]
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: WalletView,
    meta: {
      title: '電子錢包 - 市民卡系統',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'wallet-overview',
        component: () => import('@/components/wallet/WalletOverview.vue')
      },
      {
        path: 'topup',
        name: 'wallet-topup',
        component: () => import('@/components/wallet/TopUpForm.vue'),
        meta: {
          title: '儲值 - 市民卡系統'
        }
      },
      {
        path: 'history',
        name: 'wallet-history',
        component: () => import('@/components/wallet/TransactionList.vue'),
        meta: {
          title: '交易記錄 - 市民卡系統'
        }
      }
    ]
  },
  {
    path: '/discounts',
    name: 'discounts',
    component: DiscountView,
    meta: {
      title: '優惠資訊 - 市民卡系統',
      requiresAuth: true
    },
    children: [
      {
        path: ':id',
        name: 'discount-detail',
        component: () => import('@/components/discount/DiscountDetail.vue'),
        props: true
      }
    ]
  },
  {
    // 錯誤頁面
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue'),
    meta: {
      title: '系統錯誤 - 市民卡系統'
    }
  },
  {
    // 404 頁面
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '頁面不存在 - 市民卡系統'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 導航守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 設置頁面標題
  document.title = to.meta.title || '市民卡系統'

  try {
    // 檢查登入狀態
    if (to.meta.requiresAuth) {
      if (!authStore.isLoggedIn) {
        // 儲存原本要去的路徑
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // 檢查用戶狀態
      if (!authStore.user) {
        await authStore.fetchUserProfile()
      }

      // 檢查是否已驗證
      if (to.meta.requiresVerification && !authStore.user.isVerified) {
        next('/member/verification')
        return
      }
    }

    // 檢查是否為僅供未登入用戶的頁面
    if (to.meta.guest && authStore.isLoggedIn) {
      next('/')
      return
    }

    next()
  } catch (error) {
    console.error('Navigation error:', error)
    next('/error')
  }
})

// 後置導航守衛
router.afterEach((to, from) => {
  // 記錄頁面訪問
  if (process.env.NODE_ENV === 'production') {
    // 這裡可以添加分析追蹤代碼
  }
})

// 錯誤處理
router.onError((error) => {
  console.error('Router error:', error)
  router.push('/error')
})

export default router