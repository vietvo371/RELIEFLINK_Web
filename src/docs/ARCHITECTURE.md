# 🏗️ RELIEFLINK - System Architecture

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        RELIEFLINK PLATFORM                       │
│                  Disaster Relief Coordination System              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Layers

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                       │
│  Next.js 15 App Router + React 19 + TypeScript           │
├──────────────────────────────────────────────────────────┤
│  Pages:                                                   │
│  • /                    - Login/Register                  │
│  • /dashboard          - Main Dashboard                   │
│  • /requests           - Relief Requests                  │
│  • /resources          - Resource Inventory               │
│  • /distributions      - Distribution Tracking            │
│  • /ai                 - AI Predictions                   │
│  • /profile            - User Profile                     │
└──────────────────────────────────────────────────────────┘
                          ↓ HTTP/HTTPS
┌──────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                       │
│  Authentication & Authorization                           │
├──────────────────────────────────────────────────────────┤
│  • JWT Token Verification                                 │
│  • Route Protection                                       │
│  • Role-based Access Control                              │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                      API LAYER                            │
│  Next.js Route Handlers (RESTful API)                     │
├──────────────────────────────────────────────────────────┤
│  • /api/auth          - Authentication                    │
│  • /api/requests      - Relief Requests CRUD              │
│  • /api/resources     - Resources CRUD                    │
│  • /api/distributions - Distributions CRUD                │
│  • /api/blockchain    - Blockchain Logs                   │
│  • /api/ai            - AI Predictions                    │
│  • /api/centers       - Relief Centers                    │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                    │
│  Utility Functions & Services                             │
├──────────────────────────────────────────────────────────┤
│  • JWT Service        - Token management                  │
│  • Auth Service       - Password hashing                  │
│  • Blockchain Service - TX hash generation                │
│  • AI Service         - Mock predictions                  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                    │
│  Prisma ORM                                               │
├──────────────────────────────────────────────────────────┤
│  • Type-safe database queries                             │
│  • Auto-generated client                                  │
│  • Migration management                                   │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                       │
│  PostgreSQL                                               │
├──────────────────────────────────────────────────────────┤
│  Tables:                                                  │
│  • nguoi_dungs              - Users                       │
│  • yeu_cau_cuu_tros        - Relief Requests             │
│  • trung_tam_cuu_tros      - Relief Centers              │
│  • nguon_lucs              - Resources                    │
│  • phan_phois              - Distributions                │
│  • nhat_ky_blockchains     - Blockchain Logs              │
│  • du_bao_ais              - AI Predictions               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1️⃣ User Authentication Flow

```
User → Login Form → /api/auth (POST)
                        ↓
              Validate Credentials
                        ↓
              Generate JWT Token
                        ↓
            Set httpOnly Cookie
                        ↓
            Return User Data → Store in Zustand
                        ↓
              Redirect to /dashboard
```

### 2️⃣ Relief Request Creation Flow

```
User → Request Form → /api/requests (POST)
                          ↓
                Verify JWT Token
                          ↓
                  Create Request
                          ↓
              Store in Database (Prisma)
                          ↓
          Invalidate React Query Cache
                          ↓
            Return New Request → Update UI
```

### 3️⃣ Distribution + Blockchain Flow

```
Admin → Create Distribution → /api/distributions (POST)
                                      ↓
                          Generate TX Hash
                                      ↓
                      Create Distribution Record
                                      ↓
                    Create Blockchain Log Entry
                                      ↓
              Both Saved Atomically (Transaction)
                                      ↓
                  Return Data → Display in Timeline
```

### 4️⃣ AI Prediction Flow

```
User → Generate Button → /api/ai (GET) + generate=true
                              ↓
                    Run Mock AI Algorithm
                              ↓
              Generate Random Predictions
                              ↓
                Return Predictions → Display Chart

Optional: Save to Database
                ↓
        /api/ai (POST) → Store in du_bao_ais
```

---

## 🗂️ Database Schema

```
┌─────────────────┐
│  nguoi_dungs    │
├─────────────────┤
│ id              │ PK
│ ho_va_ten       │
│ email           │ UNIQUE
│ mat_khau        │ (hashed)
│ vai_tro         │ (admin/volunteer/citizen)
│ vi_do, kinh_do  │
└─────────────────┘
        │ 1
        │
        │ N
┌─────────────────┐
│yeu_cau_cuu_tros │
├─────────────────┤
│ id              │ PK
│ id_nguoi_dung   │ FK → nguoi_dungs
│ loai_yeu_cau    │
│ so_nguoi        │
│ do_uu_tien      │
│ trang_thai      │
│ vi_do, kinh_do  │
└─────────────────┘
        │ 1
        │
        │ N
┌─────────────────┐
│   phan_phois    │
├─────────────────┤
│ id              │ PK
│ id_yeu_cau      │ FK → yeu_cau_cuu_tros
│ id_nguon_luc    │ FK → nguon_lucs
│ id_tinh_nguyen  │ FK → nguoi_dungs
│ trang_thai      │
│ ma_giao_dich    │ (blockchain TX)
└─────────────────┘
        │ 1
        │
        │ N
┌─────────────────┐
│nhat_ky_blockchn │
├─────────────────┤
│ id              │ PK
│ id_phan_phoi    │ FK → phan_phois
│ ma_giao_dich    │
│ hanh_dong       │
│ du_lieu         │ JSON
└─────────────────┘

┌─────────────────┐
│trung_tam_cuu_tro│
├─────────────────┤
│ id              │ PK
│ ten_trung_tam   │
│ dia_chi         │
│ vi_do, kinh_do  │
└─────────────────┘
        │ 1
        │
        │ N
┌─────────────────┐
│   nguon_lucs    │
├─────────────────┤
│ id              │ PK
│ ten_nguon_luc   │
│ loai            │
│ so_luong        │
│ id_trung_tam    │ FK → trung_tam_cuu_tros
└─────────────────┘

┌─────────────────┐
│  du_bao_ais     │
├─────────────────┤
│ id              │ PK
│ tinh_thanh      │
│ loai_thien_tai  │
│ du_doan_*       │ (various predictions)
└─────────────────┘
```

