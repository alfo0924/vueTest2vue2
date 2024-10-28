<template>
  <div class="home">
    <!-- 輪播橫幅 -->
    <section class="hero-section">
      <div class="carousel">
        <div
            v-for="(slide, index) in carouselSlides"
            :key="index"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
        >
          <img :src="slide.image" :alt="slide.title">
          <div class="slide-content">
            <h2>{{ slide.title }}</h2>
            <p>{{ slide.description }}</p>
            <router-link
                :to="slide.link"
                class="btn btn-primary"
            >
              {{ slide.buttonText }}
            </router-link>
          </div>
        </div>
        <!-- 輪播指示器 -->
        <div class="carousel-indicators">
          <button
              v-for="(_, index) in carouselSlides"
              :key="index"
              class="indicator"
              :class="{ active: currentSlide === index }"
              @click="setSlide(index)"
          ></button>
        </div>
      </div>
    </section>

    <!-- 功能區塊 -->
    <section class="features-section">
      <h2 class="section-title">市民卡服務</h2>
      <div class="features-grid">
        <div
            v-for="feature in features"
            :key="feature.id"
            class="feature-card"
            @click="navigateToFeature(feature.route)"
        >
          <i :class="feature.icon"></i>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- 最新電影 -->
    <section class="movies-section" v-if="latestMovies.length">
      <h2 class="section-title">最新上映</h2>
      <div class="movies-grid">
        <div
            v-for="movie in latestMovies"
            :key="movie.MovieID"
            class="movie-card"
            @click="navigateToMovie(movie.MovieID)"
        >
          <img :src="movie.PosterUrl" :alt="movie.MovieName">
          <div class="movie-info">
            <h3>{{ movie.MovieName }}</h3>
            <p>{{ formatDuration(movie.Duration) }}</p>
          </div>
        </div>
      </div>
      <router-link to="/movies" class="btn btn-secondary view-all">
        查看全部電影
      </router-link>
    </section>

    <!-- 優惠資訊 -->
    <section class="discounts-section" v-if="latestDiscounts.length">
      <h2 class="section-title">優惠資訊</h2>
      <div class="discounts-grid">
        <div
            v-for="discount in latestDiscounts"
            :key="discount.DiscountID"
            class="discount-card"
        >
          <div class="discount-content">
            <h3>{{ discount.DiscountName }}</h3>
            <p>{{ discount.Description }}</p>
            <p class="expiry">有效期限：{{ formatDate(discount.ValidUntil) }}</p>
          </div>
        </div>
      </div>
      <router-link to="/discounts" class="btn btn-secondary view-all">
        查看全部優惠
      </router-link>
    </section>

    <!-- 系統公告 -->
    <section class="announcements-section" v-if="announcements.length">
      <h2 class="section-title">系統公告</h2>
      <div class="announcements-list">
        <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement-item"
        >
          <span class="date">{{ formatDate(announcement.date) }}</span>
          <span class="content">{{ announcement.content }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useDiscountStore } from '@/stores/discount'
import { formatDate, formatDuration } from '@/utils/formatters'

export default {
  name: 'HomeView',

  setup() {
    const router = useRouter()
    const movieStore = useMovieStore()
    const discountStore = useDiscountStore()

    // 輪播數據
    const carouselSlides = ref([
      {
        image: '/images/carousel/movie.jpg',
        title: '線上訂票',
        description: '輕鬆訂票，享受精彩電影',
        link: '/movies',
        buttonText: '立即訂票'
      },
      {
        image: '/images/carousel/wallet.jpg',
        title: '電子錢包',
        description: '方便支付，輕鬆儲值',
        link: '/wallet',
        buttonText: '查看錢包'
      },
      {
        image: '/images/carousel/discount.jpg',
        title: '優惠資訊',
        description: '多重優惠，省錢省心',
        link: '/discounts',
        buttonText: '查看優惠'
      }
    ])

    // 功能區塊數據
    const features = ref([
      {
        id: 1,
        icon: 'fas fa-film',
        title: '電影訂票',
        description: '線上訂票，免排隊',
        route: '/movies'
      },
      {
        id: 2,
        icon: 'fas fa-wallet',
        title: '電子錢包',
        description: '安全支付，快速儲值',
        route: '/wallet'
      },
      {
        id: 3,
        icon: 'fas fa-tags',
        title: '優惠資訊',
        description: '多重優惠，省錢省心',
        route: '/discounts'
      },
      {
        id: 4,
        icon: 'fas fa-user',
        title: '會員中心',
        description: '管理個人資料與訂單',
        route: '/member'
      }
    ])

    const currentSlide = ref(0)
    const latestMovies = ref([])
    const latestDiscounts = ref([])
    const announcements = ref([])

    // 輪播控制
    const setSlide = (index) => {
      currentSlide.value = index
    }

    // 自動輪播
    const startAutoSlide = () => {
      setInterval(() => {
        currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
      }, 5000)
    }

    // 頁面導航
    const navigateToFeature = (route) => {
      router.push(route)
    }

    const navigateToMovie = (movieId) => {
      router.push(`/movies/${movieId}`)
    }

    // 獲取數據
    const fetchData = async () => {
      try {
        // 獲取最新電影
        latestMovies.value = await movieStore.fetchLatestMovies()

        // 獲取最新優惠
        latestDiscounts.value = await discountStore.fetchLatestDiscounts()

        // 獲取系統公告
        announcements.value = [
          {
            id: 1,
            date: new Date(),
            content: '系統維護通知：系統將於本週日凌晨2-4點進行例行維護。'
          }
          // 更多公告...
        ]
      } catch (error) {
        console.error('Error fetching home page data:', error)
      }
    }

    onMounted(() => {
      fetchData()
      startAutoSlide()
    })

    return {
      carouselSlides,
      currentSlide,
      features,
      latestMovies,
      latestDiscounts,
      announcements,
      setSlide,
      navigateToFeature,
      navigateToMovie,
      formatDate,
      formatDuration
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* 輪播區域 */
.hero-section {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.carousel {
  position: relative;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-content {
  position: absolute;
  bottom: 20%;
  left: 10%;
  color: var(--text-light);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.indicator.active {
  background-color: var(--primary-color);
}

/* 功能區塊 */
.features-section {
  padding: var(--spacing-xl) 0;
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.feature-card {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

/* 電影區塊 */
.movies-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-secondary);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.movie-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
}

.movie-info {
  padding: var(--spacing-sm);
}

/* 優惠區塊 */
.discounts-section {
  padding: var(--spacing-xl) 0;
}

.discounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.discount-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.expiry {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
}

/* 公告區塊 */
.announcements-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-secondary);
}

.announcements-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.announcement-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-sm);
}

.date {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.view-all {
  display: block;
  width: fit-content;
  margin: var(--spacing-md) auto 0;
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .slide-content {
    left: 5%;
    right: 5%;
    text-align: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .announcement-item {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
</style>