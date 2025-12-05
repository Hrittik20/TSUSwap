import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
// Stripe imports removed - card payments disabled for now
import { z } from 'zod'

const transactionSchema = z.object({
  itemId: z.string(),
  paymentMethod: z.enum(['CASH_ON_MEET']),
  meetingScheduled: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = transactionSchema.parse(body)

    // Get item details
    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
      include: {
        auction: true,
        seller: true,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Item is not available' },
        { status: 400 }
      )
    }

    if (item.sellerId === (session.user as any).id) {
      return NextResponse.json(
        { error: 'You cannot buy your own item' },
        { status: 400 }
      )
    }

    // Calculate amount (no commission for now)
    let amount = item.price || 0

    if (item.listingType === 'AUCTION' && item.auction) {
      amount = item.auction.currentPrice
    }

    // Card payments disabled for now - only cash on meet
    if (data.paymentMethod !== 'CASH_ON_MEET') {
      return NextResponse.json(
        { error: 'Only cash on meet is available' },
        { status: 400 }
      )
    }

    // Create transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Update item status
      await tx.item.update({
        where: { id: item.id },
        data: { status: 'SOLD' },
      })

      // Deactivate auction if applicable
      if (item.auction) {
        await tx.auction.update({
          where: { id: item.auction.id },
          data: { isActive: false },
        })
      }

      // Create transaction record
      return tx.transaction.create({
        data: {
          amount,
          commissionAmount: 0, // No commission for now
          paymentMethod: data.paymentMethod,
          status: 'PENDING', // Cash on meet only
          stripePaymentId: null, // Card payments disabled
          meetingScheduled: data.meetingScheduled ? new Date(data.meetingScheduled) : null,
          itemId: item.id,
          buyerId: (session.user as any).id,
          sellerId: item.sellerId,
        },
        include: {
          item: true,
          buyer: {
            select: {
              id: true,
              name: true,
              roomNumber: true,
              email: true,
              phoneNumber: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              roomNumber: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      })
    })

    return NextResponse.json({
      transaction,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: (session.user as any).id },
          { sellerId: (session.user as any).id },
        ],
      },
      include: {
        item: true,
        buyer: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
            email: true,
            phoneNumber: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Fetch transactions error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

