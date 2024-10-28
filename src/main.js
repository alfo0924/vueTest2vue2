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
    faUser,
    faLock,
    faEnvelope,
    faPhone,
    faFilm,
    faTicketAlt,
    faWallet,
    faTags,
    faCalendarAlt,
    faMapMarkerAlt,
    faClock,
    faChair,
    faSignOutAlt,
    faUserCircle,
    faHistory,
    faCreditCard,
    faExclamationCircle,
    faCheckCircle,
    faSearch,
    faPlus,
    faMinus,
    faEdit,
    faTrash,
    faSpinner
} from '@fortawesome/free-solid-svg-icons'

// 引入全局樣式
import '@/assets/styles/main.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/components.css'

// 引入全局工具
import { formatDateTime, formatAmount } from '@/utils/formatters'

// 創建 Vue 應用實例
const app = createApp(App)

// 註冊 Font Awesome 圖標
library.add(
    faUser,
    faLock,
    faEnvelope,
    faPhone,
    faFilm,
    faTicketAlt,
    faWallet,
    faTags,
    faCalendarAlt,
    faMapMarkerAlt,
    faClock,
    faChair,
    faSignOutAlt,
    faUserCircle,
    faHistory,
    faCreditCard,
    faExclamationCircle,
    faCheckCircle,
    faSearch,
    faPlus,
    faMinus,
    faEdit,
    faTrash,
    faSpinner
)

// 註冊全局組件
app.component('font-awesome-icon', FontAwesomeIcon)

// 註冊全局屬性
app.config.globalProperties.$filters = {
    formatDateTime,
    formatAmount
}

// 註冊全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('Global error:', err)
    console.error('Vue instance:', vm)
    console.error('Error info:', info)
}

// 註冊全局指令
app.directive('focus', {
    mounted: (el) => el.focus()
})

// 使用 Pinia
app.use(createPinia())

// 使用 Vue Router
app.use(router)

// 掛載應用
app.mount('#app')

// 開發環境警告
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
}

// PWA 支援
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful')
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error)
            })
    })
}

// 全局錯誤追蹤
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Window Error:', {
        message: msg,
        url: url,
        lineNo: lineNo,
        columnNo: columnNo,
        error: error
    })
    return false
}

// 未處理的 Promise 錯誤追蹤
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled Promise rejection:', event.reason)
})

// 離線支援
window.addEventListener('offline', () => {
    console.log('App is offline')
    // 這裡可以添加離線提示邏輯
})

window.addEventListener('online', () => {
    console.log('App is online')
    // 這裡可以添加重新連線邏輯
})

// 瀏覽器支援檢查
const checkBrowserSupport = () => {
    const features = {
        promise: 'Promise' in window,
        fetch: 'fetch' in window,
        localStorage: 'localStorage' in window
    }

    const unsupportedFeatures = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature)

    if (unsupportedFeatures.length > 0) {
        console.warn('Unsupported features:', unsupportedFeatures)
        // 這裡可以添加瀏覽器不支援提示
    }
}

checkBrowserSupport()