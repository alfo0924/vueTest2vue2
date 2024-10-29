// src/utils/errorHandler.js

/**
 * API 錯誤處理工具
 */

// 錯誤類型定義
export const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 錯誤訊息
export const ErrorMessages = {
    [ErrorTypes.NETWORK_ERROR]: '網路連線錯誤，請檢查網路狀態',
    [ErrorTypes.AUTH_ERROR]: '身份驗證失敗，請重新登入',
    [ErrorTypes.VALIDATION_ERROR]: '輸入資料無效',
    [ErrorTypes.SERVER_ERROR]: '伺服器錯誤，請稍後再試',
    [ErrorTypes.NOT_FOUND]: '找不到請求的資源',
    [ErrorTypes.UNKNOWN_ERROR]: '發生未知錯誤'
}

/**
 * 處理 API 錯誤
 * @param {Error} error - 錯誤對象
 * @returns {Object} 處理後的錯誤資訊
 */
export const handleApiError = (error) => {
    if (error.response) {
        // 伺服器回應的錯誤
        const { status, data } = error.response

        switch (status) {
            case 400:
                return {
                    type: ErrorTypes.VALIDATION_ERROR,
                    message: data.message || ErrorMessages[ErrorTypes.VALIDATION_ERROR],
                    details: data.errors
                }
            case 401:
                return {
                    type: ErrorTypes.AUTH_ERROR,
                    message: data.message || ErrorMessages[ErrorTypes.AUTH_ERROR]
                }
            case 404:
                return {
                    type: ErrorTypes.NOT_FOUND,
                    message: data.message || ErrorMessages[ErrorTypes.NOT_FOUND]
                }
            case 500:
                return {
                    type: ErrorTypes.SERVER_ERROR,
                    message: data.message || ErrorMessages[ErrorTypes.SERVER_ERROR]
                }
            default:
                return {
                    type: ErrorTypes.UNKNOWN_ERROR,
                    message: data.message || ErrorMessages[ErrorTypes.UNKNOWN_ERROR]
                }
        }
    } else if (error.request) {
        // 請求發出但沒有收到回應
        return {
            type: ErrorTypes.NETWORK_ERROR,
            message: ErrorMessages[ErrorTypes.NETWORK_ERROR]
        }
    } else {
        // 其他錯誤
        return {
            type: ErrorTypes.UNKNOWN_ERROR,
            message: error.message || ErrorMessages[ErrorTypes.UNKNOWN_ERROR]
        }
    }
}

/**
 * 格式化錯誤訊息
 * @param {Object} error - 錯誤對象
 * @returns {string} 格式化後的錯誤訊息
 */
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error

    if (error.response?.data?.message) {
        return error.response.data.message
    }

    if (error.message) {
        return error.message
    }

    return ErrorMessages[ErrorTypes.UNKNOWN_ERROR]
}

/**
 * 記錄錯誤
 * @param {Error} error - 錯誤對象
 * @param {Object} context - 錯誤發生的上下文
 */
export const logError = (error, context = {}) => {
    console.error('Error:', {
        message: error.message,
        type: error.type,
        context,
        stack: error.stack,
        timestamp: new Date().toISOString()
    })
}

export default {
    ErrorTypes,
    ErrorMessages,
    handleApiError,
    formatErrorMessage,
    logError
}