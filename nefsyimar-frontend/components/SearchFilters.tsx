'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, MapPin } from 'lucide-react'

interface SearchFiltersProps {
  onSearch: (term: string) => void
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search memorials by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-lg transition-colors duration-200"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-effect rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Filter */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Range
              </label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400">
                <option value="">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-white font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400">
                <option value="">All Locations</option>
                <option value="addis-ababa">Addis Ababa</option>
                <option value="dire-dawa">Dire Dawa</option>
                <option value="bahir-dar">Bahir Dar</option>
                <option value="mekelle">Mekelle</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-white font-medium mb-2">
                Sort By
              </label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Visited</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
