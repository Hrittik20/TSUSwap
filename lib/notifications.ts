import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  relatedItemId?: string
  relatedTransactionId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedItemId: params.relatedItemId,
        relatedTransactionId: params.relatedTransactionId,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    // Don't throw - notifications are non-critical
  }
}

