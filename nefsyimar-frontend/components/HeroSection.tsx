'use client';

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Users, Globe, ArrowRight, Calendar } from 'lucide-react'
import { HeadstonePreview } from './HeadstoneMemorial'
import api from '@/lib/api'

const previewStoneIds = ['stone_2', 'stone_3', 'stone_4', 'stone_6', 'stone_7', 'stone_8', 'stone_9'] as const
const HEADSTONE_BASE = { width: 220, height: 300 }
const BIO_SNIPPET_LENGTH = 50

// stone_9 just gets extra side spacing so it doesn't crowd its neighbors —
// no shrinking, renders at full size like the rest
const STONE9_EXTRA_GAP = 36

function formatMemorialDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function HomeLanding() {
  const [memorials, setMemorials] = useState<any[]>([])
  const [recentMemorials, setRecentMemorials] = useState<any[]>([])
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
    if (!path) return '/images.jpg'
    if (path.startsWith('http')) return path
    if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
    return path
  }

  const row1 = memorials.filter((_, i) => i % 2 === 0)

  const scaledWidth = HEADSTONE_BASE.width * headstoneScale
  const scaledHeight = HEADSTONE_BASE.height * headstoneScale
  const CARD_HEIGHT = scaledHeight + 80

  const RenderCard = ({ m, idx }: { m: any; idx: number }) => {
    const design = previewStoneIds[idx % previewStoneIds.length]
    const isStone9 = design === 'stone_9'

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
          className="flex flex-col items-center justify-end rounded-3xl"
          style={{
            width: scaledWidth,
            height: CARD_HEIGHT,
          }}
        >
          <div
            style={{
              width: scaledWidth,
              height: scaledHeight,
              position: 'relative',
              overflow: 'hidden',
             
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '14px',
            }}
          >
            <div style={{
              width: HEADSTONE_BASE.width,
              height: HEADSTONE_BASE.height,
              transform: `scale(${headstoneScale})`,
              transformOrigin: 'bottom center',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              marginLeft: -(HEADSTONE_BASE.width / 2),
            }}>
              <HeadstonePreview
                memorial={{
                  name: m.deceased_name,
                  dates: [m.date_of_birth, m.date_of_death]
                    .filter(Boolean)
                    .map((d) => new Date(d!).getFullYear())
                    .join(' – '),
                  image: resolveImage(m.profile_image),
                  headstoneDesign: design,
                }}
                width={HEADSTONE_BASE.width}
                height={HEADSTONE_BASE.height}
              />
            </div>
          </div>
          <div className="mt-6 text-center flex-shrink-0" style={{ width: scaledWidth }}>
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
      <section className="relative min-h-[40vh] md:min-h-[72vh] flex items-center">
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

        <p className="font-serif italic mb-2 md:mb-5 text-sm md:text-lg" style={{ color: 'rgba(212,175,55,0.68)' }}>
  "Remembering someone you love"
</p>

          <div className="mb-4 md:mb-10">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-0.5">
              
            </h1>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif font-bold leading-tight">
              <span style={{ color: '#D4AF37' }}>Preserving</span>
              <span className="text-white"> Memories</span>
            </h1>
          </div>

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

        <div className="max-w-7xl mx-auto px-5 md:px-8 mb-3 md:mb-5 flex items-end justify-between">
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

        <div className="h-px mb-3" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.22), transparent)' }} />

        <div className="overflow-hidden mb-2 md:mb-3">
          <div className="flex gap-3 md:gap-5 items-end marquee-left">
            {[...row1, ...row1, ...row1].map((m, i) => (
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
              <p className="text-[9px] md:text-[11px] font-medium tracking-[0.18em] uppercase" style={{ color: 'rgba(212,175,55,0.58)' }}>
                Recently Created
              </p>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-white">Latest Memorials</h2>
          </div>
          {recentMemorials.length > 0 && (
            <span className="text-[10px] md:text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {recentMemorials.length} memorial{recentMemorials.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {recentMemorials.length > 0 ? (
          <>
            <div className="md:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {recentMemorials.map((m) => {
                const dob = m.date_of_birth ? new Date(m.date_of_birth).getFullYear() : null
                const dod = m.date_of_death ? new Date(m.date_of_death).getFullYear() : null
                const lifespan = dob && dod ? `${dob} – ${dod}` : dob ? `b. ${dob}` : null
                const bioText = getBioText(m)
                const snippet = getSnippet(bioText)
                const hasMore = bioText.length > BIO_SNIPPET_LENGTH

                return (
                  <Link
                    href={`/memorials/${m.memorial_id}`}
                    key={m.memorial_id}
                    className="flex items-start gap-3 py-4 active:opacity-70 transition-opacity"
                  >
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {m.profile_image ? (
                        <img
                          src={resolveImage(m.profile_image)}
                          alt={m.deceased_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart size={18} style={{ color: 'rgba(212,175,55,0.45)' }} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] text-white leading-tight mb-1 truncate">
                        {m.deceased_name}
                      </h3>
                      {snippet ? (
                        <p className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {snippet}
                          {hasMore && (
                            <span className="ml-1 font-semibold whitespace-nowrap" style={{ color: '#D4AF37' }}>
                              Read more
                            </span>
                          )}
                        </p>
                      ) : lifespan ? (
                        <p className="text-[13px]" style={{ color: 'rgba(212,175,55,0.75)' }}>{lifespan}</p>
                      ) : (
                        <span className="text-[13px] font-semibold" style={{ color: '#D4AF37' }}>
                          View memorial
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="hidden md:block relative group">
              <div
                id="scroll-container"
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
              >
                {recentMemorials.map((m) => {
                  const dob = m.date_of_birth ? new Date(m.date_of_birth).getFullYear() : null
                  const dod = m.date_of_death ? new Date(m.date_of_death).getFullYear() : null
                  const lifespan = dob && dod ? `${dob} – ${dod}` : dob ? `b. ${dob}` : null
                  const bioText = getBioText(m)
                  const snippet = getSnippet(bioText)
                  const hasMore = bioText.length > BIO_SNIPPET_LENGTH
                  const createdAt = getCreatedAt(m)
                  const createdLabel = createdAt ? formatMemorialDate(createdAt) : ''

                  return (
                    <Link
                      href={`/memorials/${m.memorial_id}`}
                      key={m.memorial_id}
                      className="group relative flex-shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{
                        width: '260px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(212,175,55,0.15)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }} />
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900">
                        {m.profile_image ? (
                          <img
                            src={resolveImage(m.profile_image)}
                            alt={m.deceased_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart size={26} style={{ color: 'rgba(212,175,55,0.40)' }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-base text-white leading-tight mb-0.5 truncate">
                          {m.deceased_name}
                        </h3>
                        {lifespan && (
                          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(212,175,55,0.80)' }}>
                            {lifespan}
                          </p>
                        )}
                        {createdLabel && (
                          <p className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
                            Added {createdLabel}
                          </p>
                        )}
                        {snippet ? (
                          <p className="text-sm leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {snippet}
                            {hasMore && (
                              <span className="ml-1 font-semibold whitespace-nowrap" style={{ color: '#D4AF37' }}>
                                Read more
                              </span>
                            )}
                          </p>
                        ) : (
                          <span className="text-sm font-semibold mt-auto" style={{ color: '#D4AF37' }}>
                            View memorial
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              <button
                onClick={() => document.getElementById('scroll-container')?.scrollBy({ left: -280, behavior: 'smooth' })}
                className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-900 border border-accent-500/30 flex items-center justify-center text-accent-500 hover:bg-accent-500 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => document.getElementById('scroll-container')?.scrollBy({ left: 280, behavior: 'smooth' })}
                className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-900 border border-accent-500/30 flex items-center justify-center text-accent-500 hover:bg-accent-500 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
              No memorials yet — be the first to create one.
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════ ABOUT ══════════════════ */}
      <section className="py-10 md:py-20 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8">

          {/* ── Shared heading ── */}
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

          {/* ── Body text ── */}
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

          {/* ── Cards ── */}
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