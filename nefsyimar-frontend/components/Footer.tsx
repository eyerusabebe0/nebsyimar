import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-primary-950 border-t border-accent-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-6 gap-3 sm:gap-0 max-sm:items-center">
              <Image src="/Logo.png" alt="Nefsyimar" width={40} height={40} className="w-10 h-10 object-contain rounded" />
              <span className="text-2xl font-bold text-white tracking-wide">NEFSYIMAR</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed font-light max-sm:text-sm max-sm:text-center">
              Ethiopia&apos;s trusted digital sanctuary where love, memory, and compassion live forever.
            </p>

            {/* Mobile: contact info as compact icon row */}
            <div className="
              sm:space-y-4
              max-sm:flex max-sm:flex-col max-sm:gap-2 max-sm:items-center
            ">
              <div className="flex items-center space-x-3 text-gray-400 hover:text-accent-300 transition-colors group max-sm:text-sm">
                <div className="p-2 rounded-full bg-accent-500/10 group-hover:bg-accent-500/20 transition-colors flex-shrink-0">
                  <MapPin className="w-4 h-4 text-accent-400" />
                </div>
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-accent-300 transition-colors group max-sm:text-sm">
                <div className="p-2 rounded-full bg-accent-500/10 group-hover:bg-accent-500/20 transition-colors flex-shrink-0">
                  <Mail className="w-4 h-4 text-accent-400" />
                </div>
                <span>info@nefsyimar.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-accent-300 transition-colors group max-sm:text-sm">
                <div className="p-2 rounded-full bg-accent-500/10 group-hover:bg-accent-500/20 transition-colors flex-shrink-0">
                  <Phone className="w-4 h-4 text-accent-400" />
                </div>
                <span>+251 911 123 456</span>
              </div>
            </div>
          </div>

          {/* Quick Links + Support — mobile: side by side in a 2-col grid */}
          <div className="
            sm:contents
            max-sm:col-span-1 max-sm:grid max-sm:grid-cols-2 max-sm:gap-6
          ">
            {/* Quick Links */}
            <div>
              <h3 className="text-accent-400 font-bold mb-4 sm:mb-6 tracking-wider text-sm uppercase">Quick Links</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <Link href="/memorials" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Browse Memorials
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-accent-400 font-bold mb-4 sm:mb-6 tracking-wider text-sm uppercase">Support</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            &copy; 2025 Nefsyimar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}