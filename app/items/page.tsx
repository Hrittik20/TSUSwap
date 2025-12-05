'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiClock, FiTag, FiSearch } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

interface Item {
  id: string
  title: string
  description: string
  price?: number
  images: string[]
  category: string
  condition: string
  listingType: string
  createdAt: string
  seller: {
    name: string
    roomNumber: string
  }
  auction?: {
    currentPrice: number
    endTime: string
    isActive: boolean
    bids: any[]
  }
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    search: '',
    category: '',
    listingType: '',
  })

  useEffect(() => {
    fetchItems()
  }, [filter])

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.search) params.append('search', filter.search)
      if (filter.category) params.append('category', filter.category)
      if (filter.listingType) params.append('listingType', filter.listingType)

      const response = await fetch(`/api/items?${params}`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Electronics',
    'Furniture',
    'Books',
    'Clothing',
    'Kitchen',
    'Sports',
    'Other',
  ]

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Browse Items</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="input-field pl-10"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>

          <select
            className="input-field"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={filter.listingType}
            onChange={(e) => setFilter({ ...filter, listingType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="REGULAR">Buy Now</option>
            <option value="AUCTION">Auction</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No items found</p>
          <Link href="/items/create" className="btn-primary">
            List Your First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="card hover:shadow-lg transition-shadow dark:bg-gray-800"
            >
              <div className="relative mb-4">
                {item.images[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-48 sm:h-56 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FiTag className="text-4xl text-gray-400" />
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                  {item.listingType === 'AUCTION' ? 'Auction' : 'Buy Now'}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {item.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary">
                  {(item.listingType === 'AUCTION' ? item.auction?.currentPrice : item.price)?.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-sm text-gray-500">{item.condition}</span>
              </div>

              {item.listingType === 'AUCTION' && item.auction && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <FiClock className="mr-1" />
                  <span>
                    Ends {formatDistanceToNow(new Date(item.auction.endTime), { addSuffix: true })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                <span>{item.seller.name}</span>
                <span>Room {item.seller.roomNumber}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

