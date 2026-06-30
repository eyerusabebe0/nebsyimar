'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Users, Globe, ArrowRight, Calendar } from 'lucide-react'
import { HeadstonePreview } from './HeadstoneMemorial'
import api from '@/lib/api'

const previewStoneIds = ['stone_2', 'stone_3', 'stone_4', 'stone_6', 'stone_8', 'stone_9', 'stone_10'] as const
const VALID_HEADSTONE_DESIGNS = [
  'stone_1', 'stone_2', 'stone_3', 'stone_4', 'stone_6', 'stone_8', 'stone_9', 'stone_10'
] as const
const HEADSTONE_BASE = { width: 220, height: 300 }
const BIO_SNIPPET_LENGTH = 50



function getHeadstoneDesign(design?: string) {
  if (!design) return undefined
  const normalized = design.trim()
  return VALID_HEADSTONE_DESIGNS.includes(normalized as any)
    ? (normalized as typeof VALID_HEADSTONE_DESIGNS[number])
    : undefined
}

const STONE_VISUAL_ADJUST: Record<string, { zoom: number; offsetY: number }> = {
  stone_1:  { zoom: 1.0, offsetY: 0 },
  stone_2:  { zoom: 1.0, offsetY: 0 },
  stone_3:  { zoom: 1.0, offsetY: 0 },
  stone_4:  { zoom: 1.0, offsetY: 0 },
  stone_6:  { zoom: 1.0, offsetY: 0 },
  stone_8:  { zoom: 1.0, offsetY: 0 },
  stone_9:  { zoom: 1.0, offsetY: 0 },
  stone_10: { zoom: 1.0, offsetY: 0 },
}

function getStoneAdjust(design?: string) {
  if (!design) return { zoom: 1.0, offsetY: 0 }
  return STONE_VISUAL_ADJUST[design] ?? { zoom: 1.0, offsetY: 0 }
}

// stone_9 just gets extra side spacing so it doesn't crowd its neighbors —
// no shrinking, renders at full size like the rest
const STONE9_EXTRA_GAP = 36

function formatMemorialDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatYearOnlyDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.getFullYear().toString()
}

export default function HomeLanding() {
  const [memorials, setMemorials] = useState<any[]>([])
  const [recentMemorials, setRecentMemorials] = useState<any[]>([])
  const [showAllRecentMemorials, setShowAllRecentMemorials] = useState(false)
  const router = useRouter()
  const [headstoneScale, setHeadstoneScale] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 360) setHeadstoneScale(0.78)
      else if (window.innerWidth < 480) setHeadstoneScale(0.88)
      else if (window.innerWidth < 640) setHeadstoneScale(0.94)
      else if (window.innerWidth < 768) setHeadstoneScale(0.97)
      else setHeadstoneScale(1)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
  const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

  const resolveImage = (path?: string | null) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
    return path
  }

  const marqueeItems = memorials.length > 4 ? [...memorials, ...memorials, ...memorials] : memorials

  const scaledWidth = HEADSTONE_BASE.width * headstoneScale
  const scaledHeight = HEADSTONE_BASE.height * headstoneScale
  const NAME_BOX_HEIGHT = 36
  const CARD_HEIGHT = scaledHeight + NAME_BOX_HEIGHT

