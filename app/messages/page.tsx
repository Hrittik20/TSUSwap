'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiSend, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ToastProvider'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('userId')
  const { showToast } = useToast()
  
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchConversations()
      if (selectedUserId) {
        fetchMessages()
      }
    }
  }, [status, selectedUserId])

  // Separate polling effect that only runs when authenticated and has selectedUserId
  useEffect(() => {
    if (status === 'authenticated' && selectedUserId) {
      // Poll for new messages every 10 seconds (less aggressive)
      const interval = setInterval(() => {
        fetchMessages()
        fetchConversations()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [status, selectedUserId])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        setConversations(Array.isArray(data) ? data : [])
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!selectedUserId) return

    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/messages?userId=${selectedUserId}`)
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        setMessages(Array.isArray(data) ? data : [])
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId) return

    setLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUserId,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages()
        await fetchConversations()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to send message', 'error')
      }
    } catch (error) {
      showToast('Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  if (!selectedUserId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">Messages</h2>
        {loadingConversations ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="card text-center py-12">
            <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">No conversations yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select a user from an item listing to start a conversation
            </p>
          </div>
        ) : (
          <div className="card">
            <h3 className="font-semibold mb-4 dark:text-gray-200">Your Conversations</h3>
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const lastMsg = conversation.lastMessage
                const isUnread = conversation.unreadCount > 0
                return (
                  <button
                    key={conversation.user.id}
                    onClick={() => router.push(`/messages?userId=${conversation.user.id}`)}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {conversation.user.profileImage ? (
                        <img
                          src={conversation.user.profileImage}
                          alt={conversation.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {conversation.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${isUnread ? 'font-semibold' : ''} dark:text-gray-200`}>
                            {conversation.user.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {lastMsg.senderId === (session?.user as any)?.id ? 'You: ' : ''}
                          {lastMsg.content}
                        </p>
                        {isUnread && (
                          <span className="inline-block mt-1 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {conversation.unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const otherUser = messages[0]?.sender.id === (session?.user as any)?.id
    ? messages[0]?.receiver
    : messages[0]?.sender

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <button
          onClick={() => router.push('/messages')}
          className="text-primary hover:text-primary-600 dark:hover:text-primary-400 mb-2"
        >
          ← Back to conversations
        </button>
      </div>
      <div className="card h-[600px] flex flex-col">
        {/* Header */}
        {otherUser && (
          <div className="border-b dark:border-gray-700 px-6 py-4 flex items-center space-x-3">
            {otherUser.profileImage ? (
              <img
                src={otherUser.profileImage}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold dark:text-gray-100">{otherUser.name}</h2>
              {otherUser.roomNumber && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Room {otherUser.roomNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loadingMessages ? (
            <LoadingSpinner text="Loading messages..." />
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender.id === (session?.user as any)?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t dark:border-gray-700 px-6 py-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FiSend />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}






