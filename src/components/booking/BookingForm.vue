<template>
  <div class="booking-form">
    <!-- 訂票資訊摘要 -->
    <div class="booking-summary card">
      <h3>訂票資訊</h3>
      <div class="summary-content">
        <div class="summary-item">
          <span class="label">電影名稱：</span>
          <span class="value">{{ movieDetails.MovieName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">放映時間：</span>
          <span class="value">{{ formatDateTime(showingDetails.ShowTime) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">影廳：</span>
          <span class="value">{{ venueDetails.VenueName }}</span>
        </div>
      </div>
    </div>

    <!-- 座位選擇區 -->
    <div class="seat-selection card">
      <h3>座位選擇</h3>
      <div class="screen">螢幕</div>
      <div class="seat-grid">
        <div
            v-for="seat in seats"
            :key="seat.id"
            class="seat"
            :class="{
            'seat--occupied': seat.isOccupied,
            'seat--selected': selectedSeats.includes(seat.id)
          }"
            @click="handleSeatSelect(seat)"
        >
          {{ seat.label }}
        </div>
      </div>
      <div class="seat-legend">
        <div class="legend-item">
          <div class="seat-sample available"></div>
          <span>可選座位</span>
        </div>
        <div class="legend-item">
          <div class="seat-sample occupied"></div>
          <span>已售座位</span>
        </div>
        <div class="legend-item">
          <div class="seat-sample selected"></div>
          <span>已選座位</span>
        </div>
      </div>
    </div>

    <!-- 付款資訊 -->
    <div class="payment-info card">
      <h3>付款資訊</h3>
      <div class="price-breakdown">
        <div class="price-item">
          <span>票價：</span>
          <span>NT$ {{ ticketPrice }} × {{ selectedSeats.length }}</span>
        </div>
        <div class="price-item" v-if="discount">
          <span>優惠折扣：</span>
          <span>-NT$ {{ calculateDiscount() }}</span>
        </div>
        <div class="price-item total">
          <span>總計：</span>
          <span>NT$ {{ calculateTotal() }}</span>
        </div>
      </div>

      <!-- 優惠券選擇 -->
      <div class="discount-selection">
        <h4>可用優惠</h4>
        <select v-model="selectedDiscount" class="form-select">
          <option value="">不使用優惠</option>
          <option
              v-for="discount in availableDiscounts"
              :key="discount.DiscountID"
              :value="discount.DiscountID"
          >
            {{ discount.DiscountName }}
          </option>
        </select>
      </div>

      <!-- 電子錢包餘額 -->
      <div class="wallet-balance">
        <span>電子錢包餘額：</span>
        <span :class="{ 'text-danger': isBalanceInsufficient }">
          NT$ {{ walletBalance }}
        </span>
      </div>
    </div>

    <!-- 確認按鈕 -->
    <div class="booking-actions">
      <BaseButton
          type="secondary"
          text="返回"
          @click="handleCancel"
      />
      <BaseButton
          type="primary"
          text="確認訂票"
          :disabled="!canConfirmBooking"
          @click="handleConfirm"
      />
    </div>

    <!-- 提示訊息 Modal -->
    <BaseModal
        v-model="showModal"
        :title="modalTitle"
    >
      <template #body>
        <p>{{ modalMessage }}</p>
      </template>
      <template #footer>
        <BaseButton
            type="primary"
            text="確定"
            @click="handleModalConfirm"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../common/BaseButton.vue'
import BaseModal from '../common/BaseModal.vue'
import { formatDateTime } from '@/utils/formatters'
import { useBookingStore } from '@/stores/booking'
import { useWalletStore } from '@/stores/wallet'

export default {
  name: 'BookingForm',

  components: {
    BaseButton,
    BaseModal
  },

  props: {
    movieId: {
      type: Number,
      required: true
    },
    showingId: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    const router = useRouter()
    const bookingStore = useBookingStore()
    const walletStore = useWalletStore()

    // 狀態
    const movieDetails = ref({})
    const showingDetails = ref({})
    const venueDetails = ref({})
    const seats = ref([])
    const selectedSeats = ref([])
    const availableDiscounts = ref([])
    const selectedDiscount = ref('')
    const walletBalance = ref(0)
    const showModal = ref(false)
    const modalTitle = ref('')
    const modalMessage = ref('')
    const ticketPrice = ref(300) // 假設票價固定

    // 計算屬性
    const isBalanceInsufficient = computed(() => {
      return walletBalance.value < calculateTotal.value
    })

    const canConfirmBooking = computed(() => {
      return selectedSeats.value.length > 0 && !isBalanceInsufficient.value
    })

    // 方法
    const loadBookingData = async () => {
      try {
        // 載入電影資訊
        movieDetails.value = await bookingStore.fetchMovieDetails(props.movieId)
        // 載入場次資訊
        showingDetails.value = await bookingStore.fetchShowingDetails(props.showingId)
        // 載入影廳資訊
        venueDetails.value = await bookingStore.fetchVenueDetails(showingDetails.value.VenueID)
        // 載入座位資訊
        seats.value = await bookingStore.fetchSeats(props.showingId)
        // 載入可用優惠
        availableDiscounts.value = await bookingStore.fetchAvailableDiscounts()
        // 載入錢包餘額
        walletBalance.value = await walletStore.fetchBalance()
      } catch (error) {
        showError('載入資料失敗', error.message)
      }
    }

    const handleSeatSelect = (seat) => {
      if (seat.isOccupied) return

      const seatIndex = selectedSeats.value.indexOf(seat.id)
      if (seatIndex === -1) {
        selectedSeats.value.push(seat.id)
      } else {
        selectedSeats.value.splice(seatIndex, 1)
      }
    }

    const calculateDiscount = () => {
      if (!selectedDiscount.value) return 0
      const discount = availableDiscounts.value.find(d => d.DiscountID === selectedDiscount.value)
      return discount ? (ticketPrice.value * selectedSeats.value.length * discount.DiscountRate) : 0
    }

    const calculateTotal = () => {
      const subtotal = ticketPrice.value * selectedSeats.value.length
      return subtotal - calculateDiscount()
    }

    const handleConfirm = async () => {
      try {
        const bookingData = {
          movieId: props.movieId,
          showingId: props.showingId,
          seats: selectedSeats.value,
          discountId: selectedDiscount.value,
          amount: calculateTotal()
        }

        await bookingStore.createBooking(bookingData)
        showSuccess('訂票成功', '您的訂票已完成，感謝您的購買！')
      } catch (error) {
        showError('訂票失敗', error.message)
      }
    }

    const handleCancel = () => {
      router.back()
    }

    const showSuccess = (title, message) => {
      modalTitle.value = title
      modalMessage.value = message
      showModal.value = true
    }

    const showError = (title, message) => {
      modalTitle.value = title
      modalMessage.value = message
      showModal.value = true
    }

    const handleModalConfirm = () => {
      showModal.value = false
      router.push('/movies')
    }

    // 生命週期鉤子
    onMounted(() => {
      loadBookingData()
    })

    return {
      movieDetails,
      showingDetails,
      venueDetails,
      seats,
      selectedSeats,
      availableDiscounts,
      selectedDiscount,
      walletBalance,
      showModal,
      modalTitle,
      modalMessage,
      ticketPrice,
      isBalanceInsufficient,
      canConfirmBooking,
      formatDateTime,
      handleSeatSelect,
      calculateDiscount,
      calculateTotal,
      handleConfirm,
      handleCancel,
      handleModalConfirm
    }
  }
}
</script>

<style scoped>
.booking-form {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.summary-content {
  display: grid;
  gap: var(--spacing-sm);
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.screen {
  background: var(--bg-secondary);
  text-align: center;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-radius: var(--border-radius-sm);
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.seat {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.seat--occupied {
  background-color: var(--danger-color);
  cursor: not-allowed;
}

.seat--selected {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.seat-sample {
  width: 20px;
  height: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.seat-sample.available {
  background-color: var(--bg-primary);
}

.seat-sample.occupied {
  background-color: var(--danger-color);
}

.seat-sample.selected {
  background-color: var(--primary-color);
}

.price-breakdown {
  display: grid;
  gap: var(--spacing-sm);
}

.price-item {
  display: flex;
  justify-content: space-between;
}

.price-item.total {
  font-weight: var(--font-weight-bold);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.text-danger {
  color: var(--danger-color);
}

@media (max-width: 768px) {
  .seat-grid {
    grid-template-columns: repeat(8, 1fr);
  }

  .booking-actions {
    flex-direction: column;
  }
}
</style>