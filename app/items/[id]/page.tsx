'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiClock, FiMapPin, FiUser, FiPhone, FiMail, FiMessageSquare, FiAlertCircle } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import ShareButton from '@/components/ShareButton'
import { useLanguage } from '@/components/LanguageContext'
import { isLongListed } from '@/lib/utils'

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { t, language } = useLanguage()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH_ON_MEET'>('CASH_ON_MEET')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchItem()
    // Refresh item data every 10 seconds for auction updates
    const interval = setInterval(fetchItem, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      const data = await response.json()
      setItem(data)
      if (data.auction) {
        setBidAmount((data.auction.currentPrice + 1).toString())
      }
    } catch (error) {
      console.error('Failed to fetch item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/login')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/auctions/${item.auction.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(bidAmount) }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to place bid')
        return
      }

      await fetchItem()
      alert('Bid placed successfully!')
    } catch (error) {
      alert('Failed to place bid')
    } finally {
      setProcessing(false)
    }
  }

  const handleBuyNow = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (!confirm('Are you sure you want to purchase this item?')) {
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to create transaction')
        return
      }

      const data = await response.json()
      alert('Purchase successful! The seller will contact you to arrange meetup.')
      
      router.push('/dashboard')
    } catch (error) {
      alert('Failed to complete purchase')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Item not found</p>
      </div>
    )
  }

  const isAuction = item.listingType === 'AUCTION'
  const isOwner = session && (session.user as any)?.id === item.seller.id
  const auctionEnded = isAuction && (!item.auction.isActive || new Date() > new Date(item.auction.endTime))

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Images */}
        <div>
          {item.images[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-md dark:shadow-gray-900/50"
            />
          ) : (
            <div className="w-full h-64 sm:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500">No image available</p>
            </div>
          )}
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3 sm:mt-4">
              {item.images.slice(1).map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${item.title} ${idx + 2}`}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="bg-primary text-white px-3 py-1 rounded text-sm font-medium">
                {isAuction ? t('items.auction') : t('items.buyNow')}
              </span>
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm">
                {item.category}
              </span>
            </div>
            <ShareButton item={item} />
          </div>

          <h1 className="text-3xl font-bold mb-4">{item.title}</h1>

          <div className="flex items-center mb-6">
            <span className="text-4xl font-bold text-primary">
              {(isAuction ? item.auction.currentPrice : item.price).toLocaleString('ru-RU')} ₽
            </span>
            {isAuction && item.auction.bids.length > 0 && (
              <span className="ml-4 text-gray-600">
                ({item.auction.bids.length} {item.auction.bids.length === 1 ? t('item.bid') : t('item.bids')})
              </span>
            )}
          </div>

          {isAuction && (
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
              <div className="flex items-center text-primary mb-2">
                <FiClock className="mr-2" />
                <span className="font-medium">
                  {auctionEnded
                    ? t('item.auctionEnded')
                    : `${t('items.endsIn')} ${formatDistanceToNow(new Date(item.auction.endTime), { addSuffix: true })}`}
                </span>
              </div>
              {!auctionEnded && !isOwner && session && (
                <form onSubmit={handleBid} className="mt-4">
                  <label className="block text-sm font-medium mb-2">{t('item.placeBid')}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      step="1"
                      min={item.auction.currentPrice + 1}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="input-field flex-1"
                      placeholder={t('item.enterAmount')}
                    />
                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-primary disabled:opacity-50 whitespace-nowrap"
                    >
                      {processing ? t('item.bidding') : t('item.bidButton')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('item.commission')}
                  </p>
                </form>
              )}
            </div>
          )}

          {!isAuction && !isOwner && session && (
            <div className="card mb-6">
              <h3 className="font-semibold mb-4">{t('item.purchaseOptions')}</h3>
              <div className="mb-4">
                <div className="flex items-center p-3 border-2 border-primary dark:border-primary rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <div>
                    <div className="font-medium">{t('item.cashOnMeet')}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">No fees, instant exchange</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={processing}
                className="w-full btn-primary disabled:opacity-50"
              >
                {processing ? t('item.processing') : t('item.buyNowButton')}
              </button>
            </div>
          )}

          {isLongListed(item.createdAt) && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FiAlertCircle className="text-orange-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Item Listed for a Long Time
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                    This item has been listed for {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}. 
                    The seller may be unavailable or no longer interested in selling.
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                    ⚠️ Please contact the seller before purchasing to confirm availability.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card mb-6">
            <h3 className="font-semibold mb-4">{t('item.description')}</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="card mb-6">
            <h3 className="font-semibold mb-4">{t('item.details')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('item.condition')}:</span>
                <span className="font-medium">{item.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('item.category')}:</span>
                <span className="font-medium">{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('item.listed')}:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  {isLongListed(item.createdAt) && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs">(Long listed)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">{t('item.sellerInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiUser className="mr-2 text-gray-400" />
                <span>{item.seller.name}</span>
              </div>
              <div className="flex items-center">
                <FiMapPin className="mr-2 text-gray-400" />
                <span>Room {item.seller.roomNumber}</span>
              </div>
              {item.seller.email && (
                <div className="flex items-center">
                  <FiMail className="mr-2 text-gray-400" />
                  <span>{item.seller.email}</span>
                </div>
              )}
              {item.seller.phoneNumber && (
                <div className="flex items-center">
                  <FiPhone className="mr-2 text-gray-400" />
                  <span>{item.seller.phoneNumber}</span>
                </div>
              )}
              {!isOwner && session && (
                <Link
                  href={`/messages?userId=${item.seller.id}`}
                  className="flex items-center text-primary hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <FiMessageSquare className="mr-2" />
                  <span>Send Message</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAuction && item.auction.bids.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{t('item.bidHistory')}</h2>
          <div className="card">
            <div className="space-y-3">
              {item.auction.bids.map((bid: any) => (
                <div key={bid.id} className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                  <span className="font-medium">{bid.bidder.name}</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{bid.amount.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

