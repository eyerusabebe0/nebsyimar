'use client'

import { Search, Sparkles, ShoppingBag } from 'lucide-react'

interface MarketplaceHeaderProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

export default function MarketplaceHeader({
  searchTerm,
  onSearchTermChange,
  sort,
  onSortChange,
}: MarketplaceHeaderProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="mb-8 space-y-5">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-500 via-accent-400 to-accent-600 p-5 sm:p-6 md:p-8 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/30 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/20 blur-3xl"></div>
        </div>
        <div className="relative flex flex-col sm:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs uppercase tracking-wider font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Memorial Marketplace
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display mb-1">
              Tributes, flowers & keepsakes
            </h1>
            <p className="text-white/85 text-sm sm:text-base md:text-base max-w-lg">
              Thoughtful gifts and remembrance items, hand-picked from trusted vendors in your community.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/95">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <p className="text-xs uppercase tracking-wider opacity-90">Curated</p>
              <p className="text-lg font-bold">Local Vendors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-accent-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search flowers, candles, attire, gifts..."
            className="w-full pl-12 pr-4 py-3.5 bg-primary-900/70 backdrop-blur border border-accent-500/30 rounded-2xl text-white placeholder-accent-300/60 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent shadow-lg shadow-black/30"
          />
        </form>

        <div className="flex items-center gap-2 bg-primary-900/70 backdrop-blur border border-accent-500/30 rounded-2xl px-3 py-2 shadow-lg shadow-black/30">
          <span className="text-xs uppercase tracking-wider text-accent-400 font-semibold">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-white text-sm py-3 pr-2 focus:outline-none cursor-pointer"
          >
            <option value="featured" className="bg-primary-900">Featured</option>
            <option value="best_rated" className="bg-primary-900">Best rated</option>
            <option value="price_low_high" className="bg-primary-900">Price: Low to high</option>
            <option value="price_high_low" className="bg-primary-900">Price: High to low</option>
            <option value="popular" className="bg-primary-900">Most popular</option>
            <option value="newest" className="bg-primary-900">Newest</option>
            <option value="fast_delivery" className="bg-primary-900">Fast delivery</option>
          </select>
        </div>
      </div>
    </div>
  )
}
