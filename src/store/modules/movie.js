import movieService from '@/services/movieService'

const state = {
    movies: [],
    currentMovie: null,
    showings: [],
    categories: [],
    loading: false,
    error: null,
    filters: {
        categoryId: null,
        keyword: ''
    }
}

const getters = {
    // 獲取所有電影
    getAllMovies: (state) => state.movies,

    // 獲取當前電影
    getCurrentMovie: (state) => state.currentMovie,

    // 獲取所有場次
    getAllShowings: (state) => state.showings,

    // 獲取所有類別
    getAllCategories: (state) => state.categories,

    // 獲取載入狀態
    isLoading: (state) => state.loading,

    // 獲取錯誤訊息
    getError: (state) => state.error,

    // 獲取篩選後的電影
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

        return filtered
    }
}

const mutations = {
    // 設置電影列表
    SET_MOVIES(state, movies) {
        state.movies = movies
    },

    // 設置當前電影
    SET_CURRENT_MOVIE(state, movie) {
        state.currentMovie = movie
    },

    // 設置場次列表
    SET_SHOWINGS(state, showings) {
        state.showings = showings
    },

    // 設置類別列表
    SET_CATEGORIES(state, categories) {
        state.categories = categories
    },

    // 設置載入狀態
    SET_LOADING(state, status) {
        state.loading = status
    },

    // 設置錯誤訊息
    SET_ERROR(state, error) {
        state.error = error
    },

    // 設置篩選條件
    SET_FILTERS(state, filters) {
        state.filters = { ...state.filters, ...filters }
    },

    // 清除篩選條件
    CLEAR_FILTERS(state) {
        state.filters = {
            categoryId: null,
            keyword: ''
        }
    }
}

const actions = {
    // 獲取電影列表
    async fetchMovies({ commit }) {
        try {
            commit('SET_LOADING', true)
            const movies = await movieService.getMovies()
            commit('SET_MOVIES', movies)
        } catch (error) {
            commit('SET_ERROR', error.message)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取電影詳情
    async fetchMovieById({ commit }, movieId) {
        try {
            commit('SET_LOADING', true)
            const movie = await movieService.getMovieById(movieId)
            commit('SET_CURRENT_MOVIE', movie)
        } catch (error) {
            commit('SET_ERROR', error.message)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取電影場次
    async fetchShowings({ commit }, movieId) {
        try {
            commit('SET_LOADING', true)
            const showings = await movieService.getShowings(movieId)
            commit('SET_SHOWINGS', showings)
        } catch (error) {
            commit('SET_ERROR', error.message)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取電影類別
    async fetchCategories({ commit }) {
        try {
            commit('SET_LOADING', true)
            const categories = await movieService.getCategories()
            commit('SET_CATEGORIES', categories)
        } catch (error) {
            commit('SET_ERROR', error.message)
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 設置篩選條件
    setFilters({ commit }, filters) {
        commit('SET_FILTERS', filters)
    },

    // 清除篩選條件
    clearFilters({ commit }) {
        commit('CLEAR_FILTERS')
    },

    // 創建訂票
    async createBooking({ commit }, bookingData) {
        try {
            commit('SET_LOADING', true)
            await movieService.createBooking(bookingData)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 取消訂票
    async cancelBooking({ commit }, bookingId) {
        try {
            commit('SET_LOADING', true)
            await movieService.cancelBooking(bookingId)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取已佔用座位
    async fetchOccupiedSeats({ commit }, showingId) {
        try {
            commit('SET_LOADING', true)
            const seats = await movieService.getOccupiedSeats(showingId)
            return seats
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}