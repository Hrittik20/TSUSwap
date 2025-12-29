'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { FiAlertCircle, FiZap, FiTrendingUp, FiHelpCircle, FiFlag, FiTrash2, FiX } from 'react-icons/fi'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'feedbacks'>('overview')
  const [feedbackFilter, setFeedbackFilter] = useState<{ status?: string; type?: string }>({})
  const [reportFilter, setReportFilter] = useState<{ status?: string }>({})
  const [adminError, setAdminError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string; itemTitle: string }>({
    isOpen: false,
    itemId: '',
    itemTitle: '',
  })
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return // Wait for session to load
    }
    
    if (status === 'unauthenticated') {
      // User is not logged in, redirect to login
      router.push('/login')
      return
    }
    
    if (status === 'authenticated' && session?.user) {
      // User is authenticated, check if they're admin
      checkAdminAccess()
    }
  }, [status, session])

  const checkAdminAccess = async () => {
    try {
      setAdminError(null)
      const response = await fetch('/api/admin/check')
      
      if (response.status === 401) {
        // Not authenticated, redirect to login
        router.push('/login')
        return
      }
      
      if (!response.ok) {
        const data = await response.json()
        // Not admin or admin not configured
        setAdminError(data.error || 'Access denied. Admin privileges required.')
        setLoading(false)
        return
      }
      
      // User is admin, fetch data
      await fetchData()
    } catch (error) {
      console.error('Failed to check admin access:', error)
      setAdminError('Failed to verify admin access. Please try again.')
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const [transactionsRes, itemsRes, feedbacksRes, reportsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/items'),
        fetch('/api/feedback'),
        fetch('/api/reports'),
      ])

      const transactionsData = await transactionsRes.json()
      const itemsData = await itemsRes.json()
      const feedbacksData = await feedbacksRes.json()
      const reportsData = await reportsRes.json()

      setTransactions(transactionsData)
      setItems(itemsData)
      setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : [])
      setReports(Array.isArray(reportsData) ? reportsData : [])
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

  const handleDeleteItem = async () => {
    if (!deleteReason || deleteReason.length < 10) {
      alert('Please provide a reason with at least 10 characters')
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/items/${deleteModal.itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      })

      if (response.ok) {
        setDeleteModal({ isOpen: false, itemId: '', itemTitle: '' })
        setDeleteReason('')
        fetchData()
        alert('Item deleted and seller notified')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
    } finally {
      setDeleting(false)
    }
  }

  const updateReportStatus = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to update report status:', error)
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

  const filteredReports = reports.filter((r) => {
    if (reportFilter.status && r.status !== reportFilter.status) return false
    return true
  })

  const getReportReasonLabel = (reason: string) => {
    switch (reason) {
      case 'INAPPROPRIATE': return 'Inappropriate content'
      case 'SCAM': return 'Potential scam'
      case 'FAKE': return 'Fake or misleading'
      case 'SPAM': return 'Spam'
      case 'OTHER': return 'Other'
      default: return reason
    }
  }

  const getReportReasonColor = (reason: string) => {
    switch (reason) {
      case 'SCAM': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      case 'INAPPROPRIATE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
      case 'FAKE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'SPAM': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    }
  }

  // Group reports by item
  const reportsByItem = filteredReports.reduce((acc: any, report: any) => {
    if (!acc[report.itemId]) {
      acc[report.itemId] = {
        item: report.item,
        reports: [],
        count: 0
      }
    }
    acc[report.itemId].reports.push(report)
    acc[report.itemId].count++
    return acc
  }, {})

  const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length

  if (status === 'loading' || (loading && !adminError)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  // Show error if admin access denied
  if (adminError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{adminError}</p>
            {adminError.includes('not configured') && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  ⚠️ Admin access not configured
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  To enable admin access, add your email to the <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">ADMIN_EMAILS</code> environment variable.
                </p>
              </div>
            )}
            <button
              onClick={() => router.push('/')}
              className="btn-primary mt-6"
            >
              Go to Home
            </button>
          </div>
        </div>
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
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'border-primary text-primary dark:text-primary-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiFlag />
            Reports
            {pendingReportsCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingReportsCount}
              </span>
            )}
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
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
                <button
                  onClick={() => setDeleteModal({
                    isOpen: true,
                    itemId: item.id,
                    itemTitle: item.title
                  })}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <FiTrash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Filter by Status</label>
                <select
                  value={reportFilter.status || ''}
                  onChange={(e) => setReportFilter({ status: e.target.value || undefined })}
                  className="input-field"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
              <div className="flex-1"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {Object.keys(reportsByItem).length} reported items ({filteredReports.length} total reports)
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {Object.keys(reportsByItem).length === 0 ? (
              <div className="card text-center py-12">
                <FiFlag className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No reports found</p>
              </div>
            ) : (
              Object.values(reportsByItem).map((group: any) => (
                <div key={group.item.id} className="card">
                  <div className="flex items-start gap-4">
                    {/* Item Image */}
                    {group.item.images?.[0] && (
                      <img
                        src={group.item.images[0]}
                        alt={group.item.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/items/${group.item.id}`}
                            className="font-semibold text-lg hover:text-primary dark:text-gray-100"
                          >
                            {group.item.title}
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Seller: {group.item.seller.name} ({group.item.seller.email})
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Room {group.item.seller.roomNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                            {group.count} report{group.count > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Reports for this item */}
                      <div className="mt-4 space-y-2">
                        {group.reports.map((report: any) => (
                          <div key={report.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getReportReasonColor(report.reason)}`}>
                                  {getReportReasonLabel(report.reason)}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                  report.status === 'DISMISSED' ? 'bg-gray-100 text-gray-700' :
                                  report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {report.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                {report.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Reported by: {report.reporter.name} ({report.reporter.email})
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-3">
                        <select
                          value={group.reports[0]?.status || 'PENDING'}
                          onChange={(e) => updateReportStatus(group.item.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="DISMISSED">Dismissed</option>
                        </select>
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            itemId: group.item.id,
                            itemTitle: group.item.title
                          })}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          <FiTrash2 size={14} />
                          Delete Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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

      {/* Delete Item Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold dark:text-gray-100">Delete Item</h3>
              <button
                onClick={() => {
                  setDeleteModal({ isOpen: false, itemId: '', itemTitle: '' })
                  setDeleteReason('')
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Warning:</strong> This action cannot be undone. The item will be permanently deleted and the seller will be notified.
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are about to delete: <strong className="dark:text-gray-100">{deleteModal.itemTitle}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for deletion (required) *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Explain why this item is being removed (min 10 characters). This message will be shown to the seller."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {deleteReason.length}/10 characters minimum
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ isOpen: false, itemId: '', itemTitle: '' })
                  setDeleteReason('')
                }}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={deleting || deleteReason.length < 10}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  'Deleting...'
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Delete Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

