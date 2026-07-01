'use client'

import Link from 'next/link'
import { BookOpen, Heart, Phone, Users, FileText, LifeBuoy, ArrowRight, Headphones } from 'lucide-react'

const RESOURCE_CATEGORIES = [
  {
    icon: Heart,
    title: 'Grief Support',
    description:
      'Tools and articles to help you process loss with compassion, at your own pace.',
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-400/40',
    iconColor: 'text-rose-300',
    items: [
      'Understanding the stages of grief',
      'Healthy coping strategies',
      'Supporting a grieving friend',
      'Healing rituals and traditions',
    ],
  },
  {
    icon: BookOpen,
    title: 'Memorial Guides',
    description: 'Step-by-step guides to crafting a beautiful tribute and ceremony.',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-400/40',
    iconColor: 'text-amber-300',
    items: [
      'How to write an obituary',
      'Choosing a memorial photo',
      'Planning a funeral service',
      'Ethiopian Orthodox memorial customs',
    ],
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with others who understand. You are never alone.',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-400/40',
    iconColor: 'text-emerald-300',
    items: [
      'Local support circles',
      'Online grief forums',
      'Faith-based community groups',
      'Memorial volunteer network',
    ],
  },
  {
    icon: Phone,
    title: 'Helpline & Counseling',
    description: 'Speak with trained counselors when you need someone to listen.',
    color: 'from-sky-500/20 to-blue-500/10',
    border: 'border-sky-400/40',
    iconColor: 'text-sky-300',
    items: [
      '24/7 grief helpline',
      'Professional counseling referrals',
      'Family counseling services',
      'Children & teens support',
    ],
  },
  {
    icon: FileText,
    title: 'Legal & Estate',
    description: 'Practical guidance for end-of-life planning and family matters.',
    color: 'from-indigo-500/20 to-violet-500/10',
    border: 'border-indigo-400/40',
    iconColor: 'text-indigo-300',
    items: [
      'Death certificate process',
      'Estate planning basics',
      'Will & inheritance guidance',
      'Insurance & benefits checklist',
    ],
  },
  {
    icon: Headphones,
    title: 'Reflections & Audio',
    description: 'Curated music, prayers, and reflections for moments of remembrance.',
    color: 'from-purple-500/20 to-fuchsia-500/10',
    border: 'border-purple-400/40',
    iconColor: 'text-purple-300',
    items: [
      'Memorial music playlist',
      'Guided meditation for grief',
      'Spiritual reflections',
      'Traditional Ethiopian hymns',
    ],
  },
]

const HOTLINES = [
  { label: 'Nefsyimar Grief Helpline', phone: '+251 911 000 000', hours: '24 / 7' },
  { label: 'Family Counseling Center', phone: '+251 911 000 001', hours: 'Mon-Sat 8am-6pm' },
  { label: 'Crisis Support', phone: '+251 911 000 002', hours: '24 / 7' },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent-300/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Header */}
        <div className="text-center mb-14 fade-in px-2 sm:px-0">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-accent-400 font-medium mb-3">
            Care & Compassion
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display mb-4 leading-tight">
            Resources for Your Journey
          </h1>
          <p className="text-accent-200/90 text-sm sm:text-base max-w-lg sm:max-w-2xl mx-auto leading-relaxed">
            Whether you are honoring a recent loss, preparing for a service, or supporting a loved
            one, these resources are here to walk with you, gently, every step of the way.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-10 bg-accent-400/50"></div>
            <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            <div className="h-px w-10 bg-accent-400/50"></div>
          </div>
        </div>

        {/* Resource Grid — mobile: horizontal scroll snap cards */}
        <div className="
          md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 mb-16
          max-md:flex max-md:gap-4 max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory
          max-md:pb-4 max-md:-mx-4 max-md:px-4
          max-md:[&::-webkit-scrollbar]:hidden
        ">
          {RESOURCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.title}
                className={`
                  group relative rounded-[32px] border ${cat.border} bg-gradient-to-br ${cat.color}
                  backdrop-blur-sm hover:-translate-y-1 transition-all duration-300
                  flex flex-col justify-between shadow-2xl shadow-black/20 overflow-hidden
                  p-5 sm:p-6 h-full min-h-[360px]
                  max-md:snap-center max-md:flex-shrink-0 max-md:w-[82vw] max-md:min-h-[340px]
                `}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{cat.title}</h3>
                  </div>
                  <p className="text-sm text-accent-100/80 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <ul className="grid gap-2.5 mt-5">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-gray-200 flex items-start gap-3 leading-relaxed"
                    >
                      <span className="w-2 h-2 bg-accent-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Hotlines — mobile: stacked full-width pill cards */}
        <div className="bg-primary-800/80 border border-accent-500/20 rounded-3xl p-6 sm:p-8 mb-14 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <LifeBuoy className="w-6 h-6 text-accent-300 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Helplines & Crisis Lines</h2>
          </div>
          <div className="
            sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-5
            max-sm:flex max-sm:flex-col max-sm:gap-3
          ">
            {HOTLINES.map((h) => (
              <div
                key={h.label}
                className="
                  bg-primary-900/60 border border-primary-700 rounded-2xl
                  hover:border-accent-400/50 transition-colors shadow-xl shadow-black/20
                  p-5
                  max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-4 max-sm:rounded-2xl max-sm:py-4 max-sm:px-5
                "
              >
                <div className="max-sm:flex-1">
                  <p className="text-xs uppercase tracking-wider text-accent-400 font-semibold mb-1">
                    {h.label}
                  </p>
                  <p className="text-xl font-bold text-white max-sm:text-lg">{h.phone}</p>
                </div>
                <span className="
                  text-sm text-gray-400
                  max-sm:text-xs max-sm:bg-white/5 max-sm:px-2.5 max-sm:py-1 max-sm:rounded-full max-sm:whitespace-nowrap max-sm:flex-shrink-0
                ">{h.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-accent-500/10 via-accent-400/10 to-accent-500/10 border border-accent-400/30 rounded-3xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-display">
            Need someone to talk to?
          </h2>
          <p className="text-accent-200/90 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Our community is here for you. Reach out, share your story, or simply read others' words
            of comfort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex w-full sm:w-auto justify-center items-center px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/30"
            >
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/memorials"
              className="inline-flex w-full sm:w-auto justify-center items-center px-6 py-3 border border-white/40 text-white hover:bg-white/10 rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Explore Memorials
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}