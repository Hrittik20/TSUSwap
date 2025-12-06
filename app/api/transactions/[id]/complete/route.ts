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
      include: { item: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Only seller can confirm completion for cash on meet
    // This prevents buyers from confirming online and ghosting the seller
    if (transaction.sellerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Only the seller can confirm this transaction' },
        { status: 403 }
      )
    }

    // Only allow confirmation if status is PENDING
    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaction is not in pending status' },
        { status: 400 }
      )
    }

    // Update transaction status to completed
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
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

    // Create notification for buyer
    await createNotification({
      userId: updatedTransaction.buyerId,
      type: 'TRANSACTION_COMPLETED',
      title: 'Transaction Completed',
      message: `Your purchase of "${updatedTransaction.item.title}" has been confirmed by the seller`,
      relatedItemId: updatedTransaction.item.id,
      relatedTransactionId: updatedTransaction.id,
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





