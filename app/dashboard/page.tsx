'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPackage, FiShoppingCart, FiDollarSign, FiUser } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import SellerWarning from '@/components/SellerWarning'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [userItems, setUserItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling')

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
        fetch('/api/items'),
      ])

      const transactionsData = await transactionsRes.json()
      const itemsData = await itemsRes.json()

      setTransactions(transactionsData)
      
      // Filter user's items
      const myItems = itemsData.filter(
        (item: any) => item.seller.id === (session?.user as any)?.id
      )
      setUserItems(myItems)
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

      {/* Seller Warning */}
      {sales.some((t: any) => t.status === 'FUNDS_HELD') && <SellerWarning />}

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
            {userItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't listed any items yet</p>
                <Link href="/items/create" className="btn-primary">
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              userItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {item.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
                    <div className="text-right text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
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
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {transaction.item.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          Seller: {transaction.seller.name} (Room {transaction.seller.roomNumber})
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="font-medium text-primary">{transaction.amount.toLocaleString('ru-RU')} ₽</span>
                          <span className="text-gray-500">
                            {transaction.paymentMethod === 'CARD' ? 'Card Payment' : 'Cash on Meet'}
                          </span>
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
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </div>
                      {transaction.status === 'FUNDS_HELD' && transaction.buyerId === (session?.user as any).id && (
                        <div>
                          <button
                            onClick={async () => {
                              if (confirm('Have you received and inspected the item? Only confirm if it matches the description and is in good condition.')) {
                                await fetch(`/api/transactions/${transaction.id}/complete`, {
                                  method: 'POST',
                                })
                                fetchData()
                              }
                            }}
                            className="btn-primary text-sm"
                          >
                            Confirm Receipt
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            Only confirm after inspecting the item!
                          </p>
                        </div>
                      )}
                      {transaction.status === 'FUNDS_HELD' && transaction.sellerId === (session?.user as any).id && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                          <p className="text-xs text-yellow-800 font-medium">⚠️ Seller Warning:</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            DO NOT hand over the item until buyer confirms receipt in your presence!
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
    </div>
  )
}

