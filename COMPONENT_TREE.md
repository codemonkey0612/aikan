 Nursing System - 完全なコンポーネントツリー構造

 📁 プロジェクト構造

```
nursingSystem/
├── frontend/                     React + Vite + TypeScript
│   └── src/
│       ├── main.tsx             エントリーポイント
│       ├── App.tsx              メインアプリケーションコンポーネント
│       ├── index.css            グローバルスタイル
│       │
│       ├── pages/               ページコンポーネント
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── OverviewPage.tsx
│       │   ├── UsersPage.tsx
│       │   ├── FacilitiesPage.tsx
│       │   ├── ResidentsPage.tsx
│       │   ├── ResidentDetailPage.tsx
│       │   ├── VitalsPage.tsx
│       │   ├── VitalsInputPage.tsx
│       │   ├── ShiftsPage.tsx
│       │   ├── VisitsPage.tsx
│       │   ├── SalariesPage.tsx
│       │   └── NotificationsPage.tsx
│       │
│       ├── components/          再利用可能なコンポーネント
│       │   ├── layout/
│       │   │   ├── DashboardLayout.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Topbar.tsx
│       │   ├── ui/
│       │   │   ├── Card.tsx
│       │   │   └── Table.tsx
│       │   └── dashboard/
│       │       └── SummaryCard.tsx
│       │
│       ├── hooks/               カスタムフック
│       │   ├── useAuth.ts
│       │   ├── useUsers.ts
│       │   ├── useFacilities.ts
│       │   ├── useResidents.ts
│       │   ├── useVitals.ts
│       │   ├── useShifts.ts
│       │   ├── useVisits.ts
│       │   ├── useSalaries.ts
│       │   ├── useNotifications.ts
│       │   ├── useCrudResource.ts
│       │   └── resources.ts
│       │
│       └── api/                 API統合レイヤー
│           ├── client.ts        Axiosクライアント設定
│           ├── endpoints.ts     APIエンドポイント定義
│           ├── types.ts        TypeScript型定義
│           ├── axios.ts         (非推奨) 後方互換性のため
│           ├── users.ts
│           ├── facilities.ts
│           ├── residents.ts
│           ├── vitals.ts
│           ├── shifts.ts
│           ├── visits.ts
│           ├── salaries.ts
│           └── notifications.ts
│
└── backend/                     Express + TypeScript + MySQL
    └── src/
        ├── server.ts            サーバーエントリーポイント
        ├── app.ts               Expressアプリケーション設定
        │
        ├── config/              設定ファイル
        │   ├── db.ts            データベース接続
        │   └── env.ts           環境変数
        │
        ├── routes/              ルート定義
        │   ├── auth.routes.ts
        │   ├── user.routes.ts
        │   ├── facility.routes.ts
        │   ├── resident.routes.ts
        │   ├── vital.routes.ts
        │   ├── shift.routes.ts
        │   ├── visit.routes.ts
        │   ├── salary.routes.ts
        │   └── notification.routes.ts
        │
        ├── controllers/         リクエストハンドラー
        │   ├── auth.controller.ts
        │   ├── user.controller.ts
        │   ├── facility.controller.ts
        │   ├── resident.controller.ts
        │   ├── vital.controller.ts
        │   ├── shift.controller.ts
        │   ├── visit.controller.ts
        │   ├── salary.controller.ts
        │   └── notification.controller.ts
        │
        ├── services/            ビジネスロジック
        │   ├── auth.service.ts
        │   ├── user.service.ts
        │   ├── facility.service.ts
        │   ├── resident.service.ts
        │   ├── vital.service.ts
        │   ├── shift.service.ts
        │   ├── visit.service.ts
        │   ├── salary.service.ts
        │   └── notification.service.ts
        │
        ├── models/              データベースモデル
        │   ├── user.model.ts
        │   ├── facility.model.ts
        │   ├── resident.model.ts
        │   ├── vital.model.ts
        │   ├── shift.model.ts
        │   ├── visit.model.ts
        │   ├── salary.model.ts
        │   └── notification.model.ts
        │
        ├── middlewares/         ミドルウェア
        │   ├── auth.middleware.ts
        │   └── error.middleware.ts
        │
        ├── utils/               ユーティリティ関数
        │   ├── jwt.ts           JWT認証
        │   └── password.ts      パスワードハッシュ化
        │
        └── types/               TypeScript型定義
            └── express.d.ts     Express型拡張
```

---

 🌳 フロントエンド コンポーネントツリー

