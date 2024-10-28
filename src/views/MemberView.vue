<template>
  <div class="member-view">
    <!-- 會員資料卡片 -->
    <div class="member-card">
      <div class="member-header">
        <div class="member-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="member-basic-info">
          <h2>{{ memberInfo.HolderName || '會員' }}</h2>
          <p class="card-number">卡號：{{ memberInfo.CardNumber }}</p>
          <span class="card-type-badge" :class="getCardTypeClass">
            {{ memberInfo.CardType }}
          </span>
        </div>
      </div>

      <!-- 會員資料表單 -->
      <div class="member-form">
        <h3>個人資料</h3>
        <form @submit.prevent="handleSubmit">
          <!-- 電子郵件 -->
          <BaseInput
              v-model="formData.email"
              type="email"
              label="電子郵件"
              :disabled="true"
              :value="memberInfo.Email"
          />

          <!-- 姓名 -->
          <BaseInput
              v-model="formData.holderName"
              label="持卡人姓名"
              :error="errors.holderName"
              @blur="validateHolderName"
          />

          <!-- 手機號碼 -->
          <BaseInput
              v-model="formData.phone"
              type="tel"
              label="手機號碼"
              :error="errors.phone"
              @blur="validatePhone"
          />

          <!-- 更新按鈕 -->
          <BaseButton
              type="submit"
              text="更新資料"
              :loading="loading"
              :disabled="!isFormValid || loading"
          />
        </form>
      </div>
    </div>

    <!-- 會員功能區 -->
    <div class="member-functions">
      <!-- 訂票記錄 -->
      <div class="function-card">
        <h3>
          <i class="fas fa-ticket-alt"></i>
          訂票記錄
        </h3>
        <div class="booking-list" v-if="bookings.length">
          <div
              v-for="booking in bookings"
              :key="booking.BookingID"
              class="booking-item"
          >
            <div class="booking-info">
              <h4>{{ booking.MovieName }}</h4>
              <p>{{ formatDateTime(booking.ShowTime) }}</p>
              <p>座位：{{ booking.SeatNumber }}</p>
            </div>
            <span class="booking-status" :class="getBookingStatusClass(booking.Status)">
              {{ booking.Status }}
            </span>
          </div>
        </div>
        <div v-else class="empty-state">
          暫無訂票記錄
        </div>
      </div>

      <!-- 優惠券 -->
      <div class="function-card">
        <h3>
          <i class="fas fa-tags"></i>
          我的優惠券
        </h3>
        <div class="discount-list" v-if="discounts.length">
          <div
              v-for="discount in discounts"
              :key="discount.DiscountID"
              class="discount-item"
          >
            <div class="discount-info">
              <h4>{{ discount.DiscountName }}</h4>
              <p>{{ discount.Description }}</p>
              <p class="expiry">有效期限：{{ formatDate(discount.ValidUntil) }}</p>
            </div>
            <div class="discount-status">
              <span :class="isDiscountValid(discount) ? 'valid' : 'expired'">
                {{ isDiscountValid(discount) ? '可使用' : '已過期' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          暫無優惠券
        </div>
      </div>

      <!-- 交易記錄 -->
      <div class="function-card">
        <h3>
          <i class="fas fa-history"></i>
          近期交易
        </h3>
        <div class="transaction-list" v-if="transactions.length">
          <div
              v-for="transaction in transactions"
              :key="transaction.TransactionID"
              class="transaction-item"
          >
            <div class="transaction-info">
              <span class="transaction-type" :class="getTransactionTypeClass(transaction.TransactionType)">
                {{ transaction.TransactionType }}
              </span>
              <span class="transaction-amount" :class="getAmountClass(transaction.TransactionType)">
                {{ getAmountPrefix(transaction.TransactionType) }}
                NT$ {{ formatAmount(transaction.Amount) }}
              </span>
            </div>
            <p class="transaction-time">{{ formatDateTime(transaction.TransactionTime) }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          暫無交易記錄
        </div>
      </div>
    </div>

    <!-- 提示訊息 Modal -->
    <BaseModal
        v-model="showModal"
        :title="modalTitle"
        @close="closeModal"
    >
      <template #body>
        <p>{{ modalMessage }}</p>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime, formatDate, formatAmount } from '@/utils/formatters'

export default {
  name: 'MemberView',

  components: {
    BaseInput,
    BaseButton,
    BaseModal
  },

  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const showModal = ref(false)
    const modalTitle = ref('')
    const modalMessage = ref('')

    // 會員資料
    const memberInfo = ref({})
    const formData = reactive({
      holderName: '',
      phone: '',
      email: ''
    })
    const errors = reactive({
      holderName: '',
      phone: ''
    })

    // 訂票、優惠券、交易記錄
    const bookings = ref([])
    const discounts = ref([])
    const transactions = ref([])

    // 表單驗證
    const validateHolderName = () => {
      if (!formData.holderName) {
        errors.holderName = '請輸入持卡人姓名'
        return false
      }
      errors.holderName = ''
      return true
    }

    const validatePhone = () => {
      const phoneRegex = /^09\d{8}$/
      if (!formData.phone) {
        errors.phone = '請輸入手機號碼'
        return false
      }
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = '請輸入有效的手機號碼'
        return false
      }
      errors.phone = ''
      return true
    }

    const isFormValid = computed(() => {
      return !Object.values(errors).some(error => error) &&
          formData.holderName &&
          formData.phone
    })

    // 載入資料
    const loadMemberData = async () => {
      try {
        loading.value = true
        const data = await authStore.fetchMemberInfo()
        memberInfo.value = data
        formData.holderName = data.HolderName
        formData.phone = data.Phone
        formData.email = data.Email
      } catch (error) {
        showError('載入會員資料失敗')
      } finally {
        loading.value = false
      }
    }

    const loadBookings = async () => {
      try {
        const data = await authStore.fetchBookings()
        bookings.value = data
      } catch (error) {
        console.error('Error loading bookings:', error)
      }
    }

    const loadDiscounts = async () => {
      try {
        const data = await authStore.fetchDiscounts()
        discounts.value = data
      } catch (error) {
        console.error('Error loading discounts:', error)
      }
    }

    const loadTransactions = async () => {
      try {
        const data = await authStore.fetchTransactions()
        transactions.value = data
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    // 更新會員資料
    const handleSubmit = async () => {
      if (!validateHolderName() || !validatePhone()) return

      try {
        loading.value = true
        await authStore.updateMemberInfo({
          holderName: formData.holderName,
          phone: formData.phone
        })
        showSuccess('更新成功', '會員資料已更新')
      } catch (error) {
        showError('更新失敗', error.message)
      } finally {
        loading.value = false
      }
    }

    // 工具函數
    const getCardTypeClass = computed(() => {
      return `card-type-${memberInfo.value.CardType}`
    })

    const getBookingStatusClass = (status) => {
      return {
        'status-booked': status === '已預訂',
        'status-completed': status === '已完成',
        'status-cancelled': status === '已取消'
      }
    }

    const isDiscountValid = (discount) => {
      return new Date(discount.ValidUntil) > new Date()
    }

    const getTransactionTypeClass = (type) => {
      return {
        'type-deposit': type === '充值',
        'type-payment': type === '支付',
        'type-refund': type === '退款'
      }
    }

    const getAmountClass = (type) => {
      return {
        'amount-positive': type === '充值' || type === '退款',
        'amount-negative': type === '支付'
      }
    }

    const getAmountPrefix = (type) => {
      return type === '支付' ? '-' : '+'
    }

    const showSuccess = (title, message) => {
      modalTitle.value = title
      modalMessage.value = message
      showModal.value = true
    }

    const showError = (title, message = '請稍後再試') => {
      modalTitle.value = title
      modalMessage.value = message
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    onMounted(() => {
      loadMemberData()
      loadBookings()
      loadDiscounts()
      loadTransactions()
    })

    return {
      memberInfo,
      formData,
      errors,
      loading,
      bookings,
      discounts,
      transactions,
      showModal,
      modalTitle,
      modalMessage,
      isFormValid,
      handleSubmit,
      validateHolderName,
      validatePhone,
      getCardTypeClass,
      getBookingStatusClass,
      isDiscountValid,
      getTransactionTypeClass,
      getAmountClass,
      getAmountPrefix,
      closeModal,
      formatDateTime,
      formatDate,
      formatAmount
    }
  }
}
</script>
<style scoped>
.member-view {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.member-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.member-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-light);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.member-avatar {
  font-size: 4rem;
}

.card-number {
  opacity: 0.8;
  margin: var(--spacing-xs) 0;
}

.card-type-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  background-color: rgba(255, 255, 255, 0.2);
}

.member-form {
  padding: var(--spacing-lg);
}

.member-functions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.function-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.function-card h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.booking-item,
.discount-item,
.transaction-item {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.booking-status,
.discount-status span {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.status-booked { background-color: var(--primary-color); color: var(--text-light); }
.status-completed { background-color: var(--success-color); color: var(--text-light); }
.status-cancelled { background-color: var(--danger-color); color: var(--text-light); }

.transaction-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.type-deposit { background-color: var(--success-color); color: var(--text-light); }
.type-payment { background-color: var(--danger-color); color: var(--text-light); }
.type-refund { background-color: var(--warning-color); color: var(--text-dark); }

.amount-positive { color: var(--success-color); }
.amount-negative { color: var(--danger-color); }

.empty-state {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.discount-info {
  margin-bottom: var(--spacing-sm);
}

.expiry {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .member-header {
    flex-direction: column;
    text-align: center;
  }

  .member-functions {
    grid-template-columns: 1fr;
  }

  .transaction-info {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }
}
</style>