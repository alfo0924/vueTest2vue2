import request from './api/axios.config'

class DiscountService {
    /**
     * 獲取優惠列表
     * @param {Object} params - 查詢參數
     * @returns {Promise}
     */
    async getDiscounts(params = {}) {
        try {
            return await request.get('/discounts', { params })
        } catch (error) {
            throw this.handleError(error, '獲取優惠列表失敗')
        }
    }

    /**
     * 獲取優惠詳情
     * @param {number} discountId - 優惠ID
     * @returns {Promise}
     */
    async getDiscountById(discountId) {
        try {
            return await request.get(`/discounts/${discountId}`)
        } catch (error) {
            throw this.handleError(error, '獲取優惠詳情失敗')
        }
    }

    /**
     * 獲取會員可用優惠
     * @returns {Promise}
     */
    async getMemberDiscounts() {
        try {
            return await request.get('/discounts/member')
        } catch (error) {
            throw this.handleError(error, '獲取會員優惠失敗')
        }
    }

    /**
     * 使用優惠
     * @param {number} discountId - 優惠ID
     * @param {Object} useData - 使用資料
     * @returns {Promise}
     */
    async useDiscount(discountId, useData) {
        try {
            return await request.post(`/discounts/${discountId}/use`, useData)
        } catch (error) {
            throw this.handleError(error, '使用優惠失敗')
        }
    }

    /**
     * 檢查優惠是否可用
     * @param {number} discountId - 優惠ID
     * @returns {Promise}
     */
    async checkDiscountAvailability(discountId) {
        try {
            return await request.get(`/discounts/${discountId}/check`)
        } catch (error) {
            throw this.handleError(error, '檢查優惠可用性失敗')
        }
    }

    /**
     * 獲取優惠使用記錄
     * @param {Object} params - 查詢參數
     * @returns {Promise}
     */
    async getDiscountUsageHistory(params = {}) {
        try {
            return await request.get('/discounts/usage-history', { params })
        } catch (error) {
            throw this.handleError(error, '獲取優惠使用記錄失敗')
        }
    }

    /**
     * 計算優惠金額
     * @param {number} discountId - 優惠ID
     * @param {number} originalAmount - 原始金額
     * @returns {Promise}
     */
    async calculateDiscountAmount(discountId, originalAmount) {
        try {
            return await request.post('/discounts/calculate', {
                discountId,
                originalAmount
            })
        } catch (error) {
            throw this.handleError(error, '計算優惠金額失敗')
        }
    }

    /**
     * 驗證優惠碼
     * @param {string} code - 優惠碼
     * @returns {Promise}
     */
    async validateDiscountCode(code) {
        try {
            return await request.post('/discounts/validate-code', { code })
        } catch (error) {
            throw this.handleError(error, '驗證優惠碼失敗')
        }
    }

    /**
     * 格式化優惠資料
     * @param {Object} discount - 優惠資料
     * @returns {Object}
     */
    formatDiscountData(discount) {
        return {
            id: discount.DiscountID,
            name: discount.DiscountName,
            description: discount.Description,
            validUntil: discount.ValidUntil,
            usageLimit: discount.UsageLimit,
            usageCount: discount.UsageCount || 0,
            isActive: this.isDiscountActive(discount),
            remainingUses: this.calculateRemainingUses(discount)
        }
    }

    /**
     * 檢查優惠是否有效
     * @param {Object} discount - 優惠資料
     * @returns {boolean}
     */
    isDiscountActive(discount) {
        const now = new Date()
        const validUntil = new Date(discount.ValidUntil)
        return validUntil > now &&
            (!discount.UsageLimit ||
                (discount.UsageCount || 0) < discount.UsageLimit)
    }

    /**
     * 計算剩餘使用次數
     * @param {Object} discount - 優惠資料
     * @returns {number|null}
     */
    calculateRemainingUses(discount) {
        if (!discount.UsageLimit) return null
        return discount.UsageLimit - (discount.UsageCount || 0)
    }

    /**
     * 錯誤處理
     * @param {Error} error - 錯誤對象
     * @param {string} defaultMessage - 預設錯誤訊息
     * @returns {Error}
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    return new Error('請求參數錯誤')
                case 404:
                    return new Error('優惠不存在')
                case 409:
                    return new Error('優惠已被使用或已過期')
                case 422:
                    return new Error('優惠條件不符合')
                default:
                    return new Error(error.response.data?.message || defaultMessage)
            }
        }
        return new Error(defaultMessage)
    }
}

export default new DiscountService()