'use client'

import React, { useState } from 'react'
import { Calendar, Heart, MapPin, Users, Gift, MessageCircle, Star, ChevronDown, ChevronUp } from 'lucide-react'

interface TimelineEvent {
  id: string
  type: 'birth' | 'milestone' | 'service' | 'tribute' | 'memory' | 'ethiopian_memorial'
  date: string
  title: string
  description?: string
  location?: string
  author?: string
  isHighlight?: boolean
  isEthiopianMarker?: boolean
  ethiopianDay?: number
}

interface MemorialTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const eventTypeConfig = {
  birth: {
    icon: Star,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/30'
  },
  milestone: {
    icon: Heart,
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/20',
    borderColor: 'border-accent-500/30'
  },
  service: {
    icon: MapPin,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  tribute: {
    icon: Gift,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  memory: {
    icon: MessageCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  ethiopian_memorial: {
    icon: Calendar,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  }
}

export default function MemorialTimeline({ events, className = '' }: MemorialTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [showAllEvents, setShowAllEvents] = useState(false)

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const displayEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, 5)

  if (events.length === 0) {
    return (
      <div className={`memorial-card rounded-3xl p-8 text-center ${className}`}>
        <Calendar className="w-12 h-12 text-accent-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-accent-100 mb-2">Memorial Timeline</h3>
        <p className="text-accent-300">
          Important moments and memories will appear here as they are added to the memorial.
        </p>
      </div>
    )
  }

  return (
    <div className={`memorial-card rounded-3xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-accent-100 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-accent-400" />
            <span>Life Journey</span>
          </h3>
          <p className="text-accent-400 text-sm mt-1">
            A timeline of important moments and memories
          </p>
        </div>
        <div className="text-accent-400 text-sm">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-500 via-accent-400 to-accent-300"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {displayEvents.map((event, index) => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            const isExpanded = expandedEvents.has(event.id)
            const hasExpandableContent = event.description || event.location || event.author

            return (
              <div key={event.id} className="relative flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor} ${config.borderColor} border-2 shadow-lg`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                  {event.isHighlight && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-primary-800"></div>
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className={`bg-white/5 border border-white/10 rounded-xl p-4 transition-all ${
                    hasExpandableContent ? 'cursor-pointer hover:bg-white/10' : ''
                  }`}
                  onClick={() => hasExpandableContent && toggleEventExpansion(event.id)}
                  >
                    {/* Event Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-accent-100 font-semibold text-lg mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-accent-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      </div>
                      {hasExpandableContent && (
                        <button className="ml-2 p-1 text-accent-400 hover:text-accent-300 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && hasExpandableContent && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {event.description && (
                          <p className="text-accent-200 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center space-x-2 text-accent-300 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.author && (
                          <div className="flex items-center space-x-2 text-accent-300 text-sm">
                            <Users className="w-4 h-4" />
                            <span>Shared by {event.author}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Preview for Non-Expanded */}
                    {!isExpanded && event.description && (
                      <p className="text-accent-300 text-sm mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Show More/Less Button */}
        {events.length > 5 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-200 rounded-xl transition-colors"
            >
              {showAllEvents ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show All {events.length} Events</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Timeline Legend */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-accent-200 font-medium mb-3 text-sm">Timeline Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(eventTypeConfig).map(([type, config]) => {
            const Icon = config.icon
            return (
              <div key={type} className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>
                <span className="text-accent-300 capitalize">{type}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Sample data for demonstration
export const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'birth',
    date: '1950-03-15',
    title: 'Born in Addis Ababa',
    description: 'Born to loving parents in the heart of Ethiopia',
    location: 'Addis Ababa, Ethiopia',
    isHighlight: true
  },
  {
    id: '2',
    type: 'milestone',
    date: '1975-06-20',
    title: 'Graduated from University',
    description: 'Earned a degree in Engineering from Addis Ababa University',
    location: 'Addis Ababa University'
  },
  {
    id: '3',
    type: 'milestone',
    date: '1978-09-12',
    title: 'Wedding Day',
    description: 'Married the love of their life in a beautiful ceremony',
    location: 'St. George Cathedral',
    isHighlight: true
  },
  {
    id: '4',
    type: 'milestone',
    date: '1985-04-03',
    title: 'First Child Born',
    description: 'Welcomed their first child into the world',
    isHighlight: true
  },
  {
    id: '5',
    type: 'milestone',
    date: '2024-01-10',
    title: 'Passed Away Peacefully',
    description: 'Surrounded by family, went to eternal rest',
    location: 'Home',
    isHighlight: true
  },
  {
    id: '6',
    type: 'ethiopian_memorial',
    date: '2024-01-12',
    title: 'Salest (3rd Day Memorial)',
    description: 'Traditional third day memorial service with family gathering for prayers and community support',
    location: 'Family home',
    isHighlight: true,
    isEthiopianMarker: true,
    ethiopianDay: 3
  },
  {
    id: '7',
    type: 'ethiopian_memorial',
    date: '2024-02-18',
    title: 'Arba (40th Day Memorial)',
    description: 'Major memorial service marking the end of traditional mourning period with extended family gathering',
    location: 'St. George Cathedral',
    isHighlight: true,
    isEthiopianMarker: true,
    ethiopianDay: 40
  },
  {
    id: '8',
    type: 'tribute',
    date: '2024-01-17',
    title: 'First Tribute Received',
    description: 'A beautiful flower arrangement from the Johnson family',
    author: 'Johnson Family'
  },
  {
    id: '9',
    type: 'memory',
    date: '2024-01-20',
    title: 'Childhood Memory Shared',
    description: 'A heartwarming story about their love for helping others',
    author: 'Sarah Mitchell'
  },
  {
    id: '10',
    type: 'ethiopian_memorial',
    date: '2025-01-10',
    title: 'Mut Amet (1-Year Memorial)',
    description: 'One-year anniversary memorial service celebrating the completed cycle of mourning with community-wide gathering',
    location: 'St. George Cathedral',
    isHighlight: true,
    isEthiopianMarker: true,
    ethiopianDay: 365
  }
]
