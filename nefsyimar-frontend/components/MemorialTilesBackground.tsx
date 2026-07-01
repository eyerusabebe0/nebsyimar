'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import api from '@/lib/api'

// Memorial images data - using actual memorial photos from browse memorial page
const fallbackMemorialImages = [
  {
    id: 1,
    src: '/images.jpg',
    alt: 'Ato Bekele Molla',
    name: 'በፍቅር እናስባለን',
    translation: 'Ato Bekele Molla'
  },
  {
    id: 2,
    src: '/images1.jpg',
    alt: 'W/ro Almaz Tadesse', 
    name: 'ለዘላለም በልባችን',
    translation: 'W/ro Almaz Tadesse'
  },
  {
    id: 3,
    src: '/456296.avif',
    alt: 'Dr. Haile Gebreselassie',
    name: 'በሰላም ያርፍ',
    translation: 'Dr. Haile Gebreselassie'
  },
  {
    id: 4,
    src: '/meron.jpg',
    alt: 'W/ro Meron Assefa',
    name: 'ውድ ነፍስ',
    translation: 'W/ro Meron Assefa'
  },
  {
    id: 5,
    src: '/haile.jpg',
    alt: 'Ato Girma Wolde',
    name: 'ቅዱስ ትዝታ',
    translation: 'Ato Girma Wolde'
  },
  {
    id: 6,
    src: '/dawit.jpg',
    alt: 'Ato Dawit Kebede',
    name: 'የማይረሳ ፍቅር',
    translation: 'Ato Dawit Kebede'
  },
  {
    id: 7,
    src: '/images.jpg',
    alt: 'Memorial Portrait 7',
    name: 'ዘላለማዊ ትዝታ',
    translation: 'Eternal Memory'
  },
  {
    id: 8,
    src: '/images1.jpg',
    alt: 'Memorial Portrait 8',
    name: 'በጸሎት እናስባለን',
    translation: 'Remembered in Prayer'
  },
  {
    id: 9,
    src: '/456296.avif',
    alt: 'Memorial Portrait 9',
    name: 'ፍቅር ይኖራል',
    translation: 'Love Remains'
  },
  {
    id: 10,
    src: '/meron.jpg',
    alt: 'Memorial Portrait 10',
    name: 'ትዝታ ይቀጥላል',
    translation: 'Memory Continues'
  }
]

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = RAW_API_URL.replace(/\/api\/v1\/?$/, '')

