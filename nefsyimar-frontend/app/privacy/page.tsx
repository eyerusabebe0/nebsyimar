'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-accent-300">Your privacy is important to us</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-accent-300 space-y-6">
              <p>
                At Nefsyimar, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>

              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal information (name, email, phone number)</li>
                <li>Memorial and tribute information</li>
                <li>Payment and transaction data</li>
                <li>Usage and analytics data</li>
              </ul>

              <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide and improve our services</li>
                <li>To process payments and transactions</li>
                <li>To communicate with you about your account</li>
                <li>To ensure platform security and prevent fraud</li>
              </ul>

              <h2 className="text-xl font-semibold text-white">Data Protection</h2>
              <p>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-xl font-semibold text-white">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at 
                <span className="text-white"> privacy@nefsyimar.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
