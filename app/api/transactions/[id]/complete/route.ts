import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { stripe, AUCTION_COMMISSION_RATE } from '@/lib/stripe'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Only buyer can confirm completion
    if (transaction.buyerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // For card payments, capture the funds
    if (transaction.paymentMethod === 'CARD' && transaction.stripePaymentId) {
      const paymentIntent = await stripe.paymentIntents.capture(
        transaction.stripePaymentId
      )

      // If there's a commission, create a transfer to the seller
      if (transaction.commissionAmount > 0) {
        // In a real implementation, you would:
        // 1. Have sellers connect their Stripe accounts
        // 2. Create a transfer to their account minus commission
        // For now, we'll just capture the full amount
      }
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Complete transaction error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}





