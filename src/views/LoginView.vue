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
          <BaseInput
              v-model="formData.email"
              type="email"
              label="電子郵件"
              placeholder="請輸入您的電子郵件"
              :error-message="errors.email"
              required
              autocomplete="email"
          />

          <!-- 密碼 -->
          <BaseInput
              v-model="formData.password"
              type="password"
              label="密碼"
              placeholder="請輸入您的密碼"
              :error-message="errors.password"
              required
              autocomplete="current-password"
          />

          <!-- 記住我 -->
          <div class="form-options">
            <label class="remember-me">
              <input
                  type="checkbox"
                  v-model="formData.rememberMe"
              >
              <span>記住我</span>
            </label>
            <router-link to="/forgot-password" class="forgot-password">
              忘記密碼？
            </router-link>
          </div>

          <!-- 登入按鈕 -->
          <BaseButton
              type="submit"
              text="登入"
              :loading="loading"
              :disabled="loading"
              class="login-button"
          />
        </form>

        <!-- 其他登入選項 -->
        <div class="other-options">
          <p class="divider">或</p>
          <div class="social-login">
            <button class="social-button google" @click="handleGoogleLogin">
              <i class="fab fa-google"></i>
              使用 Google 帳號登入
            </button>
            <button class="social-button facebook" @click="handleFacebookLogin">
              <i class="fab fa-facebook-f"></i>
              使用 Facebook 帳號登入
            </button>
          </div>
        </div>

        <!-- 註冊連結 -->
        <div class="register-link">
          還沒有帳號？
          <router-link to="/register">立即註冊</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

export default {
  name: 'LoginView',

  components: {
    BaseInput,
    BaseButton
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const loading = ref(false)

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

    // 表單驗證
    const validateForm = () => {
      let isValid = true
      errors.email = ''
      errors.password = ''

      if (!formData.email) {
        errors.email = '請輸入電子郵件'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = '請輸入有效的電子郵件地址'
        isValid = false
      }

      if (!formData.password) {
        errors.password = '請輸入密碼'
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

    // 第三方登入處理
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

    return {
      formData,
      errors,
      loading,
      handleLogin,
      handleGoogleLogin,
      handleFacebookLogin
    }
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
  margin-bottom: var(--spacing-md);
}

.login-form {
  padding: var(--spacing-lg);
}

.login-form h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
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
}

.login-button {
  width: 100%;
  margin-bottom: var(--spacing-lg);
}

.divider {
  text-align: center;
  position: relative;
  margin: var(--spacing-md) 0;
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

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.social-button:hover {
  opacity: 0.9;
}

.social-button.google {
  background-color: #DB4437;
  color: white;
}

.social-button.facebook {
  background-color: #4267B2;
  color: white;
}

.register-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

@media (max-width: 480px) {
  .login-container {
    box-shadow: none;
    background-color: transparent;
  }

  .login-form {
    background-color: var(--bg-primary);
    border-radius: var(--border-radius-lg);
    margin-top: var(--spacing-md);
  }
}
</style>