


# vuetest2vue2  市民卡系統前端專案結構

## 根目錄結構
```
citizen-card-system/
├── .husky/                 # Git hooks 配置
├── .vite/                  # Vite 快取目錄
├── .vscode/                # VS Code 配置
├── node_modules/           # 依賴包
├── public/                 # 靜態資源
├── src/                    # 源代碼目錄
├── .env                    # 環境變數
├── .env.development        # 開發環境變數
├── .env.production         # 生產環境變數
├── .eslintrc.js           # ESLint 配置
├── .gitignore             # Git 忽略文件
├── babel.config.js        # Babel 配置
├── components.d.ts        # 組件類型聲明
├── index.html             # HTML 模板
├── package.json           # 項目配置
├── README.md              # 項目說明
└── vite.config.js         # Vite 配置
```

## 源代碼結構 (src/)
```
src/
├── assets/                 # 靜態資源
│   ├── images/            # 圖片資源
│   │   └── icons/        # 圖標資源
│   └── styles/           # 樣式文件
│       ├── components.css # 組件樣式
│       ├── main.css      # 主要樣式
│       └── variables.css # CSS 變數
│
├── components/            # 組件目錄
│   ├── common/           # 通用組件
│   ├── movie/           # 電影相關組件
│   ├── booking/         # 訂票相關組件
│   └── wallet/          # 錢包相關組件
│
├── router/               # 路由配置
│   └── index.js         # 路由定義
│
├── services/             # 服務層
│   ├── api/             # API 配置
│   │   ├── axios.config.js  # Axios 配置
│   │   └── interceptors.js  # 請求攔截器
│   ├── authService.js   # 認證服務
│   ├── bookingService.js # 訂票服務
│   ├── discountService.js # 優惠服務
│   ├── movieService.js   # 電影服務
│   └── walletService.js  # 錢包服務
│
├── stores/               # 狀態管理
│   ├── modules/         # Store 模組
│   │   ├── auth.js     # 認證狀態
│   │   ├── booking.js  # 訂票狀態
│   │   ├── discount.js # 優惠狀態
│   │   ├── movie.js    # 電影狀態
│   │   └── wallet.js   # 錢包狀態
│   └── index.js        # Store 配置
│
├── utils/               # 工具函數
│   ├── constants.js    # 常量定義
│   ├── formatters.js   # 格式化工具
│   └── validators.js   # 驗證工具
│
├── views/               # 頁面視圖
│   ├── BookingView.vue # 訂票頁面
│   ├── DiscountView.vue # 優惠頁面
│   ├── HomeView.vue    # 首頁
│   ├── LoginView.vue   # 登入頁面
│   ├── MemberView.vue  # 會員中心
│   ├── MovieView.vue   # 電影頁面
│   ├── NotFoundView.vue # 404頁面
│   ├── RegisterView.vue # 註冊頁面
│   └── WalletView.vue  # 錢包頁面
│
├── App.vue             # 根組件
└── main.js            # 應用入口
```

## 功能模組說明

### 1. 用戶認證模組
- 註冊
- 登入/登出
- 個人資料管理

### 2. 電影訂票模組
- 電影列表
- 場次管理
- 座位選擇
- 訂單管理

### 3. 電子錢包模組
- 餘額查詢
- 儲值功能
- 交易記錄
- 支付功能

### 4. 優惠管理模組
- 優惠列表
- 優惠使用
- 優惠記錄

### 5. 會員中心模組
- 個人資料
- 訂單歷史
- 優惠記錄
- 錢包管理

### 6. 系統管理模組
- 用戶管理
- 電影管理
- 優惠管理
- 系統設置

## 技術架構
- 前端框架：Vue 3
- 構建工具：Vite
- 狀態管理：Pinia
- UI 框架：Bootstrap
- 圖標：Font Awesome
- HTTP 客戶端：Axios
- 路由：Vue Router

## 開發工具
- 代碼檢查：ESLint
- 代碼格式化：Prettier
- 版本控制：Git
- 編輯器：VS Code
- 包管理：npm


