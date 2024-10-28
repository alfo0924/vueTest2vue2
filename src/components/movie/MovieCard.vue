<template>
  <div class="movie-card" :class="{ 'movie-card--loading': loading }">
    <!-- 電影海報 -->
    <div class="movie-poster">
      <img
          v-if="movie.posterUrl"
          :src="movie.posterUrl"
          :alt="movie.movieName"
          @error="handleImageError"
      >
      <div v-else class="movie-poster-placeholder">
        <i class="fas fa-film"></i>
      </div>
    </div>

    <!-- 電影資訊 -->
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.movieName }}</h3>

      <div class="movie-meta">
        <span class="movie-duration">
          <i class="far fa-clock"></i>
          {{ formatDuration(movie.duration) }}
        </span>
        <span class="movie-category" v-if="movie.categoryName">
          <i class="fas fa-tag"></i>
          {{ movie.categoryName }}
        </span>
      </div>

      <p class="movie-description">{{ truncateDescription(movie.description) }}</p>

      <!-- 場次資訊 -->
      <div class="movie-showings" v-if="showings && showings.length">
        <h4>放映場次</h4>
        <div class="showing-list">
          <button
              v-for="showing in showings"
              :key="showing.showingId"
              class="showing-time"
              :class="{ 'showing-time--full': showing.availableSeats === 0 }"
              @click="handleShowingSelect(showing)"
              :disabled="showing.availableSeats === 0"
          >
            {{ formatShowTime(showing.showTime) }}
            <small>(剩餘座位: {{ showing.availableSeats }})</small>
          </button>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="movie-actions">
        <base-button
            type="primary"
            :disabled="!hasAvailableShowings"
            @click="handleBooking"
        >
          立即訂票
        </base-button>

        <base-button
            type="secondary"
            @click="handleShowDetails"
        >
          詳細資訊
        </base-button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import { formatDateTime, truncateText } from '@/utils/formatters'

export default defineComponent({
  name: 'MovieCard',

  components: {
    BaseButton
  },

  props: {
    movie: {
      type: Object,
      required: true,
      validator: (movie) => {
        return movie.movieId && movie.movieName
      }
    },
    showings: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    hasAvailableShowings() {
      return this.showings.some(showing => showing.availableSeats > 0)
    }
  },

  methods: {
    formatDuration(minutes) {
      if (!minutes) return '未知'
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}小時${remainingMinutes}分鐘`
    },

    formatShowTime(datetime) {
      return formatDateTime(datetime, 'HH:mm')
    },

    truncateDescription(text) {
      return truncateText(text, 150)
    },

    handleImageError(e) {
      e.target.src = '/images/movie-placeholder.jpg'
    },

    handleShowingSelect(showing) {
      this.$emit('showing-select', {
        movieId: this.movie.movieId,
        showingId: showing.showingId
      })
    },

    handleBooking() {
      this.$emit('booking', this.movie.movieId)
    },

    handleShowDetails() {
      this.$emit('show-details', this.movie.movieId)
    }
  }
})
</script>

<style scoped>
.movie-card {
  display: flex;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-normal);
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card--loading {
  opacity: 0.7;
  pointer-events: none;
}

.movie-poster {
  width: 200px;
  height: 300px;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.movie-poster img:hover {
  transform: scale(1.05);
}

.movie-poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 3rem;
}

.movie-info {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.movie-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.movie-duration,
.movie-category {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.movie-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.movie-showings {
  margin-bottom: var(--spacing-md);
}

.movie-showings h4 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.showing-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.showing-time {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.showing-time:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.showing-time--full {
  opacity: 0.5;
  cursor: not-allowed;
}

.showing-time small {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.movie-actions {
  margin-top: auto;
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .movie-card {
    flex-direction: column;
  }

  .movie-poster {
    width: 100%;
    height: 200px;
  }

  .showing-list {
    flex-direction: column;
  }
}
</style>