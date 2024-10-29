// src/services/bookingService.js
import request from './api/axios.config'

class BookingService {
    /**
     * 獲取電影場次列表
     * @param {number} movieId - 電影ID
     * @param {Object} params - 查詢參數 (日期、時間等)
     * @returns {Promise<Array>} 場次列表
     */
    async getShowings(movieId, params = {}) {
        try {
            const response = await request.get(`/movies/${movieId}/showings`, {
                params: {
                    ...params,
                    _sort: 'showTime',
                    _order: 'asc'
                }
            })
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取場次列表失敗')
        }
    }

    /**
     * 獲取場次詳情
     * @param {number} showingId - 場次ID
     * @returns {Promise<Object>} 場次詳情
     */
    async getShowingDetails(showingId) {
        try {
            const response = await request.get(`/showings/${showingId}`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取場次詳情失敗')
        }
    }

    /**
     * 獲取已佔用座位
     * @param {number} showingId - 場次ID
     * @returns {Promise<Array>} 已佔用座位列表
     */
    async getOccupiedSeats(showingId) {
        try {
            const response = await request.get(`/showings/${showingId}/seats`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取座位資訊失敗')
        }
    }

    /**
     * 檢查座位是否可用
     * @param {number} showingId - 場次ID
     * @param {Array<string>} seats - 座位編號列表
     * @returns {Promise<Object>} 座位可用性結果
     */
    async checkSeatsAvailability(showingId, seats) {
        try {
            const response = await request.post(`/showings/${showingId}/check-seats`, {
                seats,
                checkTime: new Date().toISOString()
            })
            return response.data
        } catch (error) {
            throw this.handleError(error, '檢查座位可用性失敗')
        }
    }

    /**
     * 創建訂票
     * @param {Object} bookingData - 訂票資料
     * @param {number} bookingData.showingId - 場次ID
     * @param {Array<string>} bookingData.seats - 座位編號列表
     * @param {number} bookingData.discountId - 優惠券ID (可選)
     * @returns {Promise<Object>} 訂票結果
     */
    async createBooking(bookingData) {
        try {
            // 先檢查座位可用性
            const availabilityCheck = await this.checkSeatsAvailability(
                bookingData.showingId,
                bookingData.seats
            )

            if (!availabilityCheck.available) {
                throw new Error('所選座位已被預訂')
            }

            const response = await request.post('/bookings', {
                ...bookingData,
                bookingTime: new Date().toISOString(),
                status: 'PENDING'
            })
            return response.data
        } catch (error) {
            throw this.handleError(error, '創建訂票失敗')
        }
    }

    /**
     * 獲取會員訂票列表
     * @param {Object} params - 查詢參數
     * @param {string} params.status - 訂票狀態
     * @param {Date} params.startDate - 開始日期
     * @param {Date} params.endDate - 結束日期
     * @returns {Promise<Array>} 訂票列表
     */
    async getMemberBookings(params = {}) {
        try {
            const response = await request.get('/bookings', {
                params: {
                    ...params,
                    _sort: 'bookingTime',
                    _order: 'desc'
                }
            })
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取訂票列表失敗')
        }
    }

    /**
     * 獲取訂票詳情
     * @param {number} bookingId - 訂票ID
     * @returns {Promise<Object>} 訂票詳情
     */
    async getBookingDetails(bookingId) {
        try {
            const response = await request.get(`/bookings/${bookingId}`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取訂票詳情失敗')
        }
    }

    /**
     * 取消訂票
     * @param {number} bookingId - 訂票ID
     * @returns {Promise<Object>} 取消結果
     */
    async cancelBooking(bookingId) {
        try {
            // 先獲取訂票詳情
            const booking = await this.getBookingDetails(bookingId)

            // 檢查是否可以取消
            const showTime = new Date(booking.showing.showTime)
            const now = new Date()
            const timeDiff = showTime.getTime() - now.getTime()
            const hoursDiff = timeDiff / (1000 * 60 * 60)

            if (hoursDiff < 2) {
                throw new Error('開演前2小時內無法取消訂票')
            }

            const response = await request.put(`/bookings/${bookingId}/cancel`, {
                cancelTime: new Date().toISOString()
            })
            return response.data
        } catch (error) {
            throw this.handleError(error, '取消訂票失敗')
        }
    }

    /**
     * 計算訂票金額
     * @param {Object} calculationData - 計算資料
     * @param {number} calculationData.showingId - 場次ID
     * @param {Array<string>} calculationData.seats - 座位編號列表
     * @param {number} calculationData.discountId - 優惠券ID (可選)
     * @returns {Promise<Object>} 金額計算結果
     */
    async calculateBookingAmount(calculationData) {
        try {
            const response = await request.post('/bookings/calculate', calculationData)
            return response.data
        } catch (error) {
            throw this.handleError(error, '計算訂票金額失敗')
        }
    }

    /**
     * 使用優惠券
     * @param {number} bookingId - 訂票ID
     * @param {number} discountId - 優惠券ID
     * @returns {Promise<Object>} 優惠券使用結果
     */
    async applyDiscount(bookingId, discountId) {
        try {
            const response = await request.post(`/bookings/${bookingId}/discount/${discountId}`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '使用優惠券失敗')
        }
    }

    /**
     * 獲取場地資訊
     * @param {number} venueId - 場地ID
     * @returns {Promise<Object>} 場地資訊
     */
    async getVenueInfo(venueId) {
        try {
            const response = await request.get(`/venues/${venueId}`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取場地資訊失敗')
        }
    }

    /**
     * 獲取場地座位圖
     * @param {number} venueId - 場地ID
     * @returns {Promise<Object>} 座位圖資訊
     */
    async getVenueSeatMap(venueId) {
        try {
            const response = await request.get(`/venues/${venueId}/seat-map`)
            return response.data
        } catch (error) {
            throw this.handleError(error, '獲取座位圖失敗')
        }
    }

    /**
     * 處理錯誤
     * @private
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 默認錯誤訊息
     * @returns {Error} 處理後的錯誤
     */
    handleError(error, defaultMessage) {
        console.error('Booking Service Error:', error)

        if (error.response) {
            // 伺服器回應的錯誤
            const message = error.response.data?.message || defaultMessage
            const errorCode = error.response.data?.errorCode
            const error = new Error(message)
            error.code = errorCode
            return error
        }

        if (error.request) {
            // 請求發送失敗
            return new Error('網路連接失敗，請檢查網路狀態')
        }

        // 其他錯誤
        return new Error(defaultMessage)
    }
}

export default new BookingService()