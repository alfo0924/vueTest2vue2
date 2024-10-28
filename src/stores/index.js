import { createPinia } from 'pinia'
import { markRaw } from 'vue'
import router from '@/router'

// 創建 Pinia 實例
const pinia = createPinia()

// Pinia 插件 - 添加路由器
pinia.use(({ store }) => {
    store.router = markRaw(router)
})

// 全局狀態插件
pinia.use(({ store }) => {
    // 添加全局載入狀態
    store.$state.loading = false
    store.$state.error = null
    store.$state.notifications = []
    store.$state.settings = {
        theme: localStorage.getItem('theme') || 'light',
        language: localStorage.getItem('language') || 'zh-TW'
    }

    // 添加全局方法
    store.setLoading = (status) => {
        store.$state.loading = status
    }

    store.setError = (error) => {
        store.$state.error = error
        // 自動清除錯誤訊息
        setTimeout(() => {
            store.$state.error = null
        }, 5000)
    }

    store.addNotification = (notification) => {
        const id = Date.now()
        store.$state.notifications.push({
            id,
            ...notification
        })

        // 自動移除通知
        if (notification.timeout !== false) {
            setTimeout(() => {
                store.removeNotification(id)
            }, notification.timeout || 3000)
        }
    }

    store.removeNotification = (notificationId) => {
        store.$state.notifications = store.$state.notifications.filter(
            notification => notification.id !== notificationId
        )
    }

    store.updateSettings = (settings) => {
        store.$state.settings = { ...store.$state.settings, ...settings }
        // 保存設定到本地存儲
        Object.entries(settings).forEach(([key, value]) => {
            localStorage.setItem(key, value)
        })
    }

    // 添加全局 getters
    store.isLoading = computed(() => store.$state.loading)
    store.getError = computed(() => store.$state.error)
    store.getNotifications = computed(() => store.$state.notifications)
    store.getSettings = computed(() => store.$state.settings)
})

// 持久化插件
pinia.use(({ store }) => {
    // 在 store 初始化時從 localStorage 恢復狀態
    const storeId = store.$id
    const savedState = localStorage.getItem(`${storeId}-state`)

    if (savedState) {
        store.$patch(JSON.parse(savedState))
    }

    // 監聽狀態變化並保存到 localStorage
    watch(
        () => store.$state,
        (state) => {
            localStorage.setItem(`${storeId}-state`, JSON.stringify(state))
        },
        { deep: true }
    )
})

// 初始化插件
pinia.use(({ store }) => {
    const initialize = async () => {
        try {
            store.setLoading(true)
            // 初始化各個 store
            if (store.$id === 'auth') {
                await store.initAuth()
            }
            if (store.$id === 'movie') {
                await store.fetchCategories()
            }
            if (store.$id === 'discount') {
                await store.fetchDiscounts()
            }
        } catch (error) {
            console.error(`${store.$id} initialization failed:`, error)
            store.setError(error)
        } finally {
            store.setLoading(false)
        }
    }

    // 將初始化方法添加到 store
    store.initialize = initialize
})

// 錯誤處理插件
pinia.use(({ store }) => {
    store.$onAction(({ name, args, after, onError }) => {
        after(() => {
            // 動作成功後的處理
        })

        onError((error) => {
            console.error(`Error in ${store.$id}/${name}:`, error)
            store.setError(error)
        })
    })
})

// 開發工具插件（僅在開發環境啟用）
if (process.env.NODE_ENV === 'development') {
    pinia.use(({ store }) => {
        store.$subscribe((mutation, state) => {
            console.log(`[${store.$id}] ${mutation.type}`, mutation.payload)
        })
    })
}

export default pinia