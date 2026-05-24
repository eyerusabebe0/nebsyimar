'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Star, Truck, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useCart } from '@/contexts/CartContext'

interface ProductDetailVendor {
  vendorId: string
  name: string
  rating?: number
  city?: string
  phone?: string
  deliveryFee?: number
  minimumOrder?: number
}

interface ProductDetail {
  id: string
  name: string
  description: string
  price: number
  image: string
  gallery: string[]
  rating?: number
  totalReviews?: number
  category?: string
  vendor: ProductDetailVendor
}

interface RelatedProductSummary {
  id: string
  name: string
  price: number
  image: string
}

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter()
  const { productId } = params
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [related, setRelated] = useState<RelatedProductSummary[]>([])
  const [featured, setFeatured] = useState<RelatedProductSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await api.get(`/products/${productId}`)
        const data = res.data?.data
        const apiProduct = data?.product

        if (!apiProduct || !apiProduct.vendor) {
          setError('Product not found')
          setProduct(null)
          return
        }

        const vendor = apiProduct.vendor

        const mapped: ProductDetail = {
          id: apiProduct.product_id,
          name: apiProduct.name,
          description: apiProduct.description || '',
          price: Number(apiProduct.price ?? 0),
          image: apiProduct.main_image || '/api/placeholder/400/400',
          gallery: Array.isArray(apiProduct.gallery_images) ? apiProduct.gallery_images : [],
          rating: apiProduct.rating != null ? Number(apiProduct.rating) : undefined,
          totalReviews: apiProduct.total_reviews != null ? Number(apiProduct.total_reviews) : undefined,
          category: apiProduct.category,
          vendor: {
            vendorId: vendor.vendor_id,
            name: vendor.business_name,
            rating: vendor.rating != null ? Number(vendor.rating) : undefined,
            city: vendor.city,
            phone: vendor.phone,
            deliveryFee: vendor.delivery_fee != null ? Number(vendor.delivery_fee) : undefined,
            minimumOrder: vendor.minimum_order != null ? Number(vendor.minimum_order) : undefined,
          },
        }

        const relatedProducts: RelatedProductSummary[] = Array.isArray(data?.related_products)
          ? data.related_products.map((p: any) => ({
              id: p.product_id,
              name: p.name,
              price: Number(p.price ?? 0),
              image: p.main_image || '/api/placeholder/200/200',
            }))
          : []

        setProduct(mapped)
        setRelated(relatedProducts)
      } catch (err) {
        console.error('Failed to load product detail', err)
        setError('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await api.get('/products/featured', { params: { limit: 6 } })
        const apiProducts = res.data?.data?.products || []

        const mapped: RelatedProductSummary[] = apiProducts.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: Number(p.price ?? 0),
          image: p.main_image || '/api/placeholder/200/200',
        }))

        setFeatured(mapped)
      } catch (err) {
        console.error('Failed to load featured products', err)
      }
    }

    loadFeatured()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-900 flex items-center justify-center">
        <div className="text-accent-300 text-sm">Loading product...</div>
      </div>
    )
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-accent-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    )
  }

  const handleOrderNow = () => {
    router.push(`/order/create?productId=${product.id}`)
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      vendor: {
        vendorId: product.vendor.vendorId,
        vendorName: product.vendor.name,
        vendorCity: product.vendor.city,
        deliveryFee: product.vendor.deliveryFee ?? 0,
        minimumOrder: product.vendor.minimumOrder ?? 0,
      },
    })
  }

  return (
    <div className="min-h-screen bg-accent-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-accent-300 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Product image */}
          <div className="bg-accent-800 rounded-xl overflow-hidden flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 w-full object-cover rounded-lg"
            />
          </div>

          {/* Product info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>

            {product.vendor && (
              <div className="text-sm text-accent-300">
                <span className="font-medium text-accent-100">{product.vendor.name}</span>
                {product.vendor.city && <span className="ml-1">• {product.vendor.city}</span>}
                {product.vendor.rating != null && (
                  <span className="ml-2 inline-flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{product.vendor.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-white">{product.price} ETB</div>
              {product.vendor.minimumOrder != null && product.vendor.minimumOrder > 0 && (
                <div className="text-xs text-accent-300">
                  Min order: {product.vendor.minimumOrder} ETB
                </div>
              )}
            </div>

            {product.vendor.deliveryFee != null && (
              <div className="flex items-center space-x-2 text-sm text-accent-200">
                <Truck className="w-4 h-4" />
                <span>Delivery fee: {product.vendor.deliveryFee} ETB</span>
              </div>
            )}

            <p className="text-sm text-accent-200 leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided.'}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mt-2">
              <button
                onClick={handleOrderNow}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Order now</span>
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 bg-accent-700 hover:bg-accent-600 text-white rounded-lg font-medium text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to cart</span>
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-white mb-3">More from this vendor</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((rp) => (
                <button
                  key={rp.id}
                  onClick={() => router.push(`/marketplace/products/${rp.id}`)}
                  className="text-left bg-accent-800 rounded-lg overflow-hidden hover:bg-accent-700 transition-colors"
                >
                  <div className="h-24 bg-accent-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-white line-clamp-2">{rp.name}</div>
                    <div className="text-xs text-accent-200 mt-1">{rp.price} ETB</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {featured.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-3">Featured marketplace picks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => router.push(`/marketplace/products/${fp.id}`)}
                  className="text-left bg-accent-800 rounded-lg overflow-hidden hover:bg-accent-700 transition-colors"
                >
                  <div className="h-24 bg-accent-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={fp.image}
                      alt={fp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-white line-clamp-2">{fp.name}</div>
                    <div className="text-xs text-accent-200 mt-1">{fp.price} ETB</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
