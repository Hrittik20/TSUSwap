'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi'

export default function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) {
    return null
  }

  const userName = session.user.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const profileImage = (session.user as any)?.profileImage

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover border-2 border-white border-opacity-30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 dark:bg-opacity-10 flex items-center justify-center">
            <span className="text-sm font-semibold">{userInitial}</span>
          </div>
        )}
        <span className="hidden lg:inline">{userName}</span>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiUser />
              <span className="text-gray-900 dark:text-gray-200">Dashboard</span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiSettings />
              <span className="text-gray-900 dark:text-gray-200">Profile</span>
            </Link>
            <div className="border-t dark:border-gray-700 my-1"></div>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left text-red-600 dark:text-red-400"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

