import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CatTube - Watch Funny Cat Videos',
  description: 'The best place for cat videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body 
        className={`${inter.className} bg-gray-50 dark:bg-gray-900`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  )
}