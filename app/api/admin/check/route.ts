import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

// Admin emails - add your email here
// You can also set ADMIN_EMAILS in environment variables (comma-separated)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
  : []

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email.toLowerCase()

    // Check if user email is in admin list
    if (ADMIN_EMAILS.length === 0) {
      // If no admin emails configured, deny access
      console.warn('⚠️ No admin emails configured. Set ADMIN_EMAILS in environment variables.')
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 403 }
      )
    }

    if (!ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json({ authorized: true })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin access' },
      { status: 500 }
    )
  }
}

