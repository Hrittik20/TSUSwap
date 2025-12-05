'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiSend } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('userId')
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && selectedUserId) {
      fetchMessages()
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [status, selectedUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!selectedUserId) return

    try {
      const response = await fetch(`/api/messages?userId=${selectedUserId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
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
      }
    } catch (error) {
      console.error('Failed to send message:', error)
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
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          <p className="text-gray-600 mb-6">
            Select a user from an item listing to start a conversation
          </p>
        </div>
      </div>
    )
  }

  const otherUser = messages[0]?.sender.id === (session?.user as any)?.id
    ? messages[0]?.receiver
    : messages[0]?.sender

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card h-[600px] flex flex-col">
        {/* Header */}
        {otherUser && (
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold">{otherUser.name}</h2>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
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
                        : 'bg-gray-100 text-gray-900'
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
        <form onSubmit={handleSendMessage} className="border-t px-6 py-4">
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





