'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { FiBell } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotificationBell() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications()
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [status])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true')
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        const notificationsArray = Array.isArray(data) ? data : []
        setNotifications(notificationsArray)
        setUnreadCount(notificationsArray.length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    markAsRead([notification.id])
    setIsOpen(false)
    
    if (notification.type === 'TRANSACTION_CREATED' && notification.relatedTransactionId) {
      // For transaction created notifications, redirect to chat with the buyer/seller
      try {
        const response = await fetch('/api/transactions')
        if (response.ok) {
          const transactions = await response.json()
          const transaction = transactions.find(
            (t: any) => t.id === notification.relatedTransactionId
          )
          if (transaction) {
            // If current user is seller, go to chat with buyer
            // If current user is buyer, go to chat with seller
            const otherUserId = 
              transaction.sellerId === (session?.user as any)?.id
                ? transaction.buyerId
                : transaction.sellerId
            if (otherUserId) {
              router.push(`/messages?userId=${otherUserId}&itemId=${transaction.itemId}`)
              return
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch transaction:', error)
      }
      // Fallback to dashboard if transaction fetch fails
      router.push('/dashboard')
    } else if (notification.relatedItemId) {
      router.push(`/items/${notification.relatedItemId}`)
    } else if (notification.relatedTransactionId) {
      router.push('/dashboard')
    } else if (notification.type === 'MESSAGE') {
      router.push('/messages')
    }
  }

  if (status !== 'authenticated') {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-1 hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[90vw] sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold dark:text-gray-100">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  markAsRead(notifications.map((n) => n.id))
                }}
                className="text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiBell className="mx-auto mb-2 text-3xl" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      notification.isRead ? 'bg-gray-300' : 'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        notification.isRead 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t dark:border-gray-700">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

