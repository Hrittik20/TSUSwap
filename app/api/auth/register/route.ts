import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { isValidEmail } from '@/lib/emailValidation'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  university: z.string().min(1).default('tsu'),
  dormitory: z.string().min(1),
  roomNumber: z.string().min(1),
  phoneNumber: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, university, dormitory, roomNumber, phoneNumber } = registerSchema.parse(body)

    // Validate email (prevent fake/spam emails)
    const emailValidation = isValidEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.reason || 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        university: university || 'tsu',
        dormitory,
        roomNumber,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        dormitory: true,
        roomNumber: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}


