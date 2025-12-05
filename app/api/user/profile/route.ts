import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: (session.user as any).id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        roomNumber: true,
        dormitory: true,
        phoneNumber: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            purchases: {
              where: {
                status: 'COMPLETED',
              },
            },
            sales: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}




