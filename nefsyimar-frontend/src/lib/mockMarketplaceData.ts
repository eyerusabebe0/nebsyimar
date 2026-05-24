export interface MarketplaceItem {
  id: number
  name: string
  price: number
  originalPrice: number | null
  image: string
  rating: number
  reviews: number
  description: string
  inStock: boolean
  vendor: string
  deliveryTime: string
  deliveryFee: number
  category: string
  shopLocation: string
}

export interface MarketplaceShop {
  id: number
  name: string
  location: string
  deliveryTime: string
  deliveryFee: number
  items: MarketplaceItem[]
}

const rawShops: Array<Omit<MarketplaceShop, 'items'> & {
  items: Array<Omit<MarketplaceItem, 'vendor' | 'deliveryTime' | 'deliveryFee' | 'shopLocation'>>
}> = [
  {
    id: 1,
    name: 'Addis Flowers & Wreaths',
    location: 'Bole, Addis Ababa',
    deliveryTime: '30-45 min',
    deliveryFee: 25,
    items: [
      {
        id: 101,
        name: 'White Lily Funeral Wreath',
        price: 450,
        originalPrice: 500,
        rating: 4.8,
        reviews: 24,
        image: '/white.jpg',
        inStock: true,
        description: 'Beautiful white lily wreath for funeral services',
        category: 'flowers'
      },
      {
        id: 102,
        name: 'Fresh Rose Bouquet',
        price: 180,
        originalPrice: 200,
        rating: 4.9,
        reviews: 45,
        image: '/9.jpg',
        inStock: true,
        description: 'Fresh red and white roses arrangement',
        category: 'flowers'
      },
      {
        id: 103,
        name: 'Sympathy Flower Arrangement',
        price: 320,
        originalPrice: null,
        rating: 4.7,
        reviews: 18,
        image: '/image.png',
        inStock: true,
        description: 'Mixed flower arrangement for condolences',
        category: 'flowers'
      }
    ]
  },
  {
    id: 2,
    name: 'Heritage Traditional Textiles',
    location: 'Piassa, Addis Ababa',
    deliveryTime: '45-60 min',
    deliveryFee: 30,
    items: [
      {
        id: 201,
        name: 'Traditional Black Netela',
        price: 280,
        originalPrice: null,
        rating: 4.9,
        reviews: 18,
        image: '/scarf.jpg',
        inStock: true,
        description: 'High-quality traditional black netela',
        category: 'attire'
      },
      {
        id: 202,
        name: 'White Cotton Gabi',
        price: 350,
        originalPrice: 400,
        rating: 4.8,
        reviews: 12,
        image: '/api/placeholder/300/300',
        inStock: true,
        description: 'Traditional white cotton gabi for ceremonies',
        category: 'attire'
      },
      {
        id: 203,
        name: 'Black Mourning Dress',
        price: 450,
        originalPrice: null,
        rating: 4.6,
        reviews: 8,
        image: '/api/placeholder/300/300',
        inStock: false,
        description: 'Traditional black dress for mourning',
        category: 'attire'
      }
    ]
  },
  {
    id: 3,
    name: 'Sacred Light Candles & Incense',
    location: 'Merkato, Addis Ababa',
    deliveryTime: '20-30 min',
    deliveryFee: 15,
    items: [
      {
        id: 301,
        name: 'Memorial Candle Set (12 pieces)',
        price: 120,
        originalPrice: 150,
        rating: 4.7,
        reviews: 31,
        image: '/api/placeholder/300/300',
        inStock: true,
        description: 'Set of 12 white memorial candles',
        category: 'candles'
      },
      {
        id: 302,
        name: 'Frankincense Incense Sticks',
        price: 45,
        originalPrice: null,
        rating: 4.5,
        reviews: 28,
        image: '/api/placeholder/300/300',
        inStock: true,
        description: 'Premium frankincense incense sticks',
        category: 'candles'
      },
      {
        id: 303,
        name: 'Prayer Candles (Set of 6)',
        price: 80,
        originalPrice: 95,
        rating: 4.8,
        reviews: 22,
        image: '/api/placeholder/300/300',
        inStock: true,
        description: 'Long-lasting prayer candles',
        category: 'candles'
      }
    ]
  }
]

export const marketplaceShops: MarketplaceShop[] = rawShops.map((shop) => ({
  ...shop,
  items: shop.items.map((item) => ({
    ...item,
    vendor: shop.name,
    deliveryTime: shop.deliveryTime,
    deliveryFee: shop.deliveryFee,
    shopLocation: shop.location
  }))
}))

export const marketplaceItems: MarketplaceItem[] = marketplaceShops.flatMap((shop) => shop.items)

export const findMarketplaceItem = (id: number) => {
  return marketplaceItems.find((item) => item.id === id) || null
}

