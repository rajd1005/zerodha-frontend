import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// New standard for Next.js 14: Viewport and ThemeColor move here
export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata = {
  title: 'Zerodha Multi-Trade',
  description: 'Manage multiple Zerodha accounts with advanced SL and Targets',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trade Manager',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <main className="min-h-screen flex flex-col mx-auto max-w-md bg-white shadow-xl relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
