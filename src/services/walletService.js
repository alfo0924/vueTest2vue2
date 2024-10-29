// src/services/walletService.js
import api from './api/axios.config'
import { handleApiError } from '@/utils/errorHandler'

class WalletService {
    /**
     * 獲取錢包資訊
     * @returns {Promise<Object>} 錢包資訊
     */
    async getWalletInfo() {
        try {
            const response = await api.get('/wallet/info')
            return this.formatWalletInfo(response.data)
        } catch (error) {
            throw this.handleError(error, '獲取錢包資訊失敗')
        }
    }

    /**
     * 儲值
     * @param {number} amount - 儲值金額
     * @returns {Promise<Object>} 儲值結果
     */
    async topUp(amount) {
        try {
            this.validateAmount(amount)
            const response = await api.post('/wallet/topup', { amount })
            return this.formatTransaction(response.data)
        } catch (error) {
            throw this.handleError(error, '儲值失敗')
        }
    }

    /**
     * 支付
     * @param {Object} paymentData - 支付資料
     * @param {number} paymentData.amount - 支付金額
     * @param {string} paymentData.purpose - 支付用途
     * @param {string} paymentData.orderId - 訂單編號
     * @returns {Promise<Object>} 支付結果
     */
    async pay(paymentData) {
        try {
            this.validatePaymentData(paymentData)
            const response = await api.post('/wallet/pay', paymentData)
            return this.formatTransaction(response.data)
        } catch (error) {
            throw this.handleError(error, '支付失敗')
        }
    }

    /**
     * 獲取交易記錄
     * @param {Object} params - 查詢參數
     * @param {number} params.page - 頁碼
     * @param {number} params.limit - 每頁筆數
     * @param {string} params.type - 交易類型
     * @param {string} params.startDate - 開始日期
     * @param {string} params.endDate - 結束日期
     * @returns {Promise<Object>} 交易記錄列表和分頁資訊
     */
    async getTransactions(params = {}) {
        try {
            const response = await api.get('/wallet/transactions', { params })
            return {
                transactions: response.data.transactions.map(this.formatTransaction),
                pagination: response.data.pagination
            }
        } catch (error) {
            throw this.handleError(error, '獲取交易記錄失敗')
        }
    }

    /**
     * 獲取特定交易詳情
     * @param {string} transactionId - 交易ID
     * @returns {Promise<Object>} 交易詳情
     */
    async getTransactionDetails(transactionId) {
        try {
            const response = await api.get(`/wallet/transactions/${transactionId}`)
            return this.formatTransaction(response.data)
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
            const response = await api.post('/wallet/check-balance', { amount })
            return response.data.isEnough
        } catch (error) {
            throw this.handleError(error, '檢查餘額失敗')
        }
    }

    /**
     * 退款
     * @param {Object} refundData - 退款資料
     * @param {string} refundData.transactionId - 原交易ID
     * @param {number} refundData.amount - 退款金額
     * @param {string} refundData.reason - 退款原因
     * @returns {Promise<Object>} 退款結果
     */
    async refund(refundData) {
        try {
            this.validateRefundData(refundData)
            const response = await api.post('/wallet/refund', refundData)
            return this.formatTransaction(response.data)
        } catch (error) {
            throw this.handleError(error, '退款失敗')
        }
    }

    /**
     * 驗證金額
     * @param {number} amount - 金額
     * @throws {Error} 驗證失敗時拋出錯誤
     */
    validateAmount(amount) {
        if (!amount || typeof amount !== 'number') {
            throw new Error('金額必須為數字')
        }
        if (amount <= 0) {
            throw new Error('金額必須大於0')
        }
        if (amount > 10000) {
            throw new Error('單次金額不能超過10,000元')
        }
    }

    /**
     * 驗證支付資料
     * @param {Object} paymentData - 支付資料
     * @throws {Error} 驗證失敗時拋出錯誤
     */
    validatePaymentData(paymentData) {
        if (!paymentData || typeof paymentData !== 'object') {
            throw new Error('無效的支付資料')
        }
        this.validateAmount(paymentData.amount)
        if (!paymentData.purpose) {
            throw new Error('請指定支付用途')
        }
        if (!paymentData.orderId) {
            throw new Error('請提供訂單編號')
        }
    }

    /**
     * 驗證退款資料
     * @param {Object} refundData - 退款資料
     * @throws {Error} 驗證失敗時拋出錯誤
     */
    validateRefundData(refundData) {
        if (!refundData || typeof refundData !== 'object') {
            throw new Error('無效的退款資料')
        }
        if (!refundData.transactionId) {
            throw new Error('請提供原交易編號')
        }
        this.validateAmount(refundData.amount)
        if (!refundData.reason) {
            throw new Error('請提供退款原因')
        }
    }

    /**
     * 格式化錢包資訊
     * @param {Object} data - 原始資料
     * @returns {Object} 格式化後的資料
     */
    formatWalletInfo(data) {
        return {
            walletId: data.wallet_id,
            memberId: data.member_id,
            balance: Number(data.balance),
            cardNumber: data.card_number,
            cardType: data.card_type,
            lastUpdated: new Date(data.last_updated),
            status: data.status,
            isActive: data.is_active
        }
    }

    /**
     * 格式化交易記錄
     * @param {Object} transaction - 交易記錄
     * @returns {Object} 格式化後的交易記錄
     */
    formatTransaction(transaction) {
        return {
            transactionId: transaction.transaction_id,
            type: transaction.type,
            amount: Number(transaction.amount),
            balance: Number(transaction.balance),
            description: transaction.description,
            status: transaction.status,
            orderId: transaction.order_id,
            createdAt: new Date(transaction.created_at),
            updatedAt: transaction.updated_at ? new Date(transaction.updated_at) : null
        }
    }

    /**
     * 處理錯誤
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 默認錯誤訊息
     * @returns {Error} 處理後的錯誤
     */
    handleError(error, defaultMessage) {
        return handleApiError(error, defaultMessage)
    }
}

export default new WalletService()