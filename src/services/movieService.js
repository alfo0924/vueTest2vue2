// src/services/movieService.js
import api from './api/axios.config'
import { handleApiError } from '@/utils/errorHandler'

class MovieService {
    // 獲取電影列表
    async getMovies(params = {}) {
        try {
            const response = await api.get('/movies', { params })
            return {
                movies: response.data.movies.map(this.formatMovieData),
                total: response.data.total,
                pagination: response.data.pagination
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 搜尋電影
    async searchMovies(keyword, params = {}) {
        try {
            const response = await api.get('/movies/search', {
                params: { keyword, ...params }
            })
            return {
                movies: response.data.movies.map(this.formatMovieData),
                total: response.data.total
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取電影詳情
    async getMovieById(id) {
        try {
            const response = await api.get(`/movies/${id}`)
            return this.formatMovieData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取電影類別
    async getCategories() {
        try {
            const response = await api.get('/movies/categories')
            return response.data.map(category => ({
                id: category.CategoryID,
                name: category.CategoryName,
                description: category.Description,
                movieCount: category.MovieCount
            }))
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取電影場次
    async getShowings(movieId, params = {}) {
        try {
            const response = await api.get(`/movies/${movieId}/showings`, { params })
            return {
                showings: response.data.showings.map(this.formatShowingData),
                total: response.data.total,
                pagination: response.data.pagination
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取場次詳情
    async getShowingById(showingId) {
        try {
            const response = await api.get(`/showings/${showingId}`)
            return this.formatShowingData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取場地列表
    async getVenues(params = {}) {
        try {
            const response = await api.get('/venues', { params })
            return {
                venues: response.data.venues.map(this.formatVenueData),
                total: response.data.total
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取場地詳情
    async getVenueById(id) {
        try {
            const response = await api.get(`/venues/${id}`)
            return this.formatVenueData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 創建訂票
    async createBooking(bookingData) {
        try {
            // 檢查座位是否可用
            await this.checkSeatsAvailability(bookingData.showingId, bookingData.seats)

            const response = await api.post('/bookings', bookingData)
            return this.formatBookingData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 檢查座位可用性
    async checkSeatsAvailability(showingId, seats) {
        try {
            const response = await api.post(`/showings/${showingId}/check-seats`, { seats })
            return response.data.available
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 暫存座位
    async holdSeats(showingId, seats) {
        try {
            const response = await api.post(`/showings/${showingId}/hold-seats`, { seats })
            return response.data.success
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 釋放座位
    async releaseSeats(showingId, seats) {
        try {
            const response = await api.post(`/showings/${showingId}/release-seats`, { seats })
            return response.data.success
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取訂票列表
    async getBookings(params = {}) {
        try {
            const response = await api.get('/bookings', { params })
            return {
                bookings: response.data.bookings.map(this.formatBookingData),
                total: response.data.total,
                pagination: response.data.pagination
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取訂票詳情
    async getBookingById(id) {
        try {
            const response = await api.get(`/bookings/${id}`)
            return this.formatBookingData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 取消訂票
    async cancelBooking(id) {
        try {
            const response = await api.put(`/bookings/${id}/cancel`)
            return this.formatBookingData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取已佔用座位
    async getOccupiedSeats(showingId) {
        try {
            const response = await api.get(`/showings/${showingId}/seats/occupied`)
            return response.data.seats
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 新增評價
    async createReview(reviewData) {
        try {
            const response = await api.post('/reviews', reviewData)
            return this.formatReviewData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 更新評價
    async updateReview(id, reviewData) {
        try {
            const response = await api.put(`/reviews/${id}`, reviewData)
            return this.formatReviewData(response.data)
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 獲取電影評價
    async getMovieReviews(movieId, params = {}) {
        try {
            const response = await api.get(`/movies/${movieId}/reviews`, { params })
            return {
                reviews: response.data.reviews.map(this.formatReviewData),
                total: response.data.total,
                pagination: response.data.pagination
            }
        } catch (error) {
            throw handleApiError(error)
        }
    }

    // 刪除評價
    async deleteReview(id) {
        try {
            await api.delete(`/reviews/${id}`)
            return true
        } catch (error) {
            throw handleApiError(error)
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
            categoryName: movie.CategoryName,
            posterUrl: movie.PosterUrl || '/images/default-movie.jpg',
            trailerUrl: movie.TrailerUrl,
            director: movie.Director,
            cast: movie.Cast,
            releaseDate: movie.ReleaseDate,
            endDate: movie.EndDate,
            language: movie.Language,
            subtitles: movie.Subtitles,
            rating: movie.Rating || 0,
            reviewCount: movie.ReviewCount || 0,
            status: movie.Status,
            showings: Array.isArray(movie.Showings)
                ? movie.Showings.map(this.formatShowingData)
                : [],
            createdAt: movie.CreatedAt,
            updatedAt: movie.UpdatedAt
        }
    }

    // 格式化場次數據
    formatShowingData(showing) {
        return {
            id: showing.ShowingID,
            movieId: showing.MovieID,
            movieName: showing.MovieName,
            venueId: showing.VenueID,
            venueName: showing.VenueName,
            showTime: showing.ShowTime,
            endTime: showing.EndTime,
            availableSeats: showing.AvailableSeats,
            totalSeats: showing.TotalSeats,
            price: showing.Price,
            status: showing.Status,
            seatingPlan: showing.SeatingPlan,
            createdAt: showing.CreatedAt,
            updatedAt: showing.UpdatedAt
        }
    }

    // 格式化場地數據
    formatVenueData(venue) {
        return {
            id: venue.VenueID,
            name: venue.VenueName,
            capacity: venue.Capacity,
            address: venue.Address,
            seatCount: venue.SeatCount,
            facilities: venue.Facilities,
            seatingPlan: venue.SeatingPlan,
            status: venue.Status,
            createdAt: venue.CreatedAt,
            updatedAt: venue.UpdatedAt
        }
    }

    // 格式化訂票數據
    formatBookingData(booking) {
        return {
            id: booking.BookingID,
            memberId: booking.MemberID,
            memberName: booking.MemberName,
            movieId: booking.MovieID,
            movieName: booking.MovieName,
            showingId: booking.ShowingID,
            showTime: booking.ShowTime,
            venueId: booking.VenueID,
            venueName: booking.VenueName,
            seats: booking.Seats,
            seatNumbers: booking.SeatNumbers,
            amount: booking.Amount,
            discountAmount: booking.DiscountAmount,
            finalAmount: booking.FinalAmount,
            paymentMethod: booking.PaymentMethod,
            paymentStatus: booking.PaymentStatus,
            status: booking.Status,
            bookingTime: booking.BookingTime,
            createdAt: booking.CreatedAt,
            updatedAt: booking.UpdatedAt
        }
    }

    // 格式化評價數據
    formatReviewData(review) {
        return {
            id: review.ReviewID,
            memberId: review.MemberID,
            memberName: review.MemberName,
            movieId: review.MovieID,
            movieName: review.MovieName,
            rating: review.Rating,
            comment: review.Comment,
            likes: review.Likes,
            isLiked: review.IsLiked,
            reviewTime: review.ReviewTime,
            createdAt: review.CreatedAt,
            updatedAt: review.UpdatedAt
        }
    }
}

export default new MovieService()