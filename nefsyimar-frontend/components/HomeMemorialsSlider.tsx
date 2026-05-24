'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

interface ApiMemorial {
  memorial_id: string
  deceased_name: string
  date_of_birth?: string | null
  date_of_death?: string | null
  place_of_birth?: string | null
  profile_image?: string | null
}

interface MemorialCard {
  id: string
  name: string
  years: string
  place: string
  image: string
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

function resolveImage(path?: string | null) {
  if (!path) return '/images.jpg'
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

const FALLBACK_MEMORIALS: MemorialCard[] = [
  { id: 'demo-1', name: 'Haile Selassie', years: '1892 – 1975', place: 'Ethiopia', image: '/haile.jpg' },
  { id: 'demo-2', name: 'Meron Tesfaye', years: '1955 – 2020', place: 'Addis Ababa', image: '/meron.jpg' },
  { id: 'demo-3', name: 'Dawit Bekele', years: '1962 – 2018', place: 'Bahir Dar', image: '/dawit.jpg' },
  { id: 'demo-4', name: 'Doron Asfaw', years: '1948 – 2021', place: 'Mekelle', image: '/doron.webp' },
  { id: 'demo-5', name: 'Beloved Memory', years: '1940 – 2019', place: 'Dire Dawa', image: '/images.jpg' },
  { id: 'demo-6', name: 'In Loving Memory', years: '1958 – 2022', place: 'Gondar', image: '/images1.jpg' },
]

export default function HomeMemorialsSlider() {
  const [memorials, setMemorials] = useState<MemorialCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/memorials', { params: { limit: 12 } })
        const items: ApiMemorial[] = res.data?.data?.memorials || []
        const mapped: MemorialCard[] = items.map((m) => ({
          id: m.memorial_id,
          name: m.deceased_name,
          years: [m.date_of_birth, m.date_of_death]
            .filter(Boolean)
            .map((d) => new Date(d!).getFullYear())
            .join(' – '),
          place: m.place_of_birth || '',
          image: resolveImage(m.profile_image),
        }))
        setMemorials(mapped.length ? mapped : FALLBACK_MEMORIALS)
      } catch {
        setMemorials(FALLBACK_MEMORIALS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Duplicate for seamless marquee
  const marquee = memorials.length ? [...memorials, ...memorials] : []

  return (
    <section className="py-20 animated-dark-bg overflow-hidden">
      {/* Floating dust particles */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {Array.from({ length: 14 }).map((_, idx) => (
          <span
            key={idx}
            className="dust-particle"
            style={{
              left: `${(idx * 47) % 100}%`,
              top: `${(idx * 29) % 100}%`,
              animationDelay: `${(idx % 7) * 0.7}s`,
              animationDuration: `${12 + (idx % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-accent-400 font-semibold mb-3">
            Memorials in our community
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
            Remembering Beautiful Lives
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-10 bg-accent-400/60"></div>
            <Heart className="w-4 h-4 text-accent-400 fill-current" />
            <div className="h-px w-10 bg-accent-400/60"></div>
          </div>
        </div>

        {/* Sliding Marquee */}
        {isLoading ? (
          <div className="flex gap-5 justify-center">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-64 h-80 bg-primary-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden marquee-mask">
              <div className="flex gap-6 home-memorials-track">
                {marquee.map((m, idx) => (
                  <Link
                    key={`${m.id}-${idx}`}
                    href={`/memorials/${m.id}`}
                    className="flex-shrink-0 w-64 memorial-card overflow-hidden hover:-translate-y-2 transition-all duration-500 group hover:shadow-2xl hover:shadow-accent-500/30 hover:border-accent-400/60"
                  >
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/images.jpg'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-xs uppercase tracking-wider text-accent-300 mb-1">In loving memory</p>
                        <h3 className="text-lg font-bold font-display leading-tight">{m.name}</h3>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-accent-400">{m.place || '—'}</p>
                        <p className="text-sm font-semibold text-accent-300">{m.years}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-accent-500/20 group-hover:bg-accent-500 flex items-center justify-center transition-colors border border-accent-400/40">
                        <ArrowRight className="w-4 h-4 text-accent-300 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <style jsx>{`
              .home-memorials-track {
                width: max-content;
                animation: homeMarquee 45s linear infinite;
              }
              .home-memorials-track:hover {
                animation-play-state: paused;
              }
              .marquee-mask {
                mask-image: linear-gradient(
                  to right,
                  transparent,
                  black 8%,
                  black 92%,
                  transparent
                );
                -webkit-mask-image: linear-gradient(
                  to right,
                  transparent,
                  black 8%,
                  black 92%,
                  transparent
                );
              }
              @keyframes homeMarquee {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/memorials"
            className="inline-flex items-center px-7 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/30 hover:scale-105"
          >
            Browse All Memorials
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
