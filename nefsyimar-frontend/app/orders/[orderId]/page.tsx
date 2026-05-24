'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ordersApi } from '@/lib/api'
import {
  ShoppingCart,
  ArrowLeft,
  MapPin,
  Phone,
  Truck,
  Clock,
  User,
  Package,
  Hash,
  CheckCircle,
} from 'lucide-react'

interface OrderItemDetail {
  order_item_id?: string
  product_name: string
  unit_price: number
  quantity: number
  total_price: number
  product?: {
    product_id: string
    name: string
    main_image?: string
  }
  customization_details?: any
  special_instructions?: string | null
}

interface VendorInfo {
  vendor_id: string
  business_name: string
  phone?: string
  business_address?: any
}

interface DeliveryPersonInfo {
  name?: string
  phone?: string
  vehicle_type?: string
  notes?: string
}

interface StatusHistoryEntry {
  status: string
  timestamp: string
  note?: string
}

interface OrderDetail {
  order_id: string
  order_number: string
  status: string
  subtotal: number
  delivery_fee: number
  platform_fee: number
  total_amount: number
  vendor_amount: number
  created_at: string
  estimated_delivery?: string | null
  actual_delivery?: string | null
  tracking_number?: string | null
  delivery_person?: DeliveryPersonInfo | null
  delivery_address: any
  delivery_instructions?: string | null
  delivery_date?: string | null
  delivery_time_slot?: string | null
  customer_notes?: string | null
  vendor_notes?: string | null
  status_history?: StatusHistoryEntry[]
  vendor?: VendorInfo
  items: OrderItemDetail[]
}

const STATUS_FLOW: string[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

const prettyStatus = (status: string) =>
  status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

const formatDateTime = (value?: string | null) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString()
}

