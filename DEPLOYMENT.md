# TSUSwap Deployment Guide

A step-by-step guide to deploying TSUSwap to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database migrations ready
- [ ] Environment variables documented
- [ ] Stripe account configured
- [ ] Production database ready
- [ ] Domain name acquired (optional)
- [ ] SSL certificate ready

## Recommended Deployment Stack

### Option 1: Vercel + Supabase (Easiest)
- **Frontend/Backend**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Images**: Vercel Blob or Cloudinary

### Option 2: Railway (All-in-One)
- **Everything**: Railway
- Includes database, hosting, and SSL

### Option 3: Custom VPS
- **Server**: DigitalOcean, AWS, or Azure
- **Database**: Managed PostgreSQL
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

## Deployment Instructions

### Vercel Deployment (Recommended)

#### Step 1: Prepare Repository
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Set Up Database (Supabase)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 4: Add Environment Variables
In Vercel dashboard, add:
```env
DATABASE_URL=your_supabase_connection_string
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-domain.vercel.app
STRIPE_SECRET_KEY=your_live_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_live_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
AUCTION_COMMISSION_RATE=0.05
```

#### Step 5: Deploy
```bash
# Vercel will auto-deploy on push
git push origin main

# Or use Vercel CLI
npx vercel --prod
```

#### Step 6: Set Up Database Schema
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Set environment for CLI
vercel env pull .env.local

# Push database schema
npx prisma db push
npx prisma generate
```

#### Step 7: Configure Stripe Webhooks
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to environment variables

### Railway Deployment

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account

#### Step 2: Create New Project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub repo
railway link
```

#### Step 3: Add PostgreSQL
1. Railway Dashboard → New → Database → PostgreSQL
2. Copy `DATABASE_URL` from variables tab

#### Step 4: Configure Environment
```bash
# Set variables
railway variables set NEXTAUTH_SECRET=your_secret
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set STRIPE_SECRET_KEY=your_key
# ... add all other variables
```

#### Step 5: Deploy
```bash
railway up
```

Railway will:
- Install dependencies
- Run build
- Start server
- Provide domain

### Manual VPS Deployment (Advanced)

#### Requirements
- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Database Setup
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE tsuswap;
CREATE USER tsuswap WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tsuswap TO tsuswap;
\q
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone <your-repo> /var/www/tsuswap
cd /var/www/tsuswap

# Install dependencies
npm install

# Create .env file
nano .env
# Add all environment variables

# Build application
npm run build

# Set up database
npx prisma db push

# Start with PM2
pm2 start npm --name "tsuswap" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
```nginx
# /etc/nginx/sites-available/tsuswap
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tsuswap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Production Environment Variables

### Required
```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://your-production-domain.com

# Stripe (LIVE keys, not test!)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
AUCTION_COMMISSION_RATE=0.05
NODE_ENV=production
```

### Optional
```env
# Email (if implementing notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX

# Monitoring
SENTRY_DSN=https://...
```

## Post-Deployment Steps

### 1. Test Everything
- [ ] User registration
- [ ] Login/logout
- [ ] Create listings (both types)
- [ ] Place bids
- [ ] Complete purchases (both payment methods)
- [ ] Send messages
- [ ] View dashboard
- [ ] Check admin panel

### 2. Configure Stripe
- [ ] Switch to live mode
- [ ] Set up webhook endpoint
- [ ] Test live payments
- [ ] Configure Connect (for seller payouts)

### 3. Set Up Monitoring
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Error tracking
npm install @sentry/nextjs
```

### 4. Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/tsuswap_$DATE.sql
find /backups -mtime +30 -delete

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 5. Security Hardening
- [ ] Enable firewall
- [ ] Set up fail2ban
- [ ] Configure rate limiting
- [ ] Regular security updates
- [ ] Monitor logs

## Performance Optimization

### Database
```prisma
// Add indexes to schema.prisma
@@index([sellerId])
@@index([status])
@@index([createdAt])
@@index([listingType])
```

### Caching
```javascript
// Enable Next.js caching
export const revalidate = 60 // seconds
```

### CDN
- Use Vercel CDN (automatic)
- Or configure Cloudflare

### Images
```bash
# If using file uploads, optimize with:
npm install sharp
```

## Monitoring & Maintenance

### Health Checks
```bash
# Add to crontab
*/5 * * * * curl https://your-domain.com/api/health
```

### Log Monitoring
```bash
# View PM2 logs
pm2 logs tsuswap

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Performance Monitoring
- Set up Vercel Analytics
- Google Analytics
- Sentry for errors
- UptimeRobot for uptime

## Scaling Considerations

### Database
- Enable connection pooling
- Add read replicas
- Implement caching (Redis)

### Application
- Horizontal scaling (multiple instances)
- Load balancer
- CDN for static assets

### Queue System
- Add job queue (Bull/BullMQ)
- Background tasks (email, notifications)

## Rollback Procedure

```bash
# Vercel - use dashboard to rollback
# Or revert git commit:
git revert HEAD
git push origin main

# Railway
railway rollback

# Manual VPS
cd /var/www/tsuswap
git reset --hard <previous-commit>
npm install
npm run build
pm2 restart tsuswap
```

## Troubleshooting

### Build Fails
- Check Node version
- Verify environment variables
- Review build logs
- Check dependencies

### Database Connection Error
- Verify DATABASE_URL
- Check database is running
- Verify network access
- Check connection limits

### Stripe Webhooks Not Working
- Verify webhook URL
- Check webhook signing secret
- Review Stripe dashboard logs
- Test with Stripe CLI

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Stripe Docs: https://stripe.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

## Maintenance Schedule

### Daily
- Monitor error logs
- Check transaction completion rates

### Weekly
- Review performance metrics
- Database backup verification
- Security updates

### Monthly
- Dependency updates
- Performance optimization review
- User feedback analysis
- Feature planning

---

**Deployment complete! 🚀**

Your TSUSwap marketplace is now live and serving students!





