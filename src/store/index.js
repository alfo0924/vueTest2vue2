import { createStore } from 'vuex'
import auth from './modules/auth'
import movie from './modules/movie'
import booking from './modules/booking'
import wallet from './modules/wallet'
import discount from './modules/discount'

export default createStore({
    // 根狀態
    state: {
        // 全局載入狀態
        loading: false,
        // 全局錯誤訊息
        error: null,
        // 系統通知
        notifications: [],
        // 系統設定
        settings: {
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'zh-TW'
        }
    },

    // 根 mutations
    mutations: {
        SET_LOADING(state, status) {
            state.loading = status
        },

        SET_ERROR(state, error) {
            state.error = error
        },

        CLEAR_ERROR(state) {
            state.error = null
        },

        ADD_NOTIFICATION(state, notification) {
            state.notifications.push({
                id: Date.now(),
                ...notification
            })
        },

        REMOVE_NOTIFICATION(state, notificationId) {
            state.notifications = state.notifications.filter(
                notification => notification.id !== notificationId
            )
        },

        UPDATE_SETTINGS(state, settings) {
            state.settings = { ...state.settings, ...settings }
            // 保存設定到本地存儲
            Object.entries(settings).forEach(([key, value]) => {
                localStorage.setItem(key, value)
            })
        }
    },

    // 根 actions
    actions: {
        // 初始化 store
        async initializeStore({ dispatch }) {
            try {
                // 初始化各個模組
                await Promise.all([
                    dispatch('auth/initAuth'),
                    dispatch('movie/fetchCategories'),
                    dispatch('discount/fetchDiscounts')
                ])
            } catch (error) {
                console.error('Store initialization failed:', error)
            }
        },

        // 設置載入狀態
        setLoading({ commit }, status) {
            commit('SET_LOADING', status)
        },

        // 設置錯誤訊息
        setError({ commit }, error) {
            commit('SET_ERROR', error)
            // 自動清除錯誤訊息
            setTimeout(() => {
                commit('CLEAR_ERROR')
            }, 5000)
        },

        // 新增通知
        addNotification({ commit }, notification) {
            commit('ADD_NOTIFICATION', notification)
            // 自動移除通知
            if (notification.timeout !== false) {
                setTimeout(() => {
                    commit('REMOVE_NOTIFICATION', notification.id)
                }, notification.timeout || 3000)
            }
        },

        // 移除通知
        removeNotification({ commit }, notificationId) {
            commit('REMOVE_NOTIFICATION', notificationId)
        },

        // 更新設定
        updateSettings({ commit }, settings) {
            commit('UPDATE_SETTINGS', settings)
        }
    },

    // 根 getters
    getters: {
        isLoading: state => state.loading,
        getError: state => state.error,
        getNotifications: state => state.notifications,
        getSettings: state => state.settings
    },

    // 模組
    modules: {
        auth,
        movie,
        booking,
        wallet,
        discount
    },

    // 嚴格模式（開發環境啟用）
    strict: process.env.NODE_ENV !== 'production'
})