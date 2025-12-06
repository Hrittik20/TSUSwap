import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = {
      userId: (session.user as any).id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    // Check if notifications table exists, return empty array if not
    try {
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limit to 50 most recent
      })

      return NextResponse.json(notifications || [])
    } catch (dbError: any) {
      // If table doesn't exist yet, return empty array
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      throw dbError
    }
  } catch (error) {
    console.error('Fetch notifications error:', error)
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([])
  }
}

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
    const { notificationIds } = body

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: (session.user as any).id,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark notifications read error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

