'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'

import MemorialGrid from '@/components/MemorialGrid'
import SearchFilters from '@/components/SearchFilters'

export default function MemorialsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950"></div>
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent-500/15 blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent-400/10 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-accent-300/10 blur-3xl animate-blob animation-delay-4000"></div>

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 18 }).map((_, idx) => (
            <span
              key={idx}
              className="memorial-particle"
              style={{
                left: `${(idx * 53) % 100}%`,
                top: `${(idx * 37) % 100}%`,
                animationDelay: `${(idx % 8) * 0.6}s`,
                animationDuration: `${10 + (idx % 6) * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs uppercase tracking-[0.25em] font-semibold mb-4">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Memorial Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
            Lives Remembered
          </h1>
          <p className="text-lg text-accent-200/90 max-w-2xl mx-auto leading-relaxed">
            Browse and honor the memories of loved ones in our digital sanctuary. Light a candle.
            Leave a tribute. Carry their story forward.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="h-px w-10 bg-accent-400/50"></div>
            <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            <div className="h-px w-10 bg-accent-400/50"></div>
          </div>
          <div className="mt-7 flex justify-center">
            <Link
              href="/memorials/create"
              className="inline-flex items-center bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-sm transition-all duration-300 shadow-lg shadow-accent-500/40 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Memorial
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters onSearch={setSearchTerm} />

        {/* Memorial Grid */}
        <MemorialGrid searchTerm={searchTerm} />
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob {
          animation: blob 18s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .memorial-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212, 168, 83, 0.6);
          box-shadow: 0 0 10px rgba(212, 168, 83, 0.55);
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0% {
            transform: translateY(20vh) translateX(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translateY(-110vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
