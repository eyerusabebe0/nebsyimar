'use client'

import Link from 'next/link'
import { ArrowLeft, Heart, Mail, Phone, MessageCircle } from 'lucide-react'

export default function HelpPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
            <p className="text-accent-300">We're here to help you honor and remember</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Contact Us</h2>
              
              <div className="flex items-center space-x-3 text-accent-300">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-white">Email Support</p>
                  <p className="text-sm">support@nefsyimar.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-accent-300">
                <Phone className="w-5 h-5" />
                <div>
                  <p className="text-white">Phone Support</p>
                  <p className="text-sm">+251-11-XXX-XXXX</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-accent-300">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <p className="text-white">Live Chat</p>
                  <p className="text-sm">Available 24/7</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Quick Links</h2>
              
              <div className="space-y-3">
                <Link href="/about" className="block text-accent-300 hover:text-white transition-colors">
                  About Nefsyimar
                </Link>
                <Link href="/terms" className="block text-accent-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-accent-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="block text-accent-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
