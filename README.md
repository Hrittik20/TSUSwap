# TSUSwap - University Dorm Marketplace

A modern, full-featured marketplace platform for university students to buy, sell, and auction items within their dorm community.

## 🌟 Features

- **User Authentication**: Secure signup/login system with student email verification
- **Two Listing Types**:
  - **Buy Now**: Standard listings with no commission fees
  - **Auction**: eBay-style auctions with 5% commission on final sale
- **Secure Payments**:
  - Card payments with escrow protection (Stripe integration)
  - Cash on meet option (no fees)
- **Real-time Bidding**: Live auction system with automatic price updates
- **Messaging System**: Direct communication between buyers and sellers
- **User Dashboard**: Track listings, purchases, and sales
- **Admin Panel**: Monitor all transactions and platform revenue
- **Room-based Delivery**: Students can arrange pickup/delivery using room numbers

## 🎨 Design

The platform uses **#0072bc** as the primary brand color, creating a professional and trustworthy appearance.

## 🚀 Getting Started

### 📦 Code is on GitHub
**Repository:** https://github.com/Hrittik20/TSUSwap.git

### 🌐 Deploy Online
**Quick deployment guide:** See [DEPLOY_ONLINE.md](./DEPLOY_ONLINE.md) for step-by-step instructions to deploy to Vercel, Netlify, or Railway.

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (see [DATABASE_RECOMMENDATIONS.md](./DATABASE_RECOMMENDATIONS.md) for free options)
- Stripe account (for payment processing - optional)

### 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[DEPLOY_ONLINE.md](./DEPLOY_ONLINE.md)** - Deployment guide
- **[DATABASE_RECOMMENDATIONS.md](./DATABASE_RECOMMENDATIONS.md)** - Free database options

### Installation

1. **Clone the repository** (or use the existing files)

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory based on `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tsuswap"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
AUCTION_COMMISSION_RATE=0.05
```

4. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
tsuswap/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── items/        # Item CRUD operations
│   │   ├── auctions/     # Auction bidding
│   │   ├── transactions/ # Payment handling
│   │   └── messages/     # Messaging system
│   ├── items/            # Item pages
│   ├── dashboard/        # User dashboard
│   ├── messages/         # Messaging interface
│   ├── admin/            # Admin panel
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔑 Key Features Explained

### Auction System
- Sellers set a starting price and auction duration
- 5% commission automatically calculated on final sale price
- Real-time bid updates every 10 seconds
- Automatic auction closure when time expires

### Payment Security
- **Card Payments**: Funds are held in escrow until buyer confirms receipt
- **Manual Capture**: Prevents fraud by holding payment before release
- **Cash on Meet**: Zero fees, arranged directly between users

### User Roles
- **Students**: Can buy, sell, and auction items
- **Admin**: Can monitor all transactions and view platform analytics

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (with escrow support)
- **Icons**: React Icons
- **Date Formatting**: date-fns

## 📊 Database Schema

The application uses the following main models:
- **User**: Student accounts with room numbers
- **Item**: Listings (regular or auction)
- **Auction**: Auction-specific data (prices, bids, timing)
- **Bid**: Individual bids placed on auctions
- **Transaction**: Purchase records with payment tracking
- **Message**: Direct messages between users

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based session management
- CSRF protection
- SQL injection prevention (Prisma)
- Escrow payment system for card transactions

## 📈 Future Enhancements

- Email notifications for bids and sales
- Image upload functionality (currently uses URLs)
- Rating and review system
- Advanced search and filters
- Mobile app (React Native)
- Push notifications for auction endings
- Seller verification system

## 🤝 Support

For issues or questions, please contact the TSUSwap team or create an issue in the repository.

## 📄 License

This project is proprietary and confidential.

---

**Made with ❤️ for university students**





