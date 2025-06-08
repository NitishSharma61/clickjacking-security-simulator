import type { Metadata } from 'next'
import './globals.css'
import '@/lib/event-store' // Initialize event store

export const metadata: Metadata = {
  title: 'C&C Dashboard - Attack Monitor',
  description: 'Command & Control Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}