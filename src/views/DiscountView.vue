<template>
  <div class="discount-view">
    <!-- 優惠分類標籤 -->
    <div class="category-tabs">
      <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
      >
        <i :class="category.icon"></i>
        {{ category.name }}
      </button>
    </div>

    <!-- 優惠列表 -->
    <div class="discounts-container">
      <!-- 載入中提示 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>載入優惠中...</p>
      </div>

      <!-- 優惠卡片列表 -->
      <div v-else class="discounts-grid">
        <div
            v-for="discount in filteredDiscounts"
            :key="discount.DiscountID"
            class="discount-card"
            :class="{ 'expired': isExpired(discount) }"
        >
          <!-- 優惠標題區 -->
          <div class="discount-header">
            <h3>{{ discount.DiscountName }}</h3>
            <span
                class="discount-status"
                :class="getStatusClass(discount)"
            >
              {{ getStatusText(discount) }}
            </span>
          </div>

          <!-- 優惠內容 -->
          <div class="discount-content">
            <p class="description">{{ discount.Description }}</p>
            <div class="discount-info">
              <p class="validity">
                <i class="fas fa-calendar-alt"></i>
                有效期限：{{ formatDate(discount.ValidUntil) }}
              </p>
              <p class="usage-limit" v-if="discount.UsageLimit">
                <i class="fas fa-redo"></i>
                剩餘使用次數：{{ getRemainingUses(discount) }}
              </p>
            </div>
          </div>

          <!-- 優惠操作 -->
          <div class="discount-actions">
            <BaseButton
                type="primary"
                text="立即使用"
                :disabled="!canUseDiscount(discount)"
                @click="handleUseDiscount(discount)"
            />
            <BaseButton
                type="secondary"
                text="詳細說明"
                @click="showDiscountDetails(discount)"
            />
          </div>
        </div>
      </div>

      <!-- 無優惠提示 -->
      <div v-if="!loading && filteredDiscounts.length === 0" class="no-discounts">
        <i class="fas fa-ticket-alt fa-3x"></i>
        <p>目前沒有可用的優惠</p>
      </div>
    </div>

    <!-- 優惠詳情 Modal -->
    <BaseModal
        v-model="showModal"
        :title="selectedDiscount?.DiscountName || '優惠詳情'"
    >
      <template #body>
        <div class="discount-details">
          <div class="detail-item">
            <h4>優惠說明</h4>
            <p>{{ selectedDiscount?.Description }}</p>
          </div>
          <div class="detail-item">
            <h4>使用規則</h4>
            <ul>
              <li>有效期限：{{ formatDate(selectedDiscount?.ValidUntil) }}</li>
              <li v-if="selectedDiscount?.UsageLimit">
                使用次數限制：{{ selectedDiscount.UsageLimit }} 次
              </li>
              <li>不可與其他優惠同時使用</li>
            </ul>
          </div>
          <div class="detail-item">
            <h4>注意事項</h4>
            <p>本優惠由市民卡系統提供，最終解釋權歸系統所有</p>
          </div>
        </div>
      </template>
    </BaseModal>

    <!-- 使用優惠確認 Modal -->
    <BaseModal
        v-model="showConfirmModal"
        title="確認使用優惠"
    >
      <template #body>
        <p>確定要使用「{{ selectedDiscount?.DiscountName }}」優惠嗎？</p>
        <p class="warning">使用後無法取消</p>
      </template>
      <template #footer>
        <BaseButton
            type="secondary"
            text="取消"
            @click="showConfirmModal = false"
        />
        <BaseButton
            type="primary"
            text="確認使用"
            :loading="confirmLoading"
            @click="confirmUseDiscount"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useDiscountStore } from '@/stores/discount'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { formatDate } from '@/utils/formatters'

