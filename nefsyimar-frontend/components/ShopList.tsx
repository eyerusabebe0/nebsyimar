'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Star, Truck, ChevronRight, Package } from 'lucide-react'
import api, { API_BASE_URL } from '@/lib/api'

interface Shop {
  id: string
  name: string
  location: string
  distance: string
  rating: number
  reviews: number
  deliveryTime: string
  deliveryFee: number
  specialties: string[]
  itemCount: number
  isOpen: boolean
  image: string
}

interface ShopListProps {
  onShopSelect: (shopId: string) => void
  city?: string
  minRating?: number
  searchTerm?: string
}

export default function ShopList({
  onShopSelect,
  city,
  minRating,
  searchTerm,
}: ShopListProps) {
  const handleFilterClick = () => {
    console.log('Shop filter clicked')
    // Here you can add shop filter functionality
  }

  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const buildVendorImageUrl = (rawPath: string | null | undefined): string => {
    if (!rawPath) return '/logo1.avif'
    if (rawPath.startsWith('http')) return rawPath

    const base = API_BASE_URL.replace(/\/api\/v1$/, '')
    return `${base}${rawPath}`
  }

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await api.get('/vendors', { params: { page: 1, limit: 20 } })
        const vendors = res.data?.data?.vendors || []

        const mapped: Shop[] = vendors.map((v: any) => ({
          id: v.vendor_id,
          name: v.business_name,
          location: v.city || 'Unknown location',
          distance: '—',
          rating: Number(v.rating ?? 0),
          reviews: Number(v.total_reviews ?? 0),
          deliveryTime: '—',
          deliveryFee: Number(v.delivery_fee ?? 0),
          specialties: [v.service_type].filter(Boolean),
          itemCount: Number(v.total_orders ?? 0),
          isOpen: Boolean(v.is_active),
          image: buildVendorImageUrl(v.logo_url)
        }))

        setShops(mapped)
      } catch (err: any) {
        console.error('Failed to load vendors', err)
        setError('Failed to load shops')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [])

  const filteredShops = shops.filter((shop) => {
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      if (!shop.name.toLowerCase().includes(term)) {
        return false
      }
    }

    if (minRating !== undefined && shop.rating < minRating) {
      return false
    }

    if (city && city.trim()) {
      const cityLower = city.trim().toLowerCase()
      if (!shop.location.toLowerCase().includes(cityLower)) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">All Shops Nearby</h2>
          <p className="text-xs text-accent-300">Trusted vendors in your area</p>
        </div>
        <button
          onClick={handleFilterClick}
          className="px-4 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
        >
          Filter
        </button>
      </div>

      {isLoading && (
        <div className="text-accent-300 text-sm">Loading shops...</div>
      )}
      {!isLoading && error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      {!isLoading && !error && filteredShops.length === 0 && (
        <div className="text-accent-300 text-sm">No shops available.</div>
      )}
      {!isLoading && !error && filteredShops.length > 0 && filteredShops.map((shop) => (
        <div
          key={shop.id}
          onClick={() => {
            if (shop.isOpen) {
              onShopSelect(shop.id)
            }
          }}
          className={`memorial-card p-4 transition-all duration-300 ${
            shop.isOpen
              ? 'cursor-pointer hover:shadow-2xl hover:shadow-accent-500/20 hover:border-accent-400/60 hover:-translate-y-0.5'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-accent-500/30">
              {shop.image ? (
                <img
                  src={shop.image}
                  alt={`${shop.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-accent-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base md:text-lg mb-1 truncate">
                    {shop.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-white font-semibold text-sm">{shop.rating}</span>
                      <span className="text-accent-400 text-xs">({shop.reviews})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${
                        shop.isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-primary-700/40 text-accent-400 border border-accent-500/20'
                      }`}
                    >
                      {shop.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-accent-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent-400" />
                      {shop.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-accent-400" />
                      from {shop.deliveryFee} Br
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-accent-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
