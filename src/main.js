import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入 Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// 引入 Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    // 用戶相關
    faUser, faUserCircle, faUserPlus, faSignInAlt, faSignOutAlt,
    // 表單相關
    faLock, faEnvelope, faPhone, faEye, faEyeSlash,
    // 電影相關
    faFilm, faTicketAlt, faTheaterMasks, faCouch, faVideo,
    // 錢包相關
    faWallet, faCreditCard, faMoneyBillWave, faReceipt,
    // 優惠相關
    faTags, faPercent, faGift, faStar,
    // 時間和地點
    faCalendarAlt, faMapMarkerAlt, faClock, faLocationArrow,
    // 操作相關
    faEdit, faTrash, faPlus, faMinus, faCheck, faTimes,
    // 狀態相關
    faSpinner, faExclamationCircle, faCheckCircle, faInfoCircle,
    faExclamationTriangle,
    // 導航相關
    faHome, faSearch, faList, faBars, faChevronDown, faChevronUp,
    // 其他功能
    faQrcode, faPrint, faDownload, faShare, faCog, faBell,
    faHistory, faChair
} from '@fortawesome/free-solid-svg-icons'

// 引入社交媒體圖標
import {
    faFacebookF,
    faInstagram,
    faLine,
    faYoutube
} from '@fortawesome/free-brands-svg-icons'

// 引入全局樣式
import '@/assets/styles/main.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/components.css'

// 引入全局工具函數
import * as formatters from '@/utils/formatters'
import * as validators from '@/utils/validators'
import * as constants from '@/utils/constants'

// 創建 Vue 應用實例
const app = createApp(App)

// 註冊所有圖標
const icons = [
    // 用戶相關圖標
    faUser, faUserCircle, faUserPlus, faSignInAlt, faSignOutAlt,
    // 表單相關圖標
    faLock, faEnvelope, faPhone, faEye, faEyeSlash,
    // 電影相關圖標
    faFilm, faTicketAlt, faTheaterMasks, faCouch, faVideo,
    // 錢包相關圖標
    faWallet, faCreditCard, faMoneyBillWave, faReceipt,
    // 優惠相關圖標
    faTags, faPercent, faGift, faStar,
    // 時間和地點圖標
    faCalendarAlt, faMapMarkerAlt, faClock, faLocationArrow,
    // 操作相關圖標
    faEdit, faTrash, faPlus, faMinus, faCheck, faTimes,
    // 狀態相關圖標
    faSpinner, faExclamationCircle, faCheckCircle, faInfoCircle,
    faExclamationTriangle,
    // 導航相關圖標
    faHome, faSearch, faList, faBars, faChevronDown, faChevronUp,
    // 其他功能圖標
    faQrcode, faPrint, faDownload, faShare, faCog, faBell,
    faHistory, faChair,
    // 社交媒體圖標
    faFacebookF, faInstagram, faLine, faYoutube
]

library.add(...icons)

// 註冊全局組件
app.component('font-awesome-icon', FontAwesomeIcon)

// 註冊全局屬性和方法
app.config.globalProperties.$formatters = formatters
app.config.globalProperties.$validators = validators
app.config.globalProperties.$constants = constants

// 日期格式化
app.config.globalProperties.$formatDate = (date, format = 'full') => {
    if (!date) return ''
    const options = {
        full: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        date: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        },
        time: {
            hour: '2-digit',
            minute: '2-digit'
        }
    }
    return new Date(date).toLocaleDateString('zh-TW', options[format] || options.full)
}

// 貨幣格式化
app.config.globalProperties.$formatCurrency = (amount, options = {}) => {
    const defaultOptions = {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options
    }
    return new Intl.NumberFormat('zh-TW', defaultOptions).format(amount)
}

// 註冊全局指令
app.directive('focus', {
    mounted: (el) => el.focus()
})

app.directive('click-outside', {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
    }
})

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', {
        error: err,
        component: vm?.$options?.name || 'Unknown',
        info,
        time: new Date().toISOString()
    })

    // 錯誤通知
    if (vm?.$root?.$refs?.app?.addNotification) {
        vm.$root.$refs.app.addNotification({
            type: 'error',
            title: '系統錯誤',
            message: err.message || '發生錯誤，請稍後再試',
            duration: 5000
        })
    }
}

// 使用 Pinia
const pinia = createPinia()

// Pinia 插件 - 持久化存儲
pinia.use(({ store }) => {
    // 從 localStorage 恢復狀態
    const savedState = localStorage.getItem(`${store.$id}-state`)
    if (savedState) {
        store.$patch(JSON.parse(savedState))
    }

    // 監聽狀態變化並保存
    store.$subscribe(
        (mutation, state) => {
            localStorage.setItem(`${store.$id}-state`, JSON.stringify(state))
        },
        { detached: true }
    )
})

app.use(pinia)

// 使用 Vue Router
app.use(router)

// 路由守衛
router.beforeEach((to, from, next) => {
    const authStore = pinia.state.value.auth

    // 需要登入的頁面檢查
    if (to.meta.requiresAuth && !authStore?.isLoggedIn) {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
    }

    // 已登入用戶不能訪問登入/註冊頁
    if (to.meta.guest && authStore?.isLoggedIn) {
        next({ name: 'home' })
        return
    }

    next()
})

// 掛載應用
app.mount('#app')

// 開發環境設置
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')

    // 開發工具
    app.config.performance = true
    app.config.devtools = true
}

// 網路狀態監控
const handleNetworkChange = (online) => {
    const message = online ? '網路已連線' : '網路已斷線'
    const type = online ? 'success' : 'warning'

    if (app?.$refs?.app?.addNotification) {
        app.$refs.app.addNotification({
            type,
            message,
            duration: online ? 3000 : 0
        })
    }
}

window.addEventListener('online', () => handleNetworkChange(true))
window.addEventListener('offline', () => handleNetworkChange(false))

// 全局錯誤處理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global Error:', {
        message: msg,
        url,
        lineNo,
        columnNo,
        error,
        time: new Date().toISOString()
    })

    if (app?.$refs?.app?.addNotification) {
        app.$refs.app.addNotification({
            type: 'error',
            title: '系統錯誤',
            message: '系統發生錯誤，請稍後再試',
            duration: 5000
        })
    }

    return false
}

// Promise 錯誤處理
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        time: new Date().toISOString()
    })

    if (app?.$refs?.app?.addNotification) {
        app.$refs.app.addNotification({
            type: 'error',
            title: '操作失敗',
            message: '請稍後再試',
            duration: 5000
        })
    }
})

// 性能監控
if (process.env.NODE_ENV === 'production') {
    // 監控頁面載入時間
    window.addEventListener('load', () => {
        const timing = performance.getEntriesByType('navigation')[0]
        console.log('Page Load Time:', timing.loadEventEnd - timing.navigationStart)
    })
}