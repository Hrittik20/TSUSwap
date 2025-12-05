import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Commission rate for auction sales
export const AUCTION_COMMISSION_RATE = parseFloat(
  process.env.AUCTION_COMMISSION_RATE || '0.05'
)

// Currency settings for Russia
export const CURRENCY = 'RUB'
export const CURRENCY_SYMBOL = '₽'

