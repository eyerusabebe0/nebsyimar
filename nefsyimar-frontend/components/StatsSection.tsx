'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function StatsSection() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription
    setEmail('')
  }

  return (
    <section className="py-20 bg-primary-900 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Side - Quote */}
          <div className="lg:w-1/2">
            <div className="relative">
              <span className="text-6xl text-accent-400 font-serif leading-none absolute -top-4 -left-4">&ldquo;</span>
              <blockquote className="text-xl md:text-2xl text-accent-300 italic font-light leading-relaxed pl-8">
                Those we love don&apos;t go away,<br />
                they walk beside us every day.<br />
                Unseen, unheard, but always near,<br />
                still loved, still missed, and very dear.
              </blockquote>
              {/* Decorative element */}
              <div className="flex items-center gap-2 mt-6 pl-8">
                <div className="h-px w-12 bg-accent-400/30"></div>
                <Image src="/Logo.jpg" alt="" width={24} height={24} className="w-6 h-6 opacity-60 rounded-sm" />
                <div className="h-px w-12 bg-accent-400/30"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Subscribe */}
          <div className="lg:w-1/2">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-display">
              Join Our Community
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Subscribe to receive updates, memorial stories, and helpful resources.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg uppercase text-sm tracking-wider transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
