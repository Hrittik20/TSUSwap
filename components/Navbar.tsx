'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FiMessageSquare, FiPlusCircle, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'
import { useLanguage } from './LanguageContext'

export default function Navbar() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-primary dark:bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-primary-200 dark:hover:text-primary-300 transition-colors">
            TSUSwap
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Browse Items - Always visible */}
            <Link
              href="/items"
              className="flex items-center space-x-1 hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
            >
              <FiShoppingBag />
              <span>{t('nav.items')}</span>
            </Link>

            {/* Show these ONLY when authenticated */}
            {status === 'authenticated' && (
              <>
                <Link
                  href="/items/create"
                  className="flex items-center space-x-1 hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
                >
                  <FiPlusCircle />
                  <span>{t('nav.sell')}</span>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center space-x-1 hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
                >
                  <FiMessageSquare />
                  <span>{t('nav.messages')}</span>
                </Link>

                <NotificationBell />

                <UserMenu />
              </>
            )}

            {/* Show these ONLY when NOT authenticated */}
            {status === 'unauthenticated' && (
              <>
                <Link
                  href="/login"
                  className="hover:text-primary-200 dark:hover:text-primary-300 transition-colors px-3 py-2 rounded"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-white dark:bg-gray-700 text-primary dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Language Switcher - Always visible */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white border-opacity-20 py-4">
            <div className="flex flex-col space-y-2">
              {/* Browse Items - Always visible */}
              <Link
                href="/items"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <FiShoppingBag />
                <span>{t('nav.items')}</span>
              </Link>

              {/* Show these ONLY when authenticated */}
              {status === 'authenticated' && (
                <>
                  <Link
                    href="/items/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <FiPlusCircle />
                    <span>{t('nav.sell')}</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <FiMessageSquare />
                    <span>{t('nav.messages')}</span>
                  </Link>

                  <div className="px-4 py-3">
                    <NotificationBell />
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <span>{t('nav.dashboard')}</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors text-left w-full text-red-200"
                  >
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              )}

              {/* Show these ONLY when NOT authenticated */}
              {status === 'unauthenticated' && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors text-center"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-center font-medium"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {/* Mobile Language Switcher */}
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
