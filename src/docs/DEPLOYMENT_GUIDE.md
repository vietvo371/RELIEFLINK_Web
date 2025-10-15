# 🚀 RELIEFLINK Deployment Guide

## Overview

This guide covers deploying RELIEFLINK to production using Vercel (frontend) and Railway (database).

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Railway account (free tier)

---

## 🗄️ Part 1: Database Setup (Railway)

### Step 1: Create Railway Project

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Select "Provision PostgreSQL"
4. Wait for deployment

### Step 2: Get Database URL

1. Click on PostgreSQL service
2. Go to "Connect" tab
3. Copy "Postgres Connection URL"
4. Save it (looks like: `postgresql://postgres:password@host:port/railway`)

### Step 3: Configure Database

Railway PostgreSQL is already configured. No additional setup needed!

---

## 🌐 Part 2: Application Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository

### Step 3: Configure Environment Variables

Add these in Vercel project settings:

```env
DATABASE_URL=postgresql://postgres:password@host:port/railway
JWT_SECRET=your_strong_random_secret_change_this
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_or_leave_empty
```

**Important:**
- Use the Railway PostgreSQL URL for `DATABASE_URL`
- Generate a strong random string for `JWT_SECRET`
- Get Mapbox token from https://www.mapbox.com/ (optional)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide a URL (e.g., `your-app.vercel.app`)

### Step 5: Run Database Migrations

After first deployment:

1. Go to Vercel Dashboard → Your Project
2. Go to "Settings" → "Environment Variables"
3. Make sure all variables are set
4. Open a terminal locally and run:

```bash
# Set DATABASE_URL to your Railway URL
export DATABASE_URL="your_railway_postgres_url"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

**OR** use Vercel's CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run command in Vercel environment
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 Alternative: Deploy Everything on Railway

### Step 1: Create Railway Project

1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository

### Step 2: Add PostgreSQL

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically link it

### Step 3: Configure Environment Variables

Railway auto-configures `DATABASE_URL`. Add these:

```env
JWT_SECRET=your_strong_random_secret
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Step 4: Configure Build Settings

In Railway project settings:
- **Build Command:** `yarn build`
- **Start Command:** `yarn start`

### Step 5: Deploy

Railway will automatically deploy on every push!

### Step 6: Run Migrations

In Railway dashboard:
1. Open your service
2. Go to "Settings"
3. Add a "Deploy Hook"
4. Or run manually via Railway CLI:

```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## 🔐 Production Security Checklist

Before going live:

- [ ] **Strong JWT Secret:** Generate with `openssl rand -base64 32`
- [ ] **Database Password:** Use Railway's auto-generated password
- [ ] **Environment Variables:** All secrets in environment, not code
- [ ] **HTTPS:** Vercel/Railway provide HTTPS by default
- [ ] **CORS:** Configure if needed for external APIs
- [ ] **Rate Limiting:** Add rate limiting middleware
- [ ] **Error Logging:** Set up error tracking (Sentry, etc.)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Railway support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Preview deployments** for pull requests
3. **Production deployment** on main branch

### Manual Deployment

**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
railway up
```

---

## 📊 Monitoring & Logs

### Vercel

1. Go to Dashboard → Your Project
2. Click "Analytics" for traffic stats
3. Click "Logs" for real-time logs

### Railway

1. Go to your service
2. Click "Deployments" for deployment history
3. Click "Logs" for real-time logs

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Prisma Client not generated"
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Error:** "Module not found"
```bash
# Check all imports are correct
# Ensure all dependencies are in package.json
```

### Database Connection Failed

1. Check `DATABASE_URL` is correct
2. Ensure Railway PostgreSQL is running
3. Check network restrictions
4. Try regenerating Railway database

### Migration Issues

```bash
# Reset and re-run migrations
npx prisma migrate reset --skip-seed
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎉 Post-Deployment

### Test Your Deployment

1. Visit your deployed URL
2. Try logging in with test accounts
3. Create a relief request
4. Check all pages work

### Monitor Performance

- Vercel Analytics
- Railway Metrics
- Set up alerts for downtime

### Share Your App

Your RELIEFLINK is now live! Share the URL:
- `https://your-app.vercel.app`
- or `https://your-app.up.railway.app`

---

## 💡 Tips

1. **Custom Domain:** Add via Vercel/Railway settings
2. **SSL Certificate:** Automatic with custom domains
3. **Scaling:** Both platforms auto-scale
4. **Backups:** Railway provides automatic PostgreSQL backups

---

Need help? Check the documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

