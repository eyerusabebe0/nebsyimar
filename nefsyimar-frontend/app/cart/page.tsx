'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import PhoneInput from '@/components/PhoneInput'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, vendor, subtotal, deliveryFee, total, totalItems, updateQuantity, removeItem, clearCart } = useCart()

  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [hasSavedAddress, setHasSavedAddress] = useState(false)
  const [savedAddress, setSavedAddress] = useState('')
  const [savedPhone, setSavedPhone] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return

    const storedAddress = window.localStorage.getItem('nefsyimar_last_delivery_address') || ''
    const storedPhone = window.localStorage.getItem('nefsyimar_last_delivery_phone') || ''

    if (storedAddress) {
      setSavedAddress(storedAddress)
      setHasSavedAddress(true)
      if (!deliveryAddress) {
        setDeliveryAddress(storedAddress)
      }
    }

    if (storedPhone) {
      setSavedPhone(storedPhone)
      if (!phoneNumber) {
        setPhoneNumber(storedPhone)
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-accent-900 flex items-center justify-center px-4">
        <div className="bg-accent-800 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Sign in to continue</h1>
          <p className="text-accent-300 text-sm mb-6">
            You need to sign in to place marketplace orders.
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg text-sm"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    setAddressError(null)
    setPhoneError(null)

    if (!vendor || items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      const msg = 'Please provide a more detailed delivery address'
      setAddressError(msg)
      toast.error(msg)
      return
    }

    if (!phoneNumber) {
      const msg = 'Phone number is required'
      setPhoneError(msg)
      toast.error(msg)
      return
    }

    if (vendor.minimumOrder > 0 && subtotal < vendor.minimumOrder) {
      toast.error(`Minimum order amount is ${vendor.minimumOrder} ETB`)
      return
    }

    const payload = {
      vendor_id: vendor.vendorId,
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      delivery_address: {
        street: deliveryAddress,
        city: vendor.vendorCity || 'Addis Ababa',
      },
      delivery_instructions: specialInstructions || undefined,
      customer_notes: phoneNumber ? `Phone: ${phoneNumber}` : undefined,
    }

    try {
      setIsSubmitting(true)
      const res = await api.post('/orders', payload)
      const orderNumber = res.data?.data?.order?.order_number
      toast.success(
        orderNumber
          ? `Order ${orderNumber} placed successfully`
          : 'Order placed successfully'
      )

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('nefsyimar_last_delivery_address', deliveryAddress)
        window.localStorage.setItem('nefsyimar_last_delivery_phone', phoneNumber)
      }

      clearCart()
      router.push('/orders')
    } catch (err: any) {
      console.error('Failed to place order', err)
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 400 ? 'Failed to place order' : 'Unexpected error placing order')
      if (err?.response?.data?.errors?.length) {
        console.log('Validation errors', err.response.data.errors)
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBelowMinimum = !!vendor && vendor.minimumOrder > 0 && subtotal < vendor.minimumOrder
  const remainingForMinimum = isBelowMinimum && vendor ? Math.max(0, vendor.minimumOrder - subtotal) : 0

  if (!vendor || items.length === 0) {
    return (
      <div className="min-h-screen bg-accent-900 flex items-center justify-center px-4">
        <div className="bg-accent-800 rounded-xl p-8 max-w-md w-full text-center">
          <CartIcon className="w-10 h-10 text-accent-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-accent-300 text-sm mb-6">
            Browse the marketplace and add items from a vendor to create an order.
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg text-sm"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-accent-300 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Cart</h1>
            <p className="text-accent-300 text-sm">
              {totalItems} item{totalItems === 1 ? '' : 's'} from {vendor.vendorName}
            </p>
          </div>
          <CartIcon className="w-8 h-8 text-accent-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-accent-800 rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm text-accent-200">
                <div className="font-semibold">{vendor.vendorName}</div>
                <div className="text-xs text-accent-400">
                  {vendor.vendorCity || '—'} • Delivery fee {deliveryFee} ETB
                </div>
                {vendor.minimumOrder > 0 && (
                  <div className="text-xs mt-1">
                    <span className="text-accent-400">
                      Minimum order: {vendor.minimumOrder} ETB
                    </span>
                    {isBelowMinimum && (
                      <span className="ml-1 text-orange-300">
                        • Add {remainingForMinimum} ETB more to reach the minimum
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center space-x-1 text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear cart</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-accent-800 rounded-xl p-4 flex items-center space-x-4"
                >
                  <div className="w-16 h-16 bg-accent-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CartIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-accent-400 hover:text-red-300 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-accent-300">
                      <span>{item.price} ETB each</span>
                      <span>{item.price * item.quantity} ETB</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 bg-accent-700 text-white rounded hover:bg-accent-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 bg-accent-700 text-white rounded hover:bg-accent-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout form */}
          <div className="space-y-4">
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="bg-accent-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold text-sm">Delivery Address *</h2>
                  {hasSavedAddress && savedAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryAddress(savedAddress)
                        setAddressError(null)
                      }}
                      className="text-xs text-accent-300 hover:text-white"
                    >
                      Use last address
                    </button>
                  )}
                </div>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value)
                    if (addressError) setAddressError(null)
                  }}
                  placeholder="Enter your full delivery address..."
                  className={`w-full p-3 bg-accent-700 border rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${
                    addressError ? 'border-red-500' : 'border-accent-600'
                  }`}
                  rows={3}
                  required
                />
                {addressError && (
                  <p className="mt-1 text-xs text-red-300">{addressError}</p>
                )}
              </div>

              <div className="bg-accent-800 rounded-xl p-4">
                <PhoneInput
                  value={phoneNumber}
                  onChange={(value) => {
                    setPhoneNumber(value)
                    if (phoneError && value) setPhoneError(null)
                  }}
                  label="Phone Number"
                  placeholder="Enter your phone number..."
                  required={true}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-300">{phoneError}</p>
                )}
              </div>

              <div className="bg-accent-800 rounded-xl p-4">
                <h2 className="text-white font-semibold mb-3 text-sm">Special Instructions</h2>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special delivery instructions or notes..."
                  className="w-full p-3 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  rows={3}
                />
              </div>

              <div className="bg-accent-800 rounded-xl p-4">
                <h2 className="text-white font-semibold mb-3 text-sm">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-accent-300">
                    <span>Items ({totalItems})</span>
                    <span>{subtotal} ETB</span>
                  </div>
                  <div className="flex justify-between text-accent-300">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee} ETB</span>
                  </div>
                  <div className="border-t border-accent-600 pt-2 mt-1">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>{total} ETB</span>
                    </div>
                  </div>
                  {isBelowMinimum && (
                    <div className="mt-2 text-xs text-orange-300">
                      You need to add {remainingForMinimum} ETB more to place this order.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0 || isBelowMinimum}
                className={`w-full py-3 bg-orange-500 text-white font-semibold rounded-lg text-sm transition-colors ${
                  isSubmitting || items.length === 0 || isBelowMinimum
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-orange-600'
                }`}
              >
                {isSubmitting
                  ? 'Placing order...'
                  : isBelowMinimum
                  ? 'Add more items to reach minimum order'
                  : `Place Order - ${total} ETB`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