function resolveMemorialImage(path?: string | null) {
  if (!path) return '/images.jpg'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

interface MemorialImage {
  id: number
  src: string
  alt: string
  name: string
  translation: string
}

interface MemorialTileProps {
  image: MemorialImage
  side: 'left' | 'right'
  index: number
  position: { row: number; col: number }
}

function MemorialTile({ image, side, index, position }: MemorialTileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const tileStyle = {
    animationDelay: `${index * 0.12}s`,
  }

  return (
    <div
      className={`
        memorial-tile group relative overflow-hidden rounded-lg shadow-2xl
        transition-all duration-500 ease-in-out cursor-pointer
        ${side === 'left' ? 'animate-scroll-up-left' : 'animate-scroll-up-right'}
        hover:scale-105 hover:shadow-3xl hover:z-10
        bg-white/5 backdrop-blur-sm
        border border-white/10
        w-24 h-32 md:w-32 md:h-40 lg:w-36 lg:h-48
        opacity-70
      `}
      style={tileStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Memorial Image */}
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className={`
            object-cover transition-all duration-700
            ${isHovered ? 'scale-110 brightness-110 grayscale-0' : 'scale-100 brightness-75 grayscale'}
          `}
          sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px"
        />
        
        {/* Respectful overlay */}
        <div className={`
          absolute inset-0 transition-all duration-500
          ${isHovered ? 'bg-white/5' : 'bg-black/20'}
        `} />
      </div>

      {/* Memorial Name Overlay */}
      <div className={`
        absolute inset-0 flex flex-col justify-end p-2 md:p-3
        bg-gradient-to-t from-black via-black/60 to-transparent
        transition-opacity duration-300
        ${isHovered ? 'opacity-100' : 'opacity-80'}
      `}>
        <div className="text-center">
          <p className="text-white text-xs md:text-sm font-bold leading-tight mb-1 tracking-wide">
            {image.name}
          </p>
          <p className="text-gray-300 text-xs opacity-90 leading-tight hidden md:block font-light">
            {image.translation}
          </p>
        </div>
      </div>

      {/* Respectful glow effect */}
      <div className={`
        absolute inset-0 rounded-lg transition-all duration-500
        ${isHovered ? 'shadow-glow opacity-100' : 'opacity-0'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-t from-accent-500/20 via-transparent to-accent-400/10 rounded-lg" />
      </div>

      {/* Ethiopian Cross decoration */}
      <div className="absolute top-2 right-2 opacity-70">
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 bg-accent-400/60 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/90" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/90" />
        </div>
      </div>
    </div>
  )
}

export default function MemorialTilesBackground() {
  const [images, setImages] = useState<MemorialImage[]>(fallbackMemorialImages)

  useEffect(() => {
    let isMounted = true

    const fetchMemorials = async () => {
      try {
        const response = await api.get('/memorials', { params: { limit: 20 } })
        const items = response.data?.data?.memorials || []

        if (!items.length) {
          return
        }

        const mapped: MemorialImage[] = items.map((memorial: any, index: number) => ({
          id: index + 1,
          src: resolveMemorialImage(memorial.profile_image),
          alt: memorial.deceased_name || 'Memorial photo',
          name: memorial.deceased_name || 'Memorial',
          translation: memorial.deceased_name || 'Memorial'
        }))

        if (isMounted) {
          setImages(mapped)
        }
      } catch (error) {
        console.error('Failed to load memorial tiles', error)
      }
    }

    fetchMemorials()

    return () => {
      isMounted = false
    }
  }, [])

  const baseImages = images.length ? images : fallbackMemorialImages

  // Create multiple sets for continuous scrolling
  const createTileSet = (startIndex: number) => 
    baseImages.map((image, idx) => ({ ...image, id: image.id + startIndex * 100 + idx }))

  const leftTileSets = [
    createTileSet(0),
    createTileSet(1),
    createTileSet(2)
  ]

  const rightTileSets = [
    createTileSet(3),
    createTileSet(4),
    createTileSet(5)
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Left Side Tiles - Continuous Vertical Stream */}
      <div className="absolute left-2 md:left-6 lg:left-8 top-0 pointer-events-auto">
        <div className="flex flex-col space-y-4 md:space-y-6">
          {leftTileSets.map((tileSet, setIndex) =>
            tileSet.map((image, index) => (
              <MemorialTile
                key={`left-${image.id}`}
                image={image}
                side="left"
                index={setIndex * 10 + index}
                position={{ 
                  row: setIndex * 10 + index, 
                  col: 0 
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Side Tiles - Continuous Vertical Stream */}
      <div className="absolute right-2 md:right-6 lg:right-8 top-0 pointer-events-auto">
        <div className="flex flex-col space-y-4 md:space-y-6">
          {rightTileSets.map((tileSet, setIndex) =>
            tileSet.map((image, index) => (
              <MemorialTile
                key={`right-${image.id}`}
                image={image}
                side="right"
                index={setIndex * 10 + index}
                position={{ 
                  row: setIndex * 10 + index, 
                  col: 0 
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Connecting Light Elements */}
      <div className="absolute left-0 top-1/2 w-48 h-px bg-gradient-to-r from-transparent via-accent-400/20 to-transparent transform -translate-y-1/2" />
      <div className="absolute right-0 top-1/2 w-48 h-px bg-gradient-to-l from-transparent via-accent-400/20 to-transparent transform -translate-y-1/2" />
      
      {/* Ambient Light Effects */}
      <div className="absolute left-40 top-1/2 transform -translate-y-1/2">
        <div className="w-32 h-32 bg-gradient-radial from-accent-400/5 via-accent-400/2 to-transparent rounded-full animate-pulse" />
      </div>
      <div className="absolute right-40 top-1/2 transform -translate-y-1/2">
        <div className="w-32 h-32 bg-gradient-radial from-accent-400/5 via-accent-400/2 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Floating Memorial Particles */}
      <div className="absolute left-32 top-1/3 opacity-30">
        <div className="w-1 h-1 bg-accent-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute right-32 top-2/3 opacity-30">
        <div className="w-1 h-1 bg-accent-400 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
      </div>
      <div className="absolute left-48 top-2/3 opacity-20">
        <div className="w-0.5 h-0.5 bg-accent-300 rounded-full animate-ping" style={{ animationDelay: '4s' }} />
      </div>
      <div className="absolute right-48 top-1/3 opacity-20">
        <div className="w-0.5 h-0.5 bg-accent-300 rounded-full animate-ping" style={{ animationDelay: '5s' }} />
      </div>
    </div>
  )
}
