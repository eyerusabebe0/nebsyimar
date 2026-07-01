'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, Gift, ShoppingBag, Users } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/"
          className="inline-flex items-center text-accent-300 hover:text-accent-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="glass-effect rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Our Services</h1>
            <p className="text-accent-300">Comprehensive memorial and tribute services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Digital Memorials</h3>
                  <p className="text-accent-300">
                    Create beautiful, lasting digital memorials with photos, stories, and memories 
                    that can be shared with family and friends worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Tribute Gifts</h3>
                  <p className="text-accent-300">
                    Send meaningful digital gifts including white roses, candles of peace, 
                    doves of mercy, and eternal lights to honor the deceased.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Memorial Marketplace</h3>
                  <p className="text-accent-300">
                    Access a curated marketplace of memorial products and services from 
                    trusted Ethiopian vendors and artisans.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Community Support</h3>
                  <p className="text-accent-300">
                    Connect with others who understand your journey, share condolences, 
                    and find comfort in our supportive community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-accent-700">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Ready to Get Started?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Create Account
                </Link>
                <Link
                  href="/memorials"
                  className="px-6 py-3 border border-accent-500 text-accent-300 hover:text-white hover:bg-accent-500/20 font-semibold rounded-lg transition-all duration-300"
                >
                  Browse Memorials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
