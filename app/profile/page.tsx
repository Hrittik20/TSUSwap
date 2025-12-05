'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiUser, FiMapPin, FiPhone, FiMail, FiEdit2, FiArrowLeft, FiCamera } from 'react-icons/fi'
import { useLanguage } from '@/components/LanguageContext'
import { getDormitoryLabel } from '@/lib/dormitories'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/user/profile/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to upload image')
        return
      }

      const data = await response.json()
      // Refresh profile to show new image
      await fetchProfile()
    } catch (error) {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Profile not found</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const dormitoryLabel = getDormitoryLabel(user.dormitory, language)

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center text-primary hover:text-primary-600 mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="card text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                />
              ) : (
                <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center">
                  <FiUser className="text-5xl text-primary" />
                </div>
              )}
              <label
                htmlFor="profile-upload"
                className={`absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Upload profile picture"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="profile-upload"
                />
                {uploading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiCamera size={16} />
                )}
              </label>
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">{user.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-1">TSU Student</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <Link href="/dashboard" className="btn-primary w-full block text-center">
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FiUser className="text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium dark:text-gray-200">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FiMail className="text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium dark:text-gray-200">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FiPhone className="text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium dark:text-gray-200">{user.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Dorm Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMapPin className="text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dormitory</p>
                  <p className="font-medium text-lg dark:text-gray-200">{dormitoryLabel}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FiMapPin className="text-gray-400 dark:text-gray-500 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Room Number</p>
                  <p className="font-medium text-lg dark:text-gray-200">Room {user.roomNumber}</p>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                  <strong>Full Address:</strong><br />
                  {dormitoryLabel}, Room {user.roomNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Account Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{user._count?.items || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Listings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{user._count?.sales || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sold</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{user._count?.purchases || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Purchased</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