```
main.tsx
└── <StrictMode>
    └── <App />
        └── <QueryClientProvider>
            └── <BrowserRouter>
                └── <Routes>
                    │
                    ├── Public Routes (認証不要)
                    │   ├── /login
                    │   │   └── <LoginPage />
                    │   │       ├── フォーム入力
                    │   │       ├── useAuth().login()
                    │   │       └── エラー表示
                    │   │
                    │   └── /register
                    │       └── <RegisterPage />
                    │           ├── フォーム入力
                    │           ├── useAuth().register()
                    │           └── エラー表示
                    │
                    └── Protected Routes (認証必須)
                        └── <RequireAuth>
                            └── <DashboardLayout />
                                ├── <Topbar />
                                │   ├── ユーザー情報表示
                                │   ├── useAuth().user
                                │   └── ログアウトボタン
                                │
                                ├── <Sidebar />
                                │   └── ナビゲーションメニュー
                                │
                                └── <Outlet /> (メインコンテンツ)
                                    │
                                    ├── / (Overview)
                                    │   └── <OverviewPage />
                                    │       ├── <SummaryCard /> × 4
                                    │       └── 統計情報表示
                                    │
                                    ├── /users
                                    │   └── <UsersPage />
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       ├── useUsers()
                                    │       └── CRUD操作
                                    │
                                    ├── /facilities
                                    │   └── <FacilitiesPage />
                                    │       ├── <SummaryCard /> × 3
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       ├── useFacilities()
                                    │       └── 検索機能
                                    │
                                    ├── /residents
                                    │   └── <ResidentsPage />
                                    │       ├── <SummaryCard /> × 3
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       ├── useResidents()
                                    │       └── 詳細ページへのリンク
                                    │
                                    ├── /residents/:id
                                    │   └── <ResidentDetailPage />
                                    │       ├── <SummaryCard /> × 3
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       └── useResident(id)
                                    │
                                    ├── /vitals
                                    │   └── <VitalsPage />
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       ├── useVitals()
                                    │       └── 新規登録リンク
                                    │
                                    ├── /vitals/new
                                    │   └── <VitalsInputPage />
                                    │       ├── <Card />
                                    │       ├── フォーム入力
                                    │       ├── useResidents()
                                    │       ├── useCreateVital()
                                    │       └── バリデーション
                                    │
                                    ├── /shifts
                                    │   └── <ShiftsPage />
                                    │       ├── <Card /> (カレンダー)
                                    │       ├── <Card /> (一覧)
                                    │       ├── <Table />
                                    │       └── useShifts()
                                    │
                                    ├── /visits
                                    │   └── <VisitsPage />
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       └── useVisits()
                                    │
                                    ├── /salaries
                                    │   └── <SalariesPage />
                                    │       ├── <Card />
                                    │       ├── <Table />
                                    │       └── useSalaries()
                                    │
                                    └── /notifications
                                        └── <NotificationsPage />
                                            ├── <Card />
                                            ├── <Table />
                                            └── useNotifications()
```

---

 🔌 データフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Pages Components                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LoginPage    │  │ UsersPage    │  │ VitalsPage   │     │
│  │ RegisterPage │  │ Facilities   │  │ ShiftsPage   │     │
│  │ OverviewPage │  │ Residents    │  │ ...          │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│                    ┌───────▼───────┐                       │
│                    │  Custom Hooks │                       │
│                    │  ┌──────────┐ │                       │
│                    │  │ useAuth  │ │                       │
│                    │  │ useUsers│ │                       │
│                    │  │ useVitals│ │                       │
│                    │  │ ...      │ │                       │
│                    │  └────┬─────┘ │                       │
│                    └───────┼───────┘                       │
│                            │                                │
│                    ┌───────▼───────┐                       │
│                    │  API Layer    │                       │
│                    │  ┌──────────┐ │                       │
│                    │  │ client.ts│ │                       │
│                    │  │endpoints │ │                       │
│                    │  └────┬─────┘ │                       │
│                    └───────┼───────┘                       │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP Request (Axios)
                             │ JWT Token in Header
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │→ │ Controllers   │→ │  Services    │     │
│  │ auth.routes  │  │ auth.controller│ │ auth.service │     │
│  │ user.routes  │  │ user.controller│ │ user.service │     │
│  │ ...          │  │ ...          │  │ ...          │     │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘     │
│                           │                 │              │
│                    ┌──────▼───────┐  ┌─────▼──────┐      │
│                    │  Middleware   │  │  Models    │      │
│                    │  auth.middle │  │ user.model │      │
│                    │  error.middle│  │ facility...│      │
│                    └──────────────┘  └─────┬──────┘      │
│                                             │              │
│                                    ┌────────▼────────┐    │
│                                    │   MySQL Database │    │
│                                    │   - users        │    │
│                                    │   - facilities   │    │
│                                    │   - residents    │    │
│                                    │   - vitals       │    │
│                                    │   - shifts       │    │
│                                    │   - visits       │    │
│                                    │   - salaries     │    │
│                                    │   - notifications│    │
│                                    └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

 🎣 カスタムフック階層

