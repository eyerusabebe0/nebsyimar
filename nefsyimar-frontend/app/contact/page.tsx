'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
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
              <Mail className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-accent-300">We're here to help and support you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-accent-300">support@nefsyimar.com</p>
                    <p className="text-accent-300">info@nefsyimar.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-accent-300">+251-11-XXX-XXXX</p>
                    <p className="text-accent-300">+251-91-XXX-XXXX</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Address</p>
                    <p className="text-accent-300">
                      Addis Ababa, Ethiopia<br />
                      Bole Sub City<br />
                      Woreda 03
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-accent-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Business Hours</p>
                    <p className="text-accent-300">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Send us a Message</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