const getSafeOrderIdFromParams = (raw: string | string[] | undefined): string | null => {
  if (!raw) return null
  if (Array.isArray(raw)) return raw[0] || null
  return raw
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const rawId: any = (params as any)?.orderId
    const orderId = getSafeOrderIdFromParams(rawId)

    if (!orderId) {
      setIsLoading(false)
      setError('Invalid order ID')
      return
    }

    const loadOrder = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await ordersApi.getOrder(orderId)
        const data = res.data?.data?.order

        if (!data) {
          setError('Order not found')
          setOrder(null)
          return
        }

        const mapped: OrderDetail = {
          order_id: data.order_id,
          order_number: data.order_number,
          status: data.status,
          subtotal: Number(data.subtotal ?? 0),
          delivery_fee: Number(data.delivery_fee ?? 0),
          platform_fee: Number(data.platform_fee ?? 0),
          total_amount: Number(data.total_amount ?? 0),
          vendor_amount: Number(data.vendor_amount ?? 0),
          created_at: data.created_at,
          estimated_delivery: data.estimated_delivery,
          actual_delivery: data.actual_delivery,
          tracking_number: data.tracking_number,
          delivery_person: data.delivery_person,
          delivery_address: data.delivery_address,
          delivery_instructions: data.delivery_instructions,
          delivery_date: data.delivery_date,
          delivery_time_slot: data.delivery_time_slot,
          customer_notes: data.customer_notes,
          vendor_notes: data.vendor_notes,
          status_history: Array.isArray(data.status_history) ? data.status_history : [],
          vendor: data.vendor
            ? {
                vendor_id: data.vendor.vendor_id,
                business_name: data.vendor.business_name,
                phone: data.vendor.phone,
                business_address: data.vendor.business_address,
              }
            : undefined,
          items: Array.isArray(data.items)
            ? data.items.map((it: any) => ({
                order_item_id: it.order_item_id,
                product_name: it.product?.name || it.product_name || 'Item',
                unit_price: Number(it.unit_price ?? 0),
                quantity: it.quantity ?? 1,
                total_price: Number(it.total_price ?? (Number(it.unit_price ?? 0) * (it.quantity ?? 1))),
                product: it.product
                  ? {
                      product_id: it.product.product_id,
                      name: it.product.name,
                      main_image: it.product.main_image,
                    }
                  : undefined,
                customization_details: it.customization_details,
                special_instructions: it.special_instructions,
              }))
            : [],
        }

        setOrder(mapped)
      } catch (err: any) {
        console.error('Failed to load order', err)
        const message = err?.response?.data?.message || 'Failed to load order details'
        setError(message)
        if (err?.response?.status === 404) {
          toast.error('Order not found')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [params])

  const renderDeliveryAddress = (address: any) => {
    if (!address) return 'Not provided'

    if (typeof address === 'string') return address

    const parts: string[] = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.subcity) parts.push(address.subcity)
    if (address.district) parts.push(address.district)
    if (address.house_number) parts.push(address.house_number)

    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  const renderDeliveryPerson = (deliveryPerson: any) => {
    if (!deliveryPerson) return null

    const dp: DeliveryPersonInfo = deliveryPerson

    const hasName = !!dp.name
    const hasPhone = !!dp.phone
    const hasVehicle = !!dp.vehicle_type
    const hasNotes = !!dp.notes

    if (!hasName && !hasPhone && !hasVehicle && !hasNotes) return null

    return (
      <div className="space-y-1 text-sm text-accent-200">
        {hasName && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-accent-400" />
            <span>{dp.name}</span>
          </div>
        )}
        {hasPhone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-accent-400" />
            <a href={`tel:${dp.phone}`} className="hover:text-white">
              {dp.phone}
            </a>
          </div>
        )}
        {hasVehicle && (
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-accent-400" />
            <span>{dp.vehicle_type}</span>
          </div>
        )}
        {hasNotes && <div className="text-xs text-accent-300">{dp.notes}</div>}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 flex items-center justify-center">
        <div className="text-center text-accent-300 text-sm">Loading order details...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-accent-800 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <ShoppingCart className="w-8 h-8 text-accent-400" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">Order details unavailable</h1>
          <p className="text-sm text-accent-300 mb-4">{error || 'We could not load this order.'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="w-full py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm rounded-lg"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    )
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center space-x-2 text-accent-300 hover:text-white text-xs mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold text-white">Order #{order.order_number}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-500/20 text-green-300'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-500/20 text-red-300'
                    : order.status === 'REFUNDED'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-accent-700 text-accent-100'
                }`}
              >
                {prettyStatus(order.status)}
              </span>
            </div>
            <div className="text-xs text-accent-300 flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Placed on {new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-accent-300 mb-1 flex items-center justify-end space-x-1">
              <Hash className="w-3 h-3" />
              <span>{order.order_id.slice(0, 8)}...</span>
            </div>
            <div className="text-xs text-accent-400">Total amount</div>
            <div className="text-xl font-semibold text-white">{order.total_amount} ETB</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-effect rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-accent-400" />
                  <h2 className="text-sm font-semibold text-white">Order progress</h2>
                </div>
                {order.tracking_number && (
                  <div className="flex items-center space-x-2 text-[11px] text-accent-300">
                    <Hash className="w-3 h-3" />
                    <span>Tracking: {order.tracking_number}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between space-x-2">
                {STATUS_FLOW.map((status, index) => {
                  const reachedInHistory = (order.status_history || []).some(
                    (entry) => entry.status === status,
                  )
                  const isReached =
                    currentStatusIndex >= 0
                      ? !isCancelled && (index <= currentStatusIndex || reachedInHistory)
                      : reachedInHistory

                  return (
                    <div key={status} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 ${
                          isReached
                            ? 'bg-accent-500 border-accent-400 text-white'
                            : 'bg-accent-900 border-accent-700 text-accent-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="mt-1 text-[10px] text-center text-accent-200 max-w-[72px]">
                        {prettyStatus(status)}
                      </div>
                      {index < STATUS_FLOW.length - 1 && (
                        <div className="hidden lg:block w-full h-px bg-gradient-to-r from-accent-700 via-accent-600 to-accent-700 mt-3" />
                      )}
                    </div>
                  )
                })}
              </div>

              {isCancelled && (
                <div className="mt-3 text-[11px] text-red-300">
                  This order was {order.status === 'REFUNDED' ? 'refunded' : 'cancelled'}.
                </div>
              )}

              {(order.status_history || []).length > 0 && (
                <div className="mt-4 border-t border-accent-700 pt-3">
                  <h3 className="text-xs font-semibold text-accent-200 mb-2">Status history</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px] text-accent-200">
                    {order.status_history
                      ?.slice()
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((entry, idx) => (
                        <div key={`${entry.status}-${entry.timestamp}-${idx}`} className="flex items-start space-x-2">
                          <div className="mt-0.5 w-1 h-1 rounded-full bg-accent-400" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-accent-100">
                                {prettyStatus(entry.status)}
                              </span>
                              {formatDateTime(entry.timestamp) && (
                                <span className="text-[10px] text-accent-400">
                                  {formatDateTime(entry.timestamp)}
                                </span>
                              )}
                            </div>
                            {entry.note && (
                              <div className="text-[10px] text-accent-300">{entry.note}</div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-effect rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-accent-400" />
                  <h2 className="text-sm font-semibold text-white">Items in this order</h2>
                </div>
                <div className="text-xs text-accent-300">{order.items.length} items</div>
              </div>

              {order.items.length === 0 && (
                <div className="text-xs text-accent-400">No items found for this order.</div>
              )}

              {order.items.length > 0 && (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.order_item_id || item.product?.product_id || item.product_name}
                      className="flex items-start justify-between text-sm text-accent-100"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        {item.product?.main_image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent-900 flex-shrink-0">
                            <img
                              src={item.product.main_image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-semibold text-white line-clamp-2">
                            {item.product_name}
                          </div>
                          <div className="text-[11px] text-accent-300">
                            Qty {item.quantity} × {item.unit_price} ETB
                          </div>
                          {item.special_instructions && (
                            <div className="text-[11px] text-accent-400 line-clamp-2">
                              Special instructions: {item.special_instructions}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-accent-100 ml-2 flex-shrink-0">
                        <div className="font-semibold text-white">{item.total_price} ETB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-effect rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Delivery details</h2>

              <div className="space-y-2 text-xs text-accent-200">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3 h-3 text-accent-400 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-accent-400 mb-0.5">Delivery address</div>
                    <div>{renderDeliveryAddress(order.delivery_address)}</div>
                  </div>
                </div>

                {order.delivery_instructions && (
                  <div className="flex items-start space-x-2">
                    <Clock className="w-3 h-3 text-accent-400 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-accent-400 mb-0.5">Instructions</div>
                      <div>{order.delivery_instructions}</div>
                    </div>
                  </div>
                )}

                {(order.delivery_date || order.delivery_time_slot) && (
                  <div className="flex items-start space-x-2">
                    <Clock className="w-3 h-3 text-accent-400 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-accent-400 mb-0.5">Scheduled delivery</div>
                      <div>
                        {order.delivery_date && formatDateTime(order.delivery_date)}
                        {order.delivery_time_slot ? ` • ${order.delivery_time_slot}` : ''}
                      </div>
                    </div>
                  </div>
                )}

                {order.estimated_delivery && (
                  <div className="flex items-start space-x-2">
                    <Truck className="w-3 h-3 text-accent-400 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-accent-400 mb-0.5">Estimated delivery</div>
                      <div>{formatDateTime(order.estimated_delivery)}</div>
                    </div>
                  </div>
                )}

                {order.actual_delivery && (
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-accent-400 mb-0.5">Delivered on</div>
                      <div>{formatDateTime(order.actual_delivery)}</div>
                    </div>
                  </div>
                )}

                {renderDeliveryPerson(order.delivery_person)}

                {order.customer_notes && (
                  <div className="pt-1 border-t border-accent-700 mt-2">
                    <div className="text-[11px] text-accent-400 mb-0.5">Customer notes</div>
                    <div className="text-xs text-accent-200 whitespace-pre-line">{order.customer_notes}</div>
                  </div>
                )}
              </div>
            </div>

            {order.vendor && (
              <div className="glass-effect rounded-xl p-4">
                <h2 className="text-sm font-semibold text-white mb-3">Vendor contact</h2>
                <div className="space-y-2 text-xs text-accent-200">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3 text-accent-400" />
                    <span className="font-medium text-accent-100">{order.vendor.business_name}</span>
                  </div>
                  {order.vendor.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-accent-400" />
                      <a href={`tel:${order.vendor.phone}`} className="hover:text-white">
                        {order.vendor.phone}
                      </a>
                    </div>
                  )}
                  {order.vendor.business_address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 text-accent-400 mt-0.5" />
                      <div className="text-xs text-accent-200 break-words">
                        {typeof order.vendor.business_address === 'string'
                          ? order.vendor.business_address
                          : JSON.stringify(order.vendor.business_address)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="glass-effect rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Payment summary</h2>
              <div className="space-y-2 text-xs text-accent-200">
                <div className="flex items-center justify-between">
                  <span>Items subtotal</span>
                  <span>{order.subtotal} ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery fee</span>
                  <span>{order.delivery_fee} ETB</span>
                </div>
                {order.platform_fee > 0 && (
                  <div className="flex items-center justify-between text-accent-300">
                    <span>Platform fee</span>
                    <span>{order.platform_fee} ETB</span>
                  </div>
                )}
                <div className="border-t border-accent-700 pt-2 mt-1 flex items-center justify-between text-sm">
                  <span className="text-accent-100 font-semibold">Total paid</span>
                  <span className="text-white font-bold">{order.total_amount} ETB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
