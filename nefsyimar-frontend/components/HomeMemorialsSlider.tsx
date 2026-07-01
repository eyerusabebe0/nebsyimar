'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HeadstonePreview } from './HeadstoneMemorial'
import api from '@/lib/api'

// --- CONSTANTS ---
const previewStoneIds = ['stone_2', 'stone_3', 'stone_4', 'stone_6', 'stone_8', 'stone_9', 'stone_10'] as const

const FALLBACK_MEMORIALS = [
  { id: 'demo-1', name: 'Haile Selassie', years: '1892 – 1975', place: 'Ethiopia', image: '/haile.jpg' },
  { id: 'demo-2', name: 'Meron Tesfaye', years: '1955 – 2020', place: 'Addis Ababa', image: '/meron.jpg' },
  { id: 'demo-3', name: 'Dawit Bekele', years: '1962 – 2018', place: 'Bahir Dar', image: '/dawit.jpg' },
  { id: 'demo-4', name: 'Doron Asfaw', years: '1948 – 2021', place: 'Mekelle', image: '/doron.webp' },
  { id: 'demo-5', name: 'Beloved Memory', years: '1940 – 2019', place: 'Dire Dawa' },
  { id: 'demo-6', name: 'In Loving Memory', years: '1958 – 2022', place: 'Gondar' },
]

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
  image?: string
}

export default function HomeMemorialsSlider() {
  const [memorials, setMemorials] = useState<MemorialCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
  const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

  const resolveImage = (path?: string | null) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
    return path
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/memorials', { params: { limit: 12 } })
        const items: ApiMemorial[] = res.data?.data?.memorials || []
        const mapped: MemorialCard[] = items.map((m) => ({
          id: m.memorial_id,
          name: m.deceased_name,
          years: [m.date_of_birth, m.date_of_death].filter(Boolean).map((d) => new Date(d!).getFullYear()).join(' – '),
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

  const row1 = memorials.filter((_, i) => i % 2 === 0)

  const RenderCard = ({ m, idx }: { m: MemorialCard; idx: number }) => (
    <Link
      href={`/memorials/${m.id}`}
      className="flex-shrink-0 w-44 sm:w-52 md:w-56 lg:w-60 min-w-[11rem] sm:min-w-[12.5rem] md:min-w-[13.5rem] group"
    >
      {/* Removed h-72 fixed height and ensured overflow-visible */}
      <div className="relative flex flex-col items-center justify-center overflow-visible">
        <HeadstonePreview
          memorial={{ 
            name: m.name, 
            dates: m.years, 
            image: m.image, 
            headstoneDesign: previewStoneIds[idx % previewStoneIds.length] 
          }}
          width={220}
          height={300}
        />
        <div className="mt-4 text-center text-white">
          <h3 className="font-bold text-lg">{m.name}</h3>
          <p className="text-xs text-accent-400">{m.years}</p>
        </div>
      </div>
    </Link>
  )

  return (
    <section className="py-20 animated-dark-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Remembering Beautiful Lives</h2>
      </div>

      <div className="space-y-12">
        <div className="overflow-visible">
          <div className="flex gap-6 animate-marquee-left">
            {[...row1, ...row1].map((m, i) => <RenderCard key={`r1-${i}`} m={m} idx={i} />)}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee-left { display: flex; animation: scrollLeft 40s linear infinite; }
        .animate-marquee-right { display: flex; animation: scrollRight 40s linear infinite; }
        
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}