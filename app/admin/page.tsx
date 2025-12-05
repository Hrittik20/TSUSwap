'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      // In a real app, you'd only fetch if user is admin
      // For now, show all data
      setTransactions(transactionsData)
      setItems(itemsData)
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

  const totalRevenue = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.commissionAmount, 0)

  const auctionTransactions = transactions.filter(
    (t) => t.item.listingType === 'AUCTION'
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

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
    </div>
  )
}

