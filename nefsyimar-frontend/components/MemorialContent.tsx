'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, ChevronDown, ChevronUp, Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Memorial {
  id?: string
  memorialId?: string
  name: string
  dates: string
  image: string
  biography: string
  family: string
  funeral: {
    date: string
    time: string
    location: string
    burial: string
  }
  coverImage?: string
  galleryImages?: string[]
}

interface MemorialContentProps {
  memorial: Memorial
  initialRecentGifts?: any[]
}

interface GiftOption {
  id: number
  name: string
  symbol: string
  price: number
  description: string
  image: string
  backendGiftId?: string
}

interface Tribute {
  name: string
  giftImage: string
  message: string
  amount?: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

function resolveMemorialImageUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

const GIFTS_PER_PAGE = 8
const TRIBUTES_PER_PAGE = 6

function getTributeAmount(tribute: Tribute, giftOptions: GiftOption[]): number {
  if (typeof tribute.amount === 'number') {
    return tribute.amount
  }

  const matchingGift = giftOptions.find((gift) => gift.image === tribute.giftImage)
  return matchingGift ? matchingGift.price : 0
}

function mapGiftItemToTribute(item: any): Tribute {
  const senderDisplayName =
    item.sender_name || item.sender?.name || 'Anonymous'

  const iconPath = item.gift?.icon_url || '/tribute-rose.png'
  const iconUrl = resolveMemorialImageUrl(iconPath) || '/tribute-rose.png'

  return {
    name: senderDisplayName,
    giftImage: iconUrl,
    message: item.message || 'Sent a tribute gift.',
    amount: Number(item.amount ?? 0)
  }
}

const INITIAL_GIFT_TEMPLATES: GiftOption[] = [
  {
    id: 1,
    name: 'Rose / Flower',
    symbol: '🌹',
    price: 5,
    description: 'Small tribute • Rose / Flower',
    image: '/tribute-rose.png'
  },
  {
    id: 2,
    name: 'Butterfly',
    symbol: '🦋',
    price: 10,
    description: 'Medium tribute • Butterfly',
    image: '/tribute-butterfly.png'
  },
  {
    id: 3,
    name: 'Candle',
    symbol: '🕯️',
    price: 15,
    description: 'Candle of remembrance',
    image: '/tribute-candle.png'
  },
  {
    id: 4,
    name: 'Wreath / Garland',
    symbol: '💮',
    price: 20,
    description: 'Wreath of honor',
    image: '/tribute-crown.png'
  },
  {
    id: 5,
    name: 'Bird in Flight',
    symbol: '🕊️',
    price: 25,
    description: 'Bird in flight • Peaceful spirit',
    image: '/tribute-bird.png'
  },
  {
    id: 6,
    name: 'Heart / Love Flame',
    symbol: '❤️',
    price: 30,
    description: 'Heart of love • Flame of memory',
    image: '/tribute-heart.png'
  },
  {
    id: 7,
    name: 'Tree of Life',
    symbol: '🌳',
    price: 50,
    description: 'Premium tribute • Tree of Life',
    image: '/tribute-tree.png'
  },
  {
    id: 8,
    name: 'Star / Shooting Star',
    symbol: '✨',
    price: 75,
    description: 'Premium tribute • Shooting star',
    image: '/tribute-star.png'
  }
]

const INITIAL_TRIBUTES: Tribute[] = []

export default function MemorialContent({ memorial, initialRecentGifts }: MemorialContentProps) {
  const { user, wallet, isAuthenticated, refreshUser } = useAuth()
  const [showLifeStory, setShowLifeStory] = useState(false)
  const [selectedGift, setSelectedGift] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [gifts, setGifts] = useState<GiftOption[]>(INITIAL_GIFT_TEMPLATES)
  const [recentTributes, setRecentTributes] = useState<Tribute[]>(() => {
    const items = initialRecentGifts || []

    if (!Array.isArray(items) || !items.length) {
      return INITIAL_TRIBUTES
    }

    return items.map((item: any) => mapGiftItemToTribute(item))
  })
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('telebirr')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [giftPage, setGiftPage] = useState(0)
  const [tributePage, setTributePage] = useState(0)
  const [showAllTributes, setShowAllTributes] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [defaultGalleryPhotos, setDefaultGalleryPhotos] = useState(2)
  const [galleryOverflow, setGalleryOverflow] = useState(false)

  useEffect(() => {
    const updateGalleryState = () => {
      const width = window.innerWidth
      const columns = width >= 1024 ? 3 : width >= 640 ? 3 : 2
      setDefaultGalleryPhotos(columns)

      const galleryImages = Array.isArray(memorial.galleryImages)
        ? memorial.galleryImages.filter(Boolean)
        : []
      const imageCount = galleryImages.length + (memorial.coverImage ? 1 : 0)

      const gap = 16
      const containerWidth = Math.min(width - 48, 1200)
      const cardWidth = containerWidth / columns
      const cardHeight = cardWidth * 0.75
      const rows = Math.max(1, Math.ceil(imageCount / columns))
      const estimatedHeight = rows * cardHeight + (rows - 1) * gap

      setGalleryOverflow(estimatedHeight > window.innerHeight * 0.82)
    }

    updateGalleryState()
    window.addEventListener('resize', updateGalleryState)
    return () => window.removeEventListener('resize', updateGalleryState)
  }, [memorial.galleryImages])

  useEffect(() => {
    setShowAllPhotos(false)
  }, [memorial.galleryImages])

  useEffect(() => {
    const loadGifts = async () => {
      try {
        const response = await api.get('/gifts/catalog')
        const groupedGifts = response.data?.data?.gifts || {}
        const allGifts: any[] = []

        Object.keys(groupedGifts).forEach((category) => {
          const items = groupedGifts[category]
          if (Array.isArray(items)) {
            allGifts.push(...items)
          }
        })

        if (allGifts.length === 0) {
          return
        }

        allGifts.sort((a, b) => {
          if (a.category === b.category) {
            if (a.sort_order === b.sort_order) {
              return Number(a.value) - Number(b.value)
            }
            return (a.sort_order || 0) - (b.sort_order || 0)
          }
          return String(a.category).localeCompare(String(b.category))
        })

        setGifts((current) =>
          current.map((gift, index) => {
            const backendGift = allGifts[index]
            if (!backendGift) {
              return gift
            }

            return {
              ...gift,
              price: Number(backendGift.value),
              backendGiftId: backendGift.gift_id
            }
          })
        )
      } catch (error) {
        console.error('Failed to load gift catalog', error)
      }
    }

    loadGifts()
  }, [])

  useEffect(() => {
    const memorialIdentifier = (memorial as any).memorialId || (memorial as any).id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!memorialIdentifier || !uuidRegex.test(memorialIdentifier)) {
      return
    }

    const loadMemorialGifts = async () => {
      try {
        const response = await api.get(`/gifts/memorial/${memorialIdentifier}`, {
          params: { page: 1, limit: 200, visibility: 'PUBLIC' }
        })

        const items = response.data?.data?.gifts || []

        if (!Array.isArray(items) || !items.length) {
          return
        }

        const mapped: Tribute[] = items.map((item: any) => mapGiftItemToTribute(item))

        setRecentTributes(mapped)
      } catch (error) {
        console.error('Failed to load memorial gifts', error)
      }
    }

    loadMemorialGifts()
  }, [memorial])

