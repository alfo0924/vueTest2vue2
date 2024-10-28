<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">會員註冊</h2>

      <!-- 註冊表單 -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Email -->
        <div class="form-group">
          <BaseInput
              v-model="formData.email"
              type="email"
              label="電子郵件"
              placeholder="請輸入電子郵件"
              :error="errors.email"
              required
              @blur="validateEmail"
          />
        </div>

        <!-- 密碼 -->
        <div class="form-group">
          <BaseInput
              v-model="formData.password"
              type="password"
              label="密碼"
              placeholder="請輸入密碼"
              :error="errors.password"
              required
              @blur="validatePassword"
          />
          <div class="password-requirements">
            <p>密碼必須包含：</p>
            <ul>
              <li :class="{ valid: passwordStrength.length }">至少8個字符</li>
              <li :class="{ valid: passwordStrength.uppercase }">至少一個大寫字母</li>
              <li :class="{ valid: passwordStrength.lowercase }">至少一個小寫字母</li>
              <li :class="{ valid: passwordStrength.number }">至少一個數字</li>
              <li :class="{ valid: passwordStrength.special }">至少一個特殊字符</li>
            </ul>
          </div>
        </div>

        <!-- 確認密碼 -->
        <div class="form-group">
          <BaseInput
              v-model="formData.confirmPassword"
              type="password"
              label="確認密碼"
              placeholder="請再次輸入密碼"
              :error="errors.confirmPassword"
              required
              @blur="validateConfirmPassword"
          />
        </div>

        <!-- 手機號碼 -->
        <div class="form-group">
          <BaseInput
              v-model="formData.phone"
              type="tel"
              label="手機號碼"
              placeholder="請輸入手機號碼"
              :error="errors.phone"
              required
              @blur="validatePhone"
          />
        </div>

        <!-- 卡片類型選擇 -->
        <div class="form-group">
          <label>卡片類型</label>
          <select
              v-model="formData.cardType"
              class="form-select"
              required
              @change="validateCardType"
          >
            <option value="">請選擇卡片類型</option>
            <option value="一般卡">一般卡</option>
            <option value="敬老卡">敬老卡</option>
            <option value="愛心卡">愛心卡</option>
            <option value="學生卡">學生卡</option>
          </select>
          <span class="error-message" v-if="errors.cardType">{{ errors.cardType }}</span>
        </div>

        <!-- 同意條款 -->
        <div class="form-group">
          <div class="form-check">
            <input
                type="checkbox"
                v-model="formData.agreeToTerms"
                class="form-check-input"
                id="agreeToTerms"
                required
            >
            <label class="form-check-label" for="agreeToTerms">
              我同意
              <a href="#" @click.prevent="showTerms">服務條款</a>
              和
              <a href="#" @click.prevent="showPrivacy">隱私政策</a>
            </label>
          </div>
          <span class="error-message" v-if="errors.agreeToTerms">{{ errors.agreeToTerms }}</span>
        </div>

        <!-- 提交按鈕 -->
        <BaseButton
            type="submit"
            text="註冊"
            :loading="loading"
            :disabled="!isFormValid || loading"
            class="submit-btn"
        />

        <!-- 登入連結 -->
        <div class="login-link">
          已有帳號？
          <router-link to="/login">立即登入</router-link>
        </div>
      </form>
    </div>

    <!-- 條款 Modal -->
    <BaseModal
        v-model="showTermsModal"
        title="服務條款"
        @close="showTermsModal = false"
    >
      <div class="terms-content">
        <!-- 這裡放服務條款內容 -->
        <h3>服務條款</h3>
        <p>歡迎使用市民卡系統...</p>
      </div>
    </BaseModal>

    <!-- 隱私政策 Modal -->
    <BaseModal
        v-model="showPrivacyModal"
        title="隱私政策"
        @close="showPrivacyModal = false"
    >
      <div class="privacy-content">
        <!-- 這裡放隱私政策內容 -->
        <h3>隱私政策</h3>
        <p>我們重視您的隱私...</p>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

