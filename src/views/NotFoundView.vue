<template>
  <div class="not-found">
    <div class="not-found-content">
      <!-- 錯誤代碼 -->
      <div class="error-code">404</div>

      <!-- 錯誤訊息 -->
      <h1 class="error-title">找不到頁面</h1>
      <p class="error-message">
        抱歉，您要尋找的頁面不存在或已被移除。
      </p>

      <!-- 建議選項 -->
      <div class="suggestions">
        <h2>您可以：</h2>
        <ul>
          <li>檢查網址是否正確</li>
          <li>返回上一頁重試</li>
          <li>回到首頁重新開始</li>
        </ul>
      </div>

      <!-- 操作按鈕 -->
      <div class="actions">
        <BaseButton
            type="secondary"
            text="返回上一頁"
            icon="fas fa-arrow-left"
            @click="goBack"
            class="action-btn"
        />

        <BaseButton
            type="primary"
            text="回到首頁"
            icon="fas fa-home"
            @click="goHome"
            class="action-btn"
        />
      </div>

      <!-- 聯絡支援 -->
      <div class="support">
        <p>
          如果您認為這是個錯誤，請
          <a href="mailto:support@citizencard.com">聯絡我們的支援團隊</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

export default {
  name: 'NotFoundView',

  components: {
    BaseButton
  },

  setup() {
    const router = useRouter()

    // 返回上一頁
    const goBack = () => {
      router.back()
    }

    // 回到首頁
    const goHome = () => {
      router.push('/')
    }

    return {
      goBack,
      goHome
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
}

.not-found-content {
  max-width: 600px;
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.error-code {
  font-size: 8rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-md);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.suggestions {
  margin: var(--spacing-lg) 0;
  text-align: left;
}

.suggestions h2 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.suggestions ul {
  list-style: none;
  padding: 0;
  color: var(--text-secondary);
}

.suggestions li {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  position: relative;
}

.suggestions li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin: var(--spacing-xl) 0;
}

.action-btn {
  min-width: 150px;
}

.support {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.support a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.support a:hover {
  text-decoration: underline;
}

/* 深色模式適配 */
:deep(.dark-mode) .not-found-content {
  background-color: var(--bg-secondary);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }

  .actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.not-found-content {
  animation: fadeIn 0.5s ease-out;
}
</style>