<template>
  <div class="wallet-balance-container">
    <!-- 餘額卡片 -->
    <div class="balance-card" :class="{ 'is-loading': loading }">
      <div class="balance-header">
        <h2>電子錢包餘額</h2>
        <span class="card-number">卡號: {{ cardNumber }}</span>
      </div>

      <div class="balance-amount">
        <span class="currency">NT$</span>
        <span class="amount">{{ formatAmount(walletData.balance) }}</span>
      </div>

      <div class="balance-actions">
        <BaseButton
            type="primary"
            icon="fas fa-plus-circle"
            text="儲值"
            :disabled="loading"
            @click="showTopUpModal"
        />
        <BaseButton
            type="secondary"
            icon="fas fa-history"
            text="交易記錄"
            :disabled="loading"
            @click="showTransactionHistory"
        />
      </div>
    </div>

    <!-- 最近交易 -->
    <div class="recent-transactions">
      <h3>最近交易記錄</h3>
      <div class="transaction-list" v-if="recentTransactions.length">
        <div
            v-for="transaction in recentTransactions"
            :key="transaction.TransactionID"
            class="transaction-item"
            :class="getTransactionClass(transaction.TransactionType)"
        >
          <div class="transaction-info">
            <span class="transaction-type">
              {{ getTransactionTypeText(transaction.TransactionType) }}
            </span>
            <span class="transaction-time">
              {{ formatDateTime(transaction.TransactionTime) }}
            </span>
          </div>
          <span class="transaction-amount" :class="getAmountClass(transaction.TransactionType)">
            {{ getAmountPrefix(transaction.TransactionType) }}
            {{ formatAmount(transaction.Amount) }}
          </span>
        </div>
      </div>
      <div v-else class="no-transactions">
        暫無交易記錄
      </div>
    </div>

    <!-- 儲值對話框 -->
    <BaseModal
        v-model="showModal"
        title="儲值金額"
        :show-cancel-button="true"
        :show-confirm-button="true"
        confirm-text="確認儲值"
        @confirm="handleTopUp"
    >
      <div class="top-up-form">
        <BaseInput
            v-model="topUpAmount"
            type="number"
            label="儲值金額"
            placeholder="請輸入儲值金額"
            :min="100"
            :max="10000"
            required
        />
        <div class="quick-amount-buttons">
          <button
              v-for="amount in quickAmounts"
              :key="amount"
              class="quick-amount-btn"
              @click="topUpAmount = amount"
          >
            NT$ {{ amount }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import BaseModal from '../common/BaseModal.vue'
import BaseInput from '../common/BaseInput.vue'
import { useWalletStore } from '@/stores/wallet'
import { formatDateTime, formatAmount } from '@/utils/formatters'

export default {
  name: 'WalletBalance',

  components: {
    BaseButton,
    BaseModal,
    BaseInput
  },

  setup() {
    const walletStore = useWalletStore()
    const loading = ref(false)
    const showModal = ref(false)
    const topUpAmount = ref('')
    const walletData = ref({
      balance: 0,
      cardNumber: ''
    })
    const recentTransactions = ref([])
    const quickAmounts = [500, 1000, 2000, 5000]

    // 獲取錢包資訊
    const fetchWalletData = async () => {
      try {
        loading.value = true
        const data = await walletStore.fetchWalletInfo()
        walletData.value = data
        await fetchRecentTransactions()
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        loading.value = false
      }
    }

    // 獲取最近交易記錄
    const fetchRecentTransactions = async () => {
      try {
        const transactions = await walletStore.fetchRecentTransactions()
        recentTransactions.value = transactions
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    // 處理儲值
    const handleTopUp = async () => {
      if (!topUpAmount.value || topUpAmount.value < 100) {
        alert('請輸入有效的儲值金額（最少100元）')
        return
      }

      try {
        loading.value = true
        await walletStore.topUp(Number(topUpAmount.value))
        await fetchWalletData()
        showModal.value = false
        topUpAmount.value = ''
      } catch (error) {
        console.error('Top up failed:', error)
        alert('儲值失敗，請稍後再試')
      } finally {
        loading.value = false
      }
    }

    // 顯示儲值對話框
    const showTopUpModal = () => {
      showModal.value = true
    }

    // 顯示交易歷史
    const showTransactionHistory = () => {
      // 導航到交易歷史頁面
      router.push('/wallet/history')
    }

    // 交易類型樣式
    const getTransactionClass = (type) => {
      return {
        'transaction-deposit': type === '充值',
        'transaction-payment': type === '支付',
        'transaction-refund': type === '退款'
      }
    }

    // 交易類型文字
    const getTransactionTypeText = (type) => {
      const typeMap = {
        '充值': '儲值',
        '支付': '消費',
        '退款': '退款'
      }
      return typeMap[type] || type
    }

    // 金額正負號
    const getAmountPrefix = (type) => {
      return type === '支付' ? '-' : '+'
    }

    // 金額樣式
    const getAmountClass = (type) => {
      return {
        'amount-positive': type === '充值' || type === '退款',
        'amount-negative': type === '支付'
      }
    }

    onMounted(() => {
      fetchWalletData()
    })

    return {
      loading,
      showModal,
      topUpAmount,
      walletData,
      recentTransactions,
      quickAmounts,
      showTopUpModal,
      handleTopUp,
      showTransactionHistory,
      getTransactionClass,
      getTransactionTypeText,
      getAmountPrefix,
      getAmountClass,
      formatDateTime,
      formatAmount
    }
  }
}
</script>

<style scoped>
.wallet-balance-container {
  padding: var(--spacing-lg);
}

.balance-card {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-light);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
}

.balance-card.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-number {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.balance-amount {
  text-align: center;
  margin: var(--spacing-lg) 0;
}

.currency {
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-xs);
}

.amount {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
}

.balance-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.recent-transactions {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.transaction-list {
  margin-top: var(--spacing-md);
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.transaction-type {
  font-weight: var(--font-weight-medium);
}

.transaction-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.amount-positive {
  color: var(--success-color);
}

.amount-negative {
  color: var(--danger-color);
}

.no-transactions {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}

.top-up-form {
  padding: var(--spacing-md);
}

.quick-amount-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.quick-amount-btn {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-amount-btn:hover {
  background-color: var(--primary-color);
  color: var(--text-light);
}

@media (max-width: 768px) {
  .balance-actions {
    flex-direction: column;
  }

  .quick-amount-buttons {
    grid-template-columns: 1fr;
  }
}
</style>