'use client'

import { useState } from 'react'
import { Flower, Flame, Shirt, Frame, Circle, Car } from 'lucide-react'

export default function ProductCategories() {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Items', icon: null, count: 500 },
    { id: 'flowers', name: 'Flowers & Wreaths', icon: Flower, count: 120 },
    { id: 'candles', name: 'Candles & Incense', icon: Flame, count: 85 },
    { id: 'attire', name: 'Traditional Attire', icon: Shirt, count: 95 },
    { id: 'frames', name: 'Frames & Photos', icon: Frame, count: 60 },
    { id: 'memorial', name: 'Memorial Items', icon: Circle, count: 75 },
    { id: 'services', name: 'Funeral Services', icon: Car, count: 65 }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
              activeCategory === category.id
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-accent-700 hover:border-accent-600 hover:bg-accent-800/50'
            }`}
          >
            {category.icon && (
              <category.icon className={`w-6 h-6 mx-auto mb-2 ${
                activeCategory === category.id ? 'text-accent-400' : 'text-accent-500'
              }`} />
            )}
            <div className={`font-medium text-sm ${
              activeCategory === category.id ? 'text-white' : 'text-accent-300'
            }`}>
              {category.name}
            </div>
            <div className="text-accent-500 text-xs">
              {category.count} items
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
