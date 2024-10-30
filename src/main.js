// src/main.js
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
    faIdCard, faUserShield, faUserCog, faUserEdit,
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
    faExclamationTriangle, faShieldAlt, faLockOpen,
    // 導航相關
    faHome, faSearch, faList, faBars, faChevronDown, faChevronUp,
    // 其他功能
    faQrcode, faPrint, faDownload, faShare, faCog, faBell,
    faHistory, faChair, faBook, faGraduationCap, faBriefcase
} from '@fortawesome/free-solid-svg-icons'

// 引入社交媒體圖標
import {
    faFacebookF,
    faInstagram,
    faLine,
    faYoutube,
    faGoogle
} from '@fortawesome/free-brands-svg-icons'

// 引入全局樣式
import '@/assets/styles/main.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/components.css'

// 創建 Vue 應用實例
const app = createApp(App)

// 註冊所有圖標
const icons = [
    // 用戶相關圖標
    faUser, faUserCircle, faUserPlus, faSignInAlt, faSignOutAlt,
    faIdCard, faUserShield, faUserCog, faUserEdit,
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
    faExclamationTriangle, faShieldAlt, faLockOpen,
    // 導航相關圖標
    faHome, faSearch, faList, faBars, faChevronDown, faChevronUp,
    // 其他功能圖標
    faQrcode, faPrint, faDownload, faShare, faCog, faBell,
    faHistory, faChair, faBook, faGraduationCap, faBriefcase,
    // 社交媒體圖標
    faFacebookF, faInstagram, faLine, faYoutube, faGoogle
]

library.add(...icons)

// 註冊全局組件
app.component('font-awesome-icon', FontAwesomeIcon)

// 使用 Pinia
const pinia = createPinia()

// Pinia 持久化插件
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
router.beforeEach(async (to, from, next) => {
    const authStore = pinia.state.value.auth

    // 檢查用戶狀態
    if (authStore?.token && !authStore?.user) {
        try {
            await authStore.fetchUserProfile()
        } catch (error) {
            console.error('Failed to fetch user profile:', error)
        }
    }

    // 需要登入的頁面檢查
    if (to.meta.requiresAuth && !authStore?.isLoggedIn) {
        next({
            name: 'login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // 已登入用戶不能訪問登入/註冊頁
    if (to.meta.guest && authStore?.isLoggedIn) {
        next({ name: 'home' })
        return
    }

    next()
})

// 全局屬性
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

app.config.globalProperties.$formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0
    }).format(amount)
}

// 掛載應用
app.mount('#app')

// 開發環境配置
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode')
    app.config.devtools = true
}

export default app