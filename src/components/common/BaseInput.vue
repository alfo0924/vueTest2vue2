<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="id" class="base-input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div class="input-container">
      <input
          :id="id"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          :maxlength="maxlength"
          :minlength="minlength"
          :pattern="pattern"
          :autocomplete="autocomplete"
          class="base-input"
          :class="{
          'base-input--error': hasError,
          'base-input--success': isValid && modelValue,
          'base-input--disabled': disabled
        }"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
      />

      <div v-if="icon" class="input-icon">
        <i :class="icon"></i>
      </div>

      <div v-if="hasError" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="helpText" class="help-text">
        {{ helpText }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export default defineComponent({
  name: 'BaseInput',

  props: {
    // v-model 綁定值
    modelValue: {
      type: [String, Number],
      default: ''
    },
    // 輸入框標籤
    label: {
      type: String,
      default: ''
    },
    // 輸入框類型
    type: {
      type: String,
      default: 'text',
      validator: (value) => {
        return ['text', 'password', 'email', 'number', 'tel', 'url'].includes(value)
      }
    },
    // 佔位符
    placeholder: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否必填
    required: {
      type: Boolean,
      default: false
    },
    // 最大長度
    maxlength: {
      type: Number,
      default: undefined
    },
    // 最小長度
    minlength: {
      type: Number,
      default: undefined
    },
    // 驗證模式
    pattern: {
      type: String,
      default: ''
    },
    // 自動完成
    autocomplete: {
      type: String,
      default: 'off'
    },
    // 錯誤訊息
    errorMessage: {
      type: String,
      default: ''
    },
    // 幫助文字
    helpText: {
      type: String,
      default: ''
    },
    // 圖標類名
    icon: {
      type: String,
      default: ''
    },
    // 自定義驗證函數
    validator: {
      type: Function,
      default: null
    }
  },

  emits: ['update:modelValue', 'blur', 'focus', 'input', 'validate'],

  data() {
    return {
      id: `base-input-${uuidv4()}`,
      isValid: true,
      isDirty: false
    }
  },

  computed: {
    hasError() {
      return !this.isValid && this.isDirty
    }
  },

  methods: {
    handleInput(event) {
      const value = event.target.value
      this.$emit('update:modelValue', value)
      this.$emit('input', event)
      this.validate(value)
    },

    handleBlur(event) {
      this.isDirty = true
      this.$emit('blur', event)
      this.validate(this.modelValue)
    },

    handleFocus(event) {
      this.$emit('focus', event)
    },

    validate(value) {
      if (this.validator) {
        this.isValid = this.validator(value)
      } else {
        this.isValid = true

        // 必填驗證
        if (this.required && !value) {
          this.isValid = false
        }

        // 長度驗證
        if (this.maxlength && value.length > this.maxlength) {
          this.isValid = false
        }
        if (this.minlength && value.length < this.minlength) {
          this.isValid = false
        }

        // 模式驗證
        if (this.pattern && !new RegExp(this.pattern).test(value)) {
          this.isValid = false
        }

        // 郵件驗證
        if (this.type === 'email' && value) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          this.isValid = emailPattern.test(value)
        }
      }

      this.$emit('validate', {
        value,
        isValid: this.isValid
      })
    }
  }
})
</script>

<style scoped>
.base-input-wrapper {
  margin-bottom: var(--spacing-md);
}

.base-input-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.required-mark {
  color: var(--danger-color);
  margin-left: var(--spacing-xs);
}

.input-container {
  position: relative;
}

.base-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: all var(--transition-fast);
}

.base-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.base-input--error {
  border-color: var(--danger-color);
}

.base-input--success {
  border-color: var(--success-color);
}

.base-input--disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.error-message {
  margin-top: var(--spacing-xs);
  color: var(--danger-color);
  font-size: var(--font-size-sm);
}

.help-text {
  margin-top: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
</style>