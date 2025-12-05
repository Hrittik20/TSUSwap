import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bidSchema = z.object({
  amount: z.number().positive(),
})

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

    const body = await request.json()
    const { amount } = bidSchema.parse(body)

    // Get auction with current highest bid
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        item: true,
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
    })

    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }

    // Check if auction is still active
    if (!auction.isActive || new Date() > auction.endTime) {
      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      )
    }

    // Check if user is the seller
    if (auction.item.sellerId === (session.user as any).id) {
      return NextResponse.json(
        { error: 'You cannot bid on your own item' },
        { status: 400 }
      )
    }

    // Check if bid is higher than current price
    if (amount <= auction.currentPrice) {
      return NextResponse.json(
        { error: 'Bid must be higher than current price' },
        { status: 400 }
      )
    }

    // Create bid and update auction
    const [bid, updatedAuction] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount,
          auctionId: auction.id,
          bidderId: (session.user as any).id,
        },
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.auction.update({
        where: { id: auction.id },
        data: { currentPrice: amount },
      }),
    ])

    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Place bid error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}





