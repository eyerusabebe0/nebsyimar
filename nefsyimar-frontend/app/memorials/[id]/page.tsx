import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import MemorialHeader from '@/components/MemorialHeader'
import MemorialContent from '@/components/MemorialContent'
import TributeGifts from '@/components/TributeGifts'
import MemorialPageClient from '@/components/MemorialPageClient'

interface MemorialPageProps {
  params: {
    id: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

function resolveMemorialImage(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

async function fetchMemorial(identifier: string) {
  try {
    const cookieHeader = headers().get('cookie') || undefined
    const res = await fetch(`${API_BASE_URL}/memorials/${encodeURIComponent(identifier)}`, {
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    })

    if (res.status === 404) {
      return null
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.error('Failed to load memorial', res.status, errorText)
      return null
    }

    const json = await res.json()

    if (!json.success || !json.data?.memorial) {
      return null
    }

    return json.data.memorial as any
  } catch (error) {
    console.error('Error fetching memorial:', error)
    return null
  }
}

function mapApiMemorialToProps(apiMemorial: any, currentUserId?: string) {
  const dates = [apiMemorial.date_of_birth, apiMemorial.date_of_death].filter(Boolean).join(' - ')

  const baseMemorial = {
    id: apiMemorial.memorial_id as string,
    memorialId: apiMemorial.memorial_id as string,
    name: apiMemorial.deceased_name as string,
    dates,
    location: apiMemorial.place_of_birth || '',
    image: resolveMemorialImage(apiMemorial.profile_image),
    biography: apiMemorial.bio || '',
    family: '',
    funeral: {
      date: '',
      time: '',
      location: '',
      burial: '',
    },
    coverImage: resolveMemorialImage(apiMemorial.cover_image),
    galleryImages: Array.isArray(apiMemorial.gallery_images)
      ? apiMemorial.gallery_images.map((path: string) => resolveMemorialImage(path)).filter(Boolean) as string[]
      : [],
    creatorId: apiMemorial.user_id as string,
    isOwner: currentUserId === apiMemorial.user_id,
    headstoneDesign: ['stone_1','stone_2','stone_3','stone_4','stone_6','stone_8','stone_9','stone_10'].includes(apiMemorial.memorial_settings?.headstone_design)
      ? apiMemorial.memorial_settings.headstone_design
      : 'stone_2',
    memorialSettings: apiMemorial.memorial_settings || {
      allow_comments: true,
      comment_moderation: 'none',
      auto_approve_family: false,
      blocked_users: []
    }
  }

  return baseMemorial
}

export default async function MemorialPage({ params }: MemorialPageProps) {
  if (params.id === 'create') {
    redirect('/memorials/create')
  }

  const apiMemorial = await fetchMemorial(params.id)

  if (!apiMemorial) {
    notFound()
  }

  // Get current user from auth context (this would be available in a client component)
  // For server component, we'll need to pass this from a client wrapper or use middleware
  const currentUserId: string | undefined = undefined // This would come from authentication middleware
  
  const memorial = mapApiMemorialToProps(apiMemorial, currentUserId)
  const initialRecentGifts = Array.isArray((apiMemorial as any).recent_gifts)
    ? (apiMemorial as any).recent_gifts
    : []

  return (
    <div className="min-h-screen py-8 animated-dark-bg overflow-hidden relative">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <MemorialHeader memorial={memorial} />
            <MemorialContent memorial={memorial} initialRecentGifts={initialRecentGifts} />
            <MemorialPageClient memorial={{
              memorialId: memorial.memorialId,
              creatorId: memorial.creatorId,
              memorialSettings: memorial.memorialSettings
            }} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Additional sidebar content can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  )
}
