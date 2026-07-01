'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export default function StatsSection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
    setEmail('')
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <section className="relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Gold top line */}
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.35), transparent)' }} />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 md:py-20">

        {/* Mobile: stacked, compact */}
        <div className="md:hidden space-y-8">

          {/* Quote block */}
          <div className="relative pl-4" style={{ borderLeft: '2px solid rgba(212,175,55,0.40)' }}>
            <span className="text-4xl font-serif leading-none absolute -top-2 -left-2" style={{ color: 'rgba(212,175,55,0.50)' }}>"</span>
            <blockquote className="text-sm italic font-light leading-relaxed pl-3" style={{ color: 'rgba(255,255,255,0.60)' }}>
              Those we love don't go away,<br />
              they walk beside us every day.<br />
              Unseen, unheard, but always near,<br />
              still loved, still missed, and very dear.
            </blockquote>
            <div className="flex items-center gap-2 mt-4 pl-3">
              <div className="h-px w-8" style={{ background: 'rgba(212,175,55,0.30)' }} />
              <Image src="/Logo.png" alt="" width={18} height={18} className="opacity-50 rounded-sm" />
              <div className="h-px w-8" style={{ background: 'rgba(212,175,55,0.30)' }} />
            </div>
          </div>

          {/* Subscribe block */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-1">Join Our Community</h3>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Subscribe for memorial stories and helpful resources.
            </p>

            {done ? (
              <div className="flex items-center gap-2 py-3 px-4 rounded-xl text-sm"
                style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}>
                <CheckCircle size={15} />
                Subscribed! Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-row items-stretch gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="min-w-0 flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', caretColor: '#D4AF37' }}
                />
                <button
                  type="submit"
                  className="shrink-0 px-4 py-3 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-200 active:scale-95"
                  style={{ background: '#D4AF37', color: '#000' }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Desktop: side by side — unchanged feel */}
        <div className="hidden md:flex items-center gap-16 lg:gap-24">
          <div className="flex-1">
            <div className="relative pl-6" style={{ borderLeft: '2px solid rgba(212,175,55,0.40)' }}>
              <span className="text-6xl font-serif leading-none absolute -top-4 -left-4" style={{ color: 'rgba(212,175,55,0.45)' }}>"</span>
              <blockquote className="text-xl md:text-2xl italic font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                Those we love don't go away,<br />
                they walk beside us every day.<br />
                Unseen, unheard, but always near,<br />
                still loved, still missed, and very dear.
              </blockquote>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-px w-12" style={{ background: 'rgba(212,175,55,0.30)' }} />
                <Image src="/Logo.png" alt="" width={24} height={24} className="opacity-55 rounded-sm" />
                <div className="h-px w-12" style={{ background: 'rgba(212,175,55,0.30)' }} />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Join Our Community</h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Subscribe to receive updates, memorial stories, and helpful resources.
            </p>

            {done ? (
              <div className="flex items-center gap-2 py-3 px-5 rounded-xl text-sm"
                style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}>
                <CheckCircle size={16} />
                Subscribed! Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', caretColor: '#D4AF37' }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 whitespace-nowrap"
                  style={{ background: '#D4AF37', color: '#000' }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.35), transparent)' }} />
    </section>
  )
}