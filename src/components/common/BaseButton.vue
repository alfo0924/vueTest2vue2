<template>
  <button
      :class="[
      'base-button',
      `base-button--${type}`,
      `base-button--${size}`,
      { 'base-button--block': block },
      { 'base-button--loading': loading },
      { 'base-button--disabled': disabled }
    ]"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </span>

    <!-- Icon (if provided) -->
    <i v-if="icon && !loading" :class="['button-icon', icon]"></i>

    <!-- Button Content -->
    <span class="button-content" :class="{ 'ml-2': icon }">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    // 按鈕類型
    type: {
      type: String,
      default: 'primary',
      validator: value => [
        'primary',
        'secondary',
        'success',
        'warning',
        'danger',
        'info',
        'light',
        'dark'
      ].includes(value)
    },
    // 按鈕大小
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 是否為塊級按鈕
    block: {
      type: Boolean,
      default: false
    },
    // 按鈕文字
    text: {
      type: String,
      default: ''
    },
    // Font Awesome 圖標類名
    icon: {
      type: String,
      default: ''
    },
    // 載入狀態
    loading: {
      type: Boolean,
      default: false
    },
    // 禁用狀態
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick(event) {
      if (!this.loading && !this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: var(--font-size-md);
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
}

/* 按鈕類型樣式 */
.base-button--primary {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.base-button--secondary {
  background-color: var(--secondary-color);
  color: var(--text-light);
}

.base-button--success {
  background-color: var(--success-color);
  color: var(--text-light);
}

.base-button--warning {
  background-color: var(--warning-color);
  color: var(--text-dark);
}

.base-button--danger {
  background-color: var(--danger-color);
  color: var(--text-light);
}

/* 按鈕大小 */
.base-button--small {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-sm);
}

.base-button--large {
  padding: 0.75rem 1.5rem;
  font-size: var(--font-size-lg);
}

/* 塊級按鈕 */
.base-button--block {
  display: flex;
  width: 100%;
}

/* 載入狀態 */
.base-button--loading {
  opacity: 0.8;
  cursor: wait;
}

/* 禁用狀態 */
.base-button--disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Hover 效果 */
.base-button:not(.base-button--disabled):not(.base-button--loading):hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Active 效果 */
.base-button:not(.base-button--disabled):not(.base-button--loading):active {
  transform: translateY(1px);
}

/* 圖標樣式 */
.button-icon {
  margin-right: 0.5rem;
}

/* Loading spinner 動畫 */
.spinner {
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>