'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, ShoppingCart, Heart, Truck } from 'lucide-react'
import api, { API_BASE_URL } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'

type SortOption =
  | 'featured'
  | 'best_rated'
  | 'price_low_high'
  | 'price_high_low'
  | 'popular'
  | 'newest'
  | 'fast_delivery'

interface ProductGridProps {
  selectedCategory: string | null
  searchTerm?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: SortOption
}

interface MarketplaceProduct {
  id: string
  name: string
  price: number
  image: string
  rating: number
  shopLocation: string
  deliveryTime: string
  inStock: boolean
  category: string | null
  vendorId?: string
  vendorName: string
  deliveryFee: number
  minimumOrder: number
}

const CATEGORY_MAP: Record<string, string> = {
  flowers: 'FLOWERS',
  attire: 'CLOTHING',
  candles: 'MEMORIAL_ITEMS',
  frames: 'MEMORIAL_ITEMS',
  memorial: 'MEMORIAL_ITEMS',
  gifts: 'MEMORIAL_ITEMS',
}

const parseDeliveryTimeToHours = (value: string): number => {
  if (!value) return Number.POSITIVE_INFINITY
  const numeric = parseFloat(value)
  if (!Number.isNaN(numeric) && numeric > 0) return numeric
  const match = value.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const parsed = parseFloat(match[1])
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
  }
  return Number.POSITIVE_INFINITY
}

const buildProductImageUrl = (rawPath: string | null | undefined): string => {
  if (!rawPath) return '/api/placeholder/300/300'
  if (rawPath.startsWith('http')) return rawPath

  const base = API_BASE_URL.replace(/\/api\/v1$/, '')
  return `${base}${rawPath}`
}

const mapSortToApiSort = (sort?: SortOption): string | undefined => {
  if (!sort || sort === 'featured') return undefined
  if (sort === 'best_rated') return 'rating'
  if (sort === 'price_low_high') return 'price_low'
  if (sort === 'price_high_low') return 'price_high'
  if (sort === 'popular') return 'popular'
  if (sort === 'newest') return 'newest'
  if (sort === 'fast_delivery') return undefined
  return undefined
}

export default function ProductGrid({
  selectedCategory,
  searchTerm,
  city,
  minPrice,
  maxPrice,
  minRating,
  sort,
}: ProductGridProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params: Record<string, any> = {
          page: 1,
          limit: 24,
          in_stock_only: true,
        }

        const hasFiltersOrSearch = Boolean(
          selectedCategory ||
            (searchTerm && searchTerm.trim()) ||
            city ||
            minPrice !== undefined ||
            maxPrice !== undefined ||
            minRating !== undefined ||
            (sort && sort !== 'featured'),
        )

        if (!hasFiltersOrSearch) {
          params.featured_only = true
        }

        if (selectedCategory) {
          const mappedCategory = CATEGORY_MAP[selectedCategory]
          if (mappedCategory) {
            params.category = mappedCategory
          }
        }

        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim()
        }

        if (minPrice !== undefined) {
          params.min_price = minPrice
        }

        if (maxPrice !== undefined) {
          params.max_price = maxPrice
        }

        const apiSort = mapSortToApiSort(sort)
        if (apiSort) {
          params.sort = apiSort
        }

        const res = await api.get('/products', { params })
        const apiProducts = res.data?.data?.products || []

        let mapped: MarketplaceProduct[] = apiProducts.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: Number(p.price ?? 0),
          image: buildProductImageUrl(p.main_image),
          rating: Number(p.rating ?? 0),
          shopLocation: p.vendor?.city || '—',
          deliveryTime:
            typeof p.delivery_time === 'number' && p.delivery_time > 0
              ? `${p.delivery_time} hrs`
              : '—',
          inStock: p.track_inventory ? Number(p.stock_quantity ?? 0) > 0 : true,
          category: typeof p.category === 'string' ? p.category.toLowerCase() : null,
          vendorId: p.vendor?.vendor_id,
          vendorName: p.vendor?.business_name || 'Vendor',
          deliveryFee: Number(p.vendor?.delivery_fee ?? 0),
          minimumOrder: Number(p.vendor?.minimum_order ?? 0),
        }))

        if (city && city.trim()) {
          const cityLower = city.trim().toLowerCase()
          mapped = mapped.filter((product) =>
            product.shopLocation.toLowerCase().includes(cityLower),
          )
        }

        if (minRating !== undefined) {
          mapped = mapped.filter((product) => product.rating >= minRating)
        }

        if (sort === 'fast_delivery') {
          mapped = [...mapped].sort(
            (a, b) =>
              parseDeliveryTimeToHours(a.deliveryTime) -
              parseDeliveryTimeToHours(b.deliveryTime),
          )
        }

        setProducts(mapped)
      } catch (err) {
        console.error('Failed to load products', err)
        setError('Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchTerm, city, minPrice, maxPrice, minRating, sort])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    router.push(`/marketplace/products/${productId}`)
  }

  const handleFilterClick = () => {
    console.log('Filter clicked')
    // Here you can add additional filter functionality
  }

  // Filter products based on selected category (client-side fallback)
  const filteredProducts = selectedCategory 
    ? products.filter((product) => product.category === selectedCategory)
    : products

  return (
    <div className="mb-8">
      {/* Special Offers Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Featured Products</h2>
          <p className="text-xs text-accent-300">Hand-picked tributes and remembrance items</p>
        </div>
        <button
          onClick={handleFilterClick}
          className="px-4 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
        >
          Filter
        </button>
      </div>

      {isLoading && (
        <div className="text-accent-300 text-sm">Loading featured products...</div>
      )}
      {!isLoading && error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="text-accent-300 text-sm">No products available.</div>
      )}

      {/* Products Grid */}
      <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5 md:overflow-visible md:pb-0 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="flex-shrink-0 w-44 md:w-auto memorial-card overflow-hidden hover:shadow-2xl hover:shadow-accent-500/20 hover:border-accent-400/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            {/* Product Image */}
            <div className="relative h-40 bg-gradient-to-br from-primary-800 to-primary-900 overflow-hidden">
              {product.image.startsWith('/api/placeholder') ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-accent-400" />
                  </div>
                </div>
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(product.id)
                }}
                className="absolute top-2 right-2 p-1.5 bg-primary-900/80 backdrop-blur border border-accent-400/30 rounded-full hover:bg-accent-500 transition-colors shadow"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    favorites.includes(product.id)
                      ? 'text-red-400 fill-current'
                      : 'text-accent-200'
                  }`}
                />
              </button>

              {/* Stock Status */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              {/* Price & Quick Order */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white font-bold text-base">
                  {product.price} <span className="text-xs text-accent-400 font-semibold">ETB</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!product.inStock) return
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      vendor: {
                        vendorId: product.vendorId || '',
                        vendorName: product.vendorName,
                        vendorCity: product.shopLocation,
                        deliveryFee: product.deliveryFee,
                        minimumOrder: product.minimumOrder,
                      },
                    })
                  }}
                  className="px-3 py-1 rounded-full bg-accent-500 hover:bg-accent-600 text-xs font-semibold text-white shadow-sm"
                >
                  Add
                </button>
              </div>

              {/* Product Name */}
              <h3 className="text-accent-100 text-sm font-semibold mb-1.5 line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {/* Location & Rating */}
              <div className="flex items-center justify-between text-xs text-accent-400 mb-1">
                <span className="truncate">{product.shopLocation.split(',')[0]}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span className="font-semibold text-white">{product.rating}</span>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <Truck className="w-3 h-3" />
                <span>{product.deliveryTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
