// src/services/discountService.js
import request from './api/axios.config'

class DiscountService {
    /**
     * 獲取優惠列表
     * @param {Object} params - 查詢參數 (type, status, page, limit, sortBy)
     * @returns {Promise<Object>} 優惠列表和分頁資訊
     */
    async getDiscounts(params = {}) {
        try {
            const response = await request.get('/discounts', { params })
            return {
                discounts: response.data.map(this.formatDiscountData),
                pagination: response.pagination
            }
        } catch (error) {
            throw this.handleError(error, '獲取優惠列表失敗')
        }
    }

    /**
     * 獲取優惠詳情
     * @param {number} discountId - 優惠ID
     * @returns {Promise<Object>} 優惠詳細資訊
     */
    async getDiscountById(discountId) {
        try {
            const response = await request.get(`/discounts/${discountId}`)
            return this.formatDiscountData(response.data)
        } catch (error) {
            throw this.handleError(error, '獲取優惠詳情失敗')
        }
    }

    /**
     * 獲取會員可用優惠
     * @returns {Promise<Array>} 會員可用的優惠列表
     */
    async getMemberDiscounts() {
        try {
            const response = await request.get('/discounts/member')
            return response.data.map(this.formatDiscountData)
        } catch (error) {
            throw this.handleError(error, '獲取會員優惠失敗')
        }
    }

    /**
     * 使用優惠
     * @param {number} discountId - 優惠ID
     * @param {Object} useData - 使用資料 (amount, productId, etc.)
     * @returns {Promise<Object>} 使用結果
     */
    async useDiscount(discountId, useData) {
        try {
            const response = await request.post(`/discounts/${discountId}/use`, useData)
            return {
                success: true,
                discountAmount: response.data.discountAmount,
                finalAmount: response.data.finalAmount,
                message: response.data.message
            }
        } catch (error) {
            throw this.handleError(error, '使用優惠失敗')
        }
    }

    /**
     * 檢查優惠是否可用
     * @param {number} discountId - 優惠ID
     * @returns {Promise<Object>} 可用性檢查結果
     */
    async checkDiscountAvailability(discountId) {
        try {
            const response = await request.get(`/discounts/${discountId}/check`)
            return {
                isAvailable: response.data.isAvailable,
                reason: response.data.reason,
                remainingUses: response.data.remainingUses
            }
        } catch (error) {
            throw this.handleError(error, '檢查優惠可用性失敗')
        }
    }

    /**
     * 獲取優惠使用記錄
     * @param {Object} params - 查詢參數 (startDate, endDate, page, limit)
     * @returns {Promise<Object>} 使用記錄和分頁資訊
     */
    async getDiscountUsageHistory(params = {}) {
        try {
            const response = await request.get('/discounts/usage-history', { params })
            return {
                history: response.data.map(record => ({
                    id: record.id,
                    discountId: record.discountId,
                    discountName: record.discountName,
                    usageTime: record.usageTime,
                    amount: record.amount,
                    status: record.status
                })),
                pagination: response.pagination
            }
        } catch (error) {
            throw this.handleError(error, '獲取優惠使用記錄失敗')
        }
    }

    /**
     * 計算優惠金額
     * @param {number} discountId - 優惠ID
     * @param {number} originalAmount - 原始金額
     * @returns {Promise<Object>} 計算結果
     */
    async calculateDiscountAmount(discountId, originalAmount) {
        try {
            const response = await request.post('/discounts/calculate', {
                discountId,
                originalAmount
            })
            return {
                originalAmount: response.data.originalAmount,
                discountAmount: response.data.discountAmount,
                finalAmount: response.data.finalAmount,
                discountDetails: response.data.discountDetails
            }
        } catch (error) {
            throw this.handleError(error, '計算優惠金額失敗')
        }
    }

    /**
     * 驗證優惠碼
     * @param {string} code - 優惠碼
     * @returns {Promise<Object>} 驗證結果
     */
    async validateDiscountCode(code) {
        try {
            const response = await request.post('/discounts/validate-code', { code })
            return {
                isValid: response.data.isValid,
                discount: response.data.discount ?
                    this.formatDiscountData(response.data.discount) : null,
                message: response.data.message
            }
        } catch (error) {
            throw this.handleError(error, '驗證優惠碼失敗')
        }
    }

    /**
     * 格式化優惠資料
     * @param {Object} discount - 優惠資料
     * @returns {Object} 格式化後的優惠資料
     */
    formatDiscountData(discount) {
        return {
            id: discount.DiscountID,
            name: discount.DiscountName,
            description: discount.Description,
            type: discount.DiscountType,
            value: discount.DiscountValue,
            minPurchase: discount.MinPurchase,
            validFrom: discount.ValidFrom,
            validUntil: discount.ValidUntil,
            usageLimit: discount.UsageLimit,
            usageCount: discount.UsageCount || 0,
            terms: discount.Terms,
            isActive: this.isDiscountActive(discount),
            remainingUses: this.calculateRemainingUses(discount),
            status: this.getDiscountStatus(discount)
        }
    }

    /**
     * 檢查優惠是否有效
     * @param {Object} discount - 優惠資料
     * @returns {boolean} 是否有效
     */
    isDiscountActive(discount) {
        const now = new Date()
        const validFrom = new Date(discount.ValidFrom)
        const validUntil = new Date(discount.ValidUntil)

        return validFrom <= now &&
            validUntil > now &&
            (!discount.UsageLimit ||
                (discount.UsageCount || 0) < discount.UsageLimit)
    }

    /**
     * 計算剩餘使用次數
     * @param {Object} discount - 優惠資料
     * @returns {number|null} 剩餘次數
     */
    calculateRemainingUses(discount) {
        if (!discount.UsageLimit) return null
        return Math.max(0, discount.UsageLimit - (discount.UsageCount || 0))
    }

    /**
     * 獲取優惠狀態
     * @param {Object} discount - 優惠資料
     * @returns {string} 狀態描述
     */
    getDiscountStatus(discount) {
        const now = new Date()
        const validFrom = new Date(discount.ValidFrom)
        const validUntil = new Date(discount.ValidUntil)

        if (now < validFrom) return 'upcoming'
        if (now > validUntil) return 'expired'
        if (discount.UsageLimit &&
            (discount.UsageCount || 0) >= discount.UsageLimit) {
            return 'depleted'
        }
        return 'active'
    }

    /**
     * 錯誤處理
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 預設錯誤訊息
     * @returns {Error} 處理後的錯誤
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            const { status, data } = error.response
            switch (status) {
                case 400:
                    return new Error(data.message || '請求參數錯誤')
                case 401:
                    return new Error('請先登入')
                case 403:
                    return new Error('無權限使用此優惠')
                case 404:
                    return new Error('優惠不存在')
                case 409:
                    return new Error('優惠已被使用或已過期')
                case 422:
                    return new Error(data.message || '優惠條件不符合')
                case 429:
                    return new Error('請求過於頻繁，請稍後再試')
                default:
                    return new Error(data?.message || defaultMessage)
            }
        }
        return new Error(error.message || defaultMessage)
    }
}

export default new DiscountService()