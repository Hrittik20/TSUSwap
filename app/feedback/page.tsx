'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiSend, FiAlertCircle, FiLightbulb, FiTrendingUp, FiHelpCircle } from 'react-icons/fi'
import { useToast } from '@/components/ToastProvider'

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    type: 'FEATURE',
    title: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast('Thank you for your feedback! We appreciate your input.', 'success')
        setFormData({ type: 'FEATURE', title: '', description: '' })
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to submit feedback', 'error')
      }
    } catch (error) {
      showToast('Failed to submit feedback', 'error')
    } finally {
      setLoading(false)
    }
  }

  const feedbackTypes = [
    { value: 'BUG', label: 'Bug Report', icon: FiAlertCircle, description: 'Report a problem or error' },
    { value: 'FEATURE', label: 'Feature Request', icon: FiLightbulb, description: 'Suggest a new feature' },
    { value: 'IMPROVEMENT', label: 'Improvement', icon: FiTrendingUp, description: 'Suggest an improvement' },
    { value: 'OTHER', label: 'Other', icon: FiHelpCircle, description: 'General feedback or suggestions' },
  ]

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">Feedback & Suggestions</h1>
        <p className="text-gray-600 dark:text-gray-300">
          We value your input! Share your ideas, report issues, or suggest improvements to help us make TSUSwap better.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium mb-3 dark:text-gray-200">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon
                        className={`text-xl mt-0.5 ${
                          formData.type === type.value
                            ? 'text-primary'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                      <div>
                        <div className={`font-medium ${
                          formData.type === type.value
                            ? 'text-primary dark:text-primary-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your feedback"
              className="input-field w-full"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about your feedback, suggestion, or issue..."
              className="input-field w-full min-h-[200px] resize-y"
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FiSend />
              <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-6 card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">
          💡 Tips for Effective Feedback
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Be specific and provide clear details</li>
          <li>For bug reports, include steps to reproduce the issue</li>
          <li>For feature requests, explain how it would benefit users</li>
          <li>Include any relevant screenshots or examples if possible</li>
        </ul>
      </div>
    </div>
  )
}

