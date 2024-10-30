// src/stores/auth.js
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
        isAuthenticated: false,
        // 市民卡資訊
        citizenCard: null,
        // 電子錢包資訊
        wallet: null
    }),

    getters: {
        // 取得用戶資訊
        currentUser: (state) => state.user,
        // 檢查是否已登入
        isLoggedIn: (state) => state.isAuthenticated,
        // 取得用戶角色
        userRole: (state) => state.user?.role || 'guest',
        // 取得錯誤訊息
        getError: (state) => state.error,
        // 取得市民卡資訊
        getCitizenCard: (state) => state.citizenCard,
        // 取得電子錢包資訊
        getWallet: (state) => state.wallet,
        // 檢查是否已驗證
        isVerified: (state) => state.user?.isVerified || false,
        // 檢查是否啟用
        isActive: (state) => state.user?.isActive || false
    },

    actions: {
        // 設置用戶資訊
        setUser(user) {
            this.user = {
                ...user,
                registerDate: new Date(user.registerDate),
                lastLoginTime: new Date(user.lastLoginTime)
            }
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
            this.citizenCard = null
            this.wallet = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },

        // 註冊
        async register(userData) {
            try {
                this.loading = true
                this.error = null

                // 驗證必填欄位
                if (!userData.email || !userData.password) {
                    throw new Error('電子郵件和密碼為必填欄位')
                }

                // 準備註冊資料
                const registerData = {
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone,
                    role: 'normal_user',
                    isVerified: false,
                    isActive: true,
                    registerDate: new Date().toISOString()
                }

                const response = await authService.register(registerData)
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
                // 更新最後登入時間
                await authService.updateLastLoginTime(response.user.id)
                // 獲取相關資訊
                await this.fetchUserRelatedInfo()
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
                await authService.logout()
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
                await this.fetchUserRelatedInfo()
                return user
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取用戶相關資訊
        async fetchUserRelatedInfo() {
            try {
                // 獲取市民卡資訊
                const citizenCard = await authService.getCitizenCard(this.user.id)
                this.citizenCard = citizenCard
                // 獲取電子錢包資訊
                const wallet = await authService.getWallet(this.user.id)
                this.wallet = wallet
            } catch (error) {
                console.error('獲取用戶相關資訊失敗:', error)
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

        // 驗證電子郵件
        async verifyEmail(token) {
            try {
                this.loading = true
                this.error = null
                await authService.verifyEmail(token)
                await this.fetchUserProfile()
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 重新發送驗證郵件
        async resendVerificationEmail() {
            try {
                this.loading = true
                this.error = null
                await authService.resendVerificationEmail(this.user.email)
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
                    this.token = token
                    await this.fetchUserProfile()
                } catch (error) {
                    this.clearAuth()
                }
            }
        }
    }
})