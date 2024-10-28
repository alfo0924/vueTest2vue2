import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// 請求攔截器
api.interceptors.request.use(
    config => {
        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token')

        // 如果有 token 就加到 headers 中
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 加入時間戳，防止快取
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            }
        }

        return config
    },
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器
api.interceptors.response.use(
    response => {
        // 直接返回響應數據
        return response.data
    },
    error => {
        const { response } = error

        // 根據狀態碼處理不同的錯誤情況
        if (response) {
            switch (response.status) {
                case 400:
                    error.message = '請求錯誤'
                    break
                case 401:
                    // token 過期或無效
                    error.message = '未授權，請重新登入'
                    // 清除本地存儲的 token
                    localStorage.removeItem('token')
                    // 重定向到登入頁
                    window.location.href = '/login'
                    break
                case 403:
                    error.message = '拒絕訪問'
                    break
                case 404:
                    error.message = '請求地址出錯'
                    break
                case 408:
                    error.message = '請求超時'
                    break
                case 500:
                    error.message = '伺服器內部錯誤'
                    break
                case 501:
                    error.message = '服務未實現'
                    break
                case 502:
                    error.message = '網關錯誤'
                    break
                case 503:
                    error.message = '服務不可用'
                    break
                case 504:
                    error.message = '網關超時'
                    break
                case 505:
                    error.message = 'HTTP版本不受支援'
                    break
                default:
                    error.message = '發生未知錯誤'
            }
        } else {
            // 處理網路錯誤
            if (error.message.includes('timeout')) {
                error.message = '請求超時！請檢查網路連接'
            } else {
                error.message = '網路連接錯誤！請檢查網路狀態'
            }
        }

        // 顯示錯誤訊息（可以使用 toast 或其他提示元件）
        console.error('Response error:', error.message)

        return Promise.reject(error)
    }
)

// 封裝請求方法
const request = {
    get(url, params) {
        return api.get(url, { params })
    },

    post(url, data) {
        return api.post(url, data)
    },

    put(url, data) {
        return api.put(url, data)
    },

    delete(url, params) {
        return api.delete(url, { params })
    },

    // 上傳文件
    upload(url, file) {
        const formData = new FormData()
        formData.append('file', file)
        return api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 下載文件
    download(url, params) {
        return api.get(url, {
            params,
            responseType: 'blob'
        })
    }
}

export default request