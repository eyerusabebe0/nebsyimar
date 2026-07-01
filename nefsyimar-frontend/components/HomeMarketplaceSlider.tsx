'use client'

// Mobile redesign applied — desktop layout unchanged

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
  { id: 'demo-flower',    name: 'White Rose Tribute',       price: 350, image: '/tribute-rose.png',      rating: 4.9, vendor: 'Addis Flowers',   city: 'Addis Ababa' },
  { id: 'demo-candle',    name: 'Memorial Candle Set',      price: 220, image: '/tribute-candle.png',    rating: 4.8, vendor: 'Sacred Light Co.', city: 'Addis Ababa' },
  { id: 'demo-heart',     name: 'Memorial Heart Pendant',   price: 580, image: '/tribute-heart.png',     rating: 4.9, vendor: 'Heritage Jewels',  city: 'Bahir Dar'   },
  { id: 'demo-bird',      name: 'Tribute Bird Ornament',    price: 410, image: '/tribute-bird.png',      rating: 4.7, vendor: 'Memory Frames',    city: 'Mekelle'     },
  { id: 'demo-butterfly', name: 'Butterfly Remembrance',    price: 320, image: '/tribute-butterfly.png', rating: 4.6, vendor: 'Soulful Crafts',   city: 'Gondar'      },
  { id: 'demo-tree',      name: 'Memorial Tree Sapling',    price: 750, image: '/tribute-tree.png',      rating: 5.0, vendor: 'Living Tribute',   city: 'Dire Dawa'   },
  { id: 'demo-crown',     name: 'Floral Crown Wreath',      price: 920, image: '/tribute-crown.png',     rating: 4.9, vendor: 'Rose Garden',      city: 'Addis Ababa' },
  { id: 'demo-star',      name: 'Star Memorial Frame',      price: 480, image: '/tribute-star.png',      rating: 4.8, vendor: 'Memory Frames',    city: 'Adama'       },
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

        {/* ══════════════════════════════════════
            DESKTOP header — completely unchanged
        ══════════════════════════════════════ */}
        <div className="hidden md:block text-center mb-12">
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

        {/* ══════════════════════════════════════
            MOBILE header
        ══════════════════════════════════════ */}
        <div className="md:hidden text-center mb-5 px-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-[9px] uppercase tracking-[0.2em] font-semibold mb-2">
            <ShoppingBag className="w-3 h-3" />
            Memorial Marketplace
          </div>
          <h2 className="text-[19px] font-bold text-white font-display leading-tight mb-2">
            Thoughtful Tributes<br />& Keepsakes
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-6 bg-[#D4AF37]/40" />
            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
            <div className="h-px w-6 bg-[#D4AF37]/40" />
          </div>
          <p className="text-[10.5px] text-white/50 max-w-[260px] mx-auto leading-snug">
            Flowers, candles, frames & remembrance gifts from trusted local vendors.
          </p>
        </div>

        {/* ══════════════════════════════════════
            LOADING skeletons
        ══════════════════════════════════════ */}
        {isLoading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:flex gap-4 justify-center">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-52 h-64 bg-primary-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden flex gap-2.5 overflow-hidden px-1">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex-shrink-0 w-[42vw] h-52 bg-primary-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </>
        ) : (
          <div className="relative">

            {/* ══════════════════════════════════════
                DESKTOP marquee — completely unchanged
            ══════════════════════════════════════ */}
            <div className="hidden md:block">
              <div className="overflow-hidden marquee-mask-mp">
                <div className="flex gap-5 home-mp-track">
                  {marquee.map((p, idx) => (
                    <Link
                      key={`${p.id}-${idx}`}
                      href="/marketplace"
                      className="flex-shrink-0 w-44 sm:w-52 md:w-56 min-w-[11rem] sm:min-w-[12.5rem] md:min-w-[13.5rem] memorial-card overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-500/30 hover:border-accent-400/60 transition-all duration-500 group"
                    >
                      <div className="relative h-44 bg-gradient-to-br from-primary-800 to-primary-900 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.src = '/scarf.jpg' }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-primary-900/80 backdrop-blur border border-accent-400/30 rounded-full text-[10px] uppercase tracking-wider text-accent-300 font-semibold flex items-center gap-1">
                          <Flower className="w-3 h-3 text-rose-400" />
                          Tribute
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold text-base">
                        
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white font-semibold">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            {p.rating}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-accent-100 line-clamp-2 leading-tight mb-1">{p.name}</h3>
                        <p className="text-xs text-accent-400 truncate">{p.vendor} · {p.city}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════
                MOBILE marquee — premium compact cards
            ══════════════════════════════════════ */}
            <div className="md:hidden overflow-hidden mobile-marquee-mask">
              <div className="flex gap-2.5 mobile-mp-track">
                {marquee.map((p, idx) => (
                  <Link
                    key={`mob-${p.id}-${idx}`}
                    href="/marketplace"
                    className="flex-shrink-0 w-[42vw] max-w-[168px] rounded-2xl overflow-hidden border-t-2 border-[#D4AF37]/25"
                    style={{
                      background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    }}
                  >
                    {/* Image area */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/scarf.jpg' }}
                      />
                      {/* dark-to-top overlay */}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }}
                      />
                      {/* Price — bottom left over image */}
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-[#D4AF37]/20 flex items-baseline gap-0.5">
                        <span className="text-[10px] font-black text-white leading-none">{p.price}</span>
                        <span className="text-[7.5px] text-[#D4AF37] font-bold">ETB</span>
                      </div>
                      {/* Rating — top right over image */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/55 backdrop-blur-sm">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-current flex-shrink-0" />
                        <span className="text-[9px] font-bold text-white leading-none">{p.rating}</span>
                      </div>
                      {/* Tribute pill — top left */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/55 backdrop-blur-sm border border-rose-400/20">
                        <Flower className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Text info */}
                    <div className="p-2.5 pb-3">
                      <h3 className="text-[11px] font-bold text-white line-clamp-1 leading-tight mb-0.5">
                        {p.name}
                      </h3>
                      <p className="text-[9px] text-white/40 truncate">{p.vendor} · {p.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <style jsx>{`
              /* ── Desktop ── */
              .home-mp-track {
                width: max-content;
                animation: homeMpMarquee 60s linear infinite;
              }
              .home-mp-track:hover { animation-play-state: paused; }
              .marquee-mask-mp {
                mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
              }
              /* ── Mobile ── */
              .mobile-mp-track {
                width: max-content;
                animation: homeMpMarquee 26s linear infinite;
              }
              .mobile-mp-track:hover { animation-play-state: paused; }
              .mobile-marquee-mask {
                mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
                -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
              }
              @keyframes homeMpMarquee {
                from { transform: translateX(0); }
                to   { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        )}

        {/* ══════════════════════════════════════
            CTA — desktop unchanged / mobile full-width gold pill
        ══════════════════════════════════════ */}
        <div className="mt-8 md:mt-10 text-center">

          {/* Desktop CTA — unchanged */}
          <Link
            href="/marketplace"
            className="hidden md:inline-flex items-center px-7 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent-500/30 hover:scale-105"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          {/* Mobile CTA */}
          <Link
            href="/marketplace"
            className="md:hidden flex items-center justify-center gap-2 mx-0 py-3.5 rounded-2xl border border-[#D4AF37]/25 text-[11px] font-black uppercase tracking-widest text-[#D4AF37] transition-colors active:opacity-80"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.03) 100%)' }}
          >
            Explore Marketplace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>
      </div>
    </section>
  )
}