import './globals.css'

export const metadata = {
  title: 'Zerodha Multi-Trade',
  description: 'Manage multiple Zerodha accounts with advanced SL and Targets',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <main className="min-h-screen flex flex-col mx-auto max-w-md bg-white shadow-xl relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
