'use client'

import { useState } from 'react'
import { Bluetooth, Calendar, Copy, Instagram, MapPin, Send, Share2 } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { HeadstoneDesignId, HeadstonePreview } from './HeadstoneMemorial'

interface Memorial {
  id: string
  name: string
  dates: string
  location: string
  image: string
  headstoneDesign?: string
}

const ALLOWED_HEADSTONE_DESIGNS: HeadstoneDesignId[] = [
  'stone_1', 'stone_2', 'stone_3', 'stone_4', 'stone_6', 'stone_8', 'stone_9', 'stone_10'
]

function normalizeHeadstoneDesign(design?: string): HeadstoneDesignId | undefined {
  return ALLOWED_HEADSTONE_DESIGNS.includes(design as HeadstoneDesignId)
    ? (design as HeadstoneDesignId)
    : undefined
}

interface MemorialHeaderProps {
  memorial: Memorial
}

export default function MemorialHeader({ memorial }: MemorialHeaderProps) {
  const [shareOpen, setShareOpen] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${memorial?.name || 'Memorial'} on Nefsyimar`

  const handleToggleShare = () => setShareOpen((prev) => !prev)

  const handleCopyLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard')
    } else {
      prompt('Copy the link below:', shareUrl)
    }
    setShareOpen(false)
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      '_blank'
    )
    setShareOpen(false)
  }

  const handleInstagram = () => {
    window.open('https://www.instagram.com/', '_blank')
    setShareOpen(false)
  }

  const handleTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(telegramUrl, '_blank')
    setShareOpen(false)
  }

  const handleBluetoothShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Remembering ${memorial.name}`, text: shareText, url: shareUrl })
      } catch {
        // user dismissed
      }
    } else {
      alert('Use your device share sheet or copy the link to share via Bluetooth.')
    }
    setShareOpen(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-transparent border-0">
      <div 
        className="relative flex justify-center py-6 px-4 sm:px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cemetery_bg.png')" }}
      >
        {/* Safe check for memorial object before rendering */}
        {memorial && (
          <HeadstonePreview
            memorial={{
              name: memorial.name,
              dates: memorial.dates,
              image: memorial.image,
              headstoneDesign: normalizeHeadstoneDesign(memorial.headstoneDesign),
            }}
            width={340}
            height={420}
          />
        )}
        
  {/* CRITICAL: If the headstone container has 'overflow-hidden' or 'transform', 
  this 'div' must be moved OUTSIDE that container. 
*/}
<div className="absolute top-3 left-3 z-[9999]">
  <div className="relative">
    <button
      type="button"
      onClick={handleToggleShare}
      className="px-3 py-1.5 bg-black/60 hover:bg-accent-500/95 text-accent-200 hover:text-white rounded-full text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all duration-200"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>

    {shareOpen && (
      <div 
        className="fixed md:absolute z-[10000] left-3 md:left-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl p-3 text-left"
        // Using 'fixed' on mobile ensures it breaks out of ALL parent containers
        // while 'md:absolute' keeps it positioned relative to the button on desktop.
      >
        <p className="text-xs uppercase tracking-[0.24em] text-accent-400 mb-2 px-3">Share via</p>

        <button type="button" onClick={handleCopyLink} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition flex items-center gap-2">
          <Copy className="w-4 h-4 text-accent-300" /> Copy Link
        </button>

        <button type="button" onClick={handleWhatsApp} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition flex items-center gap-2">
          <SiWhatsapp className="w-4 h-4 text-green-500" /> WhatsApp
        </button>

        <button type="button" onClick={handleTelegram} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" /> Telegram
        </button>

        <button type="button" onClick={handleInstagram} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition flex items-center gap-2">
          <Instagram className="w-4 h-4 text-pink-400" /> Instagram
        </button>

        <button type="button" onClick={handleBluetoothShare} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/10 transition flex items-center gap-2">
          <Bluetooth className="w-4 h-4 text-cyan-300" /> Device Share
        </button>
      </div>
    )}
  </div>
</div>
      </div>

      <div className="p-6 bg-transparent">
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