---

## 🔐 Security Architecture

### Authentication Chain

```
1. User Login
   ↓
2. Verify Password (bcrypt)
   ↓
3. Generate JWT Token
   ↓
4. Set httpOnly Cookie
   ↓
5. Client Stores in Zustand
   ↓
6. Every Request Includes Cookie
   ↓
7. Middleware Verifies Token
   ↓
8. Allow/Deny Access
```

### Security Features

- ✅ **Password Hashing:** bcrypt with salt rounds
- ✅ **JWT Tokens:** Signed with secret key
- ✅ **httpOnly Cookies:** XSS protection
- ✅ **Middleware Protection:** All routes except auth
- ✅ **Role-based Access:** Different permissions per role
- ✅ **HTTPS Ready:** Secure in production

---

## 📊 State Management

### Client-Side State Flow

```
┌──────────────────────────────────────┐
│         Zustand Store                 │
│  (Persistent Local Storage)           │
├──────────────────────────────────────┤
│  • user: User | null                  │
│  • token: string | null               │
│  • isAuthenticated: boolean           │
├──────────────────────────────────────┤
│  Actions:                             │
│  • login(user, token)                 │
│  • logout()                           │
│  • setUser(user)                      │
└──────────────────────────────────────┘
              ↕
┌──────────────────────────────────────┐
│      React Query Cache                │
│  (Server State Management)            │
├──────────────────────────────────────┤
│  Queries:                             │
│  • useRequests()                      │
│  • useResources()                     │
│  • useDistributions()                 │
│  • useAIPredictions()                 │
│  • useBlockchainLogs()                │
├──────────────────────────────────────┤
│  Mutations:                           │
│  • useCreateRequest()                 │
│  • useUpdateRequest()                 │
│  • useCreateDistribution()            │
└──────────────────────────────────────┘
```

---

## 🎨 Component Architecture

```
App Layout
├── QueryProvider (React Query)
│
└── Page Layout
    ├── Sidebar (Navigation)
    ├── Navbar (Top Bar)
    │
    └── Main Content
        ├── Dashboard
        │   ├── SummaryCards
        │   ├── MapView (Mapbox)
        │   └── ReliefCard (Grid)
        │
        ├── Requests
        │   ├── Filter Bar
        │   ├── ReliefCard (Grid)
        │   └── Create Modal
        │
        ├── Resources
        │   └── Data Table
        │
        ├── Distributions
        │   ├── Distribution Cards
        │   └── BlockchainTimeline
        │
        ├── AI
        │   ├── PredictionChart (Recharts)
        │   └── Data Table
        │
        └── Profile
            └── User Info Display
```

---

## 🚀 Deployment Architecture

### Development

```
┌─────────────┐
│ Local Dev   │
│ localhost   │
│ :3000       │
└─────────────┘
      ↓
┌─────────────┐
│ PostgreSQL  │
│ localhost   │
│ :5432       │
└─────────────┘
```

### Production (Recommended)

```
┌──────────────────┐
│   Users/Clients   │
└──────────────────┘
         ↓ HTTPS
┌──────────────────┐
│     Vercel        │
│  (Next.js App)    │
│  Edge Network     │
└──────────────────┘
         ↓ SSL
┌──────────────────┐
│     Railway       │
│  (PostgreSQL)     │
│  Managed DB       │
└──────────────────┘
```

---

## 📈 Performance Optimizations

1. **React Query Caching:** Reduces API calls
2. **Server Components:** Next.js 15 optimization
3. **Code Splitting:** Automatic by Next.js
4. **Image Optimization:** next/image
5. **Database Indexing:** Prisma optimizations
6. **Edge Deployment:** Vercel edge network

---

## 🔄 API Response Format

### Success Response
```json
{
  "requests": [...],
  "user": {...},
  "distributions": [...]
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

---

## 📝 Technology Choices

| Need | Technology | Why |
|------|-----------|-----|
| **Framework** | Next.js 15 | Fullstack, SSR, API routes |
| **Database** | PostgreSQL | Reliable, relational data |
| **ORM** | Prisma | Type-safe, migrations |
| **Auth** | JWT | Stateless, scalable |
| **State** | Zustand | Simple, fast |
| **Data Fetching** | React Query | Caching, auto-refetch |
| **Maps** | Mapbox | Professional mapping |
| **Charts** | Recharts | React-native charts |
| **Styling** | Tailwind | Utility-first, responsive |

---

## 🎯 Design Patterns Used

1. **Repository Pattern:** Prisma as data access layer
2. **MVC Architecture:** Routes → Logic → Data
3. **Middleware Pattern:** Auth verification
4. **Observer Pattern:** React Query subscriptions
5. **Singleton Pattern:** Prisma client
6. **Factory Pattern:** Mock data generation
7. **Strategy Pattern:** Different user roles

---

This architecture ensures:
- ✅ **Scalability:** Can handle growth
- ✅ **Maintainability:** Clean separation of concerns
- ✅ **Security:** Multiple layers of protection
- ✅ **Performance:** Optimized at every layer
- ✅ **Developer Experience:** Type-safe, modern tools

---

**Built for production, ready for scale! 🚀**

