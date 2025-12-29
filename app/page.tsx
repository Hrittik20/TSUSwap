'use client'

import Link from 'next/link'
import { FiShoppingBag, FiDollarSign, FiMessageSquare, FiUsers } from 'react-icons/fi'
import { useLanguage } from '@/components/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            {t('home.subtitle')}
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/items" className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg">
              {t('home.browseItems')}
            </Link>
            <Link href="/register" className="bg-primary-800 text-white px-8 py-3 rounded-lg hover:bg-primary-900 transition-colors font-medium text-lg border-2 border-white">
              {t('home.getStarted')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">
          {t('home.whyChoose')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-3xl text-primary dark:text-primary-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.feature1.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.feature1.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="text-3xl text-primary dark:text-primary-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.feature2.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.feature2.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-3xl text-primary dark:text-primary-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.feature3.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.feature3.desc')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-3xl text-primary dark:text-primary-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.feature4.title')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.feature4.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">
            {t('home.howItWorks')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.step1.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.step1.desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.step2.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.step2.desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{t('home.step3.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 dark:text-gray-100">
          {t('home.cta.title')}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {t('home.cta.desc')}
        </p>
        <Link href="/register" className="btn-primary text-lg px-8 py-3">
          {t('home.cta.button')}
        </Link>
      </section>
    </div>
  )
}

