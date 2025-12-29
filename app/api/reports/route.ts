import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reportSchema = z.object({
  itemId: z.string(),
  reason: z.enum(['INAPPROPRIATE', 'SCAM', 'FAKE', 'SPAM', 'OTHER']),
  description: z.string().optional(),
})

// Create a report
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
    const { itemId, reason, description } = reportSchema.parse(body)

    const userId = (session.user as any).id

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to report their own item
    if (item.sellerId === userId) {
      return NextResponse.json(
        { error: 'You cannot report your own item' },
        { status: 400 }
      )
    }

    // Check if user has already reported this item
    const existingReport = await prisma.report.findFirst({
      where: {
        itemId,
        reporterId: userId,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this item' },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        itemId,
        reporterId: userId,
        reason,
        description,
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Get all reports (admin only)
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const reports = await prisma.report.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        item: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                roomNumber: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

