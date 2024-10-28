import api from './api'

class WalletService {
    /**
     * 獲取錢包資訊
     * @returns {Promise} 錢包資訊
     */
    async getWalletInfo() {
        try {
            const response = await api.walletAPI.getWalletInfo()
            return this.formatWalletInfo(response)
        } catch (error) {
            throw this.handleError(error, '獲取錢包資訊失敗')
        }
    }

    /**
     * 儲值
     * @param {number} amount - 儲值金額
     * @returns {Promise} 儲值結果
     */
    async topUp(amount) {
        try {
            if (!this.validateAmount(amount)) {
                throw new Error('無效的儲值金額')
            }
            const response = await api.walletAPI.topUp({ amount })
            return response
        } catch (error) {
            throw this.handleError(error, '儲值失敗')
        }
    }

    /**
     * 支付
     * @param {Object} paymentData - 支付資料
     * @returns {Promise} 支付結果
     */
    async pay(paymentData) {
        try {
            if (!this.validatePaymentData(paymentData)) {
                throw new Error('無效的支付資料')
            }
            const response = await api.walletAPI.pay(paymentData)
            return response
        } catch (error) {
            throw this.handleError(error, '支付失敗')
        }
    }

    /**
     * 獲取交易記錄
     * @param {Object} params - 查詢參數
     * @returns {Promise} 交易記錄列表
     */
    async getTransactions(params = {}) {
        try {
            const response = await api.walletAPI.getTransactions(params)
            return response.map(this.formatTransaction)
        } catch (error) {
            throw this.handleError(error, '獲取交易記錄失敗')
        }
    }

    /**
     * 獲取特定交易詳情
     * @param {string} transactionId - 交易ID
     * @returns {Promise} 交易詳情
     */
    async getTransactionDetails(transactionId) {
        try {
            const response = await api.walletAPI.getTransactions({ transactionId })
            return this.formatTransaction(response)
        } catch (error) {
            throw this.handleError(error, '獲取交易詳情失敗')
        }
    }

    /**
     * 檢查餘額是否足夠
     * @param {number} amount - 檢查金額
     * @returns {Promise<boolean>} 餘額是否足夠
     */
    async checkBalance(amount) {
        try {
            const walletInfo = await this.getWalletInfo()
            return walletInfo.balance >= amount
        } catch (error) {
            throw this.handleError(error, '檢查餘額失敗')
        }
    }

    /**
     * 退款
     * @param {Object} refundData - 退款資料
     * @returns {Promise} 退款結果
     */
    async refund(refundData) {
        try {
            if (!this.validateRefundData(refundData)) {
                throw new Error('無效的退款資料')
            }
            const response = await api.walletAPI.refund(refundData)
            return response
        } catch (error) {
            throw this.handleError(error, '退款失敗')
        }
    }

    /**
     * 驗證金額
     * @param {number} amount - 金額
     * @returns {boolean} 驗證結果
     */
    validateAmount(amount) {
        return amount && amount > 0 && amount <= 10000
    }

    /**
     * 驗證支付資料
     * @param {Object} paymentData - 支付資料
     * @returns {boolean} 驗證結果
     */
    validatePaymentData(paymentData) {
        return (
            paymentData &&
            paymentData.amount &&
            this.validateAmount(paymentData.amount) &&
            paymentData.purpose
        )
    }

    /**
     * 驗證退款資料
     * @param {Object} refundData - 退款資料
     * @returns {boolean} 驗證結果
     */
    validateRefundData(refundData) {
        return (
            refundData &&
            refundData.transactionId &&
            refundData.amount &&
            this.validateAmount(refundData.amount)
        )
    }

    /**
     * 格式化錢包資訊
     * @param {Object} data - 原始資料
     * @returns {Object} 格式化後的資料
     */
    formatWalletInfo(data) {
        return {
            walletId: data.WalletID,
            balance: data.Balance,
            cardNumber: data.CardNumber,
            cardType: data.CardType,
            lastUpdated: new Date(data.LastUpdated)
        }
    }

    /**
     * 格式化交易記錄
     * @param {Object} transaction - 交易記錄
     * @returns {Object} 格式化後的交易記錄
     */
    formatTransaction(transaction) {
        return {
            transactionId: transaction.TransactionID,
            type: transaction.TransactionType,
            amount: transaction.Amount,
            balance: transaction.Balance,
            description: transaction.Description,
            status: transaction.Status,
            createdAt: new Date(transaction.TransactionTime)
        }
    }

    /**
     * 處理錯誤
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 默認錯誤訊息
     * @returns {Error} 處理後的錯誤
     */
    handleError(error, defaultMessage) {
        console.error('WalletService Error:', error)

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    return new Error('請求參數錯誤')
                case 401:
                    return new Error('請重新登入')
                case 403:
                    return new Error('權限不足')
                case 404:
                    return new Error('資源不存在')
                case 409:
                    return new Error('餘額不足')
                case 500:
                    return new Error('系統錯誤，請稍後再試')
                default:
                    return new Error(defaultMessage)
            }
        }

        if (error.request) {
            return new Error('網路連線錯誤，請檢查網路狀態')
        }

        return new Error(defaultMessage)
    }
}

export default new WalletService()