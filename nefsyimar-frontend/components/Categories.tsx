'use client'

import { Flower, Shirt, Flame, Camera, Heart, Gift } from 'lucide-react'

interface CategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}

export default function Categories({ selectedCategory, onCategorySelect }: CategoriesProps) {
  const categories = [
    {
      id: 1,
      name: 'Flowers',
      icon: Flower,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 2,
      name: 'Attire',
      icon: Shirt,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 3,
      name: 'Candles',
      icon: Flame,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 4,
      name: 'Frames',
      icon: Camera,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 5,
      name: 'Memorial',
      icon: Heart,
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 6,
      name: 'Gifts',
      icon: Gift,
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const handleCategoryClick = (categoryName: string) => {
    const newSelection = selectedCategory === categoryName ? null : categoryName
    onCategorySelect(newSelection)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white font-display">Shop by Category</h2>
        {selectedCategory && (
          <button
            onClick={() => onCategorySelect(null)}
            className="text-xs uppercase tracking-wider text-accent-300 hover:text-accent-200 font-semibold"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
        {categories.map((category) => {
          const IconComponent = category.icon
          const isSelected = selectedCategory === category.name.toLowerCase()
          return (
            <div
              key={category.id}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category.name.toLowerCase())}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-accent-400 ring-offset-2 ring-offset-primary-950 scale-105' : ''
                }`}
              >
                <IconComponent className="w-8 h-8 text-white drop-shadow" />
              </div>
              <span
                className={`text-sm font-semibold text-center transition-colors ${
                  isSelected ? 'text-accent-300' : 'text-accent-200 group-hover:text-white'
                }`}
              >
                {category.name}
              </span>
            </div>
          )
        })}
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
