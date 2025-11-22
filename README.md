# ReliefLink - Hệ thống Quản lý Cứu trợ Khẩn cấp

<div align="center">
  <img src="public/images/logo/logo-dark.svg" alt="ReliefLink Logo" width="200">
  
  **Nền tảng quản lý và phân phối cứu trợ khẩn cấp thông minh**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.20.0-2D3748)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
</div>

## 🌟 Tổng quan

ReliefLink là một hệ thống quản lý cứu trợ khẩn cấp toàn diện, được thiết kế để kết nối cộng đồng với các nguồn lực cứu trợ một cách hiệu quả và minh bạch. Hệ thống tích hợp công nghệ AI để dự báo nhu cầu và blockchain để đảm bảo tính minh bạch trong quá trình phân phối.

## 🎯 Tính năng chính

### 🤖 AI Dự báo Thông minh
- **Dự báo Thiên tai**: Phân tích và dự đoán các loại thiên tai theo khu vực
- **Dự báo Nhu cầu**: Ước tính nhu cầu thực phẩm, nước, thuốc men, chỗ ở
- **Phân tích Xu hướng**: Đánh giá mức độ rủi ro và khuyến nghị chuẩn bị

### ⛓️ Blockchain Minh bạch
- **Theo dõi Giao dịch**: Lưu trữ tất cả các hoạt động phân phối trên blockchain
- **Minh bạch Hoàn toàn**: Mọi giao dịch đều có thể kiểm tra và xác minh
- **Bảo mật Cao**: Đảm bảo tính toàn vẹn của dữ liệu

### 🗺️ Hệ thống Địa lý
- **Bản đồ Tương tác**: Hiển thị vị trí các trung tâm cứu trợ và yêu cầu
- **Định vị GPS**: Xác định chính xác vị trí cần hỗ trợ
- **Tối ưu Tuyến đường**: Hỗ trợ tìm đường hiệu quả nhất

## 👥 Hệ thống Vai trò

### 🔧 Quản trị viên (Admin)
- **Tổng quan Hệ thống**: Giám sát toàn bộ hoạt động của nền tảng
- **Quản lý Người dùng**: Phê duyệt và quản lý tài khoản
- **Thống kê & Báo cáo**: Phân tích dữ liệu và xu hướng
- **Quản lý Trung tâm**: Thiết lập và giám sát các trung tâm cứu trợ
- **Phân bổ Nguồn lực**: Điều phối phân phối tài nguyên

**Routes**: `/admin/*`
- `/admin/dashboard` - Bảng điều khiển tổng quan
- `/admin/users` - Quản lý người dùng  
- `/admin/centers` - Quản lý trung tâm cứu trợ
- `/admin/resources` - Quản lý nguồn lực
- `/admin/analytics` - Thống kê và phân tích
- `/admin/ai-predictions` - Dự báo AI

### 🚀 Tình nguyện viên (Volunteer)
- **Bảng điều khiển Cá nhân**: Theo dõi nhiệm vụ được giao
- **Nhận Nhiệm vụ**: Nhận và thực hiện các yêu cầu phân phối
- **Theo dõi Tiến độ**: Cập nhật trạng thái giao hàng
- **Lịch sử Hoạt động**: Xem các hoạt động đã thực hiện
- **Đánh giá & Xếp hạng**: Nhận đánh giá từ cộng đồng

**Routes**: `/volunteer/*`
- `/volunteer/dashboard` - Bảng điều khiển
- `/volunteer/tasks` - Nhiệm vụ được giao
- `/volunteer/deliveries` - Quản lý giao hàng
- `/volunteer/schedule` - Lịch trình hoạt động
- `/volunteer/profile` - Hồ sơ cá nhân

### 🏠 Người dân (Citizen)
- **Gửi Yêu cầu**: Tạo yêu cầu cứu trợ khẩn cấp
- **Theo dõi Tiến độ**: Xem trạng thái yêu cầu của mình
- **Lịch sử Cứu trợ**: Xem các lần được hỗ trợ trước đó
- **Thông tin Tài nguyên**: Truy cập thông tin các nguồn lực có sẵn
- **Cộng đồng**: Kết nối với cộng đồng địa phương

**Routes**: `/citizen/*`
- `/citizen/dashboard` - Bảng điều khiển
- `/citizen/requests` - Yêu cầu cứu trợ
- `/citizen/resources` - Tài nguyên khả dụng
- `/citizen/community` - Cộng đồng
- `/citizen/profile` - Hồ sơ cá nhân

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 15.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom components với Lucide React icons
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animation**: Framer Motion

### Backend & Database  
- **Database**: PostgreSQL
- **ORM**: Prisma 5.20.0
- **Authentication**: JWT với Jose
- **Password Hashing**: bcryptjs
- **API**: Next.js API Routes

### Visualization & Maps
- **Charts**: ApexCharts, Recharts
- **Maps**: Mapbox GL, React Map GL
- **Vector Maps**: React JVectorMap
- **Calendar**: FullCalendar

