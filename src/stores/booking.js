// src/stores/booking.js
import { defineStore } from 'pinia'
import bookingService from '@/services/bookingService'

export const useBookingStore = defineStore('booking', {
    state: () => ({
        bookings: [],
        currentBooking: null,
        selectedShowing: null,
        selectedSeats: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        }
    }),

    getters: {
        // 獲取所有訂票
        allBookings: (state) => state.bookings,

        // 獲取當前訂票
        currentBooking: (state) => state.currentBooking,

        // 獲取選中的場次
        selectedShowing: (state) => state.selectedShowing,

        // 獲取選中的座位
        selectedSeats: (state) => state.selectedSeats,

        // 是否正在載入
        isLoading: (state) => state.loading,

        // 獲取錯誤信息
        error: (state) => state.error,

        // 檢查是否可以進行訂票
        canBook: (state) => {
            return state.selectedShowing &&
                state.selectedSeats.length > 0 &&
                !state.loading
        },

        // 獲取已完成的訂票
        completedBookings: (state) => {
            return state.bookings.filter(booking => booking.Status === '已完成')
        },

        // 獲取待觀看的訂票
        upcomingBookings: (state) => {
            return state.bookings.filter(booking => booking.Status === '已預訂')
        },

        // 獲取已取消的訂票
        cancelledBookings: (state) => {
            return state.bookings.filter(booking => booking.Status === '已取消')
        },

        // 獲取分頁資訊
        getPagination: (state) => state.pagination
    },

    actions: {
        // 獲取用戶的所有訂票記錄
        async fetchBookings(params = {}) {
            try {
                this.loading = true
                const response = await bookingService.getMemberBookings(params)
                this.bookings = response.data
                this.pagination = response.pagination
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取特定訂票詳情
        async fetchBookingDetails(bookingId) {
            try {
                this.loading = true
                const booking = await bookingService.getBookingDetails(bookingId)
                this.currentBooking = booking
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 選擇場次
        async selectShowing(showing) {
            try {
                this.loading = true
                const showingDetails = await bookingService.getShowingDetails(showing.ShowingID)
                this.selectedShowing = showingDetails
                this.selectedSeats = []
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 選擇座位
        async selectSeats(seats) {
            try {
                this.loading = true
                if (!this.selectedShowing) {
                    throw new Error('請先選擇場次')
                }
                // 檢查座位是否可用
                const available = await bookingService.checkSeatsAvailability(
                    this.selectedShowing.ShowingID,
                    seats
                )
                if (available) {
                    this.selectedSeats = seats
                } else {
                    throw new Error('所選座位已被預訂')
                }
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 創建訂票
        async createBooking(bookingData) {
            try {
                this.loading = true
                if (!this.selectedShowing || !this.selectedSeats.length) {
                    throw new Error('請選擇場次和座位')
                }
                const booking = await bookingService.createBooking({
                    showingId: this.selectedShowing.ShowingID,
                    seats: this.selectedSeats,
                    ...bookingData
                })
                this.currentBooking = booking
                await this.fetchBookings() // 重新獲取訂票列表
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
                await bookingService.cancelBooking(bookingId)
                await this.fetchBookings() // 重新獲取訂票列表
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 計算訂票金額
        async calculateAmount(discountId = null) {
            try {
                if (!this.selectedShowing || !this.selectedSeats.length) {
                    throw new Error('請選擇場次和座位')
                }
                const calculationData = {
                    showingId: this.selectedShowing.ShowingID,
                    seats: this.selectedSeats,
                    discountId
                }
                return await bookingService.calculateBookingAmount(calculationData)
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        // 清除訂票數據
        clearBookingData() {
            this.currentBooking = null
            this.selectedShowing = null
            this.selectedSeats = []
            this.error = null
        },

        // 設置分頁
        setPagination(pagination) {
            this.pagination = { ...this.pagination, ...pagination }
        },

        // 清除錯誤
        clearError() {
            this.error = null
        }
    }
})