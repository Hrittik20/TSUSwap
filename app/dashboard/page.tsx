'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPackage, FiShoppingCart, FiDollarSign, FiUser } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ToastProvider'
import ConfirmModal from '@/components/ConfirmModal'
// SellerWarning component removed - using inline warning for pending sales

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [transactions, setTransactions] = useState<any[]>([])
  const [userItems, setUserItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling')
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'complete' | 'cancel' | 'relist' | null
    transactionId?: string
    itemId?: string
    itemTitle?: string
  }>({
    isOpen: false,
    type: null,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [transactionsRes, itemsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/user/items'), // Fetch all user items including SOLD
      ])

      const transactionsData = await transactionsRes.json()
      const itemsData = await itemsRes.json()

      setTransactions(transactionsData)
      setUserItems(itemsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  const purchases = transactions.filter(
    (t) => t.buyer.id === (session?.user as any)?.id
  )
  const sales = transactions.filter(
    (t) => t.seller.id === (session?.user as any)?.id
  )

  const activeItems = userItems.filter((item) => item.status === 'ACTIVE')
  const soldItems = userItems.filter((item) => item.status === 'SOLD')

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {session?.user?.name}!
          </p>
          {(session?.user as any)?.dormitory && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📍 {(session?.user as any).dormitory.charAt(0).toUpperCase() + (session?.user as any).dormitory.slice(1)}, Room {(session?.user as any)?.roomNumber}
            </p>
          )}
        </div>
        <Link href="/profile" className="btn-primary">
          <FiUser className="inline mr-2" />
          View Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-primary">{activeItems.length}</p>
            </div>
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center">
              <FiPackage className="text-2xl text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Items Sold</p>
              <p className="text-3xl font-bold text-green-600">{soldItems.length}</p>
            </div>
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Purchases</p>
              <p className="text-3xl font-bold text-blue-600">{purchases.length}</p>
            </div>
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
              <FiShoppingCart className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Seller Warning for Pending Sales */}
      {sales.some((t: any) => t.status === 'PENDING') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
            ⚠️ Important: Seller Confirmation Required
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            You have pending sales. Only confirm transactions after you have received cash payment in person from the buyer. 
            This prevents buyers from confirming online and then not showing up.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'selling'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('selling')}
          >
            My Listings
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'buying'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('buying')}
          >
            My Purchases
          </button>
        </div>

        {activeTab === 'selling' ? (
          <div className="space-y-4">
            {/* Pending Sales - Need Seller Confirmation */}
            {sales.filter((t: any) => t.status === 'PENDING').length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                  ⚠️ Pending Sales - Awaiting Your Confirmation
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  These buyers have purchased your items. Please confirm only after you have received payment in person.
                </p>
                <div className="space-y-3">
                  {sales
                    .filter((t: any) => t.status === 'PENDING')
                    .map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              {transaction.item.images[0] && (
                                <img
                                  src={transaction.item.images[0]}
                                  alt={transaction.item.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div>
                                <Link
                                  href={`/items/${transaction.item.id}`}
                                  className="font-semibold hover:text-primary dark:text-gray-100"
                                >
                                  {transaction.item.title}
                                </Link>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  Buyer: {transaction.buyer.name} (Room {transaction.buyer.roomNumber})
                                </p>
                                <p className="text-sm font-medium text-primary mt-1">
                                  {transaction.amount.toLocaleString('ru-RU')} ₽
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'complete',
                                    transactionId: transaction.id,
                                    itemTitle: transaction.item.title,
                                  })
                                }}
                                className="btn-primary text-sm"
                              >
                                Confirm Payment Received
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'cancel',
                                    transactionId: transaction.id,
                                    itemTitle: transaction.item.title,
                                  })
                                }}
                                className="btn-secondary text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                              >
                                Cancel Transaction
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {userItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't listed any items yet</p>
                <Link href="/items/create" className="btn-primary">
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              userItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      {item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/items/${item.id}`}
                          className="text-lg font-semibold hover:text-primary dark:text-gray-100"
                        >
                          {item.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-primary">
                            {(item.listingType === 'AUCTION'
                              ? item.auction?.currentPrice
                              : item.price)?.toLocaleString('ru-RU')} ₽
                          </span>
                          <span>{item.listingType === 'AUCTION' ? 'Auction' : 'Buy Now'}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </div>
                      {(item.status === 'SOLD' || item.status === 'CANCELLED') && (
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              type: 'relist',
                              itemId: item.id,
                              itemTitle: item.title,
                            })
                          }}
                          className="btn-secondary text-sm"
                        >
                          Relist Item
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't made any purchases yet</p>
                <Link href="/items" className="btn-primary">
                  Browse Items
                </Link>
              </div>
            ) : (
              purchases.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      {transaction.item.images[0] && (
                        <img
                          src={transaction.item.images[0]}
                          alt={transaction.item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/items/${transaction.item.id}`}
                          className="text-lg font-semibold hover:text-primary dark:text-gray-100"
                        >
                          {transaction.item.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Seller: {transaction.seller.name} (Room {transaction.seller.roomNumber})
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="font-medium text-primary">{transaction.amount.toLocaleString('ru-RU')} ₽</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {transaction.paymentMethod === 'CARD' ? 'Card Payment' : 'Cash on Meet'}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              transaction.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : transaction.status === 'PENDING'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {transaction.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </div>
                      {transaction.status === 'PENDING' && transaction.buyerId === (session?.user as any).id && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                            ⏳ Waiting for seller confirmation
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            The seller will confirm after receiving payment. Contact them to arrange the meetup.
                          </p>
                        </div>
                      )}
                      {transaction.status === 'COMPLETED' && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                          <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                            ✓ Transaction Completed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={async () => {
          if (confirmModal.type === 'complete' && confirmModal.transactionId) {
            try {
              const response = await fetch(
                `/api/transactions/${confirmModal.transactionId}/complete`,
                { method: 'POST' }
              )
              if (response.ok) {
                showToast('Transaction confirmed successfully!', 'success')
                fetchData()
              } else {
                const data = await response.json()
                showToast(data.error || 'Failed to confirm transaction', 'error')
              }
            } catch (error) {
              showToast('Failed to confirm transaction', 'error')
            }
          } else if (confirmModal.type === 'cancel' && confirmModal.transactionId) {
            try {
              const response = await fetch(
                `/api/transactions/${confirmModal.transactionId}/cancel`,
                { method: 'POST' }
              )
              if (response.ok) {
                showToast('Transaction cancelled. Item is now available for sale again.', 'success')
                fetchData()
              } else {
                const data = await response.json()
                showToast(data.error || 'Failed to cancel transaction', 'error')
              }
            } catch (error) {
              showToast('Failed to cancel transaction', 'error')
            }
          } else if (confirmModal.type === 'relist' && confirmModal.itemId) {
            try {
              const response = await fetch(`/api/items/${confirmModal.itemId}/relist`, {
                method: 'POST',
              })
              if (response.ok) {
                showToast('Item relisted successfully!', 'success')
                fetchData()
              } else {
                const data = await response.json()
                showToast(data.error || 'Failed to relist item', 'error')
              }
            } catch (error) {
              showToast('Failed to relist item', 'error')
            }
          }
        }}
        title={
          confirmModal.type === 'complete'
            ? 'Confirm Payment Received'
            : confirmModal.type === 'cancel'
            ? 'Cancel Transaction'
            : 'Relist Item'
        }
        message={
          confirmModal.type === 'complete'
            ? `Have you received the payment in person for "${confirmModal.itemTitle}"? Only confirm after you have received the cash payment from the buyer.`
            : confirmModal.type === 'cancel'
            ? `Cancel this transaction for "${confirmModal.itemTitle}"? The item will be made available for sale again. Only cancel if the buyer did not show up or did not pay.`
            : `Relist "${confirmModal.itemTitle}"? It will become available for purchase again.`
        }
        confirmText={
          confirmModal.type === 'complete'
            ? 'Yes, I Received Payment'
            : confirmModal.type === 'cancel'
            ? 'Yes, Cancel Transaction'
            : 'Yes, Relist'
        }
        cancelText="Cancel"
        confirmButtonClass={
          confirmModal.type === 'cancel'
            ? 'btn-secondary bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800'
            : 'btn-primary'
        }
      />
    </div>
  )
}

