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
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 導航選單 -->
      <div
          class="collapse navbar-collapse"
          id="navbarContent"
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
        <ul v-if="!isLoggedIn" class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/login">
              <i class="fas fa-sign-in-alt"></i> 登入
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/register">
              <i class="fas fa-user-plus"></i> 註冊
            </router-link>
          </li>
        </ul>

        <!-- 已登入狀態 -->
        <ul v-else class="navbar-nav align-items-center">
          <!-- 電子錢包 -->
          <li class="nav-item">
            <router-link class="nav-link wallet-link" to="/wallet">
              <i class="fas fa-wallet"></i>
              <span class="wallet-balance" v-if="walletBalance !== null">
                NT$ {{ formatAmount(walletBalance) }}
              </span>
            </router-link>
          </li>

          <!-- 用戶選單 -->
          <li class="nav-item dropdown">
            <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
              <i class="fas fa-user-circle"></i>
              {{ userName }}
            </a>

            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="fas fa-user"></i> 個人資料
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/bookings">
                  <i class="fas fa-ticket-alt"></i> 我的訂票
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleLogout"
                >
                  <i class="fas fa-sign-out-alt"></i> 登出
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { formatAmount } from '@/utils/formatters'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()

// 狀態
const walletBalance = ref(null)

// 計算屬性
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userName = computed(() => authStore.user?.email || '用戶')

// 處理登出
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// 獲取錢包餘額
const fetchWalletBalance = async () => {
  if (isLoggedIn.value) {
    try {
      walletBalance.value = await walletStore.fetchBalance()
    } catch (error) {
      console.error('獲取錢包餘額失敗:', error)
    }
  }
}

// 生命週期鉤子
onMounted(() => {
  fetchWalletBalance()
})
</script>

<style scoped>
.navbar {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-sm) 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-navbar);
}

.navbar-logo {
  height: 40px;
  transition: transform var(--transition-fast);
}

.navbar-logo:hover {
  transform: scale(1.05);
}

.nav-link {
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.wallet-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.wallet-balance {
  font-weight: var(--font-weight-medium);
  color: var(--success-color);
}

.dropdown-menu {
  min-width: 200px;
  padding: var(--spacing-xs) 0;
  margin-top: var(--spacing-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}

.dropdown-item {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

.dropdown-divider {
  margin: var(--spacing-xs) 0;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .navbar-nav {
    padding: var(--spacing-md) 0;
  }

  .dropdown-menu {
    border: none;
    box-shadow: none;
    background-color: var(--bg-secondary);
  }

  .wallet-link {
    justify-content: flex-start;
  }
}
</style>