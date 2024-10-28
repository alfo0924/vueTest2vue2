import discountService from '@/services/discountService'

const state = {
    discounts: [],
    memberDiscounts: [],
    currentDiscount: null,
    usageHistory: [],
    loading: false,
    error: null,
    filters: {
        type: null,
        status: 'active' // 'active', 'expired', 'all'
    }
}

const getters = {
    // 獲取所有優惠
    getAllDiscounts: (state) => state.discounts,

    // 獲取會員可用優惠
    getMemberDiscounts: (state) => state.memberDiscounts,

    // 獲取當前優惠
    getCurrentDiscount: (state) => state.currentDiscount,

    // 獲取使用記錄
    getUsageHistory: (state) => state.usageHistory,

    // 獲取載入狀態
    isLoading: (state) => state.loading,

    // 獲取錯誤訊息
    getError: (state) => state.error,

    // 獲取篩選後的優惠
    getFilteredDiscounts: (state) => {
        let filtered = [...state.discounts]

        // 依類型篩選
        if (state.filters.type) {
            filtered = filtered.filter(discount =>
                discount.DiscountType === state.filters.type
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
                discount.UsageCount < discount.UsageLimit)
    }
}

const mutations = {
    SET_DISCOUNTS(state, discounts) {
        state.discounts = discounts
    },

    SET_MEMBER_DISCOUNTS(state, discounts) {
        state.memberDiscounts = discounts
    },

    SET_CURRENT_DISCOUNT(state, discount) {
        state.currentDiscount = discount
    },

    SET_USAGE_HISTORY(state, history) {
        state.usageHistory = history
    },

    SET_LOADING(state, status) {
        state.loading = status
    },

    SET_ERROR(state, error) {
        state.error = error
    },

    SET_FILTERS(state, filters) {
        state.filters = { ...state.filters, ...filters }
    },

    UPDATE_DISCOUNT_USAGE(state, { discountId, increment = true }) {
        const discount = state.discounts.find(d => d.DiscountID === discountId)
        if (discount) {
            discount.UsageCount = (discount.UsageCount || 0) + (increment ? 1 : -1)
        }
    }
}

const actions = {
    // 獲取所有優惠
    async fetchDiscounts({ commit }) {
        try {
            commit('SET_LOADING', true)
            const discounts = await discountService.getDiscounts()
            commit('SET_DISCOUNTS', discounts)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取會員可用優惠
    async fetchMemberDiscounts({ commit }) {
        try {
            commit('SET_LOADING', true)
            const discounts = await discountService.getMemberDiscounts()
            commit('SET_MEMBER_DISCOUNTS', discounts)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取優惠詳情
    async fetchDiscountById({ commit }, discountId) {
        try {
            commit('SET_LOADING', true)
            const discount = await discountService.getDiscountById(discountId)
            commit('SET_CURRENT_DISCOUNT', discount)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 使用優惠
    async useDiscount({ commit }, { discountId, useData }) {
        try {
            commit('SET_LOADING', true)
            await discountService.useDiscount(discountId, useData)
            commit('UPDATE_DISCOUNT_USAGE', { discountId })
            // 重新獲取會員優惠列表
            await this.dispatch('fetchMemberDiscounts')
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 獲取使用記錄
    async fetchUsageHistory({ commit }, params) {
        try {
            commit('SET_LOADING', true)
            const history = await discountService.getDiscountUsageHistory(params)
            commit('SET_USAGE_HISTORY', history)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 檢查優惠可用性
    async checkDiscountAvailability({ commit }, discountId) {
        try {
            commit('SET_LOADING', true)
            return await discountService.checkDiscountAvailability(discountId)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 計算優惠金額
    async calculateDiscountAmount({ commit }, { discountId, originalAmount }) {
        try {
            commit('SET_LOADING', true)
            return await discountService.calculateDiscountAmount(discountId, originalAmount)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 設置篩選條件
    setFilters({ commit }, filters) {
        commit('SET_FILTERS', filters)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}