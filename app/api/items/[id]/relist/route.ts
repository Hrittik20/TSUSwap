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

    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        auction: true,
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Only seller can relist their items
    if (item.sellerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Only the seller can relist this item' },
        { status: 403 }
      )
    }

    // Only allow relisting if item is SOLD or CANCELLED
    if (item.status !== 'SOLD' && item.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Item can only be relisted if it was sold or cancelled' },
        { status: 400 }
      )
    }

    // Relist the item
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Update item status to ACTIVE
      const reactivatedItem = await tx.item.update({
        where: { id: params.id },
        data: {
          status: 'ACTIVE',
        },
      })

      // If it was an auction, reactivate it too
      if (item.auction) {
        await tx.auction.update({
          where: { id: item.auction.id },
          data: {
            isActive: true,
          },
        })
      }

      return reactivatedItem
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Relist item error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

