# vuetest2vue2

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```



# 市民卡系統前端專案結構

```markdown
vuetest2vue2/
├── public/                          # 靜態資源目錄
│   ├── favicon.ico                  # 網站圖標
│   └── index.html                   # HTML 模板
├── src/                            # 源代碼目錄
│   ├── assets/                     # 資源文件
│   │   ├── images/                 # 圖片資源
│   │   │   ├── logo.png           # 系統 logo
│   │   │   └── icons/             # 圖標文件
│   │   └── styles/                # 樣式文件
│   │       ├── main.css           # 主要樣式
│   │       ├── variables.css      # CSS 變量
│   │       └── components.css     # 組件樣式
│   ├── components/                 # 組件目錄
│   │   ├── common/                # 通用組件
│   │   │   ├── BaseButton.vue     # 基礎按鈕
│   │   │   ├── BaseInput.vue      # 基礎輸入框
│   │   │   ├── BaseModal.vue      # 基礎彈窗
│   │   │   └── BaseTable.vue      # 基礎表格
│   │   ├── movie/                 # 電影相關組件
│   │   │   ├── MovieCard.vue      # 電影卡片
│   │   │   ├── MovieList.vue      # 電影列表
│   │   │   └── MovieFilter.vue    # 電影篩選
│   │   ├── booking/               # 訂票相關組件
│   │   │   ├── SeatSelector.vue   # 座位選擇
│   │   │   └── BookingForm.vue    # 訂票表單
│   │   ├── wallet/                # 電子錢包組件
│   │   │   ├── WalletBalance.vue  # 餘額顯示
│   │   │   └── TransactionList.vue # 交易列表
│   │   ├── NavBar.vue             # 導航欄
│   │   └── Footer.vue             # 頁腳
│   ├── views/                      # 頁面視圖
│   │   ├── HomeView.vue           # 首頁
│   │   ├── LoginView.vue          # 登入頁
│   │   ├── RegisterView.vue       # 註冊頁
│   │   ├── MemberView.vue         # 會員頁
│   │   ├── MovieView.vue          # 電影頁
│   │   ├── BookingView.vue        # 訂票頁
│   │   ├── WalletView.vue         # 錢包頁
│   │   └── DiscountView.vue       # 優惠頁
│   ├── services/                   # 服務層
│   │   ├── api/                   # API 配置
│   │   │   ├── axios.config.js    # Axios 配置
│   │   │   └── interceptors.js    # 攔截器
│   │   ├── auth/                  # 認證服務
│   │   │   ├── authService.js     # 認證邏輯
│   │   │   └── tokenService.js    # Token 管理
│   │   ├── movie/                 # 電影服務
│   │   │   ├── movieService.js    # 電影相關
│   │   │   └── venueService.js    # 場地相關
│   │   ├── booking/               # 訂票服務
│   │   │   └── bookingService.js  # 訂票相關
│   │   └── wallet/                # 錢包服務
│   │       ├── walletService.js   # 錢包相關
│   │       └── transactionService.js # 交易相關
│   ├── store/                      # Vuex 狀態管理
│   │   ├── modules/               # 模塊
│   │   │   ├── auth.js           # 認證狀態
│   │   │   ├── movie.js          # 電影狀態
│   │   │   ├── booking.js        # 訂票狀態
│   │   │   └── wallet.js         # 錢包狀態
│   │   └── index.js              # Store 配置
│   ├── router/                     # Vue Router
│   │   ├── guards/                # 路由守衛
│   │   │   └── authGuard.js      # 認證守衛
│   │   ├── routes/               # 路由配置
│   │   │   ├── movieRoutes.js    # 電影路由
│   │   │   ├── bookingRoutes.js  # 訂票路由
│   │   │   └── walletRoutes.js   # 錢包路由
│   │   └── index.js              # 路由配置
│   ├── utils/                      # 工具函數
│   │   ├── validators.js         # 驗證工具
│   │   ├── formatters.js         # 格式化工具
│   │   └── helpers.js            # 輔助函數
│   ├── constants/                  # 常量定義
│   │   ├── api.constants.js      # API 常量
│   │   └── app.constants.js      # 應用常量
│   ├── App.vue                     # 根組件
│   └── main.js                     # 入口文件
├── tests/                          # 測試目錄
│   ├── unit/                      # 單元測試
│   └── e2e/                       # 端到端測試
├── .env                            # 環境變量
├── .env.development                # 開發環境變量
├── .env.production                 # 生產環境變量
├── .eslintrc.js                    # ESLint 配置
├── .gitignore                      # Git 忽略文件
├── babel.config.js                 # Babel 配置
├── package.json                    # 項目配置
├── README.md                       # 項目說明
└── vite.config.js                  # Vite 配置
```



1. **模組化的組件結構**
   - 共用組件放在 `components/common`
   - 功能相關組件按模組分類

2. **服務層分類**
   - API 配置和攔截器
   - 按功能模組分類的服務

3. **狀態管理**
   - Vuex store 模組化管理
   - 分離不同功能的狀態

4. **路由管理**
   - 路由守衛
   - 模組化路由配置

5. **工具和常量**
   - 通用工具函數
   - API 和應用程式常量

6. **環境配置**
   - 開發和生產環境變數
   - 構建配置

7. **樣式管理**
   - 全局樣式
   - 變數和組件樣式

8. **測試結構**
   - 單元測試
   - E2E 測試
