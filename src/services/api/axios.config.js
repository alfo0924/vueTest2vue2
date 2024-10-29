// src/services/api/axios.config.js

import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { ERROR_MESSAGES } from '@/utils/constants'

// 創建 axios 實例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // 允許跨域請求攜帶 cookie
})

// 請求攔截器
api.interceptors.request.use(
    config => {
        const authStore = useAuthStore()

        // 如果有 token 就加到 headers 中
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }

        // 防止快取
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            }
        }

        // 添加自定義 headers
        config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION
        config.headers['X-Request-Id'] = generateRequestId()

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
        // 處理特定的響應格式
        const { data, code, message } = response.data

        // 如果後端返回統一的響應格式
        if (code !== undefined) {
            switch (code) {
                case 200:
                    return data
                case 401:
                    handleUnauthorized()
                    throw new Error(message || ERROR_MESSAGES.AUTH_REQUIRED)
                default:
                    throw new Error(message || ERROR_MESSAGES.SERVER_ERROR)
            }
        }

        // 如果是普通響應，直接返回數據
        return response.data
    },
    error => {
        const { response, request } = error

        // 處理響應錯誤
        if (response) {
            switch (response.status) {
                case 400:
                    error.message = ERROR_MESSAGES.INVALID_REQUEST
                    break
                case 401:
                    handleUnauthorized()
                    error.message = ERROR_MESSAGES.AUTH_REQUIRED
                    break
                case 403:
                    error.message = ERROR_MESSAGES.FORBIDDEN
                    break
                case 404:
                    error.message = ERROR_MESSAGES.NOT_FOUND
                    break
                case 408:
                    error.message = ERROR_MESSAGES.TIMEOUT
                    break
                case 500:
                    error.message = ERROR_MESSAGES.SERVER_ERROR
                    break
                default:
                    error.message = ERROR_MESSAGES.UNKNOWN_ERROR
            }
        }
        // 處理請求錯誤
        else if (request) {
            if (error.message.includes('timeout')) {
                error.message = ERROR_MESSAGES.NETWORK_TIMEOUT
            } else {
                error.message = ERROR_MESSAGES.NETWORK_ERROR
            }
        }
        // 其他錯誤
        else {
            error.message = ERROR_MESSAGES.UNKNOWN_ERROR
        }

        // 記錄錯誤
        logError(error)

        return Promise.reject(error)
    }
)

// 處理未授權情況
const handleUnauthorized = () => {
    const authStore = useAuthStore()
    authStore.logout()

    // 保存當前路由
    const currentRoute = router.currentRoute.value
    if (currentRoute.name !== 'login') {
        router.push({
            name: 'login',
            query: { redirect: currentRoute.fullPath }
        })
    }
}

// 生成請求 ID
const generateRequestId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// 錯誤日誌
const logError = (error) => {
    console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.config?.data,
        timestamp: new Date().toISOString()
    })
}

// 請求方法封裝
const request = {
    // GET 請求
    async get(url, params, config = {}) {
        try {
            return await api.get(url, { params, ...config })
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // POST 請求
    async post(url, data, config = {}) {
        try {
            return await api.post(url, data, config)
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // PUT 請求
    async put(url, data, config = {}) {
        try {
            return await api.put(url, data, config)
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // DELETE 請求
    async delete(url, params, config = {}) {
        try {
            return await api.delete(url, { params, ...config })
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // 上傳文件
    async upload(url, file, onProgress) {
        const formData = new FormData()
        formData.append('file', file)

        try {
            return await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressEvent => {
                    if (onProgress) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        onProgress(progress)
                    }
                }
            })
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // 下載文件
    async download(url, params, filename) {
        try {
            const response = await api.get(url, {
                params,
                responseType: 'blob'
            })

            // 創建下載連結
            const blob = new Blob([response], {
                type: response.type || 'application/octet-stream'
            })
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = filename || getFilenameFromResponse(response)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)

            return response
        } catch (error) {
            throw handleRequestError(error)
        }
    },

    // 批量請求
    async all(requests) {
        try {
            return await Promise.all(requests)
        } catch (error) {
            throw handleRequestError(error)
        }
    }
}

// 處理請求錯誤
const handleRequestError = (error) => {
    // 可以在這裡添加統一的錯誤處理邏輯
    return error
}

// 從響應中獲取文件名
const getFilenameFromResponse = (response) => {
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.includes('filename=')) {
        const filename = disposition.split('filename=')[1].replace(/"/g, '')
        return decodeURIComponent(filename)
    }
    return 'download'
}

export default request