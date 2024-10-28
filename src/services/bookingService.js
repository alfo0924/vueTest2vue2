import request from './api/axios.config'

class BookingService {
    /**
     * 獲取電影場次列表
     * @param {number} movieId - 電影ID
     * @param {Object} params - 查詢參數
     * @returns {Promise}
     */
    async getShowings(movieId, params = {}) {
        try {
            return await request.get(`/movies/${movieId}/showings`, { params })
        } catch (error) {
            throw this.handleError(error, '獲取場次列表失敗')
        }
    }

    /**
     * 獲取場次詳情
     * @param {number} showingId - 場次ID
     * @returns {Promise}
     */
    async getShowingDetails(showingId) {
        try {
            return await request.get(`/showings/${showingId}`)
        } catch (error) {
            throw this.handleError(error, '獲取場次詳情失敗')
        }
    }

    /**
     * 獲取已佔用座位
     * @param {number} showingId - 場次ID
     * @returns {Promise}
     */
    async getOccupiedSeats(showingId) {
        try {
            return await request.get(`/showings/${showingId}/seats`)
        } catch (error) {
            throw this.handleError(error, '獲取座位資訊失敗')
        }
    }

    /**
     * 檢查座位是否可用
     * @param {number} showingId - 場次ID
     * @param {Array} seats - 座位列表
     * @returns {Promise}
     */
    async checkSeatsAvailability(showingId, seats) {
        try {
            return await request.post(`/showings/${showingId}/check-seats`, { seats })
        } catch (error) {
            throw this.handleError(error, '檢查座位可用性失敗')
        }
    }

    /**
     * 創建訂票
     * @param {Object} bookingData - 訂票資料
     * @returns {Promise}
     */
    async createBooking(bookingData) {
        try {
            return await request.post('/bookings', bookingData)
        } catch (error) {
            throw this.handleError(error, '創建訂票失敗')
        }
    }

    /**
     * 獲取會員訂票列表
     * @param {Object} params - 查詢參數
     * @returns {Promise}
     */
    async getMemberBookings(params = {}) {
        try {
            return await request.get('/bookings', { params })
        } catch (error) {
            throw this.handleError(error, '獲取訂票列表失敗')
        }
    }

    /**
     * 獲取訂票詳情
     * @param {number} bookingId - 訂票ID
     * @returns {Promise}
     */
    async getBookingDetails(bookingId) {
        try {
            return await request.get(`/bookings/${bookingId}`)
        } catch (error) {
            throw this.handleError(error, '獲取訂票詳情失敗')
        }
    }

    /**
     * 取消訂票
     * @param {number} bookingId - 訂票ID
     * @returns {Promise}
     */
    async cancelBooking(bookingId) {
        try {
            return await request.put(`/bookings/${bookingId}/cancel`)
        } catch (error) {
            throw this.handleError(error, '取消訂票失敗')
        }
    }

    /**
     * 計算訂票金額
     * @param {Object} calculationData - 計算所需資料
     * @returns {Promise}
     */
    async calculateBookingAmount(calculationData) {
        try {
            return await request.post('/bookings/calculate', calculationData)
        } catch (error) {
            throw this.handleError(error, '計算訂票金額失敗')
        }
    }

    /**
     * 使用優惠券
     * @param {number} bookingId - 訂票ID
     * @param {number} discountId - 優惠券ID
     * @returns {Promise}
     */
    async applyDiscount(bookingId, discountId) {
        try {
            return await request.post(`/bookings/${bookingId}/discount/${discountId}`)
        } catch (error) {
            throw this.handleError(error, '使用優惠券失敗')
        }
    }

    /**
     * 獲取場地資訊
     * @param {number} venueId - 場地ID
     * @returns {Promise}
     */
    async getVenueInfo(venueId) {
        try {
            return await request.get(`/venues/${venueId}`)
        } catch (error) {
            throw this.handleError(error, '獲取場地資訊失敗')
        }
    }

    /**
     * 處理錯誤
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 默認錯誤訊息
     * @returns {Error}
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            // 伺服器回應的錯誤
            const message = error.response.data?.message || defaultMessage
            return new Error(message)
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