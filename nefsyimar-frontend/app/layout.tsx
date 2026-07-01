import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nefsyimar - Digital Grieving Platform',
  description: 'Ethiopia\'s trusted digital sanctuary where love, memory, and compassion live forever.',
  keywords: 'memorial, grieving, Ethiopia, digital platform, tribute, condolence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen bg-primary-900 text-gray-200">
              {children}
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
