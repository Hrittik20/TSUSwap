# 🚀 Deploy TSUSwap Online - Quick Guide

Your code is now on GitHub: https://github.com/Hrittik20/TSUSwap.git

## 🏆 **Best Free Hosting Options**

### 1. **Vercel** ⭐ **RECOMMENDED** (Easiest for Next.js)
- **Free Tier:** Unlimited projects, 100 GB bandwidth
- **Perfect for:** Next.js apps (made by Next.js creators!)
- **Setup Time:** 2 minutes
- **Link:** https://vercel.com

**Steps:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository: `Hrittik20/TSUSwap`
5. Add environment variables (see below)
6. Click "Deploy"
7. Done! 🎉

---

### 2. **Netlify**
- **Free Tier:** 100 GB bandwidth, 300 build minutes/month
- **Perfect for:** Next.js apps
- **Setup Time:** 3 minutes
- **Link:** https://netlify.com

**Steps:**
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose GitHub → Select `TSUSwap`
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy!

---

### 3. **Railway**
- **Free Tier:** $5 credit/month
- **Perfect for:** Full-stack apps with database
- **Setup Time:** 5 minutes
- **Link:** https://railway.app

---

## 📋 **Required Environment Variables**

Before deploying, you need to set these in your hosting platform:

### **Required:**
```env
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-app-url.vercel.app
```

### **Optional (for payments):**
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### **Generate NEXTAUTH_SECRET:**
Run this command:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

---

## 🚀 **Vercel Deployment (Step-by-Step)**

### Step 1: Sign Up
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find `Hrittik20/TSUSwap` in the list
3. Click "Import"

### Step 3: Configure Project
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `./` (default)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
DATABASE_URL = your_supabase_or_neon_connection_string
NEXTAUTH_SECRET = your_generated_secret
NEXTAUTH_URL = https://your-app-name.vercel.app
```

**Note:** For `NEXTAUTH_URL`, you can use a placeholder first, then update it after deployment.

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live! 🎉

### Step 6: Update NEXTAUTH_URL
1. After deployment, copy your app URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` with your actual URL
4. Redeploy (automatic)

---

## 🗄️ **Database Setup (Before Deployment)**

### Option 1: Supabase (Recommended)
1. Go to https://supabase.com
2. Create account → New Project
3. Go to Settings → Database
4. Copy connection string
5. Use it as `DATABASE_URL`

### Option 2: Neon
1. Go to https://neon.tech
2. Create account → New Project
3. Copy connection string
4. Use it as `DATABASE_URL`

### After Database Setup:
```bash
# Push your schema to the database
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed
```

---

## ✅ **Post-Deployment Checklist**

After deployment, make sure to:

- [ ] Update `NEXTAUTH_URL` with your actual domain
- [ ] Test login/register
- [ ] Test creating items
- [ ] Test viewing items
- [ ] Test mobile view
- [ ] Test dark mode
- [ ] Check database connection

---

## 🔧 **Troubleshooting**

### Build Fails?
- Check environment variables are set
- Make sure `DATABASE_URL` is correct
- Check build logs in Vercel dashboard

### Database Connection Error?
- Verify `DATABASE_URL` is correct
- Check database is accessible (not paused)
- Ensure IP is whitelisted (if required)

### Authentication Not Working?
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Make sure it's `https://` not `http://`

---

## 📱 **Your Live URLs**

After deployment, you'll get:
- **Production:** `https://tsuswap.vercel.app` (or your custom domain)
- **Preview:** Each commit gets a preview URL

---

## 🎯 **Quick Start (5 Minutes)**

1. **Set up database:** Supabase (2 min)
2. **Deploy to Vercel:** Import from GitHub (2 min)
3. **Add environment variables:** Copy-paste (1 min)
4. **Deploy!** Click button (1 min)
5. **Done!** Your app is live! 🚀

---

## 🔗 **Useful Links**

- **Vercel:** https://vercel.com
- **Supabase:** https://supabase.com
- **Neon:** https://neon.tech
- **Your Repo:** https://github.com/Hrittik20/TSUSwap

---

**Your code is ready to deploy!** 🎉

Just follow the Vercel steps above and you'll be live in minutes! 🚀



