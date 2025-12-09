'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { FiAlertCircle, FiZap, FiTrendingUp, FiHelpCircle } from 'react-icons/fi'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'feedbacks'>('overview')
  const [feedbackFilter, setFeedbackFilter] = useState<{ status?: string; type?: string }>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Check if user is admin
      checkAdminAccess()
    }
  }, [status])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (!response.ok) {
        // Not admin, redirect to home
        router.push('/')
        return
      }
      // User is admin, fetch data
      fetchData()
    } catch (error) {
      console.error('Failed to check admin access:', error)
      router.push('/')
    }
  }

  const fetchData = async () => {
    try {
      const [transactionsRes, itemsRes, feedbacksRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/items'),
        fetch('/api/feedback'),
      ])

      const transactionsData = await transactionsRes.json()
      const itemsData = await itemsRes.json()
      const feedbacksData = await feedbacksRes.json()

      // In a real app, you'd only fetch if user is admin
      // For now, show all data
      setTransactions(transactionsData)
      setItems(itemsData)
      setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update feedback status:', error)
    }
  }

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return FiAlertCircle
      case 'FEATURE':
        return FiZap
      case 'IMPROVEMENT':
        return FiTrendingUp
      default:
        return FiHelpCircle
    }
  }

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'BUG':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'FEATURE':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'IMPROVEMENT':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter.status && f.status !== feedbackFilter.status) return false
    if (feedbackFilter.type && f.type !== feedbackFilter.type) return false
    return true
  })

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  const totalRevenue = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.commissionAmount, 0)

  const auctionTransactions = transactions.filter(
    (t) => t.item.listingType === 'AUCTION'
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="mb-6 border-b dark:border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary dark:text-primary-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'feedbacks'
                ? 'border-primary text-primary dark:text-primary-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Feedbacks ({feedbacks.length})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-primary">{items.length}</p>
        </div>

        <div className="card">
          <p className="text-gray-600 mb-1">Active Listings</p>
          <p className="text-3xl font-bold text-green-600">
            {items.filter((i) => i.status === 'ACTIVE').length}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600">{transactions.length}</p>
        </div>

        <div className="card">
          <p className="text-gray-600 mb-1">Доход с комиссии</p>
          <p className="text-3xl font-bold text-purple-600">{totalRevenue.toLocaleString('ru-RU')} ₽</p>
          <p className="text-xs text-gray-500 mt-1">
            From {auctionTransactions.length} auction sales
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/items/${transaction.item.id}`}
                      className="text-primary hover:text-primary-600"
                    >
                      {transaction.item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.buyer.name}
                    <br />
                    <span className="text-gray-500 text-xs">
                      Room {transaction.buyer.roomNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.seller.name}
                    <br />
                    <span className="text-gray-500 text-xs">
                      Room {transaction.seller.roomNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {transaction.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">
                    {transaction.commissionAmount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.paymentMethod === 'CARD' ? 'Card' : 'Cash'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'FUNDS_HELD'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(transaction.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Items */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Recent Listings</h2>
        <div className="space-y-4">
          {items.slice(0, 10).map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex justify-between items-start">
              <div className="flex space-x-4 flex-1">
                {item.images[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <Link
                    href={`/items/${item.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    Seller: {item.seller.name} (Room {item.seller.roomNumber})
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="font-medium text-primary">
                      {(item.listingType === 'AUCTION'
                        ? item.auction?.currentPrice
                        : item.price)?.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-gray-500">
                      {item.listingType === 'AUCTION' ? 'Auction' : 'Buy Now'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {activeTab === 'feedbacks' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Filter by Status</label>
                <select
                  value={feedbackFilter.status || ''}
                  onChange={(e) => setFeedbackFilter({ ...feedbackFilter, status: e.target.value || undefined })}
                  className="input-field"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Filter by Type</label>
                <select
                  value={feedbackFilter.type || ''}
                  onChange={(e) => setFeedbackFilter({ ...feedbackFilter, type: e.target.value || undefined })}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="BUG">Bug Report</option>
                  <option value="FEATURE">Feature Request</option>
                  <option value="IMPROVEMENT">Improvement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex-1"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
              </div>
            </div>
          </div>

          {/* Feedbacks List */}
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">No feedbacks found</p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => {
                const Icon = getFeedbackTypeIcon(feedback.type)
                return (
                  <div key={feedback.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getFeedbackTypeColor(feedback.type)}`}>
                            <Icon className="text-lg" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg dark:text-gray-100">{feedback.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                feedback.status === 'RESOLVED'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                  : feedback.status === 'REVIEWED'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                              }`}>
                                {feedback.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {feedback.type} • {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-3">
                          {feedback.description}
                        </p>
                        {feedback.userEmail && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Submitted by: {feedback.userEmail}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <select
                          value={feedback.status}
                          onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