const RenderCard = ({ m, idx }: { m: any; idx: number }) => {
    const apiDesign = typeof m.memorial_settings?.headstone_design === 'string'
      ? m.memorial_settings.headstone_design
      : undefined
    const design = apiDesign
      ? getHeadstoneDesign(apiDesign) ?? 'stone_2'
      : previewStoneIds[idx % previewStoneIds.length]
    const isStone9 = design === 'stone_9'
    const { offsetY } = getStoneAdjust(design)

    return (
      <Link
        href={`/memorials/${m.memorial_id}`}
        className="flex-shrink-0 group"
        style={{
          marginLeft: isStone9 ? STONE9_EXTRA_GAP : 0,
          marginRight: isStone9 ? STONE9_EXTRA_GAP : 0,
        }}
      >
        <div
          className="flex flex-col items-center justify-between rounded-3xl"
          style={{
            width: scaledWidth,
            height: CARD_HEIGHT,
          }}
        >
          <div
            style={{
              width: scaledWidth,
              height: scaledHeight,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '14px',
              transform: `translateY(${offsetY}px)`,
            }}
          >
            <HeadstonePreview
              memorial={{
                name: m.deceased_name,
                dates: [m.date_of_birth, m.date_of_death]
                  .filter(Boolean)
                  .map((d) => new Date(d!).getFullYear())
                  .join(' – '),
                image: resolveImage(m.profile_image),
              }}
              selectedDesignId={design as any}
              width={scaledWidth}
              height={scaledHeight}
            />
          </div>
          <div className="text-center flex-shrink-0" style={{ width: scaledWidth, height: NAME_BOX_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 className="font-semibold text-xs sm:text-sm text-white/90 truncate tracking-wide">
              {m.deceased_name}
            </h3>
          </div>
        </div>
      </Link>
    )
  }

  const getBioText = (m: any) =>
    m.biography || m.life_story || m.bio || m.description || ''

  const getSnippet = (text: string) => {
    if (!text) return ''
    if (text.length <= BIO_SNIPPET_LENGTH) return text
    return text.slice(0, BIO_SNIPPET_LENGTH).trim() + '…'
  }

  const getCreatedAt = (item: any) => item.created_at || item.createdAt || ''

  const getRelativeDateLabel = (dateInput?: string | null) => {
    if (!dateInput) return 'Recently added'

    const date = new Date(dateInput)
    if (Number.isNaN(date.getTime())) return 'Recently added'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    if (normalizedDate.getTime() === today.getTime()) return 'Today'
    if (normalizedDate.getTime() === yesterday.getTime()) return 'Yesterday'

    return normalizedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const displayedRecentMemorials = showAllRecentMemorials ? recentMemorials : recentMemorials.slice(0, 4)

  const loadMemorials = async () => {
    try {
      const res = await api.get('/memorials')
      const allData = res.data?.data?.memorials || []
      setMemorials(allData)

      const sorted = [...allData]
        .filter((m: any) => getCreatedAt(m))
        .sort((a: any, b: any) => new Date(getCreatedAt(b)).getTime() - new Date(getCreatedAt(a)).getTime())

      setRecentMemorials(sorted.slice(0, 10))
    } catch (err) {
      console.error('Failed to load', err)
    }
  }

  useEffect(() => {
    loadMemorials()
    intervalRef.current = setInterval(loadMemorials, 30000)
    window.addEventListener('focus', loadMemorials)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.removeEventListener('focus', loadMemorials)
    }
  }, [])

  return (
    <main className="bg-primary-950 min-h-screen text-white">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative min-h-[40vh] md:min-h-[72vh] flex items-center mb-50">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        <div className="absolute inset-0 bg-black/78" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)', opacity: 0.65 }} />

        <div className="relative z-10 w-full px-5 sm:px-8 md:px-16 py-7 md:py-24">
          <div className="flex items-center gap-2.5 md:gap-5 mb-3 md:mb-8">
            <Image src="/Logo.png" alt="Nefsyimar" width={40} height={40} className="object-contain md:w-[74px] md:h-[74px]" />
            <div className="w-px h-8 md:h-14" style={{ background: 'rgba(212,175,55,0.35)' }} />
            <div>
              <p className="text-[8px] md:text-[11px] font-medium tracking-[0.22em] uppercase mb-0.5" style={{ color: 'rgba(212,175,55,0.75)' }}>
                Digital Memorial Platform
              </p>
              <p className="text-[9px] md:text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Ethiopia's first
              </p>
            </div>
          </div>

          <p className="font-serif italic mb-2 md:mb-5 text-lg sm:text-xl md:text-2xl" style={{ color: 'rgba(212,175,55,0.75)' }}>
            "Remembering someone you love"
          </p>

          <p className="text-xs sm:text-sm md:text-base leading-relaxed max-w-md mb-4 md:mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            A sacred digital space to honor loved ones,
            <br />
            share stories, and keep memories alive.
          </p>

          <div className="flex flex-row gap-2 md:gap-3 max-w-full">
            <Link
              href="/memorials"
              className="inline-flex flex-1 md:flex-none items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[11px] md:text-[13px] font-bold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap"
              style={{ background: '#D4AF37', color: '#000' }}
            >
              Browse <ArrowRight size={12} />
            </Link>
            <Link
              href="/memorials/create"
              className="inline-flex flex-1 md:flex-none items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[11px] md:text-[13px] font-semibold tracking-wide transition-all duration-200 whitespace-nowrap"
              style={{ border: '1px solid rgba(212,175,55,0.45)', color: '#D4AF37' }}
            >
              Create Memorial
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ MARQUEE ══════════════════ */}
      <section className="pt-5 pb-4 md:pt-8 md:pb-6 overflow-hidden">

        <div className="h-px mb-7 -mt-8" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.45), transparent)' }} />
        <div className="max-w-7xl mx-auto px-5 md:px-8 mb-7 md:mb-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] md:text-[11px] font-medium tracking-[0.18em] uppercase mb-1" style={{ color: 'rgba(212,175,55,0.58)' }}>
              In Loving Memory
            </p>
            <h2 className="text-lg sm:text-xl md:text-3xl font-serif font-bold text-white leading-tight">
              Remembering Beautiful Lives
            </h2>
          </div>
          <Link
            href="/memorials"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
            style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.28)' }}
          >
            See All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2 md:mb-3">
          <div className="h-px w-10 sm:w-14 md:w-20" style={{ background: 'rgba(212,175,55,0.45)' }} />
          <Heart size={14} fill="#D4AF37" style={{ color: '#D4AF37' }} />
          <div className="h-px w-10 sm:w-14 md:w-20" style={{ background: 'rgba(212,175,55,0.45)' }} />
        </div>

        <div className="overflow-hidden mb-1 -mt-7 md:mb-2">
          <div className="flex gap-3 md:gap-5 items-end marquee-left">
            {marqueeItems.map((m, i) => (
              <div key={`r1-${i}`} className="flex-shrink-0">
                <RenderCard m={m} idx={i} />
              </div>
            ))}
          </div>
        </div>

        <div className="h-px mt-3" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.22), transparent)' }} />
      </section>

      {/* ══════════════════ RECENTLY CREATED ══════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-14">
        <div className="mb-5 md:mb-7 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} style={{ color: '#D4AF37' }} />
              <p className="text-[9px] md:text-[11px] font-medium tracking-[0.18em] uppercase text-[#D4AF37]/60">
                Recently Created
              </p>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Latest Memorials</h2>
          </div>
        </div>

        {recentMemorials.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {displayedRecentMemorials.map((m: any) => {
                const dob = formatYearOnlyDate(m.date_of_birth);
                const dod = formatYearOnlyDate(m.date_of_death);
                const lifespan = dob && dod ? `${dob} – ${dod}` : dob ? `b. ${dob}` : dod ? `d. ${dod}` : null;
                const createdAtLabel = getRelativeDateLabel(getCreatedAt(m));
                const bioText = getBioText(m);
                const snippet = getSnippet(bioText);

                return (
                  <Link
                    href={`/memorials/${m.memorial_id}`}
                    key={m.memorial_id}
                    className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/50 transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                      {m.profile_image ? (
                        <img
                          src={resolveImage(m.profile_image)}
                          alt={m.deceased_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart size={24} className="text-[#D4AF37]/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm border border-white/5">
                        <span className="text-[9px] font-bold text-white uppercase tracking-[0.14em]">
                          {createdAtLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-bold text-[13px] text-white truncate">{m.deceased_name}</h3>
                      {lifespan ? (
                        <p className="mt-0.5 text-[10px] text-[#D4AF37]/70">{lifespan}</p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-white/45">Memorial created</p>
                      )}
                      <p className="mt-2 text-[10px] leading-5 text-white/60">
                        {snippet || 'A memorial tribute created to honor a life and preserve cherished memories.'}
                      </p>
                      <span className="mt-2 inline-flex items-center text-[10px] font-semibold text-[#D4AF37]">
                        Read more <ArrowRight size={10} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {recentMemorials.length > 4 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAllRecentMemorials((prev) => !prev)}
                  className="px-6 py-2 text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/20 rounded-full hover:bg-[#D4AF37]/10 transition-all"
                >
                  {showAllRecentMemorials ? 'Show less' : `See all memorials (${recentMemorials.length})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 border border-white/5 bg-white/[0.02] rounded-xl">
            <p className="text-sm text-white/30">No memorials yet — be the first to create one.</p>
          </div>
        )}
      </section>

      {/* ══════════════════ ABOUT ══════════════════ */}
      <section className="py-10 md:py-20 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8">

          <div className="flex flex-col items-center text-center mb-8 md:mb-14">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}>
              <Heart size={18} style={{ color: '#D4AF37' }} className="md:hidden" />
              <Heart size={22} style={{ color: '#D4AF37' }} className="hidden md:block" />
            </div>
            <p className="text-[9px] md:text-[11px] font-medium tracking-[0.22em] uppercase mb-1.5" style={{ color: 'rgba(212,175,55,0.60)' }}>Our Mission</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-serif font-bold text-white mb-2 md:mb-3">About Nefsyimar</h2>
            <div className="w-10 md:w-14 h-px" style={{ background: 'rgba(212,175,55,0.40)' }} />
          </div>

          <div className="relative mb-8 md:mb-12 max-w-3xl mx-auto">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full hidden md:block"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.55), transparent)' }} />
            <div className="md:pl-8">
              <p className="text-xs sm:text-sm md:text-lg leading-relaxed font-light text-center md:text-left"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
                Nefsyimar is Ethiopia's first digital memorial platform, designed to honor the deceased,
                connect communities, and preserve memories with dignity and compassion. We provide a
                sacred digital space where families and friends can come together to celebrate lives
                and keep memories alive forever.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { icon: <Heart size={14} style={{ color: '#D4AF37' }} />, iconMd: <Heart size={20} style={{ color: '#D4AF37' }} />, title: 'Compassionate', desc: 'Respectful of Ethiopian traditions', descMd: 'Built with deep respect for Ethiopian cultural traditions and grieving practices' },
              { icon: <Users size={14} style={{ color: '#D4AF37' }} />, iconMd: <Users size={20} style={{ color: '#D4AF37' }} />, title: 'Community', desc: 'Families connected', descMd: 'Connecting families, friends, and communities in times of remembrance' },
              { icon: <Globe size={14} style={{ color: '#D4AF37' }} />, iconMd: <Globe size={20} style={{ color: '#D4AF37' }} />, title: 'Accessible', desc: 'Ethiopian languages', descMd: 'Available in multiple Ethiopian languages with culturally appropriate features' },
            ].map(({ icon, iconMd, title, desc, descMd }) => (
              <div key={title} className="flex flex-col items-center md:items-start text-center md:text-left p-3 md:p-7 rounded-xl md:rounded-2xl transition-all duration-300"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-7 h-7 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-5"
                  style={{ background: 'rgba(212,175,55,0.09)', border: '1px solid rgba(212,175,55,0.18)' }}>
                  <span className="md:hidden">{icon}</span>
                  <span className="hidden md:block">{iconMd}</span>
                </div>
                <p className="text-[10px] md:text-base font-semibold text-white mb-0.5 md:mb-2">{title}</p>
                <p className="text-[9px] leading-snug md:hidden" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
                <p className="text-sm leading-relaxed hidden md:block" style={{ color: 'rgba(255,255,255,0.45)' }}>{descMd}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .marquee-left { animation: scrollLeft 42s linear infinite; will-change: transform; }
        .marquee-right { animation: scrollRight 42s linear infinite; will-change: transform; }
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes scrollRight { 0% { transform: translateX(-33.333%); } 100% { transform: translateX(0); } }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}