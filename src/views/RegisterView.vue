<template>
  <div class="register-view">
    <div class="register-container">
      <h2>註冊會員</h2>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Email -->
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              required
          />
          <div class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">密碼</label>
          <div class="input-group">
            <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                required
            />
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

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <div class="input-group">
            <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                required
            />
            <button
                type="button"
                class="btn btn-outline-secondary"
                @click="toggleConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
          </div>
        </div>

        <!-- Phone -->
        <div class="form-group">
          <label for="phone">手機號碼</label>
          <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': errors.phone }"
          />
          <div class="invalid-feedback">{{ errors.phone }}</div>
        </div>

        <!-- Submit Button -->
        <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? '註冊中...' : '註冊' }}
        </button>

        <!-- Login Link -->
        <div class="text-center mt-3">
          已有帳號？
          <router-link to="/login">立即登入</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword, validatePhone } from '@/utils/validators'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateForm = () => {
  let isValid = true

  // 清除之前的錯誤
  Object.keys(errors).forEach(key => errors[key] = '')

  // Email 驗證
  if (!validateEmail(formData.email)) {
    errors.email = '請輸入有效的電子郵件地址'
    isValid = false
  }

  // 密碼驗證
  if (!validatePassword(formData.password)) {
    errors.password = '密碼必須至少包含8個字符，包括大小寫字母和數字'
    isValid = false
  }

  // 確認密碼驗證
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
    isValid = false
  }

  // 手機號碼驗證
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = '請輸入有效的手機號碼'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    await authStore.register({
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    })

    router.push('/login')
  } catch (error) {
    if (error.response?.data?.message) {
      // 處理特定的錯誤訊息
      if (error.response.data.message.includes('email')) {
        errors.email = '此電子郵件已被註冊'
      } else {
        errors.general = error.response.data.message
      }
    } else {
      errors.general = '註冊失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  padding: var(--spacing-lg);
}

.register-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.register-container h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.input-group {
  position: relative;
}

.input-group .btn {
  padding: var(--spacing-xs) var(--spacing-sm);
}

.invalid-feedback {
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

@media (max-width: 576px) {
  .register-container {
    padding: var(--spacing-md);
  }
}
</style>