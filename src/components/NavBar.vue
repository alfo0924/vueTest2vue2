<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand" to="/">
        <img src="@/assets/logo.png" alt="市民卡" class="navbar-logo">
      </router-link>

      <!-- 漢堡選單按鈕 -->
      <button
          class="navbar-toggler"
          type="button"
          @click="isNavOpen = !isNavOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 導航選單 -->
      <div
          class="collapse navbar-collapse"
          :class="{ 'show': isNavOpen }"
      >
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 電影 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/movies">
              <i class="fas fa-film"></i> 電影
            </router-link>
          </li>

          <!-- 優惠 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/discounts">
              <i class="fas fa-tags"></i> 優惠
            </router-link>
          </li>
        </ul>

        <!-- 未登入狀態 -->
        <div v-if="!isLoggedIn" class="navbar-nav">
          <router-link class="nav-link" to="/login">
            <i class="fas fa-sign-in-alt"></i> 登入
          </router-link>
          <router-link class="nav-link" to="/register">
            <i class="fas fa-user-plus"></i> 註冊
          </router-link>
        </div>

        <!-- 已登入狀態 -->
        <div v-else class="navbar-nav">
          <!-- 電子錢包 -->
          <router-link class="nav-link" to="/wallet">
            <i class="fas fa-wallet"></i>
            <span class="wallet-balance" v-if="walletBalance !== null">
              NT$ {{ formatAmount(walletBalance) }}
            </span>
          </router-link>

          <!-- 用戶選單 -->
          <div class="nav-item dropdown">
            <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                @click="toggleUserMenu"
            >
              <i class="fas fa-user-circle"></i>
              {{ userName }}
            </a>
            <div
                class="dropdown-menu dropdown-menu-end"
                :class="{ 'show': isUserMenuOpen }"
            >
              <router-link class="dropdown-item" to="/profile">
                <i class="fas fa-user"></i> 個人資料
              </router-link>
              <router-link class="dropdown-item" to="/bookings">
                <i class="fas fa-ticket-alt"></i> 我的訂票
              </router-link>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i> 登出
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { formatAmount } from '@/utils/formatters'

export default {
  name: 'NavBar',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const walletStore = useWalletStore()

    const isNavOpen = ref(false)
    const isUserMenuOpen = ref(false)
    const walletBalance = ref(null)

    // 計算屬性
    const isLoggedIn = computed(() => authStore.isLoggedIn)
    const userName = computed(() => authStore.user?.name || '用戶')

    // 切換用戶選單
    const toggleUserMenu = () => {
      isUserMenuOpen.value = !isUserMenuOpen.value
    }

    // 處理登出
    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

    // 獲取錢包餘額
    const fetchWalletBalance = async () => {
      if (isLoggedIn.value) {
        try {
          walletBalance.value = await walletStore.fetchBalance()
        } catch (error) {
          console.error('Error fetching wallet balance:', error)
        }
      }
    }

    // 點擊外部關閉選單
    const handleClickOutside = (event) => {
      if (isUserMenuOpen.value && !event.target.closest('.dropdown')) {
        isUserMenuOpen.value = false
      }
    }

    onMounted(() => {
      fetchWalletBalance()
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isNavOpen,
      isUserMenuOpen,
      isLoggedIn,
      userName,
      walletBalance,
      toggleUserMenu,
      handleLogout,
      formatAmount
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-sm) 0;
}

.navbar-logo {
  height: 40px;
}

.nav-link {
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.wallet-balance {
  margin-left: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.dropdown-menu {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}

.dropdown-item {
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
}

.dropdown-item i {
  width: 20px;
  margin-right: var(--spacing-sm);
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .navbar-nav {
    padding: var(--spacing-md) 0;
  }

  .dropdown-menu {
    position: static !important;
    width: 100%;
    margin-top: 0;
  }
}
</style>