```
useAuth
├── AuthAPI.register()
├── AuthAPI.login()
├── AuthAPI.me()
├── setAuthToken()
└── getAuthToken()

useUsers
├── UsersAPI.list()
├── UsersAPI.get(id)
├── UsersAPI.create()
├── UsersAPI.update()
└── UsersAPI.remove()

useFacilities
├── FacilitiesAPI.list()
├── FacilitiesAPI.get(id)
├── FacilitiesAPI.create()
├── FacilitiesAPI.update()
└── FacilitiesAPI.remove()

useResidents
├── ResidentsAPI.list()
├── ResidentsAPI.get(id)
├── ResidentsAPI.create()
├── ResidentsAPI.update()
└── ResidentsAPI.remove()

useVitals
├── VitalsAPI.list()
├── VitalsAPI.get(id)
├── VitalsAPI.create()
├── VitalsAPI.update()
└── VitalsAPI.remove()

useShifts
├── ShiftsAPI.list()
├── ShiftsAPI.get(id)
├── ShiftsAPI.create()
├── ShiftsAPI.update()
└── ShiftsAPI.remove()

useVisits
├── VisitsAPI.list()
├── VisitsAPI.get(id)
├── VisitsAPI.create()
├── VisitsAPI.update()
└── VisitsAPI.remove()

useSalaries
├── SalariesAPI.list()
├── SalariesAPI.get(id)
├── SalariesAPI.create()
├── SalariesAPI.update()
└── SalariesAPI.remove()

useNotifications
├── NotificationsAPI.list()
├── NotificationsAPI.get(id)
├── NotificationsAPI.create()
├── NotificationsAPI.update()
└── NotificationsAPI.remove()
```

---

 🔄 バックエンド API ルート構造

```
/api
├── /auth
│   ├── POST   /register      → AuthController.register
│   ├── POST   /login         → AuthController.login
│   └── GET    /me            → AuthController.me (認証必須)
│
├── /users
│   ├── GET    /              → UserController.getAll
│   ├── GET    /:id           → UserController.getById
│   ├── POST   /              → UserController.create (認証必須)
│   ├── PUT    /:id           → UserController.update (認証必須)
│   └── DELETE /:id           → UserController.delete (認証必須)
│
├── /facilities
│   ├── GET    /              → FacilityController.getAll
│   ├── GET    /:id           → FacilityController.getById
│   ├── POST   /              → FacilityController.create (認証必須)
│   ├── PUT    /:id           → FacilityController.update (認証必須)
│   └── DELETE /:id           → FacilityController.delete (認証必須)
│
├── /residents
│   ├── GET    /              → ResidentController.getAll
│   ├── GET    /:id           → ResidentController.getById
│   ├── POST   /              → ResidentController.create (認証必須)
│   ├── PUT    /:id           → ResidentController.update (認証必須)
│   └── DELETE /:id           → ResidentController.delete (認証必須)
│
├── /vitals
│   ├── GET    /              → VitalController.getAll
│   ├── GET    /:id           → VitalController.getById
│   ├── POST   /              → VitalController.create (認証必須)
│   ├── PUT    /:id           → VitalController.update (認証必須)
│   └── DELETE /:id           → VitalController.delete (認証必須)
│
├── /shifts
│   ├── GET    /              → ShiftController.getAll
│   ├── GET    /:id           → ShiftController.getById
│   ├── POST   /              → ShiftController.create (認証必須)
│   ├── PUT    /:id           → ShiftController.update (認証必須)
│   └── DELETE /:id           → ShiftController.delete (認証必須)
│
├── /visits
│   ├── GET    /              → VisitController.getAll
│   ├── GET    /:id           → VisitController.getById
│   ├── POST   /              → VisitController.create (認証必須)
│   ├── PUT    /:id           → VisitController.update (認証必須)
│   └── DELETE /:id           → VisitController.delete (認証必須)
│
├── /salaries
│   ├── GET    /              → SalaryController.getAll
│   ├── GET    /:id           → SalaryController.getById
│   ├── POST   /              → SalaryController.create (認証必須)
│   ├── PUT    /:id           → SalaryController.update (認証必須)
│   └── DELETE /:id           → SalaryController.delete (認証必須)
│
└── /notifications
    ├── GET    /              → NotificationController.getAll
    ├── GET    /:id           → NotificationController.getById
    ├── POST   /              → NotificationController.create (認証必須)
    ├── PUT    /:id           → NotificationController.update (認証必須)
    └── DELETE /:id           → NotificationController.delete (認証必須)
```

