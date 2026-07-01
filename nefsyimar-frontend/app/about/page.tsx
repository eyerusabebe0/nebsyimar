'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, Users, Globe } from 'lucide-react'

export default function AboutPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2">About Nefsyimar</h1>
            <p className="text-accent-300">Ethiopia's trusted digital sanctuary for honoring the deceased</p>
          </div>

          <div className="space-y-8">
            <div className="text-accent-300">
              <p className="text-lg leading-relaxed">
               Nefsyimar is Ethiopia’s pioneer digital memorial platform and the world's first to integrate interactive 3D monuments, offering a dignified global space for honoring loved ones. By combining immersive virtual legacy preservation with a seamless digital gifting ecosystem—including symbolic flowers and candles—it empowers families and communities worldwide to celebrate lives, share grief, and sustain enduring memories with profound respect.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-500/20 rounded-full mb-4">
                  <Heart className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Compassionate</h3>
                <p className="text-accent-300 text-sm">
                  Built with deep respect for Ethiopian cultural traditions and grieving practices
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-500/20 rounded-full mb-4">
                  <Users className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                <p className="text-accent-300 text-sm">
                  Connecting families, friends, and communities in times of remembrance
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-500/20 rounded-full mb-4">
                  <Globe className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Accessible</h3>
                <p className="text-accent-300 text-sm">
                  Available in multiple Ethiopian languages with culturally appropriate features
                </p>
              </div>
            </div>

            <div className="border-t border-accent-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-accent-300">
                To provide a dignified, culturally respectful platform where Ethiopian families 
                can honor their loved ones, share memories, and find comfort in community support 
                during times of grief and remembrance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
