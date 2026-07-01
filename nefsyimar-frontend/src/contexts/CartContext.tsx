'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface CartVendorInfo {
  vendorId: string
  vendorName: string
  vendorCity?: string
  deliveryFee: number
  minimumOrder: number
}

interface CartItem {
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
}

interface AddItemPayload {
  productId: string
  name: string
  price: number
  image?: string
  vendor: CartVendorInfo
  quantity?: number
}

interface CartContextType {
  items: CartItem[]
  vendor: CartVendorInfo | null
  subtotal: number
  deliveryFee: number
  total: number
  totalItems: number
  addItem: (item: AddItemPayload) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'nefsyimar_cart'

interface StoredCartState {
  items: CartItem[]
  vendor: CartVendorInfo | null
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [vendor, setVendor] = useState<CartVendorInfo | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const parsed: StoredCartState = JSON.parse(stored)
        setItems(Array.isArray(parsed.items) ? parsed.items : [])
        setVendor(parsed.vendor || null)
      }
    } catch (error) {
      console.error('Failed to load cart from storage', error)
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const payload: StoredCartState = { items, vendor }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      }
    } catch (error) {
      console.error('Failed to save cart to storage', error)
    }
  }, [items, vendor])

  const addItem = (payload: AddItemPayload) => {
    const { productId, name, price, image, vendor: itemVendor } = payload
    const quantityToAdd = payload.quantity && payload.quantity > 0 ? payload.quantity : 1

    if (!itemVendor.vendorId) {
      toast.error('This product cannot be added to cart')
      return
    }

    if (vendor && vendor.vendorId !== itemVendor.vendorId) {
      toast.error('You can only order from one vendor per order. Please complete or clear your existing cart first.')
      return
    }

    setVendor(prev => prev || itemVendor)

    setItems(prevItems => {
      const existing = prevItems.find(i => i.productId === productId)
      if (existing) {
        return prevItems.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantityToAdd }
            : i
        )
      }
      return [
        ...prevItems,
        {
          productId,
          name,
          price,
          image,
          quantity: quantityToAdd,
        },
      ]
    })

    toast.success('Added to cart')
  }

  const removeItem = (productId: string) => {
    setItems(prevItems => {
      const filtered = prevItems.filter(i => i.productId !== productId)
      if (filtered.length === 0) {
        setVendor(null)
      }
      return filtered
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prevItems =>
      prevItems.map(i =>
        i.productId === productId
          ? { ...i, quantity }
          : i
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setVendor(null)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = vendor?.deliveryFee ?? 0
  const total = subtotal + deliveryFee
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const value: CartContextType = {
    items,
    vendor,
    subtotal,
    deliveryFee,
    total,
    totalItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
