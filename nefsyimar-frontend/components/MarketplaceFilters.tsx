'use client'

import { useState } from 'react'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface MarketplaceFiltersProps {
  city: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  onFiltersChange: (filters: {
    city?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number | undefined
  }) => void
}

export default function MarketplaceFilters({
  city,
  minPrice,
  maxPrice,
  minRating,
  onFiltersChange,
}: MarketplaceFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    rating: true,
    vendor: true,
    delivery: true
  })

  const [localCity, setLocalCity] = useState(city)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice !== undefined ? String(minPrice) : '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice !== undefined ? String(maxPrice) : '')
  const [localRating, setLocalRating] = useState<number | null>(minRating ?? null)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
        <Filter className="w-5 h-5 text-accent-400" />
        <span>Filters</span>
      </div>

      {/* Location Filter */}
      <div className="memorial-card p-4 sm:p-5">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-white font-semibold mb-3"
        >
          <span>Delivery Location</span>
          {expandedSections.location ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.location && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter your address..."
              value={localCity}
              onChange={(e) => {
                const value = e.target.value
                setLocalCity(value)
                onFiltersChange({ city: value })
              }}
              className="w-full px-3 py-2 bg-primary-900/60 border border-accent-500/30 rounded-lg text-white text-sm placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
            <div className="space-y-2">
              <div className="text-accent-300 text-xs font-semibold uppercase tracking-wider">Popular Areas</div>
              {['Bole', 'Piassa', 'Merkato', 'CMC', 'Kazanchis', '4 Kilo'].map((area) => (
                <label key={area} className="flex items-center space-x-2 text-accent-200 text-sm cursor-pointer hover:text-white">
                  <input type="checkbox" className="rounded border-accent-500/40 bg-primary-900 text-accent-500 focus:ring-accent-400" />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="memorial-card p-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-white font-semibold mb-3"
        >
          <span>Price Range</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalMinPrice(value)
                  const num = value ? Number(value) : undefined
                  onFiltersChange({ minPrice: Number.isNaN(num as number) ? undefined : num })
                }}
                className="flex-1 px-3 py-2 bg-primary-900/60 border border-accent-500/30 rounded-lg text-white text-sm placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalMaxPrice(value)
                  const num = value ? Number(value) : undefined
                  onFiltersChange({ maxPrice: Number.isNaN(num as number) ? undefined : num })
                }}
                className="flex-1 px-3 py-2 bg-primary-900/60 border border-accent-500/30 rounded-lg text-white text-sm placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
            <div className="space-y-2">
              {['Under 100 ETB', '100 - 300 ETB', '300 - 500 ETB', 'Over 500 ETB'].map((range) => (
                <label key={range} className="flex items-center space-x-2 text-accent-200 text-sm cursor-pointer hover:text-white">
                  <input type="checkbox" className="rounded border-accent-500/40 bg-primary-900 text-accent-500 focus:ring-accent-400" />
                  <span>{range}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="memorial-card p-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-white font-semibold mb-3"
        >
          <span>Customer Rating</span>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[
              { stars: 4, label: '4+ Stars' },
              { stars: 3, label: '3+ Stars' },
              { stars: 2, label: '2+ Stars' },
              { stars: 1, label: '1+ Stars' }
            ].map((rating) => {
              const checked = localRating === rating.stars
              return (
                <label key={rating.stars} className="flex items-center space-x-2 text-accent-200 text-sm cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? null : rating.stars
                      setLocalRating(next)
                      onFiltersChange({ minRating: next ?? undefined })
                    }}
                    className="rounded border-accent-500/40 bg-primary-900 text-accent-500 focus:ring-accent-400"
                  />
                  <span>{rating.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Vendor */}
      <div className="memorial-card p-4">
        <button
          onClick={() => toggleSection('vendor')}
          className="flex items-center justify-between w-full text-white font-semibold mb-3"
        >
          <span>Vendor</span>
          {expandedSections.vendor ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.vendor && (
          <div className="space-y-2">
            {['Addis Flowers', 'Heritage Textiles', 'Sacred Light Co.', 'Memory Frames', 'Rose Garden'].map((vendor) => (
              <label key={vendor} className="flex items-center space-x-2 text-accent-200 text-sm cursor-pointer hover:text-white">
                <input type="checkbox" className="rounded border-accent-500/40 bg-primary-900 text-accent-500 focus:ring-accent-400" />
                <span>{vendor}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Options */}
      <div className="memorial-card p-4">
        <button
          onClick={() => toggleSection('delivery')}
          className="flex items-center justify-between w-full text-white font-semibold mb-3"
        >
          <span>Delivery</span>
          {expandedSections.delivery ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.delivery && (
          <div className="space-y-2">
            {['Same Day Delivery', 'Next Day Delivery', 'Free Shipping', 'In Stock Only'].map((option) => (
              <label key={option} className="flex items-center space-x-2 text-accent-200 text-sm cursor-pointer hover:text-white">
                <input type="checkbox" className="rounded border-accent-500/40 bg-primary-900 text-accent-500 focus:ring-accent-400" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setLocalCity('')
          setLocalMinPrice('')
          setLocalMaxPrice('')
          setLocalRating(null)
          onFiltersChange({ city: '', minPrice: undefined, maxPrice: undefined, minRating: undefined })
        }}
        className="w-full py-2.5 px-4 border-2 border-accent-500/50 text-accent-300 hover:text-white hover:bg-accent-500 hover:border-accent-500 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
      >
        Clear All Filters
      </button>
    </div>
  )
}
