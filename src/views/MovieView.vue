<template>
  <div class="movie-view">
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
          <option
              v-for="category in categories"
              :key="category.CategoryID"
              :value="category.CategoryID"
          >
            {{ category.CategoryName }}
          </option>
        </select>
      </div>
    </div>

    <!-- 電影列表 -->
    <div v-if="!loading" class="movie-grid">
      <div
          v-for="movie in filteredMovies"
          :key="movie.MovieID"
          class="movie-card"
      >
        <div class="movie-poster">
          <img
              :src="movie.PosterUrl || '/images/default-movie.jpg'"
              :alt="movie.MovieName"
              @error="handleImageError"
          >
          <div class="movie-overlay">
            <h3>{{ movie.MovieName }}</h3>
            <p class="duration">
              <i class="fas fa-clock"></i> {{ formatDuration(movie.Duration) }}
            </p>
            <p class="category">
              <i class="fas fa-film"></i> {{ getCategoryName(movie.CategoryID) }}
            </p>
            <BaseButton
                type="primary"
                text="立即訂票"
                @click="handleBooking(movie)"
            />
            <BaseButton
                type="secondary"
                text="詳細資訊"
                @click="showMovieDetails(movie)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中提示 -->
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 無結果提示 -->
    <div v-if="!loading && filteredMovies.length === 0" class="no-results">
      <i class="fas fa-film fa-3x"></i>
      <p>沒有找到符合條件的電影</p>
    </div>

    <!-- 電影詳情 Modal -->
    <BaseModal
        v-if="selectedMovie"
        v-model="showModal"
        :title="selectedMovie.MovieName"
    >
      <template #body>
        <div class="movie-details">
          <img
              :src="selectedMovie.PosterUrl"
              :alt="selectedMovie.MovieName"
              class="detail-poster"
          >
          <div class="detail-info">
            <p class="description">{{ selectedMovie.Description }}</p>
            <div class="showings-list">
              <h4>放映場次</h4>
              <div class="showing-times">
                <button
                    v-for="showing in getShowings(selectedMovie.MovieID)"
                    :key="showing.ShowingID"
                    class="showing-time"
                    :class="{ 'full': showing.AvailableSeats === 0 }"
                    :disabled="showing.AvailableSeats === 0"
                    @click="selectShowing(showing)"
                >
                  {{ formatDateTime(showing.ShowTime) }}
                  <span class="seats-info">
                    剩餘座位: {{ showing.AvailableSeats }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { formatDateTime, formatDuration } from '@/utils/formatters'

export default {
  name: 'MovieView',

  components: {
    BaseInput,
    BaseButton,
    BaseModal
  },

  setup() {
    const router = useRouter()
    const movieStore = useMovieStore()
    const authStore = useAuthStore()

    const loading = ref(false)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const showModal = ref(false)
    const selectedMovie = ref(null)

    // 計算屬性
    const filteredMovies = computed(() => {
      let movies = movieStore.movies

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        movies = movies.filter(movie =>
            movie.MovieName.toLowerCase().includes(query) ||
            movie.Description.toLowerCase().includes(query)
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

    const handleImageError = (e) => {
      e.target.src = '/images/default-movie.jpg'
    }

    const handleBooking = (movie) => {
      if (!authStore.isLoggedIn) {
        router.push({
          path: '/login',
          query: { redirect: `/movies/${movie.MovieID}` }
        })
        return
      }
      selectedMovie.value = movie
      showModal.value = true
    }

    const showMovieDetails = (movie) => {
      selectedMovie.value = movie
      showModal.value = true
    }

    const getShowings = (movieId) => {
      return movieStore.showings.filter(showing =>
          showing.MovieID === movieId
      )
    }

    const selectShowing = (showing) => {
      router.push({
        name: 'booking',
        params: {
          movieId: selectedMovie.value.MovieID,
          showingId: showing.ShowingID
        }
      })
    }

    const getCategoryName = (categoryId) => {
      const category = movieStore.categories.find(c => c.CategoryID === categoryId)
      return category ? category.CategoryName : '未分類'
    }

    onMounted(() => {
      loadMovies()
    })

    return {
      loading,
      searchQuery,
      selectedCategory,
      showModal,
      selectedMovie,
      filteredMovies,
      movieStore,
      handleSearch,
      handleFilter,
      handleImageError,
      handleBooking,
      showMovieDetails,
      getShowings,
      selectShowing,
      getCategoryName,
      formatDateTime,
      formatDuration
    }
  }
}
</script>

<style scoped>
.movie-view {
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  color: var(--text-light);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-overlay h3 {
  margin-bottom: var(--spacing-sm);
}

.duration, .category {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.loading-container {
  text-align: center;
  padding: var(--spacing-xl);
}

.no-results {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.movie-details {
  display: flex;
  gap: var(--spacing-lg);
}

.detail-poster {
  width: 200px;
  border-radius: var(--border-radius-md);
}

.detail-info {
  flex: 1;
}

.description {
  margin-bottom: var(--spacing-md);
}

.showings-list {
  margin-top: var(--spacing-md);
}

.showing-times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.showing-time {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.showing-time:not(.full):hover {
  background: var(--primary-color);
  color: var(--text-light);
}

.showing-time.full {
  opacity: 0.5;
  cursor: not-allowed;
}

.seats-info {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .filter-options {
    width: 100%;
  }

  .movie-details {
    flex-direction: column;
  }

  .detail-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>