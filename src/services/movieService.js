import api from './api'

class MovieService {
    // 獲取所有電影
    async getMovies(params) {
        try {
            const response = await api.movieAPI.getMovies(params)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取電影詳情
    async getMovieById(id) {
        try {
            const response = await api.movieAPI.getMovieById(id)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取電影類別
    async getCategories() {
        try {
            const response = await api.movieAPI.getCategories()
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取電影場次
    async getShowings(movieId) {
        try {
            const response = await api.movieAPI.getShowings(movieId)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取場次詳情
    async getShowingById(showingId) {
        try {
            const response = await api.movieAPI.getShowingById(showingId)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取場地列表
    async getVenues() {
        try {
            const response = await api.venueAPI.getVenues()
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取場地詳情
    async getVenueById(id) {
        try {
            const response = await api.venueAPI.getVenueById(id)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 創建訂票
    async createBooking(bookingData) {
        try {
            const response = await api.bookingAPI.createBooking(bookingData)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取訂票列表
    async getBookings() {
        try {
            const response = await api.bookingAPI.getBookings()
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取訂票詳情
    async getBookingById(id) {
        try {
            const response = await api.bookingAPI.getBookingById(id)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 取消訂票
    async cancelBooking(id) {
        try {
            const response = await api.bookingAPI.cancelBooking(id)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取已佔用座位
    async getOccupiedSeats(showingId) {
        try {
            const response = await api.bookingAPI.getOccupiedSeats(showingId)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 新增評價
    async createReview(reviewData) {
        try {
            const response = await api.reviewAPI.createReview(reviewData)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取電影評價
    async getMovieReviews(movieId, params) {
        try {
            const response = await api.reviewAPI.getMovieReviews(movieId, params)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 刪除評價
    async deleteReview(id) {
        try {
            const response = await api.reviewAPI.deleteReview(id)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 格式化電影數據
    formatMovieData(movie) {
        return {
            id: movie.MovieID,
            name: movie.MovieName,
            duration: movie.Duration,
            description: movie.Description,
            categoryId: movie.CategoryID,
            posterUrl: movie.PosterUrl || '/images/default-movie.jpg',
            showings: movie.Showings || []
        }
    }

    // 格式化場次數據
    formatShowingData(showing) {
        return {
            id: showing.ShowingID,
            movieId: showing.MovieID,
            venueId: showing.VenueID,
            showTime: showing.ShowTime,
            availableSeats: showing.AvailableSeats
        }
    }

    // 錯誤處理
    handleError(error) {
        console.error('MovieService Error:', error)

        if (error.response) {
            // 伺服器回應的錯誤
            switch (error.response.status) {
                case 400:
                    return new Error('請求參數錯誤')
                case 404:
                    return new Error('找不到指定的電影或場次')
                case 409:
                    return new Error('座位已被預訂')
                default:
                    return new Error('服務暫時無法使用，請稍後再試')
            }
        }

        if (error.request) {
            // 請求發送失敗
            return new Error('網路連接錯誤，請檢查網路狀態')
        }

        // 其他錯誤
        return new Error('發生未知錯誤')
    }
}

export default new MovieService()