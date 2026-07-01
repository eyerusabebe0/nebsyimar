'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MemorialTimeline, { sampleTimelineEvents } from '@/components/MemorialTimeline'

export default function TimelineDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/memorials"
            className="inline-flex items-center space-x-2 text-accent-300 hover:text-accent-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Memorials</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Memorial Timeline Demo
            </h1>
            <p className="text-accent-200 text-lg max-w-2xl mx-auto leading-relaxed">
              Experience how the memorial timeline brings together important moments, 
              memories, and tributes in a beautiful chronological journey.
            </p>
          </div>
        </div>

        {/* Timeline Component */}
        <MemorialTimeline 
          events={sampleTimelineEvents}
          className="mb-8"
        />

        {/* Information */}
        <div className="memorial-card rounded-3xl p-6 text-center">
          <h3 className="text-xl font-semibold text-accent-100 mb-3">
            How the Timeline Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Automatic Creation</h4>
              <p className="text-accent-300 text-sm">
                Timeline events are automatically created from memorial information, 
                service details, and visitor contributions.
              </p>
            </div>
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Interactive Experience</h4>
              <p className="text-accent-300 text-sm">
                Visitors can expand events to see more details, view locations, 
                and understand the full story of a life well-lived.
              </p>
            </div>
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Growing Memorial</h4>
              <p className="text-accent-300 text-sm">
                As friends and family add memories, tributes, and comments, 
                the timeline grows to become a comprehensive celebration of life.
              </p>
            </div>
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Meaningful Organization</h4>
              <p className="text-accent-300 text-sm">
                Different types of events are color-coded and organized chronologically, 
                making it easy to follow their life journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
