import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clickjacking Attack Simulation Platform',
  description: 'Educational platform to understand and prevent clickjacking attacks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} bg-gray-50 dark:bg-gray-900`}
        suppressHydrationWarning={true}
      >
        <nav className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Clickjacking Security Training
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2">
                  Home
                </a>
                <a href="/analytics" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2">
                  Analytics
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-100 dark:bg-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            This is an educational security awareness platform. All simulations are for training purposes only.
          </div>
        </footer>
      </body>
    </html>
  )
}