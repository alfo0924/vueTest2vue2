<template>
  <div class="wallet-view">
    <div class="wallet-container">
      <!-- 電子錢包卡片 -->
      <div class="wallet-section">
        <WalletBalance
            :wallet-data="walletData"
            @top-up="handleTopUp"
        />
      </div>

      <!-- 交易記錄區 -->
      <div class="transactions-section">
        <TransactionList
            :transactions="transactions"
            @load-more="loadMoreTransactions"
        />
      </div>
    </div>

    <!-- 儲值 Modal -->
    <BaseModal
        v-model="showTopUpModal"
        title="儲值金額"
        @close="closeTopUpModal"
    >
      <template #body>
        <div class="top-up-form">
          <BaseInput
              v-model="topUpAmount"
              type="number"
              label="儲值金額"
              placeholder="請輸入儲值金額"
              :error="topUpError"
              min="100"
              max="10000"
          />
          <div class="quick-amounts">
            <button
                v-for="amount in quickAmounts"
                :key="amount"
                class="quick-amount-btn"
                @click="selectQuickAmount(amount)"
            >
              NT$ {{ formatAmount(amount) }}
            </button>
          </div>
        </div>
      </template>
      <template #footer>
        <BaseButton
            type="secondary"
            text="取消"
            @click="closeTopUpModal"
        />
        <BaseButton
            type="primary"
            text="確認儲值"
            :loading="loading"
            :disabled="!isValidAmount || loading"
            @click="confirmTopUp"
        />
      </template>
    </BaseModal>

    <!-- 交易詳情 Modal -->
    <BaseModal
        v-model="showTransactionModal"
        title="交易詳情"
        @close="closeTransactionModal"
    >
      <template #body>
        <div class="transaction-details" v-if="selectedTransaction">
          <div class="detail-item">
            <span class="label">交易類型：</span>
            <span :class="getTransactionTypeClass(selectedTransaction.TransactionType)">
              {{ selectedTransaction.TransactionType }}
            </span>
          </div>
          <div class="detail-item">
            <span class="label">交易金額：</span>
            <span :class="getAmountClass(selectedTransaction.TransactionType)">
              {{ getAmountPrefix(selectedTransaction.TransactionType) }}
              NT$ {{ formatAmount(selectedTransaction.Amount) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="label">交易時間：</span>
            <span>{{ formatDateTime(selectedTransaction.TransactionTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">交易說明：</span>
            <span>{{ selectedTransaction.Description }}</span>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import WalletBalance from '@/components/wallet/WalletBalance.vue'
import TransactionList from '@/components/wallet/TransactionList.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { formatAmount, formatDateTime } from '@/utils/formatters'

export default {
  name: 'WalletView',

  components: {
    WalletBalance,
    TransactionList,
    BaseModal,
    BaseButton,
    BaseInput
  },

  setup() {
    const walletStore = useWalletStore()
    const loading = ref(false)
    const walletData = ref({})
    const transactions = ref([])
    const showTopUpModal = ref(false)
    const showTransactionModal = ref(false)
    const topUpAmount = ref('')
    const topUpError = ref('')
    const selectedTransaction = ref(null)
    const quickAmounts = [500, 1000, 2000, 5000]

    // 計算屬性
    const isValidAmount = computed(() => {
      const amount = Number(topUpAmount.value)
      return amount >= 100 && amount <= 10000
    })

    // 載入錢包資料
    const loadWalletData = async () => {
      try {
        loading.value = true
        walletData.value = await walletStore.fetchWalletInfo()
        await loadTransactions()
      } catch (error) {
        console.error('Error loading wallet data:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入交易記錄
    const loadTransactions = async () => {
      try {
        const data = await walletStore.fetchTransactions()
        transactions.value = data
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    // 載入更多交易記錄
    const loadMoreTransactions = async () => {
      // 實作分頁載入邏輯
    }

    // 處理儲值
    const handleTopUp = () => {
      showTopUpModal.value = true
    }

    const selectQuickAmount = (amount) => {
      topUpAmount.value = amount
    }

    const validateTopUpAmount = () => {
      const amount = Number(topUpAmount.value)
      if (!amount) {
        topUpError.value = '請輸入儲值金額'
        return false
      }
      if (amount < 100) {
        topUpError.value = '最低儲值金額為 NT$ 100'
        return false
      }
      if (amount > 10000) {
        topUpError.value = '最高儲值金額為 NT$ 10,000'
        return false
      }
      topUpError.value = ''
      return true
    }

    const confirmTopUp = async () => {
      if (!validateTopUpAmount()) return

      try {
        loading.value = true
        await walletStore.topUp(Number(topUpAmount.value))
        await loadWalletData()
        closeTopUpModal()
      } catch (error) {
        console.error('Top up failed:', error)
        topUpError.value = '儲值失敗，請稍後再試'
      } finally {
        loading.value = false
      }
    }

    const closeTopUpModal = () => {
      showTopUpModal.value = false
      topUpAmount.value = ''
      topUpError.value = ''
    }

    // 處理交易詳情
    const showTransactionDetails = (transaction) => {
      selectedTransaction.value = transaction
      showTransactionModal.value = true
    }

    const closeTransactionModal = () => {
      showTransactionModal.value = false
      selectedTransaction.value = null
    }

    // 工具函數
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

    onMounted(() => {
      loadWalletData()
    })

    return {
      loading,
      walletData,
      transactions,
      showTopUpModal,
      showTransactionModal,
      topUpAmount,
      topUpError,
      selectedTransaction,
      quickAmounts,
      isValidAmount,
      handleTopUp,
      selectQuickAmount,
      confirmTopUp,
      closeTopUpModal,
      showTransactionDetails,
      closeTransactionModal,
      getTransactionTypeClass,
      getAmountClass,
      getAmountPrefix,
      formatAmount,
      formatDateTime,
      loadMoreTransactions
    }
  }
}
</script>

<style scoped>
.wallet-view {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.wallet-container {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: 1fr;
}

@media (min-width: 992px) {
  .wallet-container {
    grid-template-columns: 350px 1fr;
  }
}

.wallet-section {
  position: sticky;
  top: var(--spacing-lg);
}

.top-up-form {
  padding: var(--spacing-md);
}

.quick-amounts {
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

.transaction-details {
  padding: var(--spacing-md);
}

.detail-item {
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: flex-start;
}

.detail-item .label {
  width: 100px;
  color: var(--text-secondary);
}

.type-deposit { color: var(--success-color); }
.type-payment { color: var(--danger-color); }
.type-refund { color: var(--warning-color); }

.amount-positive { color: var(--success-color); }
.amount-negative { color: var(--danger-color); }
</style>