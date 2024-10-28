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
    faWifiSlash, faHistory, faChair
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

// 引入全局工具
import * as formatters from '@/utils/formatters'
import * as validators from '@/utils/validators'

// 創建 Vue 應用實例
const app = createApp(App)

// 註冊所有圖標
library.add(
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
    faWifiSlash, faHistory, faChair,

    // 社交媒體圖標
    faFacebookF, faInstagram, faLine, faYoutube
)

// 註冊全局組件
app.component('font-awesome-icon', FontAwesomeIcon)

// 註冊全局屬性
app.config.globalProperties.$formatters = formatters
app.config.globalProperties.$validators = validators

// 註冊全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('Global error:', err)
    console.error('Vue instance:', vm)
    console.error('Error info:', info)
    // 這裡可以添加錯誤通知或日誌記錄
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

// 使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 使用 Vue Router
app.use(router)

// 掛載應用
app.mount('#app')

// 開發環境設置
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
    // 這裡可以添加開發環境特定的設置
}

// 全局事件處理
const handleNetworkChange = (online) => {
    const event = online ? 'online' : 'offline'
    const status = online ? '已連線' : '已離線'
    console.log(`App is ${status}`)
    // 這裡可以添加網路狀態變更的處理邏輯
}

window.addEventListener('online', () => handleNetworkChange(true))
window.addEventListener('offline', () => handleNetworkChange(false))

// 全局錯誤處理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Window Error:', { message: msg, url, lineNo, columnNo, error })
    // 這裡可以添加錯誤通知或日誌記錄
    return false
}

window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled Promise rejection:', event.reason)
    // 這裡可以添加錯誤通知或日誌記錄
})

// 瀏覽器功能檢查
const checkBrowserSupport = () => {
    const requiredFeatures = {
        promise: 'Promise' in window,
        fetch: 'fetch' in window,
        localStorage: 'localStorage' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webSocket: 'WebSocket' in window
    }

    const unsupportedFeatures = Object.entries(requiredFeatures)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature)

    if (unsupportedFeatures.length > 0) {
        console.warn('Unsupported features:', unsupportedFeatures)
        // 這裡可以添加瀏覽器相容性提示
    }

    return unsupportedFeatures.length === 0
}

// 初始化檢查
if (checkBrowserSupport()) {
    console.log('All required features are supported')
} else {
    console.warn('Some features are not supported')
}