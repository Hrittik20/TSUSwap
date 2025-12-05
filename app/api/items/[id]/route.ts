import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
            email: true,
            phoneNumber: true,
          },
        },
        auction: {
          include: {
            bids: {
              orderBy: { createdAt: 'desc' },
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
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Fetch item error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}





