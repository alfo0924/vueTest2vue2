import request from './api/axios.config'

// 會員相關 API
export const memberAPI = {
    // 註冊
    register: (data) => {
        return request.post('/members/register', data)
    },

    // 登入
    login: (data) => {
        return request.post('/members/login', data)
    },

    // 獲取會員資料
    getMemberInfo: () => {
        return request.get('/members/info')
    },

    // 更新會員資料
    updateMemberInfo: (data) => {
        return request.put('/members/info', data)
    }
}

// 電影相關 API
export const movieAPI = {
    // 獲取電影列表
    getMovies: (params) => {
        return request.get('/movies', { params })
    },

    // 獲取電影詳情
    getMovieById: (id) => {
        return request.get(`/movies/${id}`)
    },

    // 獲取電影類別
    getCategories: () => {
        return request.get('/movies/categories')
    },

    // 獲取場次列表
    getShowings: (movieId) => {
        return request.get(`/movies/${movieId}/showings`)
    },

    // 獲取場次詳情
    getShowingById: (showingId) => {
        return request.get(`/showings/${showingId}`)
    }
}

// 訂票相關 API
export const bookingAPI = {
    // 創建訂票
    createBooking: (data) => {
        return request.post('/bookings', data)
    },

    // 獲取訂票列表
    getBookings: () => {
        return request.get('/bookings')
    },

    // 獲取訂票詳情
    getBookingById: (id) => {
        return request.get(`/bookings/${id}`)
    },

    // 取消訂票
    cancelBooking: (id) => {
        return request.put(`/bookings/${id}/cancel`)
    },

    // 獲取已佔用座位
    getOccupiedSeats: (showingId) => {
        return request.get(`/showings/${showingId}/seats`)
    }
}

// 電子錢包相關 API
export const walletAPI = {
    // 獲取錢包資訊
    getWalletInfo: () => {
        return request.get('/wallet')
    },

    // 儲值
    topUp: (data) => {
        return request.post('/wallet/top-up', data)
    },

    // 支付
    pay: (data) => {
        return request.post('/wallet/pay', data)
    },

    // 獲取交易記錄
    getTransactions: (params) => {
        return request.get('/wallet/transactions', { params })
    }
}

// 優惠相關 API
export const discountAPI = {
    // 獲取優惠列表
    getDiscounts: (params) => {
        return request.get('/discounts', { params })
    },

    // 獲取優惠詳情
    getDiscountById: (id) => {
        return request.get(`/discounts/${id}`)
    },

    // 使用優惠
    useDiscount: (id) => {
        return request.post(`/discounts/${id}/use`)
    },

    // 獲取已使用的優惠
    getUsedDiscounts: () => {
        return request.get('/discounts/used')
    }
}

// 場地相關 API
export const venueAPI = {
    // 獲取場地列表
    getVenues: () => {
        return request.get('/venues')
    },

    // 獲取場地詳情
    getVenueById: (id) => {
        return request.get(`/venues/${id}`)
    }
}

// 系統相關 API
export const systemAPI = {
    // 獲取系統公告
    getAnnouncements: () => {
        return request.get('/announcements')
    },

    // 獲取系統設定
    getSettings: () => {
        return request.get('/settings')
    }
}

// 通知相關 API
export const notificationAPI = {
    // 獲取通知列表
    getNotifications: () => {
        return request.get('/notifications')
    },

    // 標記通知為已讀
    markAsRead: (id) => {
        return request.put(`/notifications/${id}/read`)
    },

    // 刪除通知
    deleteNotification: (id) => {
        return request.delete(`/notifications/${id}`)
    }
}

// 評價相關 API
export const reviewAPI = {
    // 新增評價
    createReview: (data) => {
        return request.post('/reviews', data)
    },

    // 獲取電影評價
    getMovieReviews: (movieId, params) => {
        return request.get(`/movies/${movieId}/reviews`, { params })
    },

    // 刪除評價
    deleteReview: (id) => {
        return request.delete(`/reviews/${id}`)
    }
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
    reviewAPI
}