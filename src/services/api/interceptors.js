import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

// 創建 axios 實例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// 請求計數器（用於追蹤活躍請求數量）
let activeRequests = 0

// 請求攔截器
api.interceptors.request.use(
    config => {
        // 增加活躍請求計數
        activeRequests++

        // 如果是第一個請求，顯示全局載入狀態
        if (activeRequests === 1) {
            // 可以在這裡觸發全局載入狀態
            document.body.classList.add('loading')
        }

        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 防止 GET 請求被快取
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            }
        }

        return config
    },
    error => {
        // 減少活躍請求計數
        activeRequests--
        if (activeRequests === 0) {
            // 隱藏全局載入狀態
            document.body.classList.remove('loading')
        }
        return Promise.reject(error)
    }
)

// 響應攔截器
api.interceptors.response.use(
    response => {
        // 減少活躍請求計數
        activeRequests--
        if (activeRequests === 0) {
            // 隱藏全局載入狀態
            document.body.classList.remove('loading')
        }

        // 直接返回響應數據
        return response.data
    },
    async error => {
        // 減少活躍請求計數
        activeRequests--
        if (activeRequests === 0) {
            // 隱藏全局載入狀態
            document.body.classList.remove('loading')
        }

        const { response } = error

        // 如果沒有響應，可能是網絡錯誤
        if (!response) {
            return Promise.reject({
                message: '網路連接錯誤，請檢查網路狀態'
            })
        }

        // 處理特定狀態碼
        switch (response.status) {
            case 400:
                error.message = response.data.message || '請求參數錯誤'
                break

            case 401: {
                const authStore = useAuthStore()

                // 清除用戶資訊
                await authStore.logout()

                // 保存當前路由，以便登入後重定向
                const currentRoute = router.currentRoute.value
                const redirectPath = currentRoute.path !== '/login' ? currentRoute.fullPath : undefined

                // 重定向到登入頁面
                router.push({
                    path: '/login',
                    query: redirectPath ? { redirect: redirectPath } : undefined
                })

                error.message = '請重新登入'
                break
            }

            case 403:
                error.message = '權限不足，拒絕訪問'
                break

            case 404:
                error.message = '請求的資源不存在'
                break

            case 408:
                error.message = '請求超時，請重試'
                break

            case 409:
                error.message = '資源衝突，請重試'
                break

            case 500:
                error.message = '伺服器內部錯誤'
                break

            case 502:
                error.message = '網關錯誤'
                break

            case 503:
                error.message = '服務暫時不可用'
                break

            case 504:
                error.message = '網關超時'
                break

            default:
                error.message = response.data.message || '發生未知錯誤'
        }

        // 顯示錯誤提示
        // 這裡可以使用全局的提示組件
        console.error('API Error:', error.message)

        return Promise.reject(error)
    }
)

// 請求方法封裝
const request = {
    get(url, params, config = {}) {
        return api.get(url, { ...config, params })
    },

    post(url, data, config = {}) {
        return api.post(url, data, config)
    },

    put(url, data, config = {}) {
        return api.put(url, data, config)
    },

    delete(url, params, config = {}) {
        return api.delete(url, { ...config, params })
    },

    // 文件上傳
    upload(url, file, onUploadProgress) {
        const formData = new FormData()
        formData.append('file', file)

        return api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onUploadProgress(percentCompleted)
                }
            }
        })
    },

    // 文件下載
    download(url, params) {
        return api.get(url, {
            params,
            responseType: 'blob',
            timeout: 30000 // 下載文件可能需要更長的超時時間
        })
    }
}

export default request