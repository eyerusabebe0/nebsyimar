'use client'

import { FileText, Users, Calendar, Heart } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Create Memorial',
    description: 'Build a beautiful memorial page to honor your loved one\'s life and legacy.',
  },
  {
    icon: Users,
    title: 'Share & Invite',
    description: 'Invite family and friends to contribute memories, photos and messages.',
  },
  {
    icon: Calendar,
    title: 'Memorial Events',
    description: 'Organize and share memorial events and keep everyone informed.',
  },
  {
    icon: Heart,
    title: 'Support & Comfort',
    description: 'Find resources and support to help you through the journey of grief.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 animated-dark-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-accent-400 font-medium mb-3">
            What We Offer
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
            Honoring Lives, Supporting Hearts
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px w-8 bg-accent-400/50"></div>
            <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            <div className="h-px w-8 bg-accent-400/50"></div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </section>
  )
}
