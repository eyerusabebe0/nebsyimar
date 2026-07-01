'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

interface MemorialEvent {
  id: string
  title: string
  memorialName: string
  date: string
  time?: string
  location: string
  attendees?: number
  href: string
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const FALLBACK_EVENTS: MemorialEvent[] = [
  {
    id: '1',
    title: 'Memorial Service of Remembrance',
    memorialName: 'Loved Ones Together',
    date: '2026-06-12',
    time: '10:00 AM',
    location: 'Holy Trinity Cathedral, Addis Ababa',
    attendees: 84,
    href: '/memorials',
  },
  {
    id: '2',
    title: '40th Day Memorial Gathering',
    memorialName: 'Family of Tewodros',
    date: '2026-06-20',
    time: '02:00 PM',
    location: 'Selam Community Hall, Bahir Dar',
    attendees: 56,
    href: '/memorials',
  },
  {
    id: '3',
    title: 'Annual Remembrance Day',
    memorialName: 'Nefsyimar Community',
    date: '2026-07-04',
    time: '09:30 AM',
    location: 'Meskel Square, Addis Ababa',
    attendees: 220,
    href: '/memorials',
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<MemorialEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/memorials', { params: { limit: 12 } })
        const items = res.data?.data?.memorials || []
        const mapped: MemorialEvent[] = items
          .filter((m: any) => m.funeral_date || m.service_date)
          .slice(0, 9)
          .map((m: any) => ({
            id: m.memorial_id,
            title: m.service_name || 'Memorial Service',
            memorialName: m.deceased_name,
            date: m.funeral_date || m.service_date,
            time: m.funeral_time || m.service_time,
            location: m.funeral_location || m.place_of_birth || '—',
            attendees: m.view_count || 0,
            href: `/memorials/${m.memorial_id}`,
          }))
        setEvents(mapped.length ? mapped : FALLBACK_EVENTS)
      } catch {
        setEvents(FALLBACK_EVENTS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent-300/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Header */}
        <div className="text-center mb-14 fade-in px-2 sm:px-0">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-accent-400 font-medium mb-3">
            Gather In Remembrance
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display mb-4 leading-tight">
            Memorial Events
          </h1>
          <p className="text-accent-200/90 text-sm sm:text-base max-w-lg sm:max-w-2xl mx-auto leading-relaxed">
            Upcoming services, anniversaries, and tributes shared by families across the community.
            Join, light a candle, and honor a life that lives on.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-10 bg-accent-400/50"></div>
            <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
            <div className="h-px w-10 bg-accent-400/50"></div>
          </div>
        </div>

        {/* Events — mobile: timeline-style vertical list, desktop: grid */}
        {isLoading ? (
          <div className="text-center text-accent-300">Loading events...</div>
        ) : (
          <>
            {/* Mobile layout: timeline */}
            <div className="md:hidden flex flex-col gap-0 relative">
              {/* Vertical line */}
              <div className="absolute left-[22px] top-0 bottom-0 w-px bg-accent-500/20" />
              {events.map((event, idx) => (
                <Link
                  key={event.id}
                  href={event.href}
                  className="group relative pl-14 pr-1 pb-8 last:pb-0"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[14px] top-1 w-[17px] h-[17px] rounded-full border-2 border-accent-400 bg-accent-500/30 z-10" />

                  <div className="bg-primary-800/80 border border-accent-500/20 rounded-2xl p-4 group-hover:border-accent-400/60 transition-all duration-300 shadow-lg shadow-black/20">
                    {/* Date badge */}
                    <span className="inline-block text-[10px] uppercase tracking-widest text-accent-400 font-semibold bg-accent-500/10 px-2.5 py-1 rounded-full mb-2">
                      {formatDate(event.date)}
                    </span>

                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-accent-200 transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-accent-300 italic mb-3">In memory of {event.memorialName}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-300">
                      {event.time && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-accent-400" />
                          {event.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-accent-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </span>
                      {event.attendees !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-accent-400" />
                          {event.attendees} attending
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end text-accent-400 gap-1 text-xs font-semibold uppercase tracking-wider group-hover:text-accent-200">
                      View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop layout: original grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, idx) => (
                <Link
                  key={event.id}
                  href={event.href}
                  className="group relative bg-gradient-to-br from-primary-800/90 to-primary-900/90 border border-accent-500/20 rounded-[32px] p-5 sm:p-6 hover:border-accent-400/60 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm shadow-2xl shadow-black/20 min-h-[330px] overflow-hidden"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-bl-full"></div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
                      <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-accent-500/20 border border-accent-400/30 rounded-xl">
                        <Calendar className="w-5 h-5 text-accent-300" />
                      </div>
                      <span className="text-white font-semibold">{formatDate(event.date)}</span>
                    </div>
                    <span className="inline-flex px-2 py-1 text-[10px] sm:text-xs uppercase tracking-[0.24em] text-accent-400 font-semibold rounded-full bg-white/5">
                      Memorial
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 group-hover:text-accent-200 transition-colors line-clamp-3">
                    {event.title}
                  </h3>
                  <p className="text-sm sm:text-base text-accent-300 mb-4 italic leading-relaxed">In memory of {event.memorialName}</p>

                  <div className="space-y-3 text-sm sm:text-base text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-400" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent-400" />
                      <span className="line-clamp-2 break-words">{event.location}</span>
                    </div>
                    {event.attendees !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent-400" />
                        <span>{event.attendees} attending</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-accent-300 group-hover:text-accent-200">
                    <span className="text-sm font-semibold uppercase tracking-wider">View details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-accent-500/10 via-accent-400/10 to-accent-500/10 border border-accent-400/30 rounded-3xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-display">
            Planning a remembrance service?
          </h2>
          <p className="text-accent-200/90 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Create a memorial and share the service details with friends and family. Everyone you
            invite will receive a beautiful keepsake page.
          </p>
          <Link
            href="/memorials/create"
            className="inline-flex items-center px-7 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/30"
          >
            Create Memorial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}