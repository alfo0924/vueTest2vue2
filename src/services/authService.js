import request from './api/axios.config'

class AuthService {
    // 註冊
    async register(userData) {
        try {
            const response = await request.post('/members/register', {
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                holderName: userData.holderName,
                cardType: userData.cardType
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 登入
    async login(credentials) {
        try {
            const response = await request.post('/members/login', {
                email: credentials.email,
                password: credentials.password
            })

            if (response.token) {
                localStorage.setItem('token', response.token)
                localStorage.setItem('user', JSON.stringify(response.user))
            }

            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 登出
    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    // 獲取當前用戶資料
    async getCurrentUser() {
        try {
            const response = await request.get('/members/info')
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 更新用戶資料
    async updateUserProfile(userData) {
        try {
            const response = await request.put('/members/info', userData)
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 修改密碼
    async changePassword(passwordData) {
        try {
            const response = await request.put('/members/password', {
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
            const response = await request.post('/members/password/reset-request', {
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
            const response = await request.post('/members/password/reset', {
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
            const response = await request.post('/members/verify-email', {
                token: token
            })
            return response
        } catch (error) {
            throw this.handleError(error)
        }
    }

    // 檢查是否已登入
    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
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
            switch (error.response.status) {
                case 400:
                    return new Error('請求參數錯誤')
                case 401:
                    this.logout() // 清除過期的認證資訊
                    return new Error('認證已過期，請重新登入')
                case 403:
                    return new Error('沒有權限執行此操作')
                case 404:
                    return new Error('找不到請求的資源')
                case 409:
                    return new Error('資料衝突，可能是電子郵件已被使用')
                case 422:
                    return new Error('提供的資料無效')
                case 500:
                    return new Error('伺服器內部錯誤')
                default:
                    return new Error('發生未知錯誤')
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