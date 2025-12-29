'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DORMITORIES } from '@/lib/dormitories'
import { UNIVERSITIES } from '@/lib/universities'
import { useLanguage } from '@/components/LanguageContext'
import { useToast } from '@/components/ToastProvider'

export default function RegisterPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    university: 'tsu', // Default to TSU
    dormitory: '',
    roomNumber: '',
    phoneNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate Gmail
    const domain = formData.email.split('@')[1]?.toLowerCase()
    if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
      setError('Only Gmail addresses (@gmail.com or @googlemail.com) are allowed')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful but login failed. Please try logging in.')
        return
      }

      showToast('Account created successfully!', 'success')
      router.push('/items')
      router.refresh()
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Join TSUSwap
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your account and start trading
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.email')} (Gmail only)
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="your@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only @gmail.com or @googlemail.com addresses are allowed
              </p>
            </div>

            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University / Университет
              </label>
              <select
                id="university"
                required
                className="input-field"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              >
                {UNIVERSITIES.map((uni) => (
                  <option key={uni.value} value={uni.value}>
                    {language === 'ru' ? uni.labelRu : uni.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {language === 'ru' ? 'Больше университетов появится в будущем' : 'More universities coming soon'}
              </p>
            </div>

            <div>
              <label htmlFor="dormitory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dormitory / Общежитие
              </label>
              <select
                id="dormitory"
                required
                className="input-field"
                value={formData.dormitory}
                onChange={(e) => setFormData({ ...formData, dormitory: e.target.value })}
              >
                <option value="">Select dormitory / Выберите общежитие</option>
                {DORMITORIES.map((dorm) => (
                  <option key={dorm.value} value={dorm.value}>
                    {language === 'ru' ? dorm.labelRu : dorm.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.roomNumber')}
              </label>
              <input
                id="roomNumber"
                type="text"
                required
                placeholder={t('auth.roomPlaceholder')}
                className="input-field"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className="input-field"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


