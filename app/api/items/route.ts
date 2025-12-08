import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const itemSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive().optional(),
  images: z.array(z.string()).min(1).max(5),
  category: z.string().min(1),
  condition: z.string().min(1),
  listingType: z.enum(['REGULAR', 'AUCTION']),
  // Auction specific fields
  startPrice: z.number().positive().optional(),
  reservePrice: z.number().positive().optional(),
  auctionDuration: z.number().positive().optional(), // in hours
})

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
    const data = itemSchema.parse(body)

    if (data.listingType === 'REGULAR' && !data.price) {
      return NextResponse.json(
        { error: 'Price is required for regular listings' },
        { status: 400 }
      )
    }

    if (data.listingType === 'AUCTION' && !data.startPrice) {
      return NextResponse.json(
        { error: 'Start price is required for auctions' },
        { status: 400 }
      )
    }

    // Create item
    const item = await prisma.item.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images,
        category: data.category,
        condition: data.condition,
        listingType: data.listingType,
        sellerId: (session.user as any).id,
        ...(data.listingType === 'AUCTION' && {
          auction: {
            create: {
              startPrice: data.startPrice!,
              currentPrice: data.startPrice!,
              reservePrice: data.reservePrice || data.startPrice!, // Default to start price if not provided
              endTime: new Date(Date.now() + (data.auctionDuration || 72) * 60 * 60 * 1000),
            },
          },
        }),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            roomNumber: true,
          },
        },
        auction: true,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create item error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const listingType = searchParams.get('listingType')
    const search = searchParams.get('search')

    const items = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        ...(category && { category }),
        ...(listingType && { listingType: listingType as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
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
    console.error('Fetch items error:', error)
    // Always return an array to prevent frontend .map() errors
    return NextResponse.json([])
  }
}





