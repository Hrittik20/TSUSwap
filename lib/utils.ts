// Utility functions for the application

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    ACTIVE: 'bg-green-100 text-green-700',
    SOLD: 'bg-gray-100 text-gray-700',
    EXPIRED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FUNDS_HELD: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REFUNDED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function calculateAuctionTimeRemaining(endTime: Date | string): {
  isExpired: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  const now = new Date().getTime()
  const end = new Date(endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { isExpired: false, days, hours, minutes, seconds }
}

/**
 * Check if an item has been listed for a long time (30+ days)
 * This indicates the seller might be unavailable
 */
export function isLongListed(createdAt: Date | string): boolean {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff >= 30 // 30 days or more
}

/**
 * Get the number of days an item has been listed
 */
export function getDaysListed(createdAt: Date | string): number {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}





