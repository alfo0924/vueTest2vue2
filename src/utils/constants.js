/**
 * API 相關常數
 */
export const API = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    TIMEOUT: 15000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

/**
 * 會員相關常數
 */
export const MEMBER = {
    // 會員角色
    ROLES: {
        ADMIN: 'admin',
        USER: 'user'
    },
    // 卡片類型
    CARD_TYPES: {
        NORMAL: '一般卡',
        ELDERLY: '敬老卡',
        CHARITY: '愛心卡',
        STUDENT: '學生卡'
    },
    // 驗證類型
    VERIFICATION_TYPES: {
        DIGITAL_ID: '數位身份證明',
        LIBRARY: '圖書館借書',
        STUDENT: '學生身份驗證',
        EMPLOYEE: '員工身份驗證'
    }
}

/**
 * 電影相關常數
 */
export const MOVIE = {
    // 電影類別
    CATEGORIES: [
        { id: 1, name: '動作' },
        { id: 2, name: '喜劇' },
        { id: 3, name: '劇情' },
        { id: 4, name: '科幻' },
        { id: 5, name: '恐怖' },
        { id: 6, name: '動畫' }
    ],
    // 座位狀態
    SEAT_STATUS: {
        AVAILABLE: 'available',
        OCCUPIED: 'occupied',
        SELECTED: 'selected'
    },
    // 訂票狀態
    BOOKING_STATUS: {
        BOOKED: '已預訂',
        COMPLETED: '已完成',
        CANCELLED: '已取消'
    }
}

/**
 * 錢包相關常數
 */
export const WALLET = {
    // 交易類型
    TRANSACTION_TYPES: {
        TOPUP: '充值',
        PAYMENT: '支付',
        REFUND: '退款'
    },
    // 交易限制
    LIMITS: {
        MIN_TOPUP: 100,
        MAX_TOPUP: 10000,
        MIN_PAYMENT: 1
    },
    // 交易狀態
    TRANSACTION_STATUS: {
        SUCCESS: 'success',
        FAILED: 'failed',
        PENDING: 'pending'
    }
}

/**
 * 優惠相關常數
 */
export const DISCOUNT = {
    // 優惠類型
    TYPES: {
        MOVIE: '電影優惠',
        TRANSPORT: '交通優惠',
        SHOPPING: '購物優惠'
    },
    // 優惠狀態
    STATUS: {
        ACTIVE: 'active',
        EXPIRED: 'expired',
        USED: 'used'
    }
}

/**
 * 通知相關常數
 */
export const NOTIFICATION = {
    // 通知類型
    TYPES: {
        SYSTEM: '系統通知',
        DISCOUNT: '優惠通知',
        BOOKING: '訂單通知'
    },
    // 通知優先級
    PRIORITY: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    }
}

/**
 * 系統相關常數
 */
export const SYSTEM = {
    // 日期時間格式
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

    // 分頁設置
    PAGINATION: {
        PAGE_SIZES: [10, 20, 50, 100],
        DEFAULT_PAGE_SIZE: 10
    },

    // 本地存儲鍵名
    STORAGE_KEYS: {
        TOKEN: 'token',
        USER: 'user',
        THEME: 'theme',
        LANGUAGE: 'language'
    },

    // 語言設置
    LANGUAGES: {
        'zh-TW': '繁體中文',
        'en-US': 'English'
    },

    // 主題設置
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    }
}

/**
 * 驗證相關常數
 */
export const VALIDATION = {
    // 密碼規則
    PASSWORD_RULES: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: true
    },

    // 手機號碼格式
    PHONE_PATTERN: /^09\d{8}$/,

    // Email格式
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

/**
 * 錯誤訊息
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: '網路連接錯誤，請檢查網路狀態',
    SERVER_ERROR: '伺服器錯誤，請稍後再試',
    AUTH_REQUIRED: '請先登入',
    INVALID_INPUT: '輸入資料無效',
    INSUFFICIENT_BALANCE: '餘額不足',
    SEAT_OCCUPIED: '座位已被預訂',
    DISCOUNT_EXPIRED: '優惠已過期',
    DISCOUNT_USED: '優惠已使用'
}

/**
 * 成功訊息
 */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: '登入成功',
    REGISTER_SUCCESS: '註冊成功',
    BOOKING_SUCCESS: '訂票成功',
    PAYMENT_SUCCESS: '支付成功',
    TOPUP_SUCCESS: '儲值成功',
    UPDATE_SUCCESS: '更新成功'
}