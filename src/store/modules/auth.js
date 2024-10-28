import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // 用戶資訊
        user: null,
        // Token
        token: localStorage.getItem('token') || null,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null,
        // 驗證狀態
        isAuthenticated: false
    }),

    getters: {
        // 取得用戶資訊
        currentUser: (state) => state.user,

        // 檢查是否已登入
        isLoggedIn: (state) => state.isAuthenticated,

        // 取得用戶角色
        userRole: (state) => state.user?.role || 'guest',

        // 取得錯誤訊息
        getError: (state) => state.error
    },

    actions: {
        // 設置用戶資訊
        setUser(user) {
            this.user = user
            this.isAuthenticated = true
        },

        // 設置 Token
        setToken(token) {
            this.token = token
            localStorage.setItem('token', token)
        },

        // 清除認證資訊
        clearAuth() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },

        // 註冊
        async register(userData) {
            try {
                this.loading = true
                this.error = null

                const response = await authService.register(userData)

                this.setToken(response.token)
                this.setUser(response.user)

                return response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 登入
        async login(credentials) {
            try {
                this.loading = true
                this.error = null

                const response = await authService.login(credentials)

                this.setToken(response.token)
                this.setUser(response.user)

                return response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 登出
        async logout() {
            try {
                this.loading = true
                this.error = null

                // 如果需要呼叫後端登出 API
                // await authService.logout()

                this.clearAuth()
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取用戶資料
        async fetchUserProfile() {
            try {
                this.loading = true
                this.error = null

                const user = await authService.getCurrentUser()
                this.setUser(user)

                return user
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 更新用戶資料
        async updateProfile(userData) {
            try {
                this.loading = true
                this.error = null

                const updatedUser = await authService.updateUserProfile(userData)
                this.setUser(updatedUser)

                return updatedUser
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 修改密碼
        async changePassword(passwordData) {
            try {
                this.loading = true
                this.error = null

                await authService.changePassword(passwordData)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 重設密碼請求
        async requestPasswordReset(email) {
            try {
                this.loading = true
                this.error = null

                await authService.requestPasswordReset(email)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 重設密碼
        async resetPassword(resetData) {
            try {
                this.loading = true
                this.error = null

                await authService.resetPassword(resetData)
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 初始化認證狀態
        async initAuth() {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    await this.fetchUserProfile()
                } catch (error) {
                    this.clearAuth()
                }
            }
        }
    }
})