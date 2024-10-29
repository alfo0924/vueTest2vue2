// src/utils/validators.js

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

    const messages = []
    if (password.length < minLength) messages.push('至少8個字符')
    if (!hasUpperCase) messages.push('至少一個大寫字母')
    if (!hasLowerCase) messages.push('至少一個小寫字母')
    if (!hasNumbers) messages.push('至少一個數字')
    if (!hasSpecialChar) messages.push('至少一個特殊字符(!@#$%^&*)')

    return {
        isValid,
        message: isValid ? '' : `密碼必須包含: ${messages.join(', ')}`
    }
}

// 確認密碼驗證
export const validateConfirmPassword = (password, confirmPassword) => {
    const isValid = password === confirmPassword
    return {
        isValid,
        message: isValid ? '' : '兩次輸入的密碼不一致'
    }
}

// 手機號碼驗證
export const validatePhone = (phone) => {
    const regex = /^09\d{8}$/
    return {
        isValid: regex.test(phone),
        message: regex.test(phone) ? '' : '請輸入有效的台灣手機號碼 (格式: 09xxxxxxxx)'
    }
}

// 市民卡號驗證
export const validateCitizenCardNumber = (cardNumber) => {
    const regex = /^[A-Z]\d{9}$/
    return {
        isValid: regex.test(cardNumber),
        message: regex.test(cardNumber) ? '' : '請輸入有效的市民卡號 (1個英文字母加9個數字)'
    }
}

// 卡片類型驗證
export const validateCardType = (cardType) => {
    const validTypes = ['一般卡', '敬老卡', '愛心卡', '學生卡']
    const isValid = validTypes.includes(cardType)
    return {
        isValid,
        message: isValid ? '' : '請選擇有效的卡片類型'
    }
}

// 持卡人姓名驗證
export const validateHolderName = (name) => {
    const regex = /^[\u4e00-\u9fa5]{2,20}$/
    return {
        isValid: regex.test(name),
        message: regex.test(name) ? '' : '請輸入有效的中文姓名 (2-20個中文字)'
    }
}

// 金額驗證
export const validateAmount = (amount, { min = 0, max = 10000 } = {}) => {
    const num = Number(amount)
    const isValid = !isNaN(num) &&
        num >= min &&
        num <= max &&
        Number.isInteger(num)
    return {
        isValid,
        message: isValid ? '' : `請輸入有效的金額 (${min}-${max}之間的整數)`
    }
}

// 必填欄位驗證
export const validateRequired = (value, fieldName) => {
    const isValid = value !== null &&
        value !== undefined &&
        value.toString().trim() !== ''
    return {
        isValid,
        message: isValid ? '' : `${fieldName}為必填欄位`
    }
}

// 長度驗證
export const validateLength = (value, { min, max, fieldName }) => {
    const length = value.toString().length
    const isValid = length >= min && length <= max
    return {
        isValid,
        message: isValid ? '' : `${fieldName}長度必須在${min}到${max}個字符之間`
    }
}

// 註冊表單驗證規則
export const registerFormRules = {
    email: [
        { validator: (value) => validateRequired(value, '電子郵件') },
        { validator: validateEmail }
    ],
    password: [
        { validator: (value) => validateRequired(value, '密碼') },
        { validator: validatePassword }
    ],
    confirmPassword: [
        { validator: (value, formData) => validateConfirmPassword(formData.password, value) }
    ],
    phone: [
        { validator: validatePhone }
    ],
    holderName: [
        { validator: (value) => validateRequired(value, '持卡人姓名') },
        { validator: validateHolderName }
    ],
    cardType: [
        { validator: (value) => validateRequired(value, '卡片類型') },
        { validator: validateCardType }
    ]
}

// 表單驗證
export const validateForm = (formData, rules) => {
    const errors = {}
    let isValid = true

    Object.keys(rules).forEach(field => {
        const value = formData[field]
        const fieldRules = rules[field]

        for (const rule of fieldRules) {
            const result = rule.validator(value, formData)
            if (!result.isValid) {
                errors[field] = result.message
                isValid = false
                break
            }
        }
    })

    return { isValid, errors }
}

// 組合驗證器
export const composeValidators = (...validators) => (value, formData) => {
    for (const validator of validators) {
        const result = validator(value, formData)
        if (!result.isValid) {
            return result
        }
    }
    return { isValid: true, message: '' }
}

// 使用示例
export const validateRegisterForm = (formData) => {
    return validateForm(formData, registerFormRules)
}

// 登入表單驗證規則
export const loginFormRules = {
    email: [
        { validator: (value) => validateRequired(value, '電子郵件') },
        { validator: validateEmail }
    ],
    password: [
        { validator: (value) => validateRequired(value, '密碼') }
    ]
}

export const validateLoginForm = (formData) => {
    return validateForm(formData, loginFormRules)
}

export default {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validatePhone,
    validateCitizenCardNumber,
    validateCardType,
    validateHolderName,
    validateAmount,
    validateRequired,
    validateLength,
    validateForm,
    composeValidators,
    registerFormRules,
    loginFormRules,
    validateRegisterForm,
    validateLoginForm
}