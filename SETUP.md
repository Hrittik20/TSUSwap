# TSUSwap Setup Guide

This guide will help you set up and run TSUSwap on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
- **Git** (optional) - [Download here](https://git-scm.com/)

## Quick Setup

### Option 1: Automated Setup (Recommended)

#### Windows:
```powershell
.\scripts\setup.ps1
```

#### Mac/Linux:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/tsuswap"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_public_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
AUCTION_COMMISSION_RATE=0.05
```

3. **Set up PostgreSQL database**:
Create a new database:
```sql
CREATE DATABASE tsuswap;
```

4. **Generate Prisma client**:
```bash
npx prisma generate
```

5. **Push database schema**:
```bash
npx prisma db push
```

6. **Seed database (optional)**:
```bash
npx tsx prisma/seed.ts
```

7. **Start the development server**:
```bash
npm run dev
```

8. **Open your browser** to `http://localhost:3000`

## Getting Stripe Keys

1. Create a free account at [stripe.com](https://stripe.com)
2. Get your test keys from the [API Keys page](https://dashboard.stripe.com/test/apikeys)
3. For webhooks, use [Stripe CLI](https://stripe.com/docs/stripe-cli) or ngrok for local testing

## Database Management

### View database with Prisma Studio:
```bash
npx prisma studio
```

### Reset database:
```bash
npx prisma db push --force-reset
```

### Run migrations (for production):
```bash
npx prisma migrate dev
```

## Sample Credentials (after seeding)

- **Email**: john@tsu.edu
- **Password**: password123

Or:
- **Email**: jane@tsu.edu
- **Password**: password123

Or:
- **Email**: mike@tsu.edu
- **Password**: password123

## Common Issues

### Port 3000 already in use
Change the port by running:
```bash
PORT=3001 npm run dev
```

### Database connection error
- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify database exists

### Prisma client not generated
Run:
```bash
npx prisma generate
```

### Module not found errors
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Environment Setup
1. Set up a production PostgreSQL database
2. Update environment variables for production
3. Set `NODE_ENV=production`
4. Use real Stripe keys (not test keys)

### Build for production:
```bash
npm run build
npm start
```

### Recommended Hosting
- **Frontend/Backend**: Vercel, Netlify, or Railway
- **Database**: Supabase, Railway, or Heroku Postgres
- **Images**: Cloudinary, AWS S3, or Vercel Blob

## Project Structure

```
tsuswap/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── (pages)/         # Page components
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── lib/                 # Utilities and config
├── prisma/             # Database schema and seed
├── public/             # Static files
└── scripts/            # Setup scripts
```

## Development Tips

1. **Auto-refresh**: The dev server hot-reloads on file changes
2. **API Testing**: Use tools like Postman or Thunder Client
3. **Database GUI**: Use Prisma Studio (`npx prisma studio`)
4. **Stripe Testing**: Use [test card numbers](https://stripe.com/docs/testing)

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review the logs in terminal
3. Ensure all environment variables are set
4. Try resetting the database
5. Contact the development team

## Next Steps

After setup, you can:
1. Create a student account
2. Browse existing items
3. List your first item
4. Test the auction system
5. Try messaging between users
6. Explore the admin dashboard

Happy trading with TSUSwap! 🎉







