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
            <br className="md:hidden" /> Supporting Hearts
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
      <div className="md:hidden grid grid-cols-2 gap-2.5">
  
  {/* Card 1 */}
  <div className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/30 bg-white/5 p-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-3">
      <FileText className="w-5 h-5 text-[#D4AF37]" />
    </div>
    <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest block mb-0.5">01</span>
    <h3 className="text-[12px] font-bold text-white mb-1">Create Memorial</h3>
    <p className="text-[10px] text-white/50 leading-snug">Build a beautiful page to honor their legacy.</p>
  </div>

  {/* Card 2 */}
  <div className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/20 bg-white/5 p-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-3">
      {/* Replace with your Icon */}
      <div className="w-4 h-4 bg-[#D4AF37]/50 rounded-full" /> 
    </div>
    <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest block mb-0.5">02</span>
    <h3 className="text-[12px] font-bold text-white mb-1">{features[1]?.title}</h3>
    <p className="text-[10px] text-white/50 leading-snug">{features[1]?.description}</p>
  </div>

  {/* Card 3 */}
  <div className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/20 bg-white/5 p-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-3">
      {/* Replace with your Icon */}
      <div className="w-4 h-4 bg-[#D4AF37]/50 rounded-full" />
    </div>
    <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest block mb-0.5">03</span>
    <h3 className="text-[12px] font-bold text-white mb-1">{features[2]?.title}</h3>
    <p className="text-[10px] text-white/50 leading-snug">{features[2]?.description}</p>
  </div>

  {/* Card 4 */}
  <div className="relative rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/20 bg-white/5 p-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-3">
      <Heart className="w-4.5 h-4.5 text-[#D4AF37]" />
    </div>
    <span className="text-[9px] font-black text-[#D4AF37]/50 tracking-widest block mb-0.5">04</span>
    <h3 className="text-[12px] font-bold text-white mb-1">Support</h3>
    <p className="text-[10px] text-white/50 leading-snug">Find resources to help through grief.</p>
  </div>

</div>
      </div>
    </section>
  )
}