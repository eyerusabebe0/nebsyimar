"use client"

// Mobile redesign applied — desktop layout unchanged

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Users } from 'lucide-react'
import api from '@/lib/api'
import { HeadstonePreview } from './HeadstoneMemorial'

type HeadstoneDesignId =
  | 'stone_1'
  | 'stone_2'
  | 'stone_3'
  | 'stone_4'
  | 'stone_6'
  | 'stone_7'
  | 'stone_8'
  | 'stone_9'

interface ApiMemorial {
  memorial_id: string
  deceased_name: string
  date_of_birth?: string | null
  date_of_death?: string | null
  place_of_birth?: string | null
  profile_image?: string | null
  gift_count?: number
  view_count?: number
  memorial_settings?: {
    headstone_design?: string | null
  }
}

const VALID_HEADSTONE_DESIGNS = new Set([
  'stone_1',
  'stone_2',
  'stone_3',
  'stone_4',
  'stone_6',
  'stone_7',
  'stone_8',
  'stone_9'
])

// stone_9's artwork renders larger than its box, so we shrink just this design
// to keep it from bleeding outside its sky.png card
const STONE9_SHRINK_FACTOR = 0.72

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

function resolveMemorialImage(path?: string | null) {
  if (!path) return '/images.jpg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

function getHeadstoneDesign(design?: string | null): HeadstoneDesignId | undefined {
  return VALID_HEADSTONE_DESIGNS.has(design ?? '') ? (design as HeadstoneDesignId) : undefined
}

interface MemorialGridProps {
  searchTerm?: string
}

export default function MemorialGrid({ searchTerm = '' }: MemorialGridProps) {
  const [memorials, setMemorials] = useState<ApiMemorial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMemorials = async () => {
      setIsLoading(true)
      try {
        const params: any = { limit: 24 }
        if (searchTerm) params.search = searchTerm
        const response = await api.get('/memorials', { params })
        const items = response.data?.data?.memorials || []
        setMemorials(items)
      } catch (error) {
        console.error('Failed to load memorials', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timeoutId = setTimeout(fetchMemorials, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // ── LOADING ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden bg-primary-800/40 border border-accent-500/10 animate-pulse">
              <div className="aspect-square bg-primary-700/40" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-primary-700/40 rounded w-3/4" />
                <div className="h-3 bg-primary-700/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile skeleton — 4-column grid */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx}>
              <div className="w-full rounded-xl bg-primary-800/50 animate-pulse" style={{ aspectRatio: '3/4' }} />
              <div className="mt-1.5 h-2 bg-primary-700/40 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </>
    )
  }

  // ── EMPTY ─────────────────────────────────────────────────
  if (!memorials.length) {
    return (
      <div className="text-center py-10 md:py-16 bg-primary-800/40 backdrop-blur-sm border border-accent-500/20 rounded-2xl">
        <Heart className="w-8 h-8 md:w-12 md:h-12 text-accent-400 mx-auto mb-3" />
        <p className="text-accent-200 text-sm md:text-lg mb-1">No memorials yet</p>
        <p className="text-accent-400 text-xs md:text-sm">Be the first to create one.</p>
      </div>
    )
  }

  // ── DESKTOP CARD ──────────────────────────────────────────
  const DesktopCard = ({ memorial, idx }: { memorial: ApiMemorial; idx: number }) => {
    const dates = [memorial.date_of_birth, memorial.date_of_death]
      .filter(Boolean)
      .map((d) => (d ? new Date(d).getFullYear() : ''))
      .filter(Boolean)
      .join(' – ')
    const location = memorial.place_of_birth || ''
    const image = resolveMemorialImage(memorial.profile_image)
    const headstoneDesign = getHeadstoneDesign(memorial.memorial_settings?.headstone_design)
    const isStone9 = headstoneDesign === 'stone_9'
    const tributes = memorial.gift_count ?? 0
    const visitors = memorial.view_count ?? 0

    return (
      <Link
        href={`/memorials/${memorial.memorial_id}`}
        style={{ animationDelay: `${(idx % 8) * 60}ms` }}
        className="fade-in"
      >
        <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-primary-950 via-slate-950 to-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_120px_rgba(56,189,248,0.18)] cursor-pointer">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),transparent_40%)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent pointer-events-none" />
          <div
            className="relative aspect-[4/5] overflow-hidden flex items-center justify-center"
            style={{
              backgroundImage: "url('/sky.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              style={{
                transform: isStone9 ? `scale(${STONE9_SHRINK_FACTOR})` : undefined,
                transformOrigin: 'center bottom',
              }}
            >
              <HeadstonePreview
                memorial={{ name: memorial.deceased_name, dates, image, headstoneDesign }}
                width={220}
                height={300}
                className="pointer-events-none"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-primary-950/30 to-transparent" />
            <div className="absolute left-4 right-4 bottom-4">
              
             
            </div>
          </div>
          <div className="relative z-10 px-4 py-3 bg-slate-950/90 backdrop-blur border-t border-white/10 flex items-center justify-between gap-3">
            <p className="text-xs text-accent-300 truncate">{location || 'Beloved soul'}</p>
            <div className="flex items-center gap-3 text-accent-100 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <Heart className="w-3 h-3 text-accent-400" />{tributes}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <Users className="w-3 h-3 text-accent-400" />{visitors}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── MOBILE CARD — compact headstone preview, fits 4-per-row grid ──
  const MobileCard = ({ memorial }: { memorial: ApiMemorial }) => {
    const dates = [memorial.date_of_birth, memorial.date_of_death]
      .filter(Boolean)
      .map((d) => (d ? new Date(d).getFullYear() : ''))
      .filter(Boolean)
      .join(' – ')
    const image = resolveMemorialImage(memorial.profile_image)
    const headstoneDesign = getHeadstoneDesign(memorial.memorial_settings?.headstone_design)
    const isStone9 = headstoneDesign === 'stone_9'

    return (
      <Link
        href={`/memorials/${memorial.memorial_id}`}
        className="flex flex-col items-center gap-1.5"
      >
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center"
          style={{
            backgroundImage: "url('/sky.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              transform: isStone9 ? `scale(${STONE9_SHRINK_FACTOR})` : undefined,
              transformOrigin: 'center bottom',
            }}
          >
            <HeadstonePreview
              memorial={{ name: memorial.deceased_name, dates, image, headstoneDesign }}
              width={84}
              height={110}
              className="mx-auto w-full"
            />
          </div>
        </div>
        <p
          className="text-center text-white font-medium leading-tight line-clamp-2 w-full"
          style={{ fontSize: '9px' }}
        >
          {memorial.deceased_name}
        </p>
        {dates && (
          <p style={{ fontSize: '8px' }} className="text-[#D4AF37]/70 text-center leading-none -mt-1">
            {dates}
          </p>
        )}
      </Link>
    )
  }

  // ── RENDER ────────────────────────────────────────────────
  return (
    <>
      {/* ── DESKTOP grid — completely unchanged ── */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {memorials.map((memorial, idx) => (
          <DesktopCard key={memorial.memorial_id} memorial={memorial} idx={idx} />
        ))}
      </div>

      {/* ── MOBILE: fixed 4-column grid ── */}
      <div className="md:hidden grid grid-cols-4 gap-2">
        {memorials.map((memorial) => (
          <MobileCard key={memorial.memorial_id} memorial={memorial} />
        ))}
      </div>
    </>
  )
}