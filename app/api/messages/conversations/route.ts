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

    const userId = (session.user as any).id

    // Get all unique conversations (users who have sent or received messages)
    let messages: any[] = []
    try {
      messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            roomNumber: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            roomNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    } catch (dbError: any) {
      // If table doesn't exist yet, return empty array
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      throw dbError
    }

    // Group messages by conversation partner
    const conversationsMap = new Map<string, any>()

    messages.forEach((message) => {
      const otherUser = message.senderId === userId ? message.receiver : message.sender
      const conversationKey = otherUser.id

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        })
      } else {
        const conversation = conversationsMap.get(conversationKey)
        // Update if this message is more recent
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message
        }
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationsMap.get(conversationKey)
        conversation.unreadCount++
      }
    })

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    )

    return NextResponse.json(conversations || [])
  } catch (error) {
    console.error('Fetch conversations error:', error)
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([])
  }
}