export default {
  name: 'RegisterView',

  components: {
    BaseInput,
    BaseButton,
    BaseModal
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const loading = ref(false)
    const showTermsModal = ref(false)
    const showPrivacyModal = ref(false)

    const formData = ref({
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      cardType: '',
      agreeToTerms: false
    })

    const errors = ref({
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      cardType: '',
      agreeToTerms: ''
    })

    const passwordStrength = computed(() => {
      const password = formData.value.password
      return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
      }
    })

    const isFormValid = computed(() => {
      return !Object.values(errors.value).some(error => error) &&
          Object.values(formData.value).every(value => value) &&
          formData.value.agreeToTerms
    })

    // 驗證方法
    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.value.email) {
        errors.value.email = '請輸入電子郵件'
      } else if (!emailRegex.test(formData.value.email)) {
        errors.value.email = '請輸入有效的電子郵件地址'
      } else {
        errors.value.email = ''
      }
    }

    const validatePassword = () => {
      const password = formData.value.password
      if (!password) {
        errors.value.password = '請輸入密碼'
      } else if (password.length < 8) {
        errors.value.password = '密碼長度至少為8個字符'
      } else if (!/[A-Z]/.test(password)) {
        errors.value.password = '密碼必須包含至少一個大寫字母'
      } else if (!/[a-z]/.test(password)) {
        errors.value.password = '密碼必須包含至少一個小寫字母'
      } else if (!/[0-9]/.test(password)) {
        errors.value.password = '密碼必須包含至少一個數字'
      } else if (!/[!@#$%^&*]/.test(password)) {
        errors.value.password = '密碼必須包含至少一個特殊字符'
      } else {
        errors.value.password = ''
      }
    }

    const validateConfirmPassword = () => {
      if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = '請確認密碼'
      } else if (formData.value.confirmPassword !== formData.value.password) {
        errors.value.confirmPassword = '兩次輸入的密碼不一致'
      } else {
        errors.value.confirmPassword = ''
      }
    }

    const validatePhone = () => {
      const phoneRegex = /^09\d{8}$/
      if (!formData.value.phone) {
        errors.value.phone = '請輸入手機號碼'
      } else if (!phoneRegex.test(formData.value.phone)) {
        errors.value.phone = '請輸入有效的手機號碼'
      } else {
        errors.value.phone = ''
      }
    }

    const validateCardType = () => {
      if (!formData.value.cardType) {
        errors.value.cardType = '請選擇卡片類型'
      } else {
        errors.value.cardType = ''
      }
    }

    // 處理註冊
    const handleRegister = async () => {
      try {
        loading.value = true
        // 驗證所有欄位
        validateEmail()
        validatePassword()
        validateConfirmPassword()
        validatePhone()
        validateCardType()

        if (!isFormValid.value) {
          return
        }

        // 調用註冊 API
        await authStore.register({
          email: formData.value.email,
          password: formData.value.password,
          phone: formData.value.phone,
          cardType: formData.value.cardType
        })

        // 註冊成功，導向登入頁
        router.push('/login')
      } catch (error) {
        console.error('Registration failed:', error)
      } finally {
        loading.value = false
      }
    }

    const showTerms = () => {
      showTermsModal.value = true
    }

    const showPrivacy = () => {
      showPrivacyModal.value = true
    }

    return {
      formData,
      errors,
      loading,
      showTermsModal,
      showPrivacyModal,
      passwordStrength,
      isFormValid,
      handleRegister,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      validatePhone,
      validateCardType,
      showTerms,
      showPrivacy
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
}

.register-card {
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.register-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.password-requirements {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.password-requirements ul {
  list-style: none;
  padding-left: var(--spacing-md);
}

.password-requirements li {
  margin-top: var(--spacing-xs);
}

.password-requirements li::before {
  content: '✗';
  color: var(--danger-color);
  margin-right: var(--spacing-xs);
}

.password-requirements li.valid::before {
  content: '✓';
  color: var(--success-color);
}

.error-message {
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.submit-btn {
  margin-top: var(--spacing-md);
}

.login-link {
  text-align: center;
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-card {
    padding: var(--spacing-md);
  }
}
</style>