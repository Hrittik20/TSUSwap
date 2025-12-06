import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  email: z.string().email(),
})

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export const dynamic = 'force-dynamic'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email
async function sendVerificationEmail(email: string, code: string) {
  // For development/testing: log the code to console
  // In production, integrate with an email service like Resend, SendGrid, etc.
  console.log('='.repeat(50))
  console.log(`📧 Verification Code for ${email}`)
  console.log(`Code: ${code}`)
  console.log('='.repeat(50))
  console.log('Note: In production, this should be sent via email service')
  
  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'TSUSwap <noreply@tsuswap.ru>',
  //   to: email,
  //   subject: 'TSUSwap Email Verification Code',
  //   html: `Your verification code is: <strong>${code}</strong>`
  // })
  
  return { success: true }
}

// Request verification code
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = verifyEmailSchema.parse(body)

    // Check if email is Gmail
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
      return NextResponse.json(
        { error: 'Only Gmail addresses are allowed' },
        { status: 400 }
      )
    }

    // Generate verification code
    const code = generateVerificationCode()

    // Store code in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
        attempts: 0,
      },
      create: {
        email,
        code,
        expiresAt,
        attempts: 0,
      },
    })

    // Send email
    await sendVerificationEmail(email, code)

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent to your email' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Verify code
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = verifyCodeSchema.parse(body)

    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      await prisma.emailVerification.update({
        where: { email },
        data: { attempts: verification.attempts + 1 },
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Mark as verified
    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    })

    return NextResponse.json({ 
      success: true,
      verified: true 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

