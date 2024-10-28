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
    }
  },
  {
    path: '/movies',
    name: 'movies',
    component: MovieView,
    meta: {
      title: '電影列表 - 市民卡系統'
    }
  },
  {
    path: '/booking/:movieId/:showingId?',
    name: 'booking',
    component: BookingView,
    props: true,
    meta: {
      title: '訂票 - 市民卡系統',
      requiresAuth: true
    }
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
  // 平滑滾動到頁面頂部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 導航守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 設置頁面標題
  document.title = to.meta.title || '市民卡系統'

  // 檢查是否需要登入
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 儲存原本要去的路徑
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 檢查是否為僅供未登入用戶的頁面
  if (to.meta.guest && authStore.isLoggedIn) {
    next('/')
    return
  }

  next()
})

// 錯誤處理
router.onError((error) => {
  console.error('Router error:', error)
  router.push('/error')
})

export default router