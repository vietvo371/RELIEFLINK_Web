# RELIEFLINK - Real-Time Disaster Relief Coordination Platform

A fullstack web application for managing disaster relief operations with AI forecasting and Blockchain transparency.

## 🚀 Features

- **Real-time Relief Requests** - Citizens can submit relief requests with location tracking
- **Resource Management** - Track relief supplies across multiple centers
- **Distribution Tracking** - Monitor deliveries with blockchain transparency
- **AI Forecasting** - Mock AI predictions for disaster relief demand
- **Role-based Access** - Admin, Volunteer, and Citizen roles
- **Interactive Map** - Mapbox GL integration for location visualization
- **Blockchain Logs** - Transparent distribution tracking with mock transaction hashes

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** Zustand + React Query
- **Maps:** Mapbox GL JS
- **Charts:** Recharts
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **UI:** Tailwind CSS + Lucide Icons
- **Blockchain:** Mock transaction hash generation

## 📦 Installation

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database

### Setup

1. **Clone the repository:**
   ```bash
   cd RELIEFLINK
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/relieflink"
   JWT_SECRET="your_secret_jwt_key_change_in_production"
   NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   yarn prisma:generate

   # Run migrations
   yarn prisma:migrate

   # Seed the database with mock data
   yarn prisma:seed
   ```

5. **Run the development server:**
   ```bash
   yarn dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 👥 Test Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@relieflink.vn | password123 |
| Volunteer | volunteer1@relieflink.vn | password123 |
| Volunteer | volunteer2@relieflink.vn | password123 |
| Citizen | citizen1@relieflink.vn | password123 |
| Citizen | citizen2@relieflink.vn | password123 |

## 📁 Project Structure

```
RELIEFLINK/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard page
│   │   ├── requests/         # Relief requests
│   │   ├── resources/        # Resource management
│   │   ├── distributions/    # Distribution tracking
│   │   ├── ai/              # AI predictions
│   │   └── profile/         # User profile
│   ├── components/
│   │   └── relief/          # Relief-specific components
│   ├── hooks/               # React Query hooks
│   ├── lib/                 # Utility functions
│   │   ├── prisma.ts       # Prisma client
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── auth.ts         # Password hashing
│   │   ├── blockchain.ts   # Mock blockchain
│   │   └── ai.ts           # Mock AI predictions
│   ├── providers/          # React providers
│   ├── store/              # Zustand stores
│   └── middleware.ts       # Auth middleware
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST, GET, DELETE | Login, register, logout |
| `/api/requests` | GET, POST | Get/create relief requests |
| `/api/requests/[id]` | GET, PUT, DELETE | Single request operations |
| `/api/resources` | GET, POST | Get/create resources |
| `/api/resources/[id]` | GET, PUT, DELETE | Single resource operations |
| `/api/distributions` | GET, POST | Get/create distributions |
| `/api/distributions/[id]` | GET, PUT, DELETE | Single distribution operations |
| `/api/blockchain` | GET, POST | Blockchain logs |
| `/api/ai` | GET, POST | AI predictions |
| `/api/centers` | GET, POST | Relief centers |

## 🎨 UI Pages

- **`/`** - Login/Register page
- **`/dashboard`** - Main dashboard with map and stats
- **`/requests`** - Relief requests management
- **`/resources`** - Resource inventory
- **`/distributions`** - Distribution tracking with blockchain logs
- **`/ai`** - AI prediction charts
- **`/profile`** - User profile

## 📊 Database Schema

Key tables:
- `nguoi_dungs` - Users (admin, volunteers, citizens)
- `yeu_cau_cuu_tros` - Relief requests
- `trung_tam_cuu_tros` - Relief centers
- `nguon_lucs` - Resources
- `phan_phois` - Distributions
- `nhat_ky_blockchains` - Blockchain logs
- `du_bao_ais` - AI predictions

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Railway (with PostgreSQL)

1. Create a new project
2. Add PostgreSQL service
3. Add your app
4. Set environment variables
5. Deploy

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable HTTPS in production
- Implement rate limiting for API routes

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for disaster relief coordination

