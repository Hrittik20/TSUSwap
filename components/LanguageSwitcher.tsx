'use client'

import { useLanguage } from './LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-1 bg-white bg-opacity-20 dark:bg-opacity-10 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-white dark:bg-gray-700 text-primary dark:text-white'
            : 'text-white hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-20'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ru'
            ? 'bg-white dark:bg-gray-700 text-primary dark:text-white'
            : 'text-white hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-20'
        }`}
      >
        РУ
      </button>
    </div>
  )
}





