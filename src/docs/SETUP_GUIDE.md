# 🚀 RELIEFLINK Quick Start Guide

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
yarn install
```

### 2️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/relieflink"
JWT_SECRET="your_secret_jwt_key_change_in_production"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
```
openssl rand -base64 32

**Note:** 
- Replace the PostgreSQL connection string with your database credentials
- You can get a free Mapbox token at https://www.mapbox.com/
- If you don't have Mapbox token, the app will work with a placeholder map

### 3️⃣ Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
1. Install PostgreSQL
2. Create database:
   ```bash
   createdb relieflink
   ```
3. Update `DATABASE_URL` in `.env` with your credentials

#### Option B: Railway (Free Tier)
1. Go to https://railway.app/
2. Create new project → Add PostgreSQL
3. Copy the connection string to your `.env`

#### Option C: Supabase (Free Tier)
1. Go to https://supabase.com/
2. Create new project
3. Go to Settings → Database
4. Copy connection string (with pooler) to your `.env`

### 4️⃣ Initialize Database

```bash
# Generate Prisma client
yarn prisma:generate

# Create database tables
yarn prisma:migrate

# Seed with test data
yarn prisma:seed
```

### 5️⃣ Run Development Server

```bash
yarn dev
```

Open http://localhost:3000

### 6️⃣ Login with Test Account

**Admin Account:**
- Email: `admin@relieflink.vn`
- Password: `password123`

**Other test accounts:**
- `volunteer1@relieflink.vn` / `password123`
- `citizen1@relieflink.vn` / `password123`

## 🎯 What to Test

1. **Login** - Use test accounts above
2. **Dashboard** - View summary cards and map
3. **Requests** - Create and view relief requests
4. **Resources** - Browse available resources
5. **Distributions** - Track distributions with blockchain logs
6. **AI Predictions** - Generate AI forecasts
7. **Profile** - View user information

## 🔧 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Try: `yarn prisma:generate`

### Prisma Client Error
```bash
yarn prisma:generate
```

### Migration Error
```bash
yarn prisma migrate reset
yarn prisma:seed
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

## 📦 Production Deployment

### Vercel + Railway

1. **Set up database on Railway:**
   - Create PostgreSQL service
   - Copy connection string

2. **Deploy to Vercel:**
   - Import from GitHub
   - Add environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Deploy

3. **Run migrations:**
   ```bash
   # In Vercel project settings → Deployments → ...
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 🔐 Security Checklist for Production

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use strong database password
- [ ] Enable SSL for database connection
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting
- [ ] Set up monitoring

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)

---

Need help? Open an issue on GitHub!

