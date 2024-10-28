<template>
  <div class="transaction-list-container">
    <!-- 交易記錄篩選 -->
    <div class="filter-section">
      <div class="date-range">
        <BaseInput
            type="date"
            v-model="startDate"
            label="開始日期"
        />
        <BaseInput
            type="date"
            v-model="endDate"
            label="結束日期"
        />
      </div>

      <div class="type-filter">
        <select v-model="selectedType" class="form-select">
          <option value="">所有類型</option>
          <option value="充值">儲值</option>
          <option value="支付">支付</option>
          <option value="退款">退款</option>
        </select>
      </div>

      <BaseButton
          type="primary"
          text="搜尋"
          icon="fas fa-search"
          @click="handleSearch"
      />
    </div>

    <!-- 交易統計 -->
    <div class="transaction-summary">
      <div class="summary-card income">
        <i class="fas fa-arrow-down"></i>
        <div class="summary-content">
          <span class="label">收入總額</span>
          <span class="amount">NT$ {{ formatAmount(totalIncome) }}</span>
        </div>
      </div>

      <div class="summary-card expense">
        <i class="fas fa-arrow-up"></i>
        <div class="summary-content">
          <span class="label">支出總額</span>
          <span class="amount">NT$ {{ formatAmount(totalExpense) }}</span>
        </div>
      </div>
    </div>

    <!-- 交易列表 -->
    <div class="transaction-table">
      <table v-if="transactions.length">
        <thead>
        <tr>
          <th>交易時間</th>
          <th>交易類型</th>
          <th>金額</th>
          <th>說明</th>
          <th>狀態</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="transaction in paginatedTransactions"
            :key="transaction.TransactionID"
            :class="getTransactionClass(transaction.TransactionType)"
        >
          <td>{{ formatDateTime(transaction.TransactionTime) }}</td>
          <td>
              <span class="transaction-type-badge" :class="getTypeBadgeClass(transaction.TransactionType)">
                {{ getTransactionTypeText(transaction.TransactionType) }}
              </span>
          </td>
          <td :class="getAmountClass(transaction.TransactionType)">
            {{ getAmountPrefix(transaction.TransactionType) }}
            {{ formatAmount(transaction.Amount) }}
          </td>
          <td>{{ transaction.Description }}</td>
          <td>
              <span class="status-badge" :class="getStatusClass(transaction.Status)">
                {{ transaction.Status }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 無資料提示 -->
      <div v-else class="no-data">
        <i class="fas fa-receipt fa-3x"></i>
        <p>{{ loading ? '載入中...' : '暫無交易記錄' }}</p>
      </div>
    </div>

    <!-- 分頁控制 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <span class="page-info">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import BaseInput from '../common/BaseInput.vue'
import { useWalletStore } from '@/stores/wallet'
import { formatDateTime, formatAmount } from '@/utils/formatters'

export default {
  name: 'TransactionList',

  components: {
    BaseButton,
    BaseInput
  },

  setup() {
    const walletStore = useWalletStore()
    const loading = ref(false)
    const transactions = ref([])
    const startDate = ref('')
    const endDate = ref('')
    const selectedType = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    // 計算屬性
    const filteredTransactions = computed(() => {
      let result = [...transactions.value]

      if (startDate.value) {
        result = result.filter(t =>
            new Date(t.TransactionTime) >= new Date(startDate.value)
        )
      }

      if (endDate.value) {
        result = result.filter(t =>
            new Date(t.TransactionTime) <= new Date(endDate.value)
        )
      }

      if (selectedType.value) {
        result = result.filter(t =>
            t.TransactionType === selectedType.value
        )
      }

      return result
    })

    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredTransactions.value.slice(start, end)
    })

    const totalPages = computed(() =>
        Math.ceil(filteredTransactions.value.length / itemsPerPage)
    )

    const totalIncome = computed(() =>
        filteredTransactions.value
            .filter(t => t.TransactionType === '充值' || t.TransactionType === '退款')
            .reduce((sum, t) => sum + t.Amount, 0)
    )

    const totalExpense = computed(() =>
        filteredTransactions.value
            .filter(t => t.TransactionType === '支付')
            .reduce((sum, t) => sum + t.Amount, 0)
    )

    // 方法
    const loadTransactions = async () => {
      try {
        loading.value = true
        transactions.value = await walletStore.fetchTransactions()
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const getTransactionClass = (type) => {
      return {
        'transaction-income': type === '充值' || type === '退款',
        'transaction-expense': type === '支付'
      }
    }

    const getTypeBadgeClass = (type) => {
      return {
        'type-deposit': type === '充值',
        'type-payment': type === '支付',
        'type-refund': type === '退款'
      }
    }

    const getStatusClass = (status) => {
      return {
        'status-success': status === '成功',
        'status-pending': status === '處理中',
        'status-failed': status === '失敗'
      }
    }

    const getTransactionTypeText = (type) => {
      const typeMap = {
        '充值': '儲值',
        '支付': '消費',
        '退款': '退款'
      }
      return typeMap[type] || type
    }

    const getAmountPrefix = (type) => {
      return type === '支付' ? '-' : '+'
    }

    const getAmountClass = (type) => {
      return {
        'amount-positive': type === '充值' || type === '退款',
        'amount-negative': type === '支付'
      }
    }

    // 監聽器
    watch([startDate, endDate, selectedType], () => {
      currentPage.value = 1
    })

    onMounted(() => {
      loadTransactions()
    })

    return {
      loading,
      transactions,
      startDate,
      endDate,
      selectedType,
      currentPage,
      paginatedTransactions,
      totalPages,
      totalIncome,
      totalExpense,
      handleSearch,
      getTransactionClass,
      getTypeBadgeClass,
      getStatusClass,
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
.transaction-list-container {
  padding: var(--spacing-lg);
}

.filter-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.date-range {
  display: flex;
  gap: var(--spacing-md);
}

.transaction-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.summary-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.summary-card i {
  font-size: var(--font-size-xl);
}

.summary-card.income {
  color: var(--success-color);
}

.summary-card.expense {
  color: var(--danger-color);
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-content .label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.summary-content .amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.transaction-table {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: var(--spacing-sm);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--bg-secondary);
  font-weight: var(--font-weight-bold);
}

.transaction-type-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.type-deposit {
  background-color: var(--success-color);
  color: var(--text-light);
}

.type-payment {
  background-color: var(--danger-color);
  color: var(--text-light);
}

.type-refund {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.amount-positive {
  color: var(--success-color);
}

.amount-negative {
  color: var(--danger-color);
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.status-success {
  background-color: var(--success-color);
  color: var(--text-light);
}

.status-pending {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.status-failed {
  background-color: var(--danger-color);
  color: var(--text-light);
}

.no-data {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.page-btn {
  padding: var(--spacing-sm);
  border: none;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .date-range {
    flex-direction: column;
  }

  .transaction-summary {
    grid-template-columns: 1fr;
  }

  .transaction-table {
    overflow-x: auto;
  }
}
</style>