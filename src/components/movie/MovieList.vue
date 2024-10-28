<template>
  <div class="movie-list-container">
    <!-- 搜尋和篩選區 -->
    <div class="filter-section">
      <div class="search-box">
        <BaseInput
            v-model="searchQuery"
            placeholder="搜尋電影..."
            icon="fas fa-search"
            @input="handleSearch"
        />
      </div>

      <div class="filter-options">
        <select v-model="selectedCategory" class="form-select" @change="handleFilter">
          <option value="">所有類別</option>
          <option v-for="category in categories" :key="category.CategoryID" :value="category.CategoryID">
            {{ category.CategoryName }}
          </option>
        </select>
      </div>
    </div>

    <!-- 載入中提示 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 電影列表 -->
    <div v-else class="movie-grid">
      <div v-for="movie in filteredMovies" :key="movie.MovieID" class="movie-card">
        <div class="movie-poster">
          <img :src="movie.PosterUrl || '/default-movie.jpg'" :alt="movie.MovieName">
          <div class="movie-overlay">
            <BaseButton
                type="primary"
                text="立即訂票"
                @click="handleBooking(movie)"
            />
          </div>
        </div>

        <div class="movie-info">
          <h3 class="movie-title">{{ movie.MovieName }}</h3>
          <div class="movie-details">
            <p class="movie-duration">
              <i class="fas fa-clock"></i> {{ movie.Duration }} 分鐘
            </p>
            <p class="movie-category">
              <i class="fas fa-film"></i> {{ getCategoryName(movie.CategoryID) }}
            </p>
          </div>
          <p class="movie-description">{{ truncateDescription(movie.Description) }}</p>

          <div class="movie-showings">
            <h4>放映場次</h4>
            <div class="showing-times">
              <BaseButton
                  v-for="showing in getShowings(movie.MovieID)"
                  :key="showing.ShowingID"
                  :type="isShowingAvailable(showing) ? 'secondary' : 'light'"
                  :disabled="!isShowingAvailable(showing)"
                  :text="formatShowTime(showing.ShowTime)"
                  @click="selectShowing(showing)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無結果提示 -->
    <div v-if="!loading && filteredMovies.length === 0" class="no-results">
      <i class="fas fa-film fa-3x"></i>
      <p>沒有找到符合條件的電影</p>
    </div>

    <!-- 訂票確認對話框 -->
    <BaseModal
        v-if="showBookingModal"
        :title="selectedMovie ? selectedMovie.MovieName : ''"
        @close="closeBookingModal"
    >
      <template #body>
        <div class="booking-details">
          <p><strong>場次時間：</strong> {{ formatShowTime(selectedShowing?.ShowTime) }}</p>
          <p><strong>剩餘座位：</strong> {{ selectedShowing?.AvailableSeats }} 個</p>
          <p><strong>影廳：</strong> {{ getVenueName(selectedShowing?.VenueID) }}</p>
        </div>
      </template>
      <template #footer>
        <BaseButton
            type="secondary"
            text="取消"
            @click="closeBookingModal"
        />
        <BaseButton
            type="primary"
            text="確認訂票"
            @click="confirmBooking"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../common/BaseButton.vue'
import BaseInput from '../common/BaseInput.vue'
import BaseModal from '../common/BaseModal.vue'
import { useMovieStore } from '@/stores/movie'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MovieList',

  components: {
    BaseButton,
    BaseInput,
    BaseModal
  },

  setup() {
    const router = useRouter()
    const movieStore = useMovieStore()
    const authStore = useAuthStore()

    // 狀態
    const loading = ref(false)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const showBookingModal = ref(false)
    const selectedMovie = ref(null)
    const selectedShowing = ref(null)

    // 計算屬性
    const filteredMovies = computed(() => {
      let movies = movieStore.movies

      if (searchQuery.value) {
        movies = movies.filter(movie =>
            movie.MovieName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.Description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedCategory.value) {
        movies = movies.filter(movie =>
            movie.CategoryID === parseInt(selectedCategory.value)
        )
      }

      return movies
    })

    // 方法
    const loadMovies = async () => {
      try {
        loading.value = true
        await movieStore.fetchMovies()
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      // 搜尋邏輯可以在這裡擴展
    }

    const handleFilter = () => {
      // 篩選邏輯可以在這裡擴展
    }

    const handleBooking = (movie) => {
      if (!authStore.isLoggedIn) {
        router.push('/login')
        return
      }
      selectedMovie.value = movie
      showBookingModal.value = true
    }

    const closeBookingModal = () => {
      showBookingModal.value = false
      selectedMovie.value = null
      selectedShowing.value = null
    }

    const confirmBooking = () => {
      if (selectedShowing.value) {
        router.push({
          name: 'booking',
          params: {
            movieId: selectedMovie.value.MovieID,
            showingId: selectedShowing.value.ShowingID
          }
        })
      }
    }

    const truncateDescription = (description, length = 100) => {
      if (!description) return ''
      return description.length > length
          ? `${description.substring(0, length)}...`
          : description
    }

    const formatShowTime = (datetime) => {
      if (!datetime) return ''
      return new Date(datetime).toLocaleString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getShowings = (movieId) => {
      return movieStore.showings.filter(showing =>
          showing.MovieID === movieId
      )
    }

    const isShowingAvailable = (showing) => {
      return showing.AvailableSeats > 0
    }

    const getCategoryName = (categoryId) => {
      const category = movieStore.categories.find(c => c.CategoryID === categoryId)
      return category ? category.CategoryName : '未分類'
    }

    const getVenueName = (venueId) => {
      const venue = movieStore.venues.find(v => v.VenueID === venueId)
      return venue ? venue.VenueName : ''
    }

    // 生命週期鉤子
    onMounted(() => {
      loadMovies()
    })

    return {
      loading,
      searchQuery,
      selectedCategory,
      showBookingModal,
      selectedMovie,
      selectedShowing,
      filteredMovies,
      handleSearch,
      handleFilter,
      handleBooking,
      closeBookingModal,
      confirmBooking,
      truncateDescription,
      formatShowTime,
      getShowings,
      isShowingAvailable,
      getCategoryName,
      getVenueName
    }
  }
}
</script>

<style scoped>
.movie-list-container {
  padding: var(--spacing-lg);
}

.filter-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.search-box {
  flex: 1;
}

.filter-options {
  width: 200px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.movie-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal);
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-info {
  padding: var(--spacing-md);
}

.movie-title {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.movie-details {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.movie-description {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.movie-showings {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.showing-times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.loading-spinner,
.no-results {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.booking-details {
  padding: var(--spacing-md);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .filter-options {
    width: 100%;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>