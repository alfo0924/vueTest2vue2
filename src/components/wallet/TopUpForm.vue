<template>
  <div class="top-up-form">
    <h3 class="form-title">儲值金額</h3>

    <!-- 餘額顯示 -->
    <div class="current-balance">
      <span>目前餘額：</span>
      <span class="amount">NT$ {{ formatAmount(currentBalance) }}</span>
    </div>

    <!-- 儲值表單 -->
    <div class="form-content">
      <!-- 金額輸入 -->
      <div class="form-group">
        <BaseInput
            v-model.number="amount"
            type="number"
            label="儲值金額"
            :min="minAmount"
            :max="maxAmount"
            :error="error"
            @input="validateAmount"
        />
      </div>

      <!-- 快速選擇金額 -->
      <div class="quick-amounts">
        <button
            v-for="value in quickAmounts"
            :key="value"
            class="quick-amount-btn"
            :class="{ active: amount === value }"
            @click="selectAmount(value)"
        >
          NT$ {{ formatAmount(value) }}
        </button>
      </div>

      <!-- 付款方式選擇 -->
      <div class="payment-methods">
        <h4>選擇付款方式</h4>
        <div class="method-options">
          <label v-for="method in paymentMethods" :key="method.value">
            <input
                type="radio"
                v-model="selectedMethod"
                :value="method.value"
            >
            <span class="method-label">
              <i :class="method.icon"></i>
              {{ method.label }}
            </span>
          </label>
        </div>
      </div>

      <!-- 確認按鈕 -->
      <BaseButton
          type="primary"
          text="確認儲值"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="handleTopUp"
          class="submit-btn"
      />
    </div>

    <!-- 注意事項 -->
    <div class="notice">
      <h4>儲值說明</h4>
      <ul>
        <li>單次儲值金額需介於 NT$ {{ minAmount }} 至 NT$ {{ maxAmount }} 之間</li>
        <li>儲值完成後即可使用</li>
        <li>如有任何問題請聯繫客服</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatAmount } from '@/utils/formatters'

export default {
  name: 'TopUpForm',

  components: {
    BaseInput,
    BaseButton
  },

  setup() {
    const walletStore = useWalletStore()
    const amount = ref('')
    const error = ref('')
    const loading = ref(false)
    const selectedMethod = ref('creditCard')

    // 常數定義
    const minAmount = 100
    const maxAmount = 10000
    const quickAmounts = [500, 1000, 2000, 5000]
    const paymentMethods = [
      { value: 'creditCard', label: '信用卡', icon: 'fas fa-credit-card' },
      { value: 'transfer', label: '銀行轉帳', icon: 'fas fa-university' },
      { value: 'linePay', label: 'Line Pay', icon: 'fab fa-line' }
    ]

    // 計算屬性
    const currentBalance = computed(() => walletStore.currentBalance)
    const isValid = computed(() => {
      const value = Number(amount.value)
      return value >= minAmount &&
          value <= maxAmount &&
          !error.value &&
          selectedMethod.value
    })

    // 方法
    const validateAmount = () => {
      const value = Number(amount.value)
      if (isNaN(value) || value < minAmount) {
        error.value = `最低儲值金額為 NT$ ${minAmount}`
        return false
      }
      if (value > maxAmount) {
        error.value = `最高儲值金額為 NT$ ${maxAmount}`
        return false
      }
      error.value = ''
      return true
    }

    const selectAmount = (value) => {
      amount.value = value
      validateAmount()
    }

    const handleTopUp = async () => {
      if (!isValid.value) return

      try {
        loading.value = true
        await walletStore.topUp({
          amount: Number(amount.value),
          method: selectedMethod.value
        })
        // 成功後重置表單
        amount.value = ''
        selectedMethod.value = 'creditCard'
      } catch (error) {
        console.error('Top up failed:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      amount,
      error,
      loading,
      selectedMethod,
      currentBalance,
      minAmount,
      maxAmount,
      quickAmounts,
      paymentMethods,
      isValid,
      formatAmount,
      validateAmount,
      selectAmount,
      handleTopUp
    }
  }
}
</script>

<style scoped>
.top-up-form {
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.form-title {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.current-balance {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.form-content {
  margin-bottom: var(--spacing-lg);
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.quick-amount-btn {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-amount-btn:hover,
.quick-amount-btn.active {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}

.payment-methods {
  margin: var(--spacing-lg) 0;
}

.method-options {
  display: grid;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.method-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.submit-btn {
  width: 100%;
  margin-top: var(--spacing-lg);
}

.notice {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.notice h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.notice ul {
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .quick-amounts {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>