'use client'

import { useTheme } from './ThemeProvider'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-20 dark:bg-opacity-10 hover:bg-opacity-30 dark:hover:bg-opacity-20 transition-colors text-white"
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <FiMoon size={20} />
      ) : (
        <FiSun size={20} />
      )}
    </button>
  )
}

