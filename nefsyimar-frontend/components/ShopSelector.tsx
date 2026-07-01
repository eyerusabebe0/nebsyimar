'use client'

import { useState } from 'react'
import { MapPin, Clock, Star, Truck } from 'lucide-react'

export default function ShopSelector() {
  const [selectedShop, setSelectedShop] = useState<number | null>(null)

  const shops = [
    {
      id: 1,
      name: 'Addis Flowers',
      location: 'Bole, Addis Ababa',
      distance: '2.3 km',
      rating: 4.8,
      reviews: 156,
      deliveryTime: '30-45 min',
      deliveryFee: 25,
      specialties: ['Fresh Flowers', 'Wreaths', 'Arrangements']
    },
    {
      id: 2,
      name: 'Heritage Textiles',
      location: 'Piassa, Addis Ababa',
      distance: '3.1 km',
      rating: 4.9,
      reviews: 89,
      deliveryTime: '45-60 min',
      deliveryFee: 30,
      specialties: ['Traditional Attire', 'Netela', 'Gabi']
    },
    {
      id: 3,
      name: 'Sacred Light Co.',
      location: 'Merkato, Addis Ababa',
      distance: '1.8 km',
      rating: 4.7,
      reviews: 203,
      deliveryTime: '20-30 min',
      deliveryFee: 15,
      specialties: ['Candles', 'Incense', 'Religious Items']
    },
    {
      id: 4,
      name: 'Memory Frames',
      location: 'CMC, Addis Ababa',
      distance: '4.2 km',
      rating: 4.6,
      reviews: 67,
      deliveryTime: '60-90 min',
      deliveryFee: 35,
      specialties: ['Photo Frames', 'Memorial Plaques', 'Custom Prints']
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Choose Your Preferred Shop</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => setSelectedShop(shop.id)}
            className={`memorial-card rounded-xl p-4 cursor-pointer transition-all duration-200 ${
              selectedShop === shop.id
                ? 'ring-2 ring-accent-500 bg-accent-500/10'
                : 'hover:bg-accent-800/50'
            }`}
          >
            {/* Shop Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-lg">{shop.name}</h3>
                <div className="flex items-center space-x-1 text-accent-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{shop.location}</span>
                  <span>•</span>
                  <span>{shop.distance}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-white font-medium">{shop.rating}</span>
                </div>
                <div className="text-accent-500 text-xs">({shop.reviews} reviews)</div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{shop.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1 text-accent-400 text-sm">
                <Truck className="w-4 h-4" />
                <span>{shop.deliveryFee} ETB delivery</span>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2">
              {shop.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent-700 text-accent-300 text-xs rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>

            {/* Selection Indicator */}
            {selectedShop === shop.id && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center space-x-1 text-accent-400 text-sm">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <span>Selected Shop</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedShop && (
        <div className="mt-4 glass-effect rounded-lg p-4">
          <div className="text-center text-accent-300">
            <span>Shopping from: </span>
            <span className="text-white font-medium">
              {shops.find(shop => shop.id === selectedShop)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
