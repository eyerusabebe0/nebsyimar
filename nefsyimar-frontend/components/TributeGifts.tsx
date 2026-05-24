'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart, Star } from 'lucide-react'

interface Memorial {
  id: string
  name: string
  totalTributes: number
  totalAmount: number
}

interface TributeGiftsProps {
  memorial: Memorial
}

export default function TributeGifts({ memorial }: TributeGiftsProps) {
  const [selectedGift, setSelectedGift] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const gifts = [
    {
      id: 1,
      name: 'Rose / Flower',
      symbol: '🌹',
      price: 5,
      description: 'Small tribute • Rose / Flower',
      animation: 'Petal bloom',
      image: '/tribute-rose.png'
    },
    {
      id: 2,
      name: 'Butterfly',
      symbol: '🦋',
      price: 10,
      description: 'Medium tribute • Butterfly',
      animation: 'Soft wings',
      image: '/tribute-butterfly.png'
    },
    {
      id: 3,
      name: 'Candle',
      symbol: '🕯️',
      price: 15,
      description: 'Candle of remembrance',
      animation: 'Gentle flame',
      image: '/tribute-candle.png'
    },
    {
      id: 4,
      name: 'Wreath / Garland',
      symbol: '💮',
      price: 20,
      description: 'Wreath of honor',
      animation: 'Soft glow',
      image: '/tribute-crown.png'
    },
    {
      id: 5,
      name: 'Bird in Flight',
      symbol: '🕊️',
      price: 25,
      description: 'Bird in flight • Peaceful spirit',
      animation: 'Flying dove',
      image: '/tribute-bird.png'
    },
    {
      id: 6,
      name: 'Heart / Love Flame',
      symbol: '❤️',
      price: 30,
      description: 'Heart of love • Flame of memory',
      animation: 'Warm glow',
      image: '/tribute-heart.png'
    },
    {
      id: 7,
      name: 'Tree of Life',
      symbol: '🌳',
      price: 50,
      description: 'Premium tribute • Tree of Life',
      animation: 'Gentle shimmer',
      image: '/tribute-tree.png'
    },
    {
      id: 8,
      name: 'Star / Shooting Star',
      symbol: '✨',
      price: 75,
      description: 'Premium tribute • Shooting star',
      animation: 'Soft trail',
      image: '/tribute-star.png'
    }
  ]

  const handleGiftSelect = (giftId: number) => {
    setSelectedGift(giftId)
    setShowPayment(true)
  }

  return (
    <div className="space-y-6">
      {/* Gift Selection */}
      <div className="memorial-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-accent-400" />
          <span>Send Tribute Gift</span>
        </h3>
        
        <div className="space-y-3">
          {gifts.map((gift) => (
            <button
              key={gift.id}
              onClick={() => handleGiftSelect(gift.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedGift === gift.id
                  ? 'border-accent-500 bg-primary-900/10'
                  : 'border-white/20 hover:border-accent-600 hover:bg-primary-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={gift.image}
                      alt={gift.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-contain drop-shadow-md mix-blend-screen"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium">{gift.name}</div>
                    <div className="text-accent-400 text-sm">{gift.description}</div>
                  </div>
                </div>
                <div className="text-accent-300 font-semibold">
                  {gift.price} ETB
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment Form */}
        {showPayment && selectedGift && (
          <div className="mt-6 p-4 glass-effect rounded-lg">
            <h4 className="text-white font-medium mb-4">Complete Your Tribute</h4>
            <form className="space-y-4">
              <div>
                <label className="block text-accent-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-accent-400 text-sm mb-2">Message (Optional)</label>
                <textarea
                  placeholder="Share a memory or message..."
                  rows={3}
                  className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-accent-400 text-sm mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 bg-primary-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
                  <option value="telebirr">Telebirr</option>
                  <option value="cbe">CBE Birr</option>
                  <option value="hellocash">HelloCash</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Send Tribute
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
        <h3 className="text-lg font-semibold text-white mb-4">Recent Tributes</h3>
        <div className="space-y-3">
          {[
            { name: 'Sarah M.', giftImage: '/tribute-candle.png', message: 'Rest in peace, uncle. You will be missed.' },
            { name: 'Michael T.', giftImage: '/tribute-rose.png', message: 'Thank you for all your wisdom and kindness.' },
            { name: 'Hanna K.', giftImage: '/tribute-bird.png', message: 'Your memory will live on in our hearts.' }
          ].map((tribute, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-primary-800/50 rounded-lg">
              <div className="flex-shrink-0 flex items-center justify-center">
                <Image
                  src={tribute.giftImage}
                  alt="Tribute gift icon"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain drop-shadow-md mix-blend-screen"
                />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{tribute.name}</div>
                <div className="text-accent-400 text-sm">{tribute.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
