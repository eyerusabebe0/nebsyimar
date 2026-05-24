'use client'

import { Calendar, MapPin, Share2 } from 'lucide-react'
import Memorial3DScene from './Memorial3DScene'

interface Memorial {
  id: string
  name: string
  dates: string
  location: string
  image: string
  headstoneDesign?: string
}

interface MemorialHeaderProps {
  memorial: Memorial
}

export default function MemorialHeader({ memorial }: MemorialHeaderProps) {
  return (
    <div className="memorial-card rounded-2xl overflow-hidden bg-primary-900/80 border border-accent-500/20">
      {/* 3D Grave Scene */}
      <div className="relative">
        <Memorial3DScene memorial={memorial} />
        <div className="absolute top-3 left-3 z-10">
          <button className="px-3 py-1.5 bg-primary-900/80 hover:bg-accent-500 backdrop-blur border border-accent-400/40 text-accent-200 hover:text-white rounded-full text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Memorial Info */}
      <div className="p-6 bg-gradient-to-b from-primary-900/0 to-primary-900/40">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-400 font-semibold mb-2">
          In Loving Memory of
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">
          {memorial.name}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-accent-300">
          {memorial.dates && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-400" />
              <span className="font-medium">{memorial.dates}</span>
            </div>
          )}
          {memorial.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-400" />
              <span>{memorial.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
