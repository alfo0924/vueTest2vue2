// src/stores/movie.js
import { defineStore } from 'pinia'
import movieService from '@/services/movieService'

export const useMovieStore = defineStore('movie', {
    state: () => ({
        movies: [],
        currentMovie: null,
        showings: [],
        categories: [],
        loading: false,
        error: null,
        filters: {
            categoryId: null,
            keyword: '',
            sortBy: 'name', // 'name', 'date', 'category'
            order: 'asc' // 'asc', 'desc'
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        }
    }),

    getters: {
        getAllMovies: (state) => state.movies,
        getCurrentMovie: (state) => state.currentMovie,
        getAllShowings: (state) => state.showings,
        getAllCategories: (state) => state.categories,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,

        getFilteredMovies: (state) => {
            let filtered = [...state.movies]

            // 依類別篩選
            if (state.filters.categoryId) {
                filtered = filtered.filter(movie =>
                    movie.CategoryID === state.filters.categoryId
                )
            }

            // 依關鍵字搜尋
            if (state.filters.keyword) {
                const keyword = state.filters.keyword.toLowerCase()
                filtered = filtered.filter(movie =>
                    movie.MovieName.toLowerCase().includes(keyword) ||
                    movie.Description.toLowerCase().includes(keyword)
                )
            }

            // 排序
            filtered.sort((a, b) => {
                const order = state.filters.order === 'asc' ? 1 : -1
                switch (state.filters.sortBy) {
                    case 'name':
                        return order * a.MovieName.localeCompare(b.MovieName)
                    case 'date':
                        return order * (new Date(a.ShowTime) - new Date(b.ShowTime))
                    case 'category':
                        return order * a.CategoryID - b.CategoryID
                    default:
                        return 0
                }
            })

            return filtered
        },

        // 獲取分頁資訊
        getPagination: (state) => state.pagination,

        // 獲取可用座位
        getAvailableSeats: (state) => (showingId) => {
            const showing = state.showings.find(s => s.ShowingID === showingId)
            return showing ? showing.AvailableSeats : 0
        }
    },

    actions: {
        // 獲取電影列表
        async fetchMovies(params = {}) {
            try {
                this.loading = true
                const response = await movieService.getMovies(params)
                this.movies = response.data
                this.pagination = response.pagination
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取電影詳情
        async fetchMovieById(movieId) {
            try {
                this.loading = true
                const movie = await movieService.getMovieById(movieId)
                this.currentMovie = movie
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取電影場次
        async fetchShowings(movieId) {
            try {
                this.loading = true
                const showings = await movieService.getShowings(movieId)
                this.showings = showings
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取電影類別
        async fetchCategories() {
            try {
                this.loading = true
                const categories = await movieService.getCategories()
                this.categories = categories
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 設置篩選條件
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters }
        },

        // 清除篩選條件
        clearFilters() {
            this.filters = {
                categoryId: null,
                keyword: '',
                sortBy: 'name',
                order: 'asc'
            }
        },

        // 設置分頁
        setPagination(pagination) {
            this.pagination = { ...this.pagination, ...pagination }
        },

        // 創建訂票
        async createBooking(bookingData) {
            try {
                this.loading = true
                const booking = await movieService.createBooking(bookingData)
                // 更新場次的可用座位
                const showing = this.showings.find(s => s.ShowingID === bookingData.showingId)
                if (showing) {
                    showing.AvailableSeats -= bookingData.seats.length
                }
                return booking
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 取消訂票
        async cancelBooking(bookingId) {
            try {
                this.loading = true
                await movieService.cancelBooking(bookingId)
                // 可以在這裡更新相關狀態
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取已佔用座位
        async fetchOccupiedSeats(showingId) {
            try {
                this.loading = true
                return await movieService.getOccupiedSeats(showingId)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 清除錯誤
        clearError() {
            this.error = null
        }
    }
})