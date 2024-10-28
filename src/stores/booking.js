import bookingService from '@/services/bookingService'

const state = {
    bookings: [],
    currentBooking: null,
    selectedShowing: null,
    selectedSeats: [],
    loading: false,
    error: null
}

const mutations = {
    SET_BOOKINGS(state, bookings) {
        state.bookings = bookings
    },

    SET_CURRENT_BOOKING(state, booking) {
        state.currentBooking = booking
    },

    SET_SELECTED_SHOWING(state, showing) {
        state.selectedShowing = showing
    },

    SET_SELECTED_SEATS(state, seats) {
        state.selectedSeats = seats
    },

    SET_LOADING(state, status) {
        state.loading = status
    },

    SET_ERROR(state, error) {
        state.error = error
    },

    CLEAR_BOOKING_DATA(state) {
        state.currentBooking = null
        state.selectedShowing = null
        state.selectedSeats = []
        state.error = null
    }
}

const actions = {
    // 獲取用戶的所有訂票記錄
    async fetchBookings({ commit }) {
        try {
            commit('SET_LOADING', true)
            const bookings = await bookingService.getMemberBookings()
            commit('SET_BOOKINGS', bookings)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取特定訂票詳情
    async fetchBookingDetails({ commit }, bookingId) {
        try {
            commit('SET_LOADING', true)
            const booking = await bookingService.getBookingDetails(bookingId)
            commit('SET_CURRENT_BOOKING', booking)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 選擇場次
    async selectShowing({ commit }, showing) {
        try {
            commit('SET_LOADING', true)
            const showingDetails = await bookingService.getShowingDetails(showing.ShowingID)
            commit('SET_SELECTED_SHOWING', showingDetails)
            commit('SET_SELECTED_SEATS', [])
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 選擇座位
    async selectSeats({ commit, state }, seats) {
        try {
            commit('SET_LOADING', true)
            // 檢查座位是否可用
            const available = await bookingService.checkSeatsAvailability(
                state.selectedShowing.ShowingID,
                seats
            )
            if (available) {
                commit('SET_SELECTED_SEATS', seats)
            } else {
                throw new Error('所選座位已被預訂')
            }
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 創建訂票
    async createBooking({ commit, state }, bookingData) {
        try {
            commit('SET_LOADING', true)
            const booking = await bookingService.createBooking({
                showingId: state.selectedShowing.ShowingID,
                seats: state.selectedSeats,
                ...bookingData
            })
            commit('SET_CURRENT_BOOKING', booking)
            return booking
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
            await bookingService.cancelBooking(bookingId)
            // 重新獲取訂票列表
            await this.dispatch('fetchBookings')
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 計算訂票金額
    async calculateAmount({ state }, discountId = null) {
        try {
            const calculationData = {
                showingId: state.selectedShowing.ShowingID,
                seats: state.selectedSeats,
                discountId
            }
            return await bookingService.calculateBookingAmount(calculationData)
        } catch (error) {
            throw error
        }
    },

    // 清除訂票數據
    clearBookingData({ commit }) {
        commit('CLEAR_BOOKING_DATA')
    }
}

const getters = {
    // 獲取所有訂票
    allBookings: state => state.bookings,

    // 獲取當前訂票
    currentBooking: state => state.currentBooking,

    // 獲取選中的場次
    selectedShowing: state => state.selectedShowing,

    // 獲取選中的座位
    selectedSeats: state => state.selectedSeats,

    // 是否正在載入
    isLoading: state => state.loading,

    // 獲取錯誤信息
    error: state => state.error,

    // 檢查是否可以進行訂票
    canBook: state => {
        return state.selectedShowing &&
            state.selectedSeats.length > 0 &&
            !state.loading
    },

    // 獲取已完成的訂票
    completedBookings: state => {
        return state.bookings.filter(booking => booking.Status === '已完成')
    },

    // 獲取待觀看的訂票
    upcomingBookings: state => {
        return state.bookings.filter(booking => booking.Status === '已預訂')
    },

    // 獲取已取消的訂票
    cancelledBookings: state => {
        return state.bookings.filter(booking => booking.Status === '已取消')
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}