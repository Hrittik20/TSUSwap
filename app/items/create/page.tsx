'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CreateItemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    listingType: 'REGULAR',
    startPrice: '',
    auctionDuration: '72',
    images: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
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

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to upload image')
        return
      }

      const data = await response.json()
      if (data.url && !formData.images.includes(data.url)) {
        setFormData({
          ...formData,
          images: [...formData.images, data.url],
        })
      }
    } catch (error) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleImageUrl = (url: string) => {
    if (url && !formData.images.includes(url)) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.images.length === 0) {
      setError('Please add at least one image URL')
      return
    }

    if (formData.listingType === 'REGULAR' && !formData.price) {
      setError('Price is required for regular listings')
      return
    }

    if (formData.listingType === 'AUCTION' && !formData.startPrice) {
      setError('Start price is required for auctions')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        listingType: formData.listingType,
        images: formData.images,
      }

      if (formData.listingType === 'REGULAR') {
        payload.price = parseFloat(formData.price)
      } else {
        const startPrice = parseFloat(formData.startPrice)
        payload.startPrice = startPrice
        // Reserve price defaults to starting price (simpler for users)
        payload.reservePrice = startPrice
        payload.auctionDuration = parseInt(formData.auctionDuration)
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create listing')
        return
      }

      const data = await response.json()
      router.push(`/items/${data.id}`)
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">List an Item</h1>

      <form onSubmit={handleSubmit} className="card space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Listing Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
              <input
                type="radio"
                name="listingType"
                value="REGULAR"
                checked={formData.listingType === 'REGULAR'}
                onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Buy Now</div>
                <div className="text-sm text-gray-500">No commission fees</div>
              </div>
            </label>
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
              <input
                type="radio"
                name="listingType"
                value="AUCTION"
                checked={formData.listingType === 'AUCTION'}
                onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Auction</div>
                <div className="text-sm text-gray-500">5% commission</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            required
            className="input-field"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., iPhone 13 Pro Max"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={5}
            className="input-field"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your item in detail..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              required
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition *
            </label>
            <select
              id="condition"
              required
              className="input-field"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="">Select condition</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.listingType === 'REGULAR' ? (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (₽) *
            </label>
            <input
              id="price"
              type="number"
              step="1"
              min="0"
              required
              className="input-field"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="startPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Starting Price (₽) *
              </label>
              <input
                id="startPrice"
                type="number"
                step="1"
                min="0"
                required
                className="input-field"
                value={formData.startPrice}
                onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will also be your minimum acceptable price (reserve price)
              </p>
            </div>

            <div>
              <label htmlFor="auctionDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Duration (hours) *
              </label>
              <select
                id="auctionDuration"
                className="input-field"
                value={formData.auctionDuration}
                onChange={(e) => setFormData({ ...formData, auctionDuration: e.target.value })}
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">7 days</option>
              </select>
            </div>

            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm text-primary-700">
                <strong>Note:</strong> A 5% commission will be applied to the final sale price for auction items.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images * (Upload or add URL)
          </label>
          <div className="space-y-3">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload image (JPEG, PNG, WebP - Max 5MB)'}
                </span>
              </label>
            </div>

            {/* Or URL Input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            <input
              type="url"
              className="input-field"
              placeholder="Enter image URL and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleImageUrl((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Add image URLs (e.g., from Imgur, Google Drive, etc.). Press Enter after each URL.
            </p>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Item ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}





