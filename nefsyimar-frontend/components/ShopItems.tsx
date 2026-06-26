
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, ShoppingCart, Heart } from 'lucide-react'
import api, { API_BASE_URL } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'

interface ShopItem {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  rating: number
  reviews: number
  description: string
  inStock: boolean
  category: string | null
}

interface Shop {
  id: string
  name: string
  location: string
  deliveryTime: string
  deliveryFee: number
   minimumOrder: number
  items: ShopItem[]
}

interface ShopItemsProps {
  shopId: string
  onBackToShops: () => void
}

export default function ShopItems({ shopId, onBackToShops }: ShopItemsProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addItem } = useCart()

  const buildProductImageUrl = (rawPath: string | null | undefined): string => {
    if (!rawPath) return '/api/placeholder/300/300'
    if (rawPath.startsWith('http')) return rawPath

    const base = API_BASE_URL.replace(/\/api\/v1$/, '')
    return `${base}${rawPath}`
  }

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await api.get(`/vendors/${shopId}`)
        const data = res.data?.data || {}
        const vendor = data.vendor
        const products = data.products || []

        if (!vendor) {
          setError('Shop not found')
          setShop(null)
          return
        }

        const mappedShop: Shop = {
          id: vendor.vendor_id,
          name: vendor.business_name,
          location: vendor.city || 'Unknown location',
          deliveryTime: '—',
          deliveryFee: Number(vendor.delivery_fee ?? 0),
          minimumOrder: Number(vendor.minimum_order ?? 0),
          items: products.map((p: any) => ({
            id: p.product_id,
            name: p.name,
            price: Number(p.price ?? 0),
            originalPrice: null,
            image: buildProductImageUrl(p.main_image),
            rating: Number(p.rating ?? 0),
            reviews: Number(p.total_reviews ?? 0),
            description: p.description || '',
            inStock: p.track_inventory ? Number(p.stock_quantity ?? 0) > 0 : true,
            category: typeof p.category === 'string' ? p.category.toLowerCase() : null,
          })),
        }

        setShop(mappedShop)
      } catch (err) {
        console.error('Failed to load shop', err)
        setError('Failed to load shop')
      } finally {
        setIsLoading(false)
      }
    }

    if (shopId) {
      fetchShop()
    }
  }, [shopId])

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  if (isLoading) {
    return (
      <div className="memorial-card rounded-xl p-6 text-accent-300">
        Loading shop items...
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="memorial-card rounded-xl p-6 text-accent-300">
        <button
          onClick={onBackToShops}
          className="flex items-center space-x-2 text-accent-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shops</span>
        </button>
        <div>{error || 'Shop not found.'}</div>
      </div>
    )
  }

  return (
    <div>
      {/* Shop Header */}
      <div className="mb-8">
        <button
          onClick={onBackToShops}
          className="flex items-center space-x-2 text-accent-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shops</span>
        </button>

        <div className="memorial-card rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{shop.name}</h1>
          <div className="flex items-center justify-between text-accent-400">
            <span>{shop.location}</span>
            <div className="flex items-center space-x-4">
              <span>Delivery: {shop.deliveryTime}</span>
              <span>Fee: {shop.deliveryFee} ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Available Items</h2>
          <span className="text-accent-400 text-sm sm:text-base">{shop.items.length} items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {shop.items.map((item: ShopItem) => (
            <div
              key={item.id}
              onClick={() => router.push(`/marketplace/products/${item.id}`)}
              className="memorial-card rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group cursor-pointer"
            >
              {/* Item Image */}
              <div className="relative h-44 sm:h-48 bg-gradient-to-br from-accent-700 to-accent-800">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', item.image);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', item.image)}
                />
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Sale Badge */}
                {item.originalPrice && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                      SALE
                    </span>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-3 right-3 p-2 glass-effect rounded-full hover:bg-accent-600 transition-colors"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(item.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-white'
                    }`} 
                  />
                </button>

                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4 sm:p-5">
                <h3 className="text-white text-base sm:text-lg font-medium mb-2 group-hover:text-accent-400 transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-accent-400 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-accent-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-accent-400 text-sm">
                    {item.rating} ({item.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-white font-bold text-lg">
                    {item.price} ETB
                  </span>
                  {item.originalPrice && (
                    <span className="text-accent-500 line-through text-sm">
                      {item.originalPrice} ETB
                    </span>
                  )}
                </div>

                {/* Order Button */}
                <button
                  disabled={!item.inStock}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!item.inStock) return
                    addItem({
                      productId: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      vendor: {
                        vendorId: shop.id,
                        vendorName: shop.name,
                        vendorCity: shop.location,
                        deliveryFee: shop.deliveryFee,
                        minimumOrder: shop.minimumOrder,
                      },
                    })
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    item.inStock
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white'
                      : 'bg-accent-700 text-accent-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
