<template>
  <div class="booking-view">
    <!-- 訂票進度指示器 -->
    <div class="booking-progress">
      <div
          v-for="(step, index) in bookingSteps"
          :key="step.id"
          class="progress-step"
          :class="{
          'active': currentStep === index,
          'completed': currentStep > index
        }"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <!-- 電影資訊 -->
    <div class="movie-info" v-if="movie">
      <div class="movie-poster">
        <img :src="movie.PosterUrl" :alt="movie.MovieName">
      </div>
      <div class="movie-details">
        <h2>{{ movie.MovieName }}</h2>
        <p class="duration">
          <i class="fas fa-clock"></i> {{ formatDuration(movie.Duration) }}
        </p>
        <p class="category">
          <i class="fas fa-film"></i> {{ movie.CategoryName }}
        </p>
        <p class="showing-time">
          <i class="fas fa-calendar-alt"></i>
          {{ formatDateTime(selectedShowing?.ShowTime) }}
        </p>
        <p class="venue">
          <i class="fas fa-map-marker-alt"></i>
          {{ selectedShowing?.VenueName }}
        </p>
      </div>
    </div>

    <!-- 步驟內容 -->
    <div class="booking-content">
      <!-- 選擇場次 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>選擇場次</h3>
        <div class="showings-grid">
          <div
              v-for="showing in availableShowings"
              :key="showing.ShowingID"
              class="showing-card"
              :class="{
              'selected': selectedShowing?.ShowingID === showing.ShowingID,
              'full': showing.AvailableSeats === 0
            }"
              @click="selectShowing(showing)"
          >
            <div class="showing-time">
              {{ formatTime(showing.ShowTime) }}
            </div>
            <div class="showing-venue">
              {{ showing.VenueName }}
            </div>
            <div class="available-seats">
              剩餘座位: {{ showing.AvailableSeats }}
            </div>
          </div>
        </div>
      </div>

      <!-- 選擇座位 -->
      <div v-else-if="currentStep === 1" class="step-content">
        <h3>選擇座位</h3>
        <SeatSelector
            :showing-id="selectedShowing?.ShowingID"
            :occupied-seats="occupiedSeats"
            @seat-selected="handleSeatSelection"
        />
      </div>

      <!-- 確認訂單 -->
      <div v-else-if="currentStep === 2" class="step-content">
        <h3>確認訂單</h3>
        <BookingForm
            :movie="movie"
            :showing="selectedShowing"
            :selected-seats="selectedSeats"
            @confirm="handleBookingConfirm"
        />
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="booking-actions">
      <BaseButton
          v-if="currentStep > 0"
          type="secondary"
          text="上一步"
          @click="previousStep"
      />
      <BaseButton
          v-if="currentStep < bookingSteps.length - 1"
          type="primary"
          text="下一步"
          :disabled="!canProceed"
          @click="nextStep"
      />
    </div>

    <!-- 提示訊息 -->
    <BaseModal
        v-model="showModal"
        :title="modalTitle"
        @close="handleModalClose"
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
import { useRoute, useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import SeatSelector from '@/components/booking/SeatSelector.vue'
import BookingForm from '@/components/booking/BookingForm.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { formatDateTime, formatTime, formatDuration } from '@/utils/formatters'

export default {
  name: 'BookingView',

  components: {
    SeatSelector,
    BookingForm,
    BaseButton,
    BaseModal
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const movieStore = useMovieStore()
    const bookingStore = useBookingStore()
    const authStore = useAuthStore()

    // 基本數據
    const movie = ref(null)
    const availableShowings = ref([])
    const selectedShowing = ref(null)
    const occupiedSeats = ref([])
    const selectedSeats = ref([])
    const currentStep = ref(0)
    const showModal = ref(false)
    const modalTitle = ref('')
    const modalMessage = ref('')

    // 訂票步驟
    const bookingSteps = [
      { id: 1, label: '選擇場次' },
      { id: 2, label: '選擇座位' },
      { id: 3, label: '確認訂單' }
    ]

    // 是否可以進行下一步
    const canProceed = computed(() => {
      switch (currentStep.value) {
        case 0:
          return selectedShowing.value !== null
        case 1:
          return selectedSeats.value.length > 0
        case 2:
          return true
        default:
          return false
      }
    })

    // 載入電影資訊
    const loadMovieData = async () => {
      try {
        const movieId = parseInt(route.params.movieId)
        movie.value = await movieStore.fetchMovieDetails(movieId)
        availableShowings.value = await movieStore.fetchShowings(movieId)
      } catch (error) {
        showError('載入失敗', '無法載入電影資訊，請稍後再試')
      }
    }

    // 選擇場次
    const selectShowing = (showing) => {
      if (showing.AvailableSeats === 0) return
      selectedShowing.value = showing
      loadOccupiedSeats(showing.ShowingID)
    }

    // 載入已佔用座位
    const loadOccupiedSeats = async (showingId) => {
      try {
        occupiedSeats.value = await bookingStore.fetchOccupiedSeats(showingId)
      } catch (error) {
        console.error('Error loading occupied seats:', error)
      }
    }

    // 處理座位選擇
    const handleSeatSelection = (seats) => {
      selectedSeats.value = seats
    }

    // 處理訂票確認
    const handleBookingConfirm = async (bookingData) => {
      try {
        await bookingStore.createBooking({
          ...bookingData,
          movieId: movie.value.MovieID,
          showingId: selectedShowing.value.ShowingID,
          seats: selectedSeats.value
        })
        showSuccess('訂票成功', '您的訂票已完成，感謝您的購買！')
      } catch (error) {
        showError('訂票失敗', error.message)
      }
    }

    // 步驟控制
    const nextStep = () => {
      if (currentStep.value < bookingSteps.length - 1) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    // Modal 控制
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

    const handleModalClose = () => {
      showModal.value = false
    }

    const handleModalConfirm = () => {
      showModal.value = false
      router.push('/bookings')
    }

    onMounted(() => {
      if (!authStore.isLoggedIn) {
        router.push('/login')
        return
      }
      loadMovieData()
    })

    return {
      movie,
      availableShowings,
      selectedShowing,
      occupiedSeats,
      selectedSeats,
      currentStep,
      bookingSteps,
      showModal,
      modalTitle,
      modalMessage,
      canProceed,
      formatDateTime,
      formatTime,
      formatDuration,
      selectShowing,
      handleSeatSelection,
      handleBookingConfirm,
      nextStep,
      previousStep,
      handleModalClose,
      handleModalConfirm
    }
  }
}
</script>

<style scoped>
.booking-view {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.booking-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.progress-step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(50% + 20px);
  right: calc(-50% + 20px);
  height: 2px;
  background-color: var(--border-color);
  z-index: 1;
}

.progress-step.completed:not(:last-child)::after {
  background-color: var(--primary-color);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  z-index: 2;
}

.progress-step.active .step-number,
.progress-step.completed .step-number {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.step-label {
  margin-left: var(--spacing-sm);
  color: var(--text-secondary);
}

.progress-step.active .step-label {
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
}

.movie-info {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.movie-poster {
  width: 200px;
  flex-shrink: 0;
}

.movie-poster img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.movie-details {
  flex: 1;
}

.movie-details h2 {
  margin-bottom: var(--spacing-md);
}

.movie-details p {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.movie-details i {
  width: 20px;
  margin-right: var(--spacing-sm);
}

.showings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.showing-card {
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.showing-card:hover:not(.full) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.showing-card.selected {
  border: 2px solid var(--primary-color);
}

.showing-card.full {
  opacity: 0.5;
  cursor: not-allowed;
}

.showing-time {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.showing-venue {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.available-seats {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.booking-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .movie-info {
    flex-direction: column;
  }

  .movie-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .progress-step:not(:last-child)::after {
    display: none;
  }

  .step-label {
    display: none;
  }
}
</style>