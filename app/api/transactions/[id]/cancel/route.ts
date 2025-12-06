import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

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
      include: { 
        item: {
          include: {
            auction: true,
          },
        },
      },
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

    // Get transaction with relations for notification
    const transactionWithRelations = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        item: true,
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (transactionWithRelations) {
      // Create notification for buyer
      await createNotification({
        userId: transactionWithRelations.buyerId,
        type: 'TRANSACTION_CANCELLED',
        title: 'Transaction Cancelled',
        message: `The transaction for "${transactionWithRelations.item.title}" has been cancelled by the seller. The item is now available for purchase again.`,
        relatedItemId: transactionWithRelations.item.id,
        relatedTransactionId: transactionWithRelations.id,
      })
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Cancel transaction error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

