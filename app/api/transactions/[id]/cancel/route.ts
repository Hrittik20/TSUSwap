import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    // Only seller can cancel pending transactions
    if (transaction.sellerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Only the seller can cancel this transaction' },
        { status: 403 }
      )
    }

    // Only allow cancellation if status is PENDING
    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending transactions can be cancelled' },
        { status: 400 }
      )
    }

    // Cancel transaction and reactivate item
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status to cancelled
      const cancelledTransaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
        },
      })

      // Reactivate the item so it can be sold again
      await tx.item.update({
        where: { id: transaction.itemId },
        data: {
          status: 'ACTIVE',
        },
      })

      // If it was an auction, reactivate it too
      if (transaction.item.auction) {
        await tx.auction.update({
          where: { id: transaction.item.auction.id },
          data: {
            isActive: true,
          },
        })
      }

      return cancelledTransaction
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Cancel transaction error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

