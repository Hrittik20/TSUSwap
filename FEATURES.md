# TSUSwap Features Documentation

## Overview

TSUSwap is a comprehensive marketplace platform designed specifically for university dorm students. It provides a secure, easy-to-use environment for buying, selling, and auctioning items within the campus community.

## Core Features

### 1. User Authentication & Profiles

#### Registration
- Students sign up with their university email
- Required information:
  - Full name
  - Email address
  - Password (minimum 6 characters)
  - Room number (for meetups)
  - Phone number (optional)

#### Login/Logout
- Secure JWT-based authentication
- Session persistence
- Protected routes for authenticated users

#### User Profile
- View and edit profile information
- Display room number for easy coordination
- Contact information for buyers/sellers

### 2. Item Listings

#### Two Listing Types

**Buy Now Listings**
- Set a fixed price
- No commission fees
- Immediate purchase option
- Great for quick sales

**Auction Listings**
- Set starting price
- Optional reserve price
- Choose auction duration (24h, 48h, 72h, or 7 days)
- 5% commission on final sale price
- Real-time bidding
- Automatic auction closure

#### Creating a Listing
1. Choose listing type (Buy Now or Auction)
2. Add title and detailed description
3. Select category (Electronics, Furniture, Books, etc.)
4. Specify condition (New, Like New, Good, Fair, Poor)
5. Set price (or starting bid for auctions)
6. Add images (via URLs)
7. Submit listing

#### Item Categories
- Electronics
- Furniture
- Books
- Clothing
- Kitchen
- Sports
- Other

### 3. Auction System

#### How Auctions Work
1. Seller creates auction with starting price
2. Buyers place bids (each must be higher than current price)
3. Auction runs for set duration
4. Highest bidder at end time wins
5. 5% commission automatically calculated

#### Auction Features
- Real-time bid updates (refreshes every 10 seconds)
- Bid history display
- Time remaining countdown
- Minimum bid increment
- Reserve price option (private minimum)
- Automatic auction closure

#### Bidding Rules
- Must be logged in to bid
- Cannot bid on own items
- Each bid must exceed current price
- Seller cannot bid on their own auctions
- Auction ends automatically when time expires

### 4. Payment Options

#### Card Payments (Secure with Escrow)
**How it works:**
1. Buyer selects "Card Payment" option
2. Payment is processed through Stripe
3. Funds are held in escrow
4. Seller ships/delivers item
5. Buyer confirms receipt
6. Funds released to seller

**Benefits:**
- Fraud protection for buyers
- Payment guarantee for sellers
- Secure transaction handling
- Automatic commission calculation for auctions

#### Cash on Meet (No Fees)
**How it works:**
1. Buyer selects "Cash on Meet" option
2. Buyer and seller arrange meetup
3. Exchange happens in person
4. Cash payment on delivery
5. No platform fees

**Benefits:**
- Zero transaction fees
- Immediate settlement
- Personal interaction
- Room-to-room delivery

### 5. Browse & Search

#### Filtering Options
- Search by keywords
- Filter by category
- Filter by listing type (Buy Now vs Auction)
- Sort by date posted

#### Item Display
- Grid view of all items
- Item image preview
- Price/current bid
- Time remaining (for auctions)
- Seller information
- Item condition

### 6. Item Details Page

#### Information Displayed
- Full item description
- Multiple images (if available)
- Current price or bid
- Listing type badge
- Category and condition
- Time since posted
- Seller details:
  - Name
  - Room number
  - Contact information
  - Message button

#### Actions Available
**For Regular Items:**
- Select payment method
- Buy now button
- Message seller

**For Auctions:**
- View bid history
- Place bid
- See time remaining
- View highest bidder (anonymized)

### 7. User Dashboard

#### Overview Section
- Active listings count
- Items sold count
- Purchases made count

#### My Listings Tab
- View all your active listings
- See sold items
- Check auction status
- View bids on your auctions
- Quick access to item pages

#### My Purchases Tab
- View all purchases
- Track payment status
- See seller information
- Confirm receipt (for card payments)
- Access transaction history

### 8. Messaging System

#### Features
- Direct messaging between users
- Message from item pages
- Real-time message updates (polls every 5 seconds)
- Read/unread status
- Timestamp for each message

#### Use Cases
- Ask questions about items
- Arrange meetup details
- Negotiate prices
- Coordinate delivery

### 9. Admin Dashboard

#### Statistics
- Total items listed
- Active listings
- Total transactions
- Commission revenue earned

#### Transaction Monitoring
- View all transactions
- See payment methods
- Track transaction status
- Monitor completion rates
- Calculate total commission

#### Recent Listings
- See all new items
- Monitor platform activity
- Check auction status
- View seller information

### 10. Security Features

#### Authentication Security
- Password hashing with bcrypt
- JWT-based sessions
- Protected API routes
- CSRF protection

#### Payment Security
- Stripe integration
- PCI compliance
- Escrow system for card payments
- Manual payment capture
- Fraud prevention

#### Data Security
- SQL injection prevention (Prisma ORM)
- Input validation with Zod
- XSS protection
- Secure environment variables

## User Flows

### Selling Flow
1. Create account / Login
2. Click "Sell Item"
3. Choose listing type
4. Fill in item details
5. Add images
6. Publish listing
7. Receive bids/purchases
8. Coordinate delivery
9. Complete transaction

### Buying Flow
1. Browse items
2. View item details
3. Place bid (auction) or click Buy Now
4. Select payment method
5. Complete payment
6. Message seller
7. Arrange pickup
8. Confirm receipt
9. Leave feedback (future feature)

### Auction Flow
1. Find auction item
2. Place initial bid
3. Monitor auction
4. Place higher bids as needed
5. Win auction
6. Complete payment
7. Arrange delivery

## Technical Features

### Performance
- Server-side rendering with Next.js
- Optimized database queries
- Image loading optimization
- Real-time updates for auctions

### Responsive Design
- Mobile-friendly interface
- Tablet optimized
- Desktop full features
- Touch-friendly controls

### Accessibility
- Semantic HTML
- Keyboard navigation
- ARIA labels
- Screen reader support

## Future Enhancements

### Planned Features
- Email notifications
- Push notifications
- Image upload (file system)
- Rating and review system
- Wishlist/favorites
- Advanced search filters
- Saved searches
- Offer system for Buy Now items
- Shipping options
- Item verification system
- Dispute resolution
- Mobile app (React Native)

### Potential Integrations
- University SSO
- Campus ID verification
- Payment plan options
- Student discount verification
- Campus map for meetups

## Support & Help

### Common Questions

**Q: How do I cancel a listing?**
A: Currently, contact admin. (Feature coming soon)

**Q: What if buyer doesn't pay?**
A: With card payments, funds are held automatically. For cash, rely on meetup coordination.

**Q: How do I get my commission refund?**
A: Commission is only charged on completed auction sales.

**Q: Can I edit my listing?**
A: Currently not supported. You can delete and recreate. (Edit feature coming soon)

**Q: What if I don't receive my item?**
A: For card payments, don't confirm receipt. Contact admin for dispute resolution.

### Contact Support
- Email: support@tsuswap.edu (placeholder)
- Help Center: /help (coming soon)
- Report Issue: /report (coming soon)

---

**TSUSwap** - Making campus trading simple, secure, and social! 🎓📦





