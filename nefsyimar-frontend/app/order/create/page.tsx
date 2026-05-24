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

  const handleFiltersChange = (filters: {
    city?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number | undefined
  }) => {
    if (filters.city !== undefined) setCityFilter(filters.city)
    if (filters.minPrice !== undefined) setMinPrice(filters.minPrice)
    if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice)
    if (filters.minRating !== undefined) setMinRating(filters.minRating)
  }

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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* Sidebar filters: visible on desktop/tablet only */}
            <div className="hidden md:block md:col-span-1">
              <MarketplaceFilters
                city={cityFilter}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minRating={minRating}
                onFiltersChange={handleFiltersChange}
              />
            </div>

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