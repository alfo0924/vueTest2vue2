<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" :class="modalSize">
        <!-- Modal Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" :class="{ 'has-footer': hasFooter }">
          <slot></slot>
        </div>

        <!-- Modal Footer -->
        <div v-if="hasFooter" class="modal-footer">
          <slot name="footer">
            <button
                v-if="showCancelButton"
                class="btn btn-secondary"
                @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
                v-if="showConfirmButton"
                class="btn btn-primary"
                @click="handleConfirm"
                :disabled="confirmDisabled"
            >
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    // 控制模態框顯示
    modelValue: {
      type: Boolean,
      required: true
    },
    // 模態框標題
    title: {
      type: String,
      default: ''
    },
    // 模態框大小
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'full'].includes(value)
    },
    // 是否顯示取消按鈕
    showCancelButton: {
      type: Boolean,
      default: true
    },
    // 是否顯示確認按鈕
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    // 取消按鈕文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 確認按鈕文字
    confirmText: {
      type: String,
      default: '確認'
    },
    // 確認按鈕是否禁用
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    // 點擊遮罩是否關閉
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:modelValue', 'cancel', 'confirm'],

  computed: {
    modalSize() {
      return `modal-${this.size}`
    },
    hasFooter() {
      return this.showCancelButton || this.showConfirmButton || this.$slots.footer
    }
  },

  methods: {
    closeModal() {
      if (this.closeOnClickOverlay) {
        this.$emit('update:modelValue', false)
      }
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:modelValue', false)
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  },

  mounted() {
    // 監聽 ESC 鍵關閉模態框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modelValue) {
        this.closeModal()
      }
    })
  },

  beforeUnmount() {
    // 移除事件監聽
    document.removeEventListener('keydown', this.closeModal)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.modal-container {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Modal sizes */
.modal-small {
  width: 300px;
}

.modal-medium {
  width: 500px;
}

.modal-large {
  width: 800px;
}

.modal-full {
  width: 95vw;
  height: 90vh;
}

.modal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--danger-color);
}

.modal-body {
  padding: var(--spacing-md);
  overflow-y: auto;
  flex-grow: 1;
}

.modal-body.has-footer {
  padding-bottom: 0;
}

.modal-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 過渡動畫 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform var(--transition-normal);
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(-20px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-container {
    width: 95% !important;
    margin: var(--spacing-sm);
  }

  .modal-body {
    max-height: calc(90vh - 120px);
  }
}
</style>