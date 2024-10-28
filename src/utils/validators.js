/**
 * 驗證工具類
 */

// Email 驗證
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
        isValid: regex.test(email),
        message: regex.test(email) ? '' : '請輸入有效的電子郵件地址'
    }
}

// 密碼驗證
export const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*]/.test(password)

    const isValid = password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar

    let message = ''
    if (!isValid) {
        message = '密碼必須包含:'
        if (password.length < minLength) message += ' 至少8個字符'
        if (!hasUpperCase) message += ' 至少一個大寫字母'
        if (!hasLowerCase) message += ' 至少一個小寫字母'
        if (!hasNumbers) message += ' 至少一個數字'
        if (!hasSpecialChar) message += ' 至少一個特殊字符(!@#$%^&*)'
    }

    return { isValid, message }
}

// 手機號碼驗證
export const validatePhone = (phone) => {
    const regex = /^09\d{8}$/
    return {
        isValid: regex.test(phone),
        message: regex.test(phone) ? '' : '請輸入有效的手機號碼'
    }
}

// 身分證字號驗證
export const validateID = (id) => {
    const regex = /^[A-Z][12]\d{8}$/
    return {
        isValid: regex.test(id),
        message: regex.test(id) ? '' : '請輸入有效的身分證字號'
    }
}

// 卡號驗證
export const validateCardNumber = (cardNumber) => {
    const regex = /^\d{16}$/
    return {
        isValid: regex.test(cardNumber),
        message: regex.test(cardNumber) ? '' : '請輸入有效的卡號(16位數字)'
    }
}

// 金額驗證
export const validateAmount = (amount) => {
    const isValid = !isNaN(amount) &&
        amount > 0 &&
        amount <= 10000 &&
        Number.isInteger(Number(amount))

    return {
        isValid,
        message: isValid ? '' : '請輸入有效的金額(1-10000之間的整數)'
    }
}

// 座位號碼驗證
export const validateSeatNumber = (seatNumber) => {
    const regex = /^[A-Z]\d{1,2}$/
    return {
        isValid: regex.test(seatNumber),
        message: regex.test(seatNumber) ? '' : '請輸入有效的座位號碼(如:A1)'
    }
}

// 日期時間驗證
export const validateDateTime = (dateTime) => {
    const date = new Date(dateTime)
    const isValid = date instanceof Date && !isNaN(date)
    return {
        isValid,
        message: isValid ? '' : '請輸入有效的日期時間'
    }
}

// 必填欄位驗證
export const validateRequired = (value, fieldName) => {
    const isValid = value !== null && value !== undefined && value !== ''
    return {
        isValid,
        message: isValid ? '' : `${fieldName}為必填欄位`
    }
}

// 長度驗證
export const validateLength = (value, { min, max, fieldName }) => {
    const length = value.length
    const isValid = length >= min && length <= max
    return {
        isValid,
        message: isValid ? '' : `${fieldName}長度必須在${min}到${max}個字符之間`
    }
}

// 數值範圍驗證
export const validateRange = (value, { min, max, fieldName }) => {
    const num = Number(value)
    const isValid = !isNaN(num) && num >= min && num <= max
    return {
        isValid,
        message: isValid ? '' : `${fieldName}必須在${min}到${max}之間`
    }
}

// 表單驗證
export const validateForm = (formData, rules) => {
    const errors = {}
    let isValid = true

    Object.keys(rules).forEach(field => {
        const value = formData[field]
        const fieldRules = rules[field]

        fieldRules.forEach(rule => {
            if (!rule.validator(value).isValid) {
                errors[field] = rule.validator(value).message
                isValid = false
            }
        })
    })

    return { isValid, errors }
}

// 組合驗證器
export const composeValidators = (...validators) => (value) => {
    for (const validator of validators) {
        const result = validator(value)
        if (!result.isValid) {
            return result
        }
    }
    return { isValid: true, message: '' }
}

// 使用示例：
const loginFormRules = {
    email: [
        { validator: (value) => validateRequired(value, '電子郵件') },
        { validator: validateEmail }
    ],
    password: [
        { validator: (value) => validateRequired(value, '密碼') },
        { validator: validatePassword }
    ]
}

export const validateLoginForm = (formData) => {
    return validateForm(formData, loginFormRules)
}