export default {
  name: 'DiscountView',

  components: {
    BaseButton,
    BaseModal
  },

  setup() {
    const discountStore = useDiscountStore()
    const authStore = useAuthStore()

    // 基本狀態
    const loading = ref(false)
    const showModal = ref(false)
    const showConfirmModal = ref(false)
    const confirmLoading = ref(false)
    const selectedCategory = ref('all')
    const selectedDiscount = ref(null)

    // 優惠分類
    const categories = [
      { id: 'all', name: '全部優惠', icon: 'fas fa-tags' },
      { id: 'movie', name: '電影優惠', icon: 'fas fa-film' },
      { id: 'transport', name: '交通優惠', icon: 'fas fa-bus' },
      { id: 'shopping', name: '購物優惠', icon: 'fas fa-shopping-bag' }
    ]

    // 過濾後的優惠列表
    const filteredDiscounts = computed(() => {
      let discounts = discountStore.discounts

      if (selectedCategory.value !== 'all') {
        discounts = discounts.filter(d => d.Category === selectedCategory.value)
      }

      return discounts
    })

    // 載入優惠資料
    const loadDiscounts = async () => {
      try {
        loading.value = true
        await discountStore.fetchDiscounts()
      } catch (error) {
        console.error('Error loading discounts:', error)
      } finally {
        loading.value = false
      }
    }

    // 檢查優惠是否過期
    const isExpired = (discount) => {
      return new Date(discount.ValidUntil) < new Date()
    }

    // 獲取剩餘使用次數
    const getRemainingUses = (discount) => {
      const used = discountStore.getUsageCount(discount.DiscountID)
      return discount.UsageLimit - used
    }

    // 檢查是否可以使用優惠
    const canUseDiscount = (discount) => {
      if (!authStore.isLoggedIn) return false
      if (isExpired(discount)) return false
      if (discount.UsageLimit && getRemainingUses(discount) <= 0) return false
      return true
    }

    // 獲取優惠狀態樣式
    const getStatusClass = (discount) => {
      if (isExpired(discount)) return 'status-expired'
      if (!canUseDiscount(discount)) return 'status-unavailable'
      return 'status-available'
    }

    // 獲取優惠狀態文字
    const getStatusText = (discount) => {
      if (isExpired(discount)) return '已過期'
      if (!canUseDiscount(discount)) return '不可用'
      return '可使用'
    }

    // 顯示優惠詳情
    const showDiscountDetails = (discount) => {
      selectedDiscount.value = discount
      showModal.value = true
    }

    // 處理使用優惠
    const handleUseDiscount = (discount) => {
      if (!canUseDiscount(discount)) return
      selectedDiscount.value = discount
      showConfirmModal.value = true
    }

    // 確認使用優惠
    const confirmUseDiscount = async () => {
      try {
        confirmLoading.value = true
        await discountStore.useDiscount(selectedDiscount.value.DiscountID)
        showConfirmModal.value = false
        // 重新載入優惠資料
        await loadDiscounts()
      } catch (error) {
        console.error('Error using discount:', error)
      } finally {
        confirmLoading.value = false
      }
    }

    onMounted(() => {
      loadDiscounts()
    })

    return {
      loading,
      showModal,
      showConfirmModal,
      confirmLoading,
      selectedCategory,
      selectedDiscount,
      categories,
      filteredDiscounts,
      isExpired,
      getRemainingUses,
      canUseDiscount,
      getStatusClass,
      getStatusText,
      showDiscountDetails,
      handleUseDiscount,
      confirmUseDiscount,
      formatDate
    }
  }
}
</script>

<style scoped>
.discount-view {
  padding: var(--spacing-lg);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}

.category-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.category-tab.active {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.category-tab i {
  margin-right: var(--spacing-xs);
}

.discounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.discount-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal);
}

.discount-card:hover:not(.expired) {
  transform: translateY(-5px);
}

.discount-card.expired {
  opacity: 0.6;
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.discount-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.status-available {
  background-color: var(--success-color);
  color: var(--text-light);
}

.status-unavailable {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.status-expired {
  background-color: var(--danger-color);
  color: var(--text-light);
}

.discount-content {
  margin-bottom: var(--spacing-md);
}

.description {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.discount-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.discount-info i {
  width: 16px;
  margin-right: var(--spacing-xs);
}

.discount-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-container,
.no-discounts {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.discount-details {
  padding: var(--spacing-md);
}

.detail-item {
  margin-bottom: var(--spacing-md);
}

.detail-item h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.detail-item ul {
  list-style: none;
  padding-left: var(--spacing-md);
}

.detail-item li {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.warning {
  color: var(--danger-color);
  margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
  .category-tabs {
    padding-bottom: var(--spacing-xs);
  }

  .discounts-grid {
    grid-template-columns: 1fr;
  }

  .discount-actions {
    flex-direction: column;
  }
}
</style>