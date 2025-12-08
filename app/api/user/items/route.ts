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

    const items = await prisma.item.findMany({
      where: {
        sellerId: (session.user as any).id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
          },
        },
        auction: {
          include: {
            bids: {
              orderBy: { amount: 'desc' },
              take: 1,
              include: {
                bidder: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(items || [])
  } catch (error) {
    console.error('Fetch user items error:', error)
    return NextResponse.json([])
  }
}

