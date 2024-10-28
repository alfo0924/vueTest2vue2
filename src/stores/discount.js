// src/stores/discount.js
import { defineStore } from 'pinia'
import discountService from '@/services/discountService'

export const useDiscountStore = defineStore('discount', {
    state: () => ({
        discounts: [],
        memberDiscounts: [],
        currentDiscount: null,
        usageHistory: [],
        loading: false,
        error: null,
        filters: {
            type: null,
            category: null,
            status: 'active', // 'active', 'expired', 'all'
            sortBy: 'validUntil' // 'validUntil', 'usageCount', 'name'
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        }
    }),

    getters: {
        // 基本 getters
        getAllDiscounts: (state) => state.discounts,
        getMemberDiscounts: (state) => state.memberDiscounts,
        getCurrentDiscount: (state) => state.currentDiscount,
        getUsageHistory: (state) => state.usageHistory,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,

        // 篩選後的優惠
        getFilteredDiscounts: (state) => {
            let filtered = [...state.discounts]

            // 依類型篩選
            if (state.filters.type) {
                filtered = filtered.filter(discount =>
                    discount.DiscountType === state.filters.type
                )
            }

            // 依分類篩選
            if (state.filters.category) {
                filtered = filtered.filter(discount =>
                    discount.Category === state.filters.category
                )
            }

            // 依狀態篩選
            if (state.filters.status !== 'all') {
                const now = new Date()
                filtered = filtered.filter(discount => {
                    const isExpired = new Date(discount.ValidUntil) < now
                    return state.filters.status === 'active' ? !isExpired : isExpired
                })
            }

            // 排序
            filtered.sort((a, b) => {
                switch (state.filters.sortBy) {
                    case 'validUntil':
                        return new Date(b.ValidUntil) - new Date(a.ValidUntil)
                    case 'usageCount':
                        return (b.UsageCount || 0) - (a.UsageCount || 0)
                    case 'name':
                        return a.DiscountName.localeCompare(b.DiscountName)
                    default:
                        return 0
                }
            })

            return filtered
        },

        // 檢查優惠是否可用
        canUseDiscount: (state) => (discountId) => {
            const discount = state.discounts.find(d => d.DiscountID === discountId)
            if (!discount) return false

            const now = new Date()
            const validUntil = new Date(discount.ValidUntil)

            return validUntil > now &&
                (!discount.UsageLimit ||
                    (discount.UsageCount || 0) < discount.UsageLimit)
        },

        // 獲取分頁資訊
        getPagination: (state) => state.pagination
    },

    actions: {
        // 獲取所有優惠
        async fetchDiscounts(params = {}) {
            try {
                this.loading = true
                const response = await discountService.getDiscounts(params)
                this.discounts = response.data
                this.pagination = response.pagination
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取會員優惠
        async fetchMemberDiscounts() {
            try {
                this.loading = true
                const discounts = await discountService.getMemberDiscounts()
                this.memberDiscounts = discounts
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取優惠詳情
        async fetchDiscountById(discountId) {
            try {
                this.loading = true
                const discount = await discountService.getDiscountById(discountId)
                this.currentDiscount = discount
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 使用優惠
        async useDiscount({ discountId, useData }) {
            try {
                this.loading = true
                await discountService.useDiscount(discountId, useData)

                // 更新使用次數
                const discount = this.discounts.find(d => d.DiscountID === discountId)
                if (discount) {
                    discount.UsageCount = (discount.UsageCount || 0) + 1
                }

                // 重新獲取會員優惠
                await this.fetchMemberDiscounts()
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 獲取使用記錄
        async fetchUsageHistory(params) {
            try {
                this.loading = true
                const history = await discountService.getDiscountUsageHistory(params)
                this.usageHistory = history
            } catch (error) {
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // 設置篩選條件
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters }
        },

        // 重置篩選條件
        resetFilters() {
            this.filters = {
                type: null,
                category: null,
                status: 'active',
                sortBy: 'validUntil'
            }
        },

        // 清除錯誤
        clearError() {
            this.error = null
        }
    }
})