### Additional Features
- **File Upload**: React Dropzone
- **Date Picker**: Flatpickr
- **Drag & Drop**: React DnD
- **Cookie Management**: cookies-next
- **Date Utilities**: date-fns

## 🗄️ Cấu trúc Database

### Bảng chính:
- **nguoi_dungs**: Quản lý người dùng (admin, tình nguyện viên, người dân)
- **yeu_cau_cuu_tros**: Lưu trữ yêu cầu cứu trợ khẩn cấp
- **trung_tam_cuu_tros**: Thông tin các trung tâm cứu trợ
- **nguon_lucs**: Quản lý tài nguyên cứu trợ
- **phan_phois**: Theo dõi quá trình phân phối
- **nhat_ky_blockchains**: Lưu trữ blockchain logs
- **du_bao_ais**: Dự báo AI về thiên tai và nhu cầu

## 🚀 Cài đặt & Khởi chạy

### 1. Clone Repository
```bash
git clone <repository-url>
cd RELIEFLINK
```

### 2. Cài đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình Environment
Tạo file `.env` trong thư mục gốc:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/relieflink"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 4. Thiết lập Database
```bash
# Chạy migrations
npm run prisma:migrate

# Seed database với dữ liệu mẫu
npm run prisma:seed
```

### 5. Khởi chạy Development Server
```bash
npm run dev
# hoặc
yarn dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📊 Dữ liệu mẫu

Sau khi chạy seed, bạn có thể đăng nhập với các tài khoản test:

### Admin
- **Email**: admin@relieflink.vn
- **Password**: password123

### Tình nguyện viên
- **Email**: volunteer1@relieflink.vn đến volunteer20@relieflink.vn
- **Password**: password123

### Người dân  
- **Email**: citizen1@relieflink.vn đến citizen50@relieflink.vn
- **Password**: password123

## 📂 Cấu trúc Project

```
RELIEFLINK/
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Dữ liệu mẫu
│   └── migrations/          # Database migrations
├── public/
│   └── images/              # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/         # Authentication pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── volunteer/      # Volunteer portal  
│   │   ├── citizen/        # Citizen portal
│   │   └── api/            # API endpoints
│   ├── components/
│   │   ├── admin/          # Admin components
│   │   ├── auth/           # Auth components
│   │   ├── relief/         # Relief-specific components
│   │   ├── charts/         # Chart components
│   │   └── common/         # Shared components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── context/            # React contexts
│   └── store/              # State management
├── package.json
├── prisma/
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/[id]` - Lấy thông tin người dùng
- `PUT /api/users/[id]` - Cập nhật thông tin

### Relief Requests
- `GET /api/requests` - Lấy danh sách yêu cầu
- `POST /api/requests` - Tạo yêu cầu mới
- `PUT /api/requests/[id]` - Cập nhật yêu cầu
- `DELETE /api/requests/[id]` - Xóa yêu cầu

### Resources & Centers
- `GET /api/centers` - Danh sách trung tâm
- `GET /api/resources` - Danh sách tài nguyên
- `POST /api/distributions` - Tạo phân phối mới

### AI & Analytics
- `GET /api/ai/predictions` - Dự báo AI
- `GET /api/analytics/dashboard` - Dữ liệu dashboard
- `GET /api/blockchain/logs` - Blockchain logs

## 🔧 Scripts có sẵn

```bash
npm run dev           # Chạy development server
npm run build         # Build production
npm run start         # Chạy production server
npm run lint          # Kiểm tra code quality
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Chạy database migrations  
npm run prisma:seed       # Seed database với dữ liệu mẫu
```

## 🌍 Tính năng đặc biệt

### 🤖 AI-Powered Predictions
- Dự báo thiên tai dựa trên dữ liệu lịch sử
- Ước tính nhu cầu cứu trợ theo khu vực
- Phân tích xu hướng và đưa ra khuyến nghị

### ⛓️ Blockchain Integration  
- Lưu trữ tất cả giao dịch trên blockchain
- Đảm bảo tính minh bạch và không thể thay đổi
- Theo dõi từng bước trong chuỗi cung ứng

### 🗺️ Real-time Mapping
- Hiển thị vị trí thời gian thực
- Tối ưu hóa tuyến đường giao hàng
- Theo dõi tiến độ phân phối

### 📱 Responsive Design
- Tương thích đa nền tảng
- Progressive Web App (PWA) ready
- Offline capabilities

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **UI/UX Designer**: [Name]

## 🆘 Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:
- Tạo issue trên GitHub repository
- Liên hệ team phát triển qua email
- Tham gia Discord server của dự án

## 🙏 Cảm ơn

- OpenStreetMap cho dữ liệu bản đồ
- Prisma team cho ORM tuyệt vời
- Next.js team cho framework mạnh mẽ
- Cộng đồng open source Việt Nam

---

<div align="center">
  <strong>ReliefLink</strong> - Kết nối cộng đồng với nguồn lực cứu trợ một cách thông minh và minh bạch
  
  Made with ❤️ in Vietnam
</div>

