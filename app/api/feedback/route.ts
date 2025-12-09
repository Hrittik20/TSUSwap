import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { type, title, description } = body

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Type, title, and description are required' },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validTypes = ['BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        type: type as any,
        title: title.trim(),
        description: description.trim(),
        userId: session?.user ? (session.user as any).id : null,
        userEmail: session?.user?.email || null,
      },
    })

    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedback },
      { status: 201 }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
      : []
    
    const userEmail = session.user.email.toLowerCase()
    if (ADMIN_EMAILS.length === 0 || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (type) {
      where.type = type
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Fetch feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}
