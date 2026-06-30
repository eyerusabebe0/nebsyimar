'use client'

import { useState } from 'react'
import MarketplaceHeader from '@/components/MarketplaceHeader'
import Categories from '@/components/Categories'
import ProductGrid from '@/components/ProductGrid'
import ShopList from '@/components/ShopList'
import ShopItems from '@/components/ShopItems'
import MarketplaceFilters from '@/components/MarketplaceFilters'

type SortOption =
  | 'featured'
  | 'best_rated'
  | 'price_low_high'
  | 'price_high_low'
  | 'popular'
  | 'newest'
  | 'fast_delivery'

export default function MarketplacePage() {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sort, setSort] = useState<SortOption>('featured')
  const [cityFilter, setCityFilter] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [minRating, setMinRating] = useState<number | undefined>(undefined)

  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(shopId)
  }

  const handleBackToShops = () => {
    setSelectedShopId(null)
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  return (
    <div className="min-h-screen py-8 animated-dark-bg overflow-hidden relative">
      {/* Floating dust */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {Array.from({ length: 14 }).map((_, idx) => (
          <span
            key={idx}
            className="dust-particle"
            style={{
              left: `${(idx * 53) % 100}%`,
              top: `${(idx * 37) % 100}%`,
              animationDelay: `${(idx % 7) * 0.7}s`,
              animationDuration: `${12 + (idx % 6) * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MarketplaceHeader
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          sort={sort}
          onSortChange={(value) => setSort(value as SortOption)}
        />

        {selectedShopId ? (
          <ShopItems shopId={selectedShopId} onBackToShops={handleBackToShops} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-6">
              <Categories selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
              <ProductGrid
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                sort={sort}
                city={cityFilter}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minRating={minRating}
              />
              <div className="md:hidden">
                <MarketplaceFilters
                  city={cityFilter}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  minRating={minRating}
                  onFiltersChange={(filters) => {
                    if (filters.city !== undefined) setCityFilter(filters.city)
                    if (filters.minPrice !== undefined) setMinPrice(filters.minPrice)
                    if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice)
                    if (filters.minRating !== undefined) setMinRating(filters.minRating)
                  }}
                />
              </div>
              <ShopList
                onShopSelect={handleShopSelect}
                city={cityFilter}
                minRating={minRating}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
