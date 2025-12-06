import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DORMITORIES } from '@/lib/dormitories'

const dormitoryValues = DORMITORIES.map(d => d.value) as [string, ...string[]]

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().max(20).optional().nullable(),
  dormitory: z.enum(dormitoryValues).optional(),
  roomNumber: z.string().min(1).max(20).optional(),
})

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    // Update user profile (email cannot be changed)
    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
        ...(data.dormitory && { dormitory: data.dormitory }),
        ...(data.roomNumber && { roomNumber: data.roomNumber }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        dormitory: true,
        roomNumber: true,
        phoneNumber: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

