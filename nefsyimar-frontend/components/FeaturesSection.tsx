'use client'

import { FileText, Users, Calendar, Heart } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Create Memorial',
    description: 'Build a beautiful memorial page to honor your loved one\'s life and legacy.',
    num: '01',
  },
  {
    icon: Users,
    title: 'Share & Invite',
    description: 'Invite family and friends to contribute memories, photos and messages.',
    num: '02',
  },
  {
    icon: Calendar,
    title: 'Memorial Events',
    description: 'Organize and share memorial events and keep everyone informed.',
    num: '03',
  },
  {
    icon: Heart,
    title: 'Support & Comfort',
    description: 'Find resources and support to help you through the journey of grief.',
    num: '04',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 animated-dark-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header — same on all screens ── */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[10px] md:text-sm uppercase tracking-[0.2em] text-accent-400 font-medium mb-2 md:mb-3">
            What We Offer
          </p>
          <h2 className="text-xl md:text-4xl font-bold text-white font-display mb-3 md:mb-4">
            ,<br className="md:hidden" /> Supporting Hearts
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
            <div className="h-px w-6 md:w-8 bg-accent-400/50" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-accent-400 rounded-full" />
            <div className="h-px w-6 md:w-8 bg-accent-400/50" />
          </div>
        </div>

        {/* ── DESKTOP: unchanged 4-col grid ── */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="feature-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-accent-500/10 rounded-2xl flex items-center justify-center border border-accent-500/30">
                <feature.icon className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-display">{feature.title}</h3>
              <p className="text-sm text-accent-200/80 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* ── MOBILE: premium mixed layout ── */}
        <div className="md:hidden flex flex-col gap-2.5">

          {/* Card 1 — full width hero card */}
          <div
            className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/30 bg-white/5"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest">01</span>
                  <h3 className="text-[13px] font-bold text-white">Create Memorial</h3>
                </div>
                <p className="text-[10.5px] text-white/50 leading-snug">
                  Build a beautiful memorial page to honor your loved one's life and legacy.
                </p>
              </div>
            </div>
            {/* decorative gold corner */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5"
              style={{ background: 'radial-gradient(circle at top right, #D4AF37, transparent 70%)' }} />
          </div>

          {/* Cards 2 & 3 — side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            {[features[1], features[2]].map((f, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/20 p-3.5"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/15 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-[8.5px] font-black text-[#D4AF37]/40 tracking-widest block mb-0.5">
                  {i === 0 ? '02' : '03'}
                </span>
                <h3 className="text-[11.5px] font-bold text-white mb-1 leading-tight">{f.title}</h3>
                <p className="text-[9.5px] text-white/45 leading-snug">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Card 4 — full width, different accent treatment */}
          <div
            className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/15 p-4"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.05) 100%)' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest">04</span>
                  <h3 className="text-[13px] font-bold text-white">Support & Comfort</h3>
                </div>
                <p className="text-[10.5px] text-white/50 leading-snug">
                  Find resources and support to help you through the journey of grief.
                </p>
              </div>
            </div>
            {/* gold pill tag */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <span className="text-[8px] font-bold text-[#D4AF37] tracking-wider uppercase">Always here</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}