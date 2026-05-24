"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Calendar, MapPin, Users } from 'lucide-react'
import api from '@/lib/api'

interface ApiMemorial {
  memorial_id: string
  deceased_name: string
  date_of_birth?: string | null
  date_of_death?: string | null
  place_of_birth?: string | null
  profile_image?: string | null
  gift_count?: number
  view_count?: number
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

function resolveMemorialImage(path?: string | null) {
  if (!path) return '/images.jpg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

interface MemorialGridProps {
  searchTerm?: string
}

export default function MemorialGrid({ searchTerm = '' }: MemorialGridProps) {
  // Sample memorial data
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden bg-primary-800/40 border border-accent-500/10 animate-pulse"
          >
            <div className="aspect-square bg-primary-700/40"></div>
            <div className="p-4 space-y-2">
              <div className="h-3 bg-primary-700/40 rounded w-3/4"></div>
              <div className="h-3 bg-primary-700/40 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!memorials.length) {
    return (
      <div className="text-center py-16 bg-primary-800/40 backdrop-blur-sm border border-accent-500/20 rounded-2xl">
        <Heart className="w-12 h-12 text-accent-400 mx-auto mb-3" />
        <p className="text-accent-200 text-lg mb-1">No memorials yet</p>
        <p className="text-accent-400 text-sm">Be the first to create one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {memorials.map((memorial, idx) => {
        const dates = [memorial.date_of_birth, memorial.date_of_death]
          .filter(Boolean)
          .map((d) => (d ? new Date(d).getFullYear() : ''))
          .filter(Boolean)
          .join(' – ')
        const location = memorial.place_of_birth || ''
        const image = resolveMemorialImage(memorial.profile_image)
        const tributes = memorial.gift_count ?? 0
        const visitors = memorial.view_count ?? 0

        return (
          <Link
            key={memorial.memorial_id}
            href={`/memorials/${memorial.memorial_id}`}
            style={{ animationDelay: `${(idx % 8) * 60}ms` }}
            className="fade-in"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-primary-800/80 to-primary-900/80 backdrop-blur-sm border border-accent-500/20 hover:border-accent-400/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent-500/20 transition-all duration-500 group cursor-pointer">
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent-400/0 via-accent-400/0 to-accent-400/0 group-hover:from-accent-400/30 group-hover:via-transparent group-hover:to-accent-300/20 transition-all duration-500 pointer-events-none"></div>

              {/* Memorial Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-800 to-primary-900">
                <img
                  src={image}
                  alt={`${memorial.deceased_name} memorial photo`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = '/images.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/30 to-transparent"></div>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent-500/90 backdrop-blur text-[10px] uppercase tracking-wider text-white font-semibold">
                  In Memory
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-accent-300 uppercase tracking-wider mb-0.5">
                    {dates || '—'}
                  </p>
                  <h3 className="text-base md:text-lg font-bold text-white font-display leading-tight line-clamp-2 group-hover:text-accent-200 transition-colors">
                    {memorial.deceased_name}
                  </h3>
                </div>
              </div>

              {/* Memorial Footer */}
              <div className="p-3 flex items-center justify-between text-xs">
                <p className="text-accent-300 truncate flex-1">
                  {location || 'Beloved soul'}
                </p>
                <div className="flex items-center gap-3 text-accent-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {tributes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {visitors}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
