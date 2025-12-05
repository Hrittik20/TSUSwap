import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { LanguageProvider } from '@/components/LanguageContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TSUSwap - TSU Dorm Marketplace',
  description: 'Buy and sell items within Tomsk State University dorms. Safe, secure, and easy marketplace for students.',
  keywords: ['marketplace', 'university', 'dorm', 'buy', 'sell', 'auction', 'students', 'TSU', 'Tomsk'],
  authors: [{ name: 'TSUSwap' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    title: 'TSUSwap - TSU Dorm Marketplace',
    description: 'Buy and sell items within Tomsk State University dorms',
    url: 'https://tsuswap.ru',
    siteName: 'TSUSwap',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TSUSwap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TSUSwap - TSU Dorm Marketplace',
    description: 'Buy and sell items within Tomsk State University dorms',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TSUSwap" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
            <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 mt-16">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2025 TSUSwap. All rights reserved.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Secure marketplace for Tomsk State University students
                </p>
              </div>
            </footer>
          </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
