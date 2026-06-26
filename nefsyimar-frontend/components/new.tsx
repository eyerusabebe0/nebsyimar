'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="Memorial Background"
          fill
          className="object-cover object-right"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/98 via-primary-900/85 to-primary-900/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl fade-in">
          {/* Logo and Motto Section */}
          <div className="mb-8">
            <Image
              src="/Logo.png"
              alt="Nefsyimar Logo"
              width={220}
              height={220}
              className="w-40 h-40 md:w-52 md:h-52 object-contain rounded-lg"
            />
            <h1 className="mt-4 text-accent-400 font-serif italic text-2xl md:text-3xl tracking-wide drop-shadow-md">
              "Remembering someone you love"
            </h1>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base mb-10 max-w-md leading-relaxed">
            Nefsyimar is a place to remember your loved ones, share their story, and keep their memory alive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/memorials/create"
              className="px-7 py-3.5 bg-accent-500 hover:bg-accent-600 text-white rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/20"
            >
              Create Memorial
            </Link>
            <Link
              href="/memorials"
              className="px-7 py-3.5 border border-white/60 text-white hover:bg-white/10 rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Explore Memorials
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}