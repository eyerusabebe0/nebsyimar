'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User, LogIn, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { totalItems } = useCart()

  const isAdmin = user?.role === 'Administrator'
  const isVendor = user?.role === 'Vendor'

  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', href: '/admin' },
        { name: 'Memorial Admin', href: '/admin/memorials' },
        { name: 'Marketplace Admin', href: '/admin/marketplace' },
      ]
    : isVendor
    ? []
    : [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Memorials', href: '/memorials' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Events', href: '/events' },
        { name: 'Resources', href: '/resources' },
        { name: 'Contact', href: '/contact' },
      ]

  const dashboardHref = isAdmin ? '/admin' : isVendor ? '/vendor' : '/dashboard'
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : isVendor ? 'Vendor Dashboard' : 'Dashboard'

  return (
    <nav className="glass-effect sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAdmin ? '/admin' : isVendor ? '/vendor' : '/'} className="flex items-center space-x-2">
            <Image src="/Logo.jpg" alt="Nebsyimar" width={44} height={44} className="w-11 h-11 object-contain rounded" />
            <span className="text-xl font-bold text-white tracking-wider font-display">NEBSYIMAR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-200 hover:text-accent-400 transition-colors duration-200 uppercase tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side: Login + Create Memorial */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden xl:block text-sm">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-primary-900 rounded-lg shadow-xl border border-accent-700/30 py-2 z-50">
                    <Link
                      href={dashboardHref}
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {dashboardLabel}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <hr className="border-white/10 my-2" />
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-200 hover:text-accent-400 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
            <Link
              href="/memorials/create"
              className="px-5 py-2 border border-accent-400 text-accent-400 hover:bg-accent-400 hover:text-primary-900 rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Create Memorial
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200 hover:text-white transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200 uppercase text-sm tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="border-t border-white/10 pt-2 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-300">
                      <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="block px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {dashboardLabel}
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="block px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/memorials/create"
                      className="block px-3 py-2 mt-2 text-center border border-accent-400 text-accent-400 rounded-md text-sm font-semibold uppercase tracking-wider"
                      onClick={() => setIsOpen(false)}
                    >
                      Create Memorial
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
