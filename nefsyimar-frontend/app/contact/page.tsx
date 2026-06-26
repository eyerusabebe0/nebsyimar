'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center text-accent-300 hover:text-accent-200 mb-8 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="glass-effect rounded-xl p-5 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-accent-500/20 rounded-full mb-4">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-accent-400" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-accent-300 text-sm sm:text-base">We're here to help and support you</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Contact info — mobile: 2x2 grid of info cards */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-5">Get in Touch</h2>

              {/* Mobile: 2-col card grid. Desktop: original stacked list */}
              <div className="
                grid grid-cols-2 gap-3
                sm:grid-cols-1 sm:gap-0 sm:space-y-4
              ">
                {/* Email */}
                <div className="
                  sm:flex sm:items-start sm:space-x-3
                  max-sm:bg-primary-700/30 max-sm:border max-sm:border-primary-600/50 max-sm:rounded-2xl max-sm:p-4
                ">
                  <Mail className="w-5 h-5 text-accent-400 max-sm:mb-2 sm:mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Email</p>
                    <p className="text-accent-300 text-xs sm:text-sm break-all">support@nefsyimar.com</p>
                    <p className="text-accent-300 text-xs sm:text-sm break-all">info@nefsyimar.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="
                  sm:flex sm:items-start sm:space-x-3
                  max-sm:bg-primary-700/30 max-sm:border max-sm:border-primary-600/50 max-sm:rounded-2xl max-sm:p-4
                ">
                  <Phone className="w-5 h-5 text-accent-400 max-sm:mb-2 sm:mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Phone</p>
                    <p className="text-accent-300 text-xs sm:text-sm">+251-11-XXX-XXXX</p>
                    <p className="text-accent-300 text-xs sm:text-sm">+251-91-XXX-XXXX</p>
                  </div>
                </div>

                {/* Address */}
                <div className="
                  sm:flex sm:items-start sm:space-x-3
                  max-sm:bg-primary-700/30 max-sm:border max-sm:border-primary-600/50 max-sm:rounded-2xl max-sm:p-4
                ">
                  <MapPin className="w-5 h-5 text-accent-400 max-sm:mb-2 sm:mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Address</p>
                    <p className="text-accent-300 text-xs sm:text-sm">
                      Addis Ababa, Ethiopia<br />
                      Bole Sub City<br />
                      Woreda 03
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="
                  sm:flex sm:items-start sm:space-x-3
                  max-sm:bg-primary-700/30 max-sm:border max-sm:border-primary-600/50 max-sm:rounded-2xl max-sm:p-4
                ">
                  <Clock className="w-5 h-5 text-accent-400 max-sm:mb-2 sm:mt-1" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Hours</p>
                    <p className="text-accent-300 text-xs sm:text-sm">
                      Mon–Fri: 8AM–6PM<br />
                      Saturday: 9AM–4PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-5">Send us a Message</h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm sm:text-base"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-sm sm:text-base"
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