  const handleGiftSelect = (giftId: number) => {
    setSelectedGift(giftId)
    setShowPayment(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedGift) {
      toast.error('Please select a tribute gift first.')
      return
    }

    const selectedGiftData = gifts.find((gift) => gift.id === selectedGift)

    if (!selectedGiftData || !selectedGiftData.backendGiftId) {
      toast.error('This tribute gift is not available at the moment. Please try another one.')
      return
    }

    const memorialIdentifier = (memorial as any).memorialId || (memorial as any).id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!memorialIdentifier || !uuidRegex.test(memorialIdentifier)) {
      toast.error('Tribute gifts are only available for published memorials.')
      return
    }

    if (!isAuthenticated || !user) {
      toast.error('Please sign in to send a tribute gift.')
      return
    }

    if (!wallet) {
      toast.error('Wallet information is not available. Please open your profile wallet and try again.')
      return
    }

    const currentBalance = Number(wallet.balance ?? 0)

    if (currentBalance < selectedGiftData.price) {
      toast.error('Insufficient wallet balance to send this tribute gift.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/gifts/send', {
        memorial_id: memorialIdentifier,
        gift_id: selectedGiftData.backendGiftId,
        message: message || undefined,
        sender_name: senderName || user.name,
        is_anonymous: false,
        visibility: 'PUBLIC'
      })

      if (response.data?.success && response.data?.data?.gift_transaction) {
        const txn = response.data.data.gift_transaction
        const manualName = senderName.trim()
        const senderDisplayName =
          manualName || txn.sender_name || txn.sender?.name || user.name

        const newTribute: Tribute = {
          name: senderDisplayName,
          giftImage: selectedGiftData.image,
          message: message || 'Sent a tribute gift.',
          amount: selectedGiftData.price
        }

        setRecentTributes((prev) => [newTribute, ...prev])

        setSenderName('')
        setMessage('')

        toast.success('Your tribute gift has been sent.')
        await refreshUser()
        setShowPayment(false)
        setSelectedGift(null)
      } else {
        const errorMessage =
          response.data?.message || 'Failed to send tribute gift. Please try again.'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to send tribute gift. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalGiftPages = Math.max(1, Math.ceil(gifts.length / GIFTS_PER_PAGE))
  const safeGiftPage = Math.min(giftPage, totalGiftPages - 1)
  const startGiftIndex = safeGiftPage * GIFTS_PER_PAGE
  const visibleGifts = gifts.slice(startGiftIndex, startGiftIndex + GIFTS_PER_PAGE)

  const tributesWithAmount = recentTributes.map((tribute) => ({
    ...tribute,
    amount: getTributeAmount(tribute, gifts),
  }))

  const topTributes = [...tributesWithAmount]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3)

  const totalTributePages = Math.max(1, Math.ceil(tributesWithAmount.length / TRIBUTES_PER_PAGE))
  const safeTributePage = Math.min(tributePage, totalTributePages - 1)
  const startTributeIndex = safeTributePage * TRIBUTES_PER_PAGE
  const paginatedTributes = tributesWithAmount.slice(
    startTributeIndex,
    startTributeIndex + TRIBUTES_PER_PAGE
  )
const CEMETERY_BG_STYLE: React.CSSProperties = {
  background:
    'radial-gradient(circle at 50% 14%, rgba(238,192,192,0.08), transparent 100%), ' +
    'linear-gradient(to top, rgba(15,15,15,0.98), rgba(23,30,22,0.62) 38%, rgba(53,124,59,0.12) 100%), ' +
    'url("/cemetery_bg.png") center bottom / cover no-repeat',
  boxShadow: 'inset 0 0 42px rgba(0,0,0,0.88)',
}

const GRASS_LAYERS = [
  { h: 'h-16', z: 'z-20', size: '120px', brightness: '0.32', blur: '0.5px', ty: '4px' },
  { h: 'h-14', z: 'z-25', size: '135px', brightness: '0.48', blur: '0',     ty: '2px' },
  { h: 'h-11', z: 'z-30', size: '150px', brightness: '0.62', blur: '0',     ty: '0'   },
]

function GrassOverlay() {
  return (
    <>
      {GRASS_LAYERS.map((l, i) => (
        <div
          key={i}
          className={`absolute bottom-0 left-0 right-0 ${l.h} pointer-events-none ${l.z}`}
          style={{
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/1/1a/Grass_01.png")',
            backgroundRepeat: 'repeat-x',
            backgroundSize: `${l.size} auto`,
            backgroundPosition: 'bottom center',
            filter: `brightness(${l.brightness}) contrast(1.1) saturate(0.8)${l.blur ? ` blur(${l.blur})` : ''}`,
            transform: `translateY(${l.ty})`,
          }}
        />
      ))}
    </>
  )
}
  return (
    <div className="space-y-6">
      {/* Life Story Toggle */}
      <div className="memorial-card rounded-xl p-6">
        <button
          onClick={() => setShowLifeStory(!showLifeStory)}
          className="w-full flex items-center justify-between text-xl font-semibold text-white mb-4 hover:text-accent-400 transition-colors"
        >
          <span>Life Story</span>
          {showLifeStory ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        
        {showLifeStory && (
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            <p className="text-accent-300 leading-relaxed">
              {memorial.biography}
            </p>
            <p className="text-accent-400 italic">
              {memorial.family}
            </p>
          </div>
        )}
      </div>

      {/* Send Tribute Gift - Right after Life Story */}
      <div className="memorial-card rounded-xl p-3 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center space-x-2">
          <Heart className="w-4 h-4 md:w-5 md:h-5 text-accent-400" />
          <span>Send Tribute Gift</span>
        </h3>
        
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
          {visibleGifts.map((gift) => (
            <button
              key={gift.id}
              onClick={() => handleGiftSelect(gift.id)}
              className={`relative flex flex-col overflow-hidden rounded-lg sm:rounded-2xl transition-all duration-300 bg-gradient-to-b from-primary-900/80 to-primary-950/80 border border-white/6 group ${
                selectedGift === gift.id ? 'ring-2 ring-accent-400' : 'hover:-translate-y-1 hover:shadow-2xl'
              }`}
            >
              <div className="relative aspect-square bg-primary-900/40 overflow-hidden">
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = '/tribute-rose.png' }}
                />
                <div className="absolute top-1 left-1 sm:top-3 sm:left-3 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary-900/80 backdrop-blur border border-accent-400/30 text-[7px] sm:text-[11px] uppercase tracking-wider text-accent-200 font-semibold hidden sm:flex items-center gap-1.5">
                  <span className="text-rose-400">🕊️</span>
                  Tribute
                </div>
              </div>

              <div className="p-1 sm:p-3 flex-1">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <span className="text-white font-bold text-[11px] sm:text-base leading-tight">{gift.price} <span className="text-[8px] sm:text-xs text-accent-400">ETB</span></span>
                </div>
                <h4 className="text-[9px] sm:text-sm font-semibold text-accent-100 line-clamp-1 sm:line-clamp-2 leading-tight mb-0 sm:mb-1">{gift.name}</h4>
                <p className="hidden sm:block text-xs text-accent-400 line-clamp-2">{gift.description}</p>
              </div>

              {selectedGift === gift.id && (
                <div className="absolute top-1 right-1 sm:top-3 sm:right-3 flex h-3.5 w-3.5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-accent-500 text-[7px] sm:text-[10px] text-white font-bold">✓</div>
              )}
            </button>
          ))}
        </div>

        {totalGiftPages > 1 && (
          <div className="mt-4 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => setGiftPage(Math.max(0, safeGiftPage - 1))}
              className="p-2 rounded-full bg-primary-900/60 hover:bg-primary-800 text-accent-200 disabled:opacity-40"
              disabled={safeGiftPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-accent-400 text-sm">
              {safeGiftPage + 1} / {totalGiftPages}
            </span>
            <button
              type="button"
              onClick={() => setGiftPage(Math.min(totalGiftPages - 1, safeGiftPage + 1))}
              className="p-2 rounded-full bg-primary-900/60 hover:bg-primary-800 text-accent-200 disabled:opacity-40"
              disabled={safeGiftPage >= totalGiftPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Payment Form */}
        {showPayment && selectedGift && (
          <div className="mt-6 p-4 glass-effect rounded-lg">
            <h4 className="text-white font-medium mb-4">Complete Your Tribute</h4>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-accent-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-accent-400 text-sm mb-2">Message (Optional)</label>
                <textarea
                  placeholder="Share a memory or message..."
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-accent-400 text-sm mb-2">Payment Method</label>
                <select
                  className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="telebirr">Telebirr</option>
                  <option value="cbe">CBE Birr</option>
                  <option value="hellocash">HelloCash</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  {isSubmitting ? 'Sending...' : 'Send Tribute'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 border border-accent-600 text-accent-300 hover:text-white hover:bg-accent-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Recent Tributes */}
      <div className="memorial-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span>Recent Tributes</span>
          {tributesWithAmount.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAllTributes((prev) => !prev)}
              className="p-1 rounded-full hover:bg-primary-900/60 text-accent-300"
              aria-label={showAllTributes ? 'Hide tributes' : 'Show all tributes'}
            >
              {showAllTributes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </h3>
        {topTributes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2 space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-accent-300">Top gifts (by amount)</span>
            </div>
            <div className="space-y-3">
              {topTributes.map((tribute, index) => (
                <div
                  key={`top-${index}`}
                  className="p-3 rounded-lg bg-primary-800/60 flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 rounded-full flex items-center justify-center">
                    <Image
                      src={tribute.giftImage}
                      alt="Tribute gift icon"
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain drop-shadow-md mix-blend-screen"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium text-sm">{tribute.name}</div>
                      {typeof tribute.amount === 'number' && (
                        <div className="text-yellow-300 text-xs font-semibold">
                          {tribute.amount} ETB
                        </div>
                      )}
                    </div>
                    <div className="text-accent-400 text-sm line-clamp-2">
                      {tribute.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAllTributes && (
          <>
            <div className="space-y-3">
              {paginatedTributes.map((tribute, index) => (
                <div
                  key={`list-${startTributeIndex + index}`}
                  className="flex items-start space-x-3 p-3 bg-primary-800/50 rounded-lg"
                >
                  <div className="flex-shrink-0 rounded-full flex items-center justify-center">
                    <Image
                      src={tribute.giftImage}
                      alt="Tribute gift icon"
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain drop-shadow-md mix-blend-screen"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium text-sm">{tribute.name}</div>
                      {typeof tribute.amount === 'number' && (
                        <div className="text-accent-300 text-xs font-semibold">
                          {tribute.amount} ETB
                        </div>
                      )}
                    </div>
                    <div className="text-accent-400 text-sm">{tribute.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {totalTributePages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setTributePage(Math.max(0, safeTributePage - 1))}
                  className="p-2 rounded-full bg-primary-900/60 hover:bg-primary-800 text-accent-200 disabled:opacity-40"
                  disabled={safeTributePage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-accent-400 text-sm">
                  {safeTributePage + 1} / {totalTributePages}
                </span>
                <button
                  type="button"
                  onClick={() => setTributePage(Math.min(totalTributePages - 1, safeTributePage + 1))}
                  className="p-2 rounded-full bg-primary-900/60 hover:bg-primary-800 text-accent-200 disabled:opacity-40"
                  disabled={safeTributePage >= totalTributePages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Funeral Information */}
      <div className="memorial-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-accent-400" />
          <span>Funeral Service Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-accent-400 text-sm">Date</div>
                <div className="text-white font-medium">{memorial.funeral.date}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-accent-400 text-sm">Time</div>
                <div className="text-white font-medium">{memorial.funeral.time}</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-accent-400 text-sm">Service Location</div>
                <div className="text-white font-medium">{memorial.funeral.location}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-accent-400 text-sm">Burial Site</div>
                <div className="text-white font-medium">{memorial.funeral.burial}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="memorial-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Photo Memories</h2>
            <p className="text-accent-400 text-sm mt-1">
              Cherished images from the memorial collection.
            </p>
          </div>
        </div>

        {(() => {
          const images: string[] = [];
          const coverUrl = resolveMemorialImageUrl(memorial.coverImage);
          if (coverUrl) {
            images.push(coverUrl);
          }

          if (Array.isArray(memorial.galleryImages)) {
            memorial.galleryImages.forEach((img) => {
              const url = resolveMemorialImageUrl(img);
              if (url && !images.includes(url)) images.push(url);
            });
          }

          if (!images.length) {
            return (
              <div className="rounded-3xl border border-white/10 bg-primary-900/40 p-8 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-accent-300 mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-white mb-2">No photo memories yet</p>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  This memorial doesn't have any gallery photos yet. Add cherished images to keep the memory alive.
                </p>
              </div>
            );
          }

          const displayLimit = showAllPhotos ? images.length : defaultGalleryPhotos
          const shouldShowSeeMore = !showAllPhotos && images.length > defaultGalleryPhotos && galleryOverflow
          const displayItems = showAllPhotos || !shouldShowSeeMore ? images : images.slice(0, displayLimit)

          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {displayItems.map((src, index) => (
                <div
                  key={`gallery-${index}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-primary-950 via-slate-950 to-slate-900 shadow-[0_15px_40px_rgba(2,6,23,0.6)] sm:shadow-[0_30px_90px_rgba(2,6,23,0.75)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={src}
                    alt={`Memorial photo ${index + 1}`}
                    fill
                    quality={90}
                    className="object-cover rounded-2xl sm:rounded-[28px]"
                  />
                </div>
              ))}

              {/* See More tile */}
              {shouldShowSeeMore && (
                <button
                  type="button"
                  onClick={() => setShowAllPhotos(true)}
                  className="group relative flex items-center justify-center aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-[28px] border border-accent-500/20 bg-primary-950/80 transition-all duration-300 hover:border-accent-400/40 hover:bg-accent-500/10"
                >
                  <span className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-white">
                    <span>See More</span>
                    <span className="text-[10px] sm:text-xs text-accent-300">
                      {images.length - defaultGalleryPhotos} more photo{images.length - defaultGalleryPhotos === 1 ? '' : 's'}
                    </span>
                  </span>
                </button>
              )}

              {/* Show Less tile, shown after expanding */}
              {showAllPhotos && images.length > defaultGalleryPhotos && (
                <button
                  type="button"
                  onClick={() => setShowAllPhotos(false)}
                  className="group relative flex items-center justify-center aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-[28px] border border-accent-500/20 bg-primary-950/80 transition-all duration-300 hover:border-accent-400/40 hover:bg-accent-500/10"
                >
                  <span className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-white">
                    <span>Show Less</span>
                  </span>
                </button>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  )
}