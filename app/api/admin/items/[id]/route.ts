import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'

const deleteSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

// Admin delete item with reason
export async function DELETE(
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

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes((session.user as any).email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reason } = deleteSchema.parse(body)

    // Get the item with seller info
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Store item info before deletion for notification
    const itemTitle = item.title
    const sellerId = item.sellerId

    // Delete the item (this will cascade delete related reports, auction, etc.)
    await prisma.item.delete({
      where: { id: params.id },
    })

    // Mark any related reports as resolved
    await prisma.report.updateMany({
      where: { itemId: params.id },
      data: { status: 'RESOLVED' },
    }).catch(() => {
      // Reports may have been cascade deleted, ignore error
    })

    // Notify the seller about the removal
    await createNotification({
      userId: sellerId,
      type: 'ITEM_REMOVED',
      title: 'Your item has been removed',
      message: `Your listing "${itemTitle}" has been removed by an administrator.\n\nReason: ${reason}\n\nIf you believe this was a mistake, please contact support.`,
      relatedItemId: undefined, // Item is deleted
    })

    return NextResponse.json({
      success: true,
      message: 'Item deleted and seller notified',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Admin delete item error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Update report status
export async function PATCH(
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

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes((session.user as any).email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update all reports for this item
    await prisma.report.updateMany({
      where: { itemId: params.id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update report status error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

