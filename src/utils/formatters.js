/**
 * 日期時間格式化工具
 */

// 格式化日期時間
export const formatDateTime = (datetime, format = 'YYYY-MM-DD HH:mm') => {
    if (!datetime) return ''

    const date = new Date(datetime)
    if (isNaN(date)) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

// 格式化日期
export const formatDate = (date) => {
    return formatDateTime(date, 'YYYY-MM-DD')
}

// 格式化時間
export const formatTime = (time) => {
    return formatDateTime(time, 'HH:mm')
}

/**
 * 金額格式化工具
 */

// 格式化金額
export const formatAmount = (amount, currency = 'NT$') => {
    if (typeof amount !== 'number') return ''

    return `${currency} ${amount.toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`
}

/**
 * 電影相關格式化工具
 */

// 格式化電影時長
export const formatDuration = (minutes) => {
    if (!minutes) return ''

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
        return `${remainingMinutes} 分鐘`
    }

    if (remainingMinutes === 0) {
        return `${hours} 小時`
    }

    return `${hours} 小時 ${remainingMinutes} 分鐘`
}

/**
 * 卡片相關格式化工具
 */

// 格式化卡號
export const formatCardNumber = (number) => {
    if (!number) return ''

    return number.toString()
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
}

// 格式化手機號碼
export const formatPhoneNumber = (phone) => {
    if (!phone) return ''

    return phone.toString()
        .replace(/\D/g, '')
        .replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3')
}

/**
 * 文字格式化工具
 */

// 截斷文字
export const truncateText = (text, length = 50, suffix = '...') => {
    if (!text) return ''

    if (text.length <= length) return text

    return text.substring(0, length) + suffix
}

// 格式化座位號碼
export const formatSeatNumber = (row, col) => {
    if (!row || !col) return ''

    return `${String.fromCharCode(64 + row)}${col}`
}

/**
 * 狀態格式化工具
 */

// 格式化訂票狀態
export const formatBookingStatus = (status) => {
    const statusMap = {
        'booked': '已預訂',
        'completed': '已完成',
        'cancelled': '已取消'
    }
    return statusMap[status] || status
}

// 格式化交易類型
export const formatTransactionType = (type) => {
    const typeMap = {
        'topup': '儲值',
        'payment': '支付',
        'refund': '退款'
    }
    return typeMap[type] || type
}

/**
 * 驗證工具
 */

// 驗證 Email
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

// 驗證手機號碼
export const validatePhone = (phone) => {
    const re = /^09\d{8}$/
    return re.test(phone)
}

// 驗證密碼強度
export const validatePassword = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    }
}

/**
 * 其他工具函數
 */

// 生成隨機 ID
export const generateId = (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2)
}

// 深拷貝物件
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    return JSON.parse(JSON.stringify(obj))
}

// 防抖函數
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// 節流函數
export const throttle = (func, limit) => {
    let inThrottle
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}