# TSUSwap Quick Start Guide

Get TSUSwap up and running in 5 minutes! ⚡

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Stripe account created (free)

## Installation (3 steps)

### Step 1: Environment Setup
Copy and edit your environment file:
```bash
cp .env.example .env
```

**Minimum required values:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tsuswap"
NEXTAUTH_SECRET="any-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 2: Install & Setup
```bash
npm install
npx prisma db push
npm run db:seed    # Optional: adds sample data
```

### Step 3: Run
```bash
npm run dev
```

Visit: **http://localhost:3000** 🎉

## Test Credentials (if seeded)
```
Email: john@tsu.edu
Password: password123
```

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npx prisma studio` | Open database GUI |
| `npm run db:seed` | Add sample data |
| `npm run db:push` | Update database schema |

## Project Structure at a Glance

```
tsuswap/
├── app/
│   ├── api/              # Backend API routes
│   ├── items/            # Item pages
│   ├── dashboard/        # User dashboard
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
├── lib/                  # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── .env                  # Configuration
```

## Your First Actions

### As a Seller:
1. Login/Register
2. Click "Sell Item"
3. Choose "Buy Now" or "Auction"
4. Fill in details
5. Done! ✅

### As a Buyer:
1. Browse items at `/items`
2. Click an item
3. Click "Buy Now" or "Place Bid"
4. Choose payment method
5. Complete! ✅

## Key Features

✨ **Buy Now** - Fixed price, no fees  
🔨 **Auctions** - eBay-style, 5% commission  
💳 **Card Payment** - Escrow protection  
💵 **Cash on Meet** - Zero fees  
💬 **Messaging** - Chat with buyers/sellers  
📊 **Dashboard** - Track everything  

## Common Issues & Fixes

### Port 3000 in use?
```bash
PORT=3001 npm run dev
```

### Database connection error?
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure database exists

### Can't login?
1. Check if you registered
2. Verify password
3. Try seeding database for test accounts

### Stripe errors?
1. Get test keys from stripe.com
2. Add to .env
3. Use test card: 4242 4242 4242 4242

## File Locations

| Need to... | Edit this file |
|------------|---------------|
| Add new API endpoint | `app/api/*/route.ts` |
| Change database | `prisma/schema.prisma` |
| Modify homepage | `app/page.tsx` |
| Update styles | `app/globals.css` |
| Change colors | `tailwind.config.ts` |

## Getting Stripe Keys (2 minutes)

1. Go to [stripe.com](https://stripe.com) → Sign up
2. Dashboard → Developers → API keys
3. Copy "Secret key" and "Publishable key"
4. Paste into `.env`

Test cards: https://stripe.com/docs/testing

## Production Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy!

### Other Options
- Railway (includes database)
- Netlify
- Heroku
- DigitalOcean

## Need Help?

📖 **Full Documentation**: See `README.md` and `FEATURES.md`  
🔧 **Setup Guide**: See `SETUP.md`  
🐛 **Issues**: Check console errors first  
💡 **Tips**: Use Prisma Studio to view data  

## Development Workflow

```bash
# Make changes to code
# ↓
# See changes instantly (hot reload)
# ↓
# Edit database schema in schema.prisma
# ↓
npx prisma db push
# ↓
# Continue development
```

## API Endpoints Overview

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/signin` | Login |
| `GET /api/items` | List items |
| `POST /api/items` | Create listing |
| `POST /api/auctions/[id]/bid` | Place bid |
| `POST /api/transactions` | Purchase item |
| `GET /api/messages` | Get messages |
| `POST /api/messages` | Send message |

## Testing Checklist

- [ ] Register new account
- [ ] Login with credentials
- [ ] Create Buy Now listing
- [ ] Create Auction listing
- [ ] Place a bid
- [ ] Purchase an item
- [ ] Send a message
- [ ] View dashboard
- [ ] Check admin panel

## Color Scheme

Primary: `#0072bc` (TSU Blue)  
You can change this in `tailwind.config.ts`

## Performance Tips

- Images: Use URLs for now, add upload later
- Database: Add indexes for production
- Caching: Enable in production
- CDN: Use for static assets

## Next Steps

1. ✅ Get it running
2. ✅ Test all features  
3. 🎨 Customize design
4. 🔒 Add SSL for production
5. 📧 Set up email notifications
6. 🚀 Deploy!

---

**That's it! You're ready to go!** 🚀

For detailed information, see the full documentation in `README.md` and `FEATURES.md`.

Happy trading! 🎓📦





