<template>
  <footer class="site-footer">
    <div class="footer-content">
      <!-- 主要內容區 -->
      <div class="footer-sections">
        <!-- 關於我們 -->
        <div class="footer-section">
          <h3>關於市民卡</h3>
          <p>市民卡是一個整合性的智慧城市服務平台，提供電影訂票、電子支付、優惠管理等多項便民服務。</p>
        </div>

        <!-- 快速連結 -->
        <div class="footer-section">
          <h3>快速連結</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/movies">電影訂票</router-link>
            </li>
            <li>
              <router-link to="/wallet">電子錢包</router-link>
            </li>
            <li>
              <router-link to="/discounts">優惠資訊</router-link>
            </li>
            <li>
              <router-link to="/member">會員中心</router-link>
            </li>
          </ul>
        </div>

        <!-- 聯絡資訊 -->
        <div class="footer-section">
          <h3>聯絡我們</h3>
          <ul class="contact-info">
            <li>
              <i class="fas fa-phone"></i>
              <span>客服專線：0800-000-000</span>
            </li>
            <li>
              <i class="fas fa-envelope"></i>
              <span>Email：support@citizencard.com</span>
            </li>
            <li>
              <i class="fas fa-clock"></i>
              <span>服務時間：週一至週五 9:00-18:00</span>
            </li>
          </ul>
        </div>

        <!-- 社群媒體 -->
        <div class="footer-section">
          <h3>關注我們</h3>
          <div class="social-links">
            <a href="#" class="social-link" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link" title="Line">
              <i class="fab fa-line"></i>
            </a>
            <a href="#" class="social-link" title="Youtube">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- 下載 App -->
      <div class="app-download">
        <h3>下載市民卡 App</h3>
        <div class="app-buttons">
          <a href="#" class="app-button">
            <i class="fab fa-apple"></i>
            <span>App Store</span>
          </a>
          <a href="#" class="app-button">
            <i class="fab fa-google-play"></i>
            <span>Google Play</span>
          </a>
        </div>
      </div>

      <!-- 版權資訊 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} 市民卡系統. All rights reserved.</p>
        </div>
        <div class="terms-links">
          <router-link to="/privacy">隱私權政策</router-link>
          <router-link to="/terms">使用條款</router-link>
          <router-link to="/sitemap">網站地圖</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',

  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.site-footer {
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: var(--spacing-xl) 0;
  margin-top: auto;
}

.footer-content {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.footer-sections {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.footer-section h3 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.footer-links,
.contact-info {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li,
.contact-info li {
  margin-bottom: var(--spacing-sm);
}

.footer-links a {
  color: var(--text-light);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary-color);
}

.contact-info li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  transition: all var(--transition-fast);
}

.social-link:hover {
  background-color: var(--primary-color);
  transform: translateY(-2px);
}

.app-download {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.app-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.app-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.app-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.footer-bottom {
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terms-links {
  display: flex;
  gap: var(--spacing-md);
}

.terms-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.terms-links a:hover {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .footer-sections {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-bottom {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}

@media (max-width: 576px) {
  .footer-sections {
    grid-template-columns: 1fr;
  }

  .app-buttons {
    flex-direction: column;
  }
}
</style>