'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingBag, ArrowRight, Star, Flower } from 'lucide-react'
import api, { API_BASE_URL } from '@/lib/api'

interface ApiProduct {
  product_id: string
  name: string
  price: number
  main_image?: string | null
  rating?: number
  vendor?: { city?: string; business_name?: string }
}

interface ProductCard {
  id: string
  name: string
  price: number
  image: string
  rating: number
  vendor: string
  city: string
}

const buildImage = (raw?: string | null): string => {
  if (!raw) return '/scarf.jpg'
  if (raw.startsWith('http')) return raw
  const base = API_BASE_URL.replace(/\/api\/v1$/, '')
  return `${base}${raw}`
}

const FALLBACK_PRODUCTS: ProductCard[] = [
  { id: 'demo-flower', name: 'White Rose Tribute', price: 350, image: '/tribute-rose.png', rating: 4.9, vendor: 'Addis Flowers', city: 'Addis Ababa' },
  { id: 'demo-candle', name: 'Memorial Candle Set', price: 220, image: '/tribute-candle.png', rating: 4.8, vendor: 'Sacred Light Co.', city: 'Addis Ababa' },
  { id: 'demo-heart', name: 'Memorial Heart Pendant', price: 580, image: '/tribute-heart.png', rating: 4.9, vendor: 'Heritage Jewels', city: 'Bahir Dar' },
  { id: 'demo-bird', name: 'Tribute Bird Ornament', price: 410, image: '/tribute-bird.png', rating: 4.7, vendor: 'Memory Frames', city: 'Mekelle' },
  { id: 'demo-butterfly', name: 'Butterfly Remembrance', price: 320, image: '/tribute-butterfly.png', rating: 4.6, vendor: 'Soulful Crafts', city: 'Gondar' },
  { id: 'demo-tree', name: 'Memorial Tree Sapling', price: 750, image: '/tribute-tree.png', rating: 5.0, vendor: 'Living Tribute', city: 'Dire Dawa' },
  { id: 'demo-crown', name: 'Floral Crown Wreath', price: 920, image: '/tribute-crown.png', rating: 4.9, vendor: 'Rose Garden', city: 'Addis Ababa' },
  { id: 'demo-star', name: 'Star Memorial Frame', price: 480, image: '/tribute-star.png', rating: 4.8, vendor: 'Memory Frames', city: 'Adama' },
]

export default function HomeMarketplaceSlider() {
  const [products, setProducts] = useState<ProductCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/products', { params: { page: 1, limit: 12, in_stock_only: true } })
        const items: ApiProduct[] = res.data?.data?.products || []
        const mapped: ProductCard[] = items.map((p) => ({
          id: p.product_id,
          name: p.name,
          price: Number(p.price ?? 0),
          image: buildImage(p.main_image),
          rating: Number(p.rating ?? 0),
          vendor: p.vendor?.business_name || 'Vendor',
          city: p.vendor?.city || '—',
        }))
        setProducts(mapped.length ? mapped : FALLBACK_PRODUCTS)
      } catch {
        setProducts(FALLBACK_PRODUCTS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const marquee = products.length ? [...products, ...products] : []

  return (
    <section className="py-20 animated-dark-bg overflow-hidden">
      {/* Floating dust particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {Array.from({ length: 12 }).map((_, idx) => (
          <span
            key={idx}
            className="dust-particle"
            style={{
              left: `${(idx * 41) % 100}%`,
              top: `${(idx * 33) % 100}%`,
              animationDelay: `${(idx % 6) * 0.8}s`,
              animationDuration: `${14 + (idx % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs uppercase tracking-[0.2em] font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            Memorial Marketplace
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
            Thoughtful Tributes & Keepsakes
          </h2>
          <p className="text-accent-200/85 max-w-2xl mx-auto leading-relaxed">
            Browse flowers, candles, frames, attire, and remembrance gifts hand-picked from trusted
            local vendors. Tap any item to explore the full marketplace.
          </p>
        </div>

        {/* Sliding products */}
        {isLoading ? (
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-52 h-64 bg-primary-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden marquee-mask-mp">
              <div className="flex gap-5 home-mp-track">
                {marquee.map((p, idx) => (
                  <Link
                    key={`${p.id}-${idx}`}
                    href="/marketplace"
                    className="flex-shrink-0 w-56 memorial-card overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-500/30 hover:border-accent-400/60 transition-all duration-500 group"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-primary-800 to-primary-900 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/scarf.jpg'
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary-900/80 backdrop-blur border border-accent-400/30 rounded-full text-[10px] uppercase tracking-wider text-accent-300 font-semibold flex items-center gap-1">
                        <Flower className="w-3 h-3 text-rose-400" />
                        Tribute
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-base">
                          {p.price} <span className="text-xs text-accent-400">ETB</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white font-semibold">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          {p.rating}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-accent-100 line-clamp-2 leading-tight mb-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-accent-400 truncate">{p.vendor} · {p.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <style jsx>{`
              .home-mp-track {
                width: max-content;
                animation: homeMpMarquee 60s linear infinite;
              }
              .home-mp-track:hover {
                animation-play-state: paused;
              }
              .marquee-mask-mp {
                mask-image: linear-gradient(
                  to right,
                  transparent,
                  black 6%,
                  black 94%,
                  transparent
                );
                -webkit-mask-image: linear-gradient(
                  to right,
                  transparent,
                  black 6%,
                  black 94%,
                  transparent
                );
              }
              @keyframes homeMpMarquee {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/marketplace"
            className="inline-flex items-center px-7 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/30 hover:scale-105"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
