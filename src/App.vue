<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- 導航欄 -->
    <NavBar
        v-if="!isAuthPage"
        :user="authStore.user"
        @toggle-theme="toggleTheme"
        @logout="handleLogout"
    />

    <!-- 主要內容區 -->
    <main class="main-content">
      <!-- 全局載入指示器 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-wrapper">
          <div class="spinner"></div>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- 路由視圖 -->
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <Suspense>
            <component :is="Component" />
            <template #fallback>
              <div class="loading-overlay">
                <div class="spinner"></div>
                <p>載入中...</p>
              </div>
            </template>
          </Suspense>
        </Transition>
      </RouterView>
    </main>

    <!-- 頁尾 -->
    <Footer v-if="!isAuthPage" />

    <!-- 全局通知 -->
    <div class="notifications">
      <TransitionGroup name="notification">
        <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification"
            :class="[notification.type, { 'is-dismissible': notification.dismissible }]"
        >
          <i :class="getNotificationIcon(notification.type)"></i>
          <div class="notification-content">
            <div v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button
              v-if="notification.dismissible"
              class="notification-close"
              @click="removeNotification(notification.id)"
              aria-label="關閉通知"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 離線提示 -->
    <div v-if="!isOnline" class="offline-alert">
      <i class="fas fa-wifi-slash"></i>
      目前處於離線狀態，部分功能可能無法使用
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

// 初始化
const router = useRouter()
const authStore = useAuthStore()

// 狀態管理
const loading = ref(false)
const loadingMessage = ref('載入中...')
const notifications = ref([])
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const isOnline = ref(navigator.onLine)

// 計算屬性
const isAuthPage = computed(() => {
  const authPages = ['/login', '/register', '/forgot-password']
  return authPages.includes(router.currentRoute.value.path)
})

// 主題切換
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark-mode')
}

// 載入狀態控制
const setLoading = (status, message = '載入中...') => {
  loading.value = status
  loadingMessage.value = message
}

// 通知管理
const getNotificationIcon = (type) => ({
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle'
}[type] || 'fas fa-info-circle')

const addNotification = ({
                           message,
                           type = 'info',
                           title = '',
                           duration = 3000,
                           dismissible = true
                         }) => {
  const id = Date.now()
  notifications.value.push({
    id,
    message,
    type,
    title,
    dismissible
  })

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration)
  }
}

const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// 登出處理
const handleLogout = async () => {
  try {
    setLoading(true, '登出中...')
    await authStore.logout()
    router.push('/login')
    addNotification({
      type: 'success',
      message: '已成功登出'
    })
  } catch (error) {
    addNotification({
      type: 'error',
      message: '登出失敗，請稍後再試'
    })
  } finally {
    setLoading(false)
  }
}

// 網路狀態監控
const handleOnline = () => {
  isOnline.value = true
  addNotification({
    type: 'success',
    message: '網路連線已恢復'
  })
}

const handleOffline = () => {
  isOnline.value = false
  addNotification({
    type: 'warning',
    message: '網路連線已斷開',
    duration: 0
  })
}

// 生命週期鉤子
onMounted(() => {
  // 設置初始主題
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
  }

  // 初始化認證狀態
  if (authStore.token) {
    authStore.fetchUserProfile().catch(error => {
      addNotification({
        type: 'error',
        message: '身份驗證失敗，請重新登入'
      })
    })
  }

  // 添加網路狀態監聽
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
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
}

.spinner-wrapper {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 通知樣式 */
.notifications {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-index-notification);
}

.notification {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-md);
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

.notification.info {
  background-color: var(--info-color);
  color: var(--text-light);
}

.notification i {
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--spacing-xs);
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.notification-close:hover {
  opacity: 1;
}

/* 離線提示 */
.offline-alert {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--warning-color);
  color: var(--text-dark);
  text-align: center;
  padding: var(--spacing-sm);
  z-index: var(--z-index-notification);
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

.notification-enter-from,
.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 響應式設計 */
@media (max-width: 576px) {
  .notifications {
    left: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .notification {
    min-width: auto;
    width: calc(100% - var(--spacing-sm) * 2);
  }
}
</style>