---

 🗄️ データベーススキーマ

```
users
├── id (PK)
├── role (ADMIN | NURSE | STAFF)
├── first_name
├── last_name
├── email (UNIQUE)
├── phone
├── password_hash
├── active
└── created_at

facilities
├── id (PK)
├── corporation_id
├── name
├── code
├── postal_code
├── address
├── lat
├── lng
└── created_at

residents
├── id (PK)
├── facility_id (FK → facilities.id)
├── first_name
├── last_name
├── gender (MALE | FEMALE | OTHER)
├── birth_date
├── status
└── created_at

vital_records
├── id (PK)
├── resident_id (FK → residents.id)
├── measured_at
├── systolic_bp
├── diastolic_bp
├── pulse
├── temperature
├── spo2
├── note
├── created_by (FK → users.id)
└── created_at

shifts
├── id (PK)
├── user_id (FK → users.id)
├── facility_id (FK → facilities.id)
├── date
├── start_time
├── end_time
├── shift_type
└── created_at

visits
├── id (PK)
├── shift_id (FK → shifts.id)
├── resident_id (FK → residents.id)
├── visited_at
└── note

nurse_salaries
├── id (PK)
├── user_id (FK → users.id)
├── year_month
├── amount
└── created_at

notifications
├── id (PK)
├── title
├── body
├── target_role
├── publish_from
├── publish_to
├── created_by (FK → users.id)
└── created_at
```

---

 🔐 認証フロー

```
1. ユーザー登録
   RegisterPage
   └── useAuth().register()
       └── AuthAPI.register()
           └── POST /api/auth/register
               └── AuthController.register
                   └── AuthService.register
                       ├── パスワードハッシュ化 (bcrypt)
                       ├── ユーザー作成
                       └── JWT生成
                           └── { token, user }

2. ログイン
   LoginPage
   └── useAuth().login()
       └── AuthAPI.login()
           └── POST /api/auth/login
               └── AuthController.login
                   └── AuthService.login
                       ├── メール検証
                       ├── パスワード検証 (bcrypt.compare)
                       └── JWT生成
                           └── { token, user }

3. 認証確認
   App.tsx (RequireAuth)
   └── useAuth().refreshProfile()
       └── AuthAPI.me()
           └── GET /api/auth/me
               └── authenticate middleware
                   ├── JWT検証
                   └── AuthController.me
                       └── AuthService.getProfile
                           └── UserService.getUserById

4. 保護されたルート
   すべてのCRUD操作
   └── authenticate middleware
       ├── Authorization: Bearer <token>
       ├── JWT検証
       └── req.user にユーザー情報を設定
```

---

 📦 依存関係

 Frontend
- **React 18** - UIライブラリ
- **React Router DOM** - ルーティング
- **TanStack Query (React Query)** - データフェッチング・キャッシュ
- **Axios** - HTTPクライアント
- **Tailwind CSS** - スタイリング
- **Heroicons** - アイコン

 Backend
- **Express** - Webフレームワーク
- **TypeScript** - 型安全性
- **MySQL2** - データベースドライバ
- **jsonwebtoken** - JWT認証
- **bcryptjs** - パスワードハッシュ化
- **cors** - CORS設定
- **swagger-ui-express** - APIドキュメント
- **yamljs** - OpenAPI仕様読み込み

---
 🎨 UIコンポーネント階層

```
DashboardLayout
├── Topbar
│   ├── ロゴ/タイトル
│   └── ユーザー情報
│       ├── 名前表示
│       ├── メール表示
│       ├── アバター
│       └── ログアウトボタン
│
├── Sidebar
│   └── ナビゲーションメニュー
│       ├── 概要
│       ├── ユーザー
│       ├── 施設
│       ├── 入居者
│       ├── バイタル
│       ├── シフト
│       ├── 訪問
│       ├── 給与
│       └── 通知
│
└── Main Content (Outlet)
    └── 各ページコンポーネント
        ├── Card (共通コンテナ)
        ├── Table (データ表示)
        ├── SummaryCard (統計情報)
        └── フォーム (入力ページ)
```

---

 📝 ファイル数統計

- **Frontend Pages**: 13
- **Frontend Components**: 8
- **Frontend Hooks**: 11
- **Frontend API Files**: 11
- **Backend Routes**: 9
- **Backend Controllers**: 9
- **Backend Services**: 9
- **Backend Models**: 8
- **Total**: 78+ ファイル

---

このドキュメントは、プロジェクトの完全な構造を理解するためのリファレンスとして使用できます。

