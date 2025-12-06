'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-8'

  return (
    <div className={containerClass}>
      <div className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">{text}</p>
      )}
    </div>
  )
}

