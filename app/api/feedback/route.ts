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

