'use client'

import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
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
              <FileText className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
            <p className="text-accent-300">Please read these terms carefully</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-accent-300 space-y-6">
              <p>
                Welcome to Nefsyimar. By using our platform, you agree to these Terms of Service.
              </p>

              <h2 className="text-xl font-semibold text-white">Acceptance of Terms</h2>
              <p>
                By accessing and using Nefsyimar, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h2 className="text-xl font-semibold text-white">Use of Service</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining account security</li>
                <li>You agree to use the service respectfully and lawfully</li>
                <li>Memorial content must be appropriate and respectful</li>
              </ul>

              <h2 className="text-xl font-semibold text-white">Payments and Refunds</h2>
              <p>
                All payments are processed securely. Refund policies apply as outlined in our 
                refund policy section.
              </p>

              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p>
                For questions about these Terms, contact us at 
                <span className="text-white"> legal@nefsyimar.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
