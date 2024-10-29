// src/services/authService.js
import request from './api/axios.config'

class AuthService {
    // 註冊
    async register(userData) {
        try {
            const response = await request.post('/auth/register', {
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                holderName: userData.holderName,
                cardType: userData.cardType,
                role: 'user'
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 登入
    async login(credentials) {
        try {
            const response = await request.post('/auth/login', {
                email: credentials.email,
                password: credentials.password
            })

            if (response.token) {
                localStorage.setItem('token', response.token)
                localStorage.setItem('user', JSON.stringify(response.user))
                // 更新最後登入時間
                await this.updateLastLoginTime()
            }

            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 登出
    async logout() {
        try {
            await request.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }

    // 獲取當前用戶資料
    async getCurrentUser() {
        try {
            const response = await request.get('/auth/profile')
            // 更新本地存儲的用戶資訊
            localStorage.setItem('user', JSON.stringify(response))
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 更新用戶資料
    async updateUserProfile(userData) {
        try {
            const response = await request.put('/auth/profile', {
                phone: userData.phone,
                holderName: userData.holderName,
                cardType: userData.cardType,
                // 其他可更新的欄位
                ...userData
            })
            // 更新本地存儲的用戶資訊
            localStorage.setItem('user', JSON.stringify(response))
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 更新最後登入時間
    async updateLastLoginTime() {
        try {
            await request.put('/auth/last-login')
        } catch (error) {
            console.error('Update last login time error:', error)
        }
    }

    // 修改密碼
    async changePassword(passwordData) {
        try {
            const response = await request.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 重設密碼請求
    async requestPasswordReset(email) {
        try {
            const response = await request.post('/auth/password/reset-request', {
                email: email
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 重設密碼
    async resetPassword(resetData) {
        try {
            const response = await request.post('/auth/password/reset', {
                token: resetData.token,
                newPassword: resetData.newPassword
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 驗證 Email
    async verifyEmail(token) {
        try {
            const response = await request.post('/auth/verify-email', {
                token: token
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 重新發送驗證郵件
    async resendVerificationEmail() {
        try {
            const response = await request.post('/auth/verify-email/resend')
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 檢查 Email 是否已被使用
    async checkEmailAvailability(email) {
        try {
            const response = await request.get(`/auth/check-email/${email}`)
            return response.available
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 獲取用戶角色權限
    async getUserPermissions() {
        try {
            const response = await request.get('/auth/permissions')
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 檢查是否已登入
    isAuthenticated() {
        const token = this.getToken()
        const user = this.getUser()
        return !!(token && user)
    }

    // 檢查是否為管理員
    isAdmin() {
        const user = this.getUser()
        return user && user.role === 'admin'
    }

    // 獲取 Token
    getToken() {
        return localStorage.getItem('token')
    }

    // 獲取用戶資料
    getUser() {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    }

    // 錯誤處理
    handleError(error) {
        if (error.response) {
            // 伺服器回應錯誤
            const errorMessage = error.response.data?.message || '發生錯誤'

            switch (error.response.status) {
                case 400:
                    return new Error(`請求參數錯誤: ${errorMessage}`)
                case 401:
                    this.logout() // 清除過期的認證資訊
                    return new Error('認證已過期，請重新登入')
                case 403:
                    return new Error(`沒有權限執行此操作: ${errorMessage}`)
                case 404:
                    return new Error(`找不到請求的資源: ${errorMessage}`)
                case 409:
                    return new Error(`資料衝突，可能是電子郵件已被使用: ${errorMessage}`)
                case 422:
                    return new Error(`提供的資料無效: ${errorMessage}`)
                case 429:
                    return new Error('請求過於頻繁，請稍後再試')
                case 500:
                    return new Error(`伺服器內部錯誤: ${errorMessage}`)
                default:
                    return new Error(`發生未知錯誤 (${error.response.status}): ${errorMessage}`)
            }
        }

        if (error.request) {
            // 請求發送失敗
            return new Error('無法連接到伺服器，請檢查網路連線')
        }

        // 其他錯誤
        return new Error('發生錯誤：' + error.message)
    }
}

export default new AuthService()