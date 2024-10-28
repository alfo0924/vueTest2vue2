<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- 導航欄 -->
    <NavBar
        v-if="!isAuthPage"
        @toggle-theme="toggleTheme"
    />

    <!-- 主要內容區 -->
    <main class="main-content">
      <!-- 全局載入指示器 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 路由視圖 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 頁尾 -->
    <Footer v-if="!isAuthPage" />

    <!-- 全局通知 -->
    <div class="notifications">
      <transition-group name="notification">
        <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification"
            :class="notification.type"
        >
          {{ notification.message }}
          <button
              class="notification-close"
              @click="removeNotification(notification.id)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'App',

  components: {
    NavBar,
    Footer
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(false)
    const notifications = ref([])
    const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

    // 計算是否為認證頁面（登入/註冊）
    const isAuthPage = computed(() => {
      return ['/login', '/register'].includes(router.currentRoute.value.path)
    })

    // 切換主題
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark-mode')
    }

    // 添加通知
    const addNotification = (message, type = 'info') => {
      const id = Date.now()
      notifications.value.push({ id, message, type })

      // 自動移除通知
      setTimeout(() => {
        removeNotification(id)
      }, 3000)
    }

    // 移除通知
    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }

    // 初始化
    onMounted(async () => {
      // 設置初始主題
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
      }

      // 檢查認證狀態
      try {
        loading.value = true
        if (authStore.token) {
          await authStore.fetchUserProfile()
        }
      } catch (error) {
        console.error('Authentication error:', error)
        addNotification(error.message, 'error')
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      notifications,
      isDarkMode,
      isAuthPage,
      toggleTheme,
      addNotification,
      removeNotification
    }
  }
}
</script>

<style>
/* 全局樣式 */
:root {
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
}

/* Dark theme */
.dark-mode {
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --border-color: #495057;
}

/* 基本樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg) 0;
  position: relative;
}

/* 載入指示器 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
  color: var(--text-light);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 通知樣式 */
.notifications {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-index-notification);
}

.notification {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 300px;
}

.notification.success {
  background-color: var(--success-color);
  color: var(--text-light);
}

.notification.error {
  background-color: var(--danger-color);
  color: var(--text-light);
}

.notification.warning {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--spacing-xs);
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.notification-enter-active,
.notification-leave-active {
  transition: all var(--transition-normal);
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .notifications {
    left: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .notification {
    min-width: auto;
  }
}
</style>