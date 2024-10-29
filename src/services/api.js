// src/services/api.js

import request from './api/axios.config'

// 會員相關 API
export const memberAPI = {
    // 註冊
    register: (data) => request.post('/members/register', data),

    // 登入
    login: (data) => request.post('/members/login', data),

    // 登出
    logout: () => request.post('/members/logout'),

    // 獲取會員資料
    getMemberInfo: () => request.get('/members/info'),

    // 更新會員資料
    updateMemberInfo: (data) => request.put('/members/info', data),

    // 更改密碼
    changePassword: (data) => request.put('/members/password', data),

    // 重設密碼
    resetPassword: (email) => request.post('/members/reset-password', { email }),

    // 驗證 Email
    verifyEmail: (token) => request.post(`/members/verify-email/${token}`),

    // 獲取會員卡資訊
    getCardInfo: () => request.get('/members/card')
}

// 電影相關 API
export const movieAPI = {
    // 獲取電影列表
    getMovies: (params) => request.get('/movies', { params }),

    // 獲取電影詳情
    getMovieById: (id) => request.get(`/movies/${id}`),

    // 獲取電影類別
    getCategories: () => request.get('/movies/categories'),

    // 獲取場次列表
    getShowings: (movieId, params) => request.get(`/movies/${movieId}/showings`, { params }),

    // 獲取場次詳情
    getShowingById: (showingId) => request.get(`/showings/${showingId}`),

    // 搜尋電影
    searchMovies: (keyword) => request.get('/movies/search', { params: { keyword } }),

    // 獲取推薦電影
    getRecommendations: () => request.get('/movies/recommendations')
}

// 訂票相關 API
export const bookingAPI = {
    // 創建訂票
    createBooking: (data) => request.post('/bookings', data),

    // 獲取訂票列表
    getBookings: (params) => request.get('/bookings', { params }),

    // 獲取訂票詳情
    getBookingById: (id) => request.get(`/bookings/${id}`),

    // 取消訂票
    cancelBooking: (id) => request.put(`/bookings/${id}/cancel`),

    // 獲取已佔用座位
    getOccupiedSeats: (showingId) => request.get(`/showings/${showingId}/seats`),

    // 暫存座位
    holdSeats: (showingId, seats) => request.post(`/showings/${showingId}/hold-seats`, { seats }),

    // 釋放座位
    releaseSeats: (showingId, seats) => request.post(`/showings/${showingId}/release-seats`, { seats })
}

// 電子錢包相關 API
export const walletAPI = {
    // 獲取錢包資訊
    getWalletInfo: () => request.get('/wallet'),

    // 儲值
    topUp: (data) => request.post('/wallet/top-up', data),

    // 支付
    pay: (data) => request.post('/wallet/pay', data),

    // 退款
    refund: (data) => request.post('/wallet/refund', data),

    // 獲取交易記錄
    getTransactions: (params) => request.get('/wallet/transactions', { params }),

    // 檢查餘額
    checkBalance: (amount) => request.get('/wallet/check-balance', { params: { amount } }),

    // 獲取儲值方式
    getTopUpMethods: () => request.get('/wallet/top-up-methods')
}

// 優惠相關 API
export const discountAPI = {
    // 獲取優惠列表
    getDiscounts: (params) => request.get('/discounts', { params }),

    // 獲取優惠詳情
    getDiscountById: (id) => request.get(`/discounts/${id}`),

    // 使用優惠
    useDiscount: (id, data) => request.post(`/discounts/${id}/use`, data),

    // 獲取已使用的優惠
    getUsedDiscounts: (params) => request.get('/discounts/used', { params }),

    // 檢查優惠可用性
    checkDiscountAvailability: (id) => request.get(`/discounts/${id}/availability`),

    // 獲取會員專屬優惠
    getMemberDiscounts: () => request.get('/discounts/member')
}

// 場地相關 API
export const venueAPI = {
    // 獲取場地列表
    getVenues: (params) => request.get('/venues', { params }),

    // 獲取場地詳情
    getVenueById: (id) => request.get(`/venues/${id}`),

    // 獲取場地座位圖
    getVenueSeatingPlan: (id) => request.get(`/venues/${id}/seating-plan`)
}

// 系統相關 API
export const systemAPI = {
    // 獲取系統公告
    getAnnouncements: (params) => request.get('/announcements', { params }),

    // 獲取系統設定
    getSettings: () => request.get('/settings'),

    // 獲取系統狀態
    getSystemStatus: () => request.get('/system/status'),

    // 獲取版本資訊
    getVersion: () => request.get('/system/version')
}

// 通知相關 API
export const notificationAPI = {
    // 獲取通知列表
    getNotifications: (params) => request.get('/notifications', { params }),

    // 標記通知為已讀
    markAsRead: (id) => request.put(`/notifications/${id}/read`),

    // 標記所有通知為已讀
    markAllAsRead: () => request.put('/notifications/read-all'),

    // 刪除通知
    deleteNotification: (id) => request.delete(`/notifications/${id}`),

    // 清空通知
    clearNotifications: () => request.delete('/notifications/clear'),

    // 獲取未讀通知數量
    getUnreadCount: () => request.get('/notifications/unread-count')
}

// 評價相關 API
export const reviewAPI = {
    // 新增評價
    createReview: (data) => request.post('/reviews', data),

    // 獲取電影評價
    getMovieReviews: (movieId, params) => request.get(`/movies/${movieId}/reviews`, { params }),

    // 更新評價
    updateReview: (id, data) => request.put(`/reviews/${id}`, data),

    // 刪除評價
    deleteReview: (id) => request.delete(`/reviews/${id}`),

    // 點讚評價
    likeReview: (id) => request.post(`/reviews/${id}/like`),

    // 取消點讚
    unlikeReview: (id) => request.delete(`/reviews/${id}/like`)
}

// 身份驗證相關 API
export const verificationAPI = {
    // 驗證身份
    verify: (type, data) => request.post(`/verification/${type}`, data),

    // 獲取驗證狀態
    getVerificationStatus: (type) => request.get(`/verification/${type}/status`),

    // 重新發送驗證碼
    resendVerificationCode: (type) => request.post(`/verification/${type}/resend`)
}

export default {
    memberAPI,
    movieAPI,
    bookingAPI,
    walletAPI,
    discountAPI,
    venueAPI,
    systemAPI,
    notificationAPI,
    reviewAPI,
    verificationAPI
}