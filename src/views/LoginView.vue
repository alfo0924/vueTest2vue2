<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Logo 區域 -->
      <div class="logo-section">
        <img src="@/assets/logo.png" alt="市民卡" class="logo">
        <h1>歡迎使用市民卡系統</h1>
      </div>

      <!-- 登入表單 -->
      <div class="login-form">
        <h2>會員登入</h2>
        <form @submit.prevent="handleLogin">
          <!-- 電子郵件 -->
          <div class="form-group">
            <label for="email">電子郵件</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="請輸入電子郵件"
                  required
                  autocomplete="email"
              >
              <div class="invalid-feedback">{{ errors.email }}</div>
            </div>
          </div>

          <!-- 密碼 -->
          <div class="form-group">
            <label for="password">密碼</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-lock"></i>
              </span>
              <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="請輸入密碼"
                  required
                  autocomplete="current-password"
              >
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="togglePassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
              <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
          </div>

          <!-- 記住我和忘記密碼 -->
          <div class="form-options">
            <label class="remember-me">
              <input
                  type="checkbox"
                  v-model="formData.rememberMe"
              >
              <span>記住我</span>
            </label>
            <router-link
                :to="{ name: 'forgot-password' }"
                class="forgot-password"
            >
              忘記密碼？
            </router-link>
          </div>

          <!-- 登入按鈕 -->
          <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>

        <!-- 其他登入選項 -->
        <div class="other-options">
          <p class="divider">或</p>
          <div class="social-login">
            <button
                class="btn btn-outline-danger w-100 mb-2"
                @click="handleGoogleLogin"
                :disabled="loading"
            >
              <i class="fab fa-google me-2"></i>
              使用 Google 帳號登入
            </button>
            <button
                class="btn btn-outline-primary w-100"
                @click="handleFacebookLogin"
                :disabled="loading"
            >
              <i class="fab fa-facebook-f me-2"></i>
              使用 Facebook 帳號登入
            </button>
          </div>
        </div>

        <!-- 註冊連結 -->
        <div class="register-link">
          <p>還沒有帳號？</p>
          <router-link
              :to="{ name: 'register' }"
              class="btn btn-outline-primary"
          >
            立即註冊
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validateRequired } from '@/utils/validators'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 狀態
const loading = ref(false)
const showPassword = ref(false)

// 表單數據
const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 錯誤訊息
const errors = reactive({
  email: '',
  password: ''
})

// 切換密碼顯示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 表單驗證
const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  // 驗證電子郵件
  const emailResult = validateEmail(formData.email)
  if (!emailResult.isValid) {
    errors.email = emailResult.message
    isValid = false
  }

  // 驗證密碼
  const passwordResult = validateRequired(formData.password, '密碼')
  if (!passwordResult.isValid) {
    errors.password = passwordResult.message
    isValid = false
  }

  return isValid
}

// 處理登入
const handleLogin = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    await authStore.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    })

    // 登入成功後導向
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (error) {
    if (error.response?.status === 401) {
      errors.password = '電子郵件或密碼錯誤'
    } else {
      errors.password = '登入失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 第三方登入
const handleGoogleLogin = async () => {
  try {
    loading.value = true
    await authStore.googleLogin()
    router.push('/')
  } catch (error) {
    console.error('Google login failed:', error)
  } finally {
    loading.value = false
  }
}

const handleFacebookLogin = async () => {
  try {
    loading.value = true
    await authStore.facebookLogin()
    router.push('/')
  } catch (error) {
    console.error('Facebook login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.logo-section {
  text-align: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-light);
}

.logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-md);
}

.login-form {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.forgot-password:hover {
  text-decoration: underline;
}

.divider {
  text-align: center;
  position: relative;
  margin: var(--spacing-lg) 0;
  color: var(--text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: var(--border-color);
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.social-login {
  margin-bottom: var(--spacing-lg);
}

.register-link {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.register-link p {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .login-container {
    box-shadow: none;
  }

  .login-form {
    padding: var(--spacing-md);
  }
}
</style>