import walletService from '@/services/walletService'

export const useWalletStore = defineStore('wallet', {
    state: () => ({
        // 錢包資訊
        walletInfo: {
            walletId: null,
            balance: 0,
            cardNumber: '',
            cardType: ''
        },

        // 交易記錄
        transactions: [],

        // 分頁資訊
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        },

        // 載入狀態
        loading: false,

        // 錯誤訊息
        error: null
    }),

    getters: {
        // 取得錢包餘額
        currentBalance: (state) => state.walletInfo.balance,

        // 取得卡片資訊
        cardInfo: (state) => ({
            cardNumber: state.walletInfo.cardNumber,
            cardType: state.walletInfo.cardType
        }),

        // 取得最近交易記錄
        recentTransactions: (state) => state.transactions.slice(0, 5),

        // 取得所有交易記錄
        allTransactions: (state) => state.transactions,

        // 計算收入總額
        totalIncome: (state) => {
            return state.transactions
                .filter(t => t.type === '充值' || t.type === '退款')
                .reduce((sum, t) => sum + t.amount, 0)
        },

        // 計算支出總額
        totalExpense: (state) => {
            return state.transactions
                .filter(t => t.type === '支付')
                .reduce((sum, t) => sum + t.amount, 0)
        },

        // 檢查是否正在載入
        isLoading: (state) => state.loading,

        // 取得錯誤訊息
        getError: (state) => state.error
    },

    actions: {
        // 獲取錢包資訊
        async fetchWalletInfo() {
            try {
                this.loading = true
                this.error = null
                const response = await walletService.getWalletInfo()
                this.walletInfo = response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 儲值
        async topUp(amount) {
            try {
                this.loading = true
                this.error = null
                const response = await walletService.topUp(amount)
                await this.fetchWalletInfo()
                await this.fetchTransactions()
                return response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 支付
        async pay(paymentData) {
            try {
                this.loading = true
                this.error = null
                const response = await walletService.pay(paymentData)
                await this.fetchWalletInfo()
                await this.fetchTransactions()
                return response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取交易記錄
        async fetchTransactions(params = {}) {
            try {
                this.loading = true
                this.error = null
                const response = await walletService.getTransactions({
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params
                })
                this.transactions = response.transactions
                this.pagination.total = response.total
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 檢查餘額是否足夠
        async checkBalance(amount) {
            try {
                const response = await walletService.checkBalance(amount)
                return response
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        // 退款
        async refund(refundData) {
            try {
                this.loading = true
                this.error = null
                const response = await walletService.refund(refundData)
                await this.fetchWalletInfo()
                await this.fetchTransactions()
                return response
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 設置分頁
        setPage(page) {
            this.pagination.page = page
        },

        // 設置每頁筆數
        setLimit(limit) {
            this.pagination.limit = limit
            this.pagination.page = 1
        },

        // 清除錯誤訊息
        clearError() {
            this.error = null
        }
    }
})