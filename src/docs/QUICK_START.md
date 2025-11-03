# 🚀 RELIEFLINK - Quick Start Card

## ⚡ Get Started in 5 Minutes

### 1️⃣ **Setup Database** (Choose One)

**Option A: Local PostgreSQL**
```bash
createdb relieflink
```

**Option B: Free Cloud Database**
- **Railway:** https://railway.app/ → New PostgreSQL
- **Supabase:** https://supabase.com/ → New Project

### 2️⃣ **Configure Environment**

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/relieflink"
JWT_SECRET="your_secret_key"
NEXT_PUBLIC_MAPBOX_TOKEN="optional_mapbox_token"
```

### 3️⃣ **Initialize Database**

```bash
yarn prisma:generate    # Generate Prisma client
yarn prisma:migrate     # Create tables
yarn prisma:seed        # Add test data
```

### 4️⃣ **Run Application**

```bash
yarn dev
```

Open: http://localhost:3000

### 5️⃣ **Login**

```
Email: admin@relieflink.vn
Password: password123
```

---

## 📋 Useful Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Run production build |
| `yarn prisma:generate` | Generate Prisma client |
| `yarn prisma:migrate` | Run database migrations |
| `yarn prisma:seed` | Seed test data |
| `yarn lint` | Check code quality |

---

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@relieflink.vn | password123 |
| Volunteer | volunteer1@relieflink.vn | password123 |
| Citizen | citizen1@relieflink.vn | password123 |

---

## 🎯 What to Test

1. ✅ **Dashboard** - View stats and map
2. ✅ **Requests** - Create relief request
3. ✅ **Resources** - Browse inventory
4. ✅ **Distributions** - Track deliveries
5. ✅ **AI** - Generate predictions
6. ✅ **Profile** - View your info

---

## 🚀 Deploy to Production

### Vercel + Railway (Recommended)

1. **Database:**
   - Create Railway PostgreSQL
   - Copy connection URL

2. **Deploy:**
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy!

See `DEPLOYMENT_GUIDE.md` for details.

---

## 🐛 Common Issues

**Database connection error?**
```bash
# Check DATABASE_URL in .env
yarn prisma:generate
```

**Prisma client error?**
```bash
yarn prisma:generate
```

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill
```

---

## 📚 Documentation

- `README_RELIEFLINK.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `DEPLOYMENT_GUIDE.md` - Deploy to production
- `PROJECT_COMPLETION_SUMMARY.md` - What's included

---

## 🎨 Tech Stack

- Next.js 15 + TypeScript
- PostgreSQL + Prisma
- Zustand + React Query
- Mapbox GL + Recharts
- Tailwind CSS + Lucide Icons

---

## ✨ Features

✅ User authentication (JWT)  
✅ Relief request management  
✅ Resource inventory  
✅ Distribution tracking  
✅ Blockchain logs  
✅ AI predictions  
✅ Interactive maps  
✅ Dark mode  
✅ Responsive design  

---

## 🎉 You're Ready!

Everything is set up and ready to go.

Run `yarn dev` and start exploring!

---

**Need Help?** Check the documentation files or open an issue.

**Happy Coding! 🚀**

