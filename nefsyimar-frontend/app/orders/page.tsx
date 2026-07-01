'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ordersApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { getSocket } from '@/lib/socket'

interface OrderItemSummary {
  id: string
  name: string
  quantity: number
  unitPrice: number
  image?: string
}

interface UserOrder {
  order_id: string
  order_number?: string
  status: string
  total_amount: number
  created_at: string
  vendor?: {
    vendor_id: string
    business_name: string
    phone?: string
  }
  items: OrderItemSummary[]
  rating?: number
  review?: string
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewText, setReviewText] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await ordersApi.getMyOrders(page, 10, statusFilter || undefined)
        const data = res.data?.data
        const rawOrders = data?.orders || []

        const mapped: UserOrder[] = rawOrders.map((o: any) => ({
          order_id: o.order_id,
          order_number: o.order_number,
          status: o.status,
          total_amount: Number(o.total_amount ?? 0),
          created_at: o.created_at,
          vendor: o.vendor
            ? {
                vendor_id: o.vendor.vendor_id,
                business_name: o.vendor.business_name,
                phone: o.vendor.phone,
              }
            : undefined,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.order_item_id || `${it.product?.product_id || ''}-${it.product_name || ''}`,
                name: it.product?.name || it.product_name || 'Item',
                quantity: it.quantity ?? 1,
                unitPrice: Number(it.unit_price ?? it.price ?? 0),
                image: it.product?.main_image,
              }))
            : [],
          rating: o.rating != null ? Number(o.rating) : undefined,
          review: o.review || undefined,
        }))

        setOrders(mapped)

        if (data?.pagination) {
          setPage(data.pagination.current_page)
          setTotalPages(data.pagination.total_pages)
        } else {
          setPage(1)
          setTotalPages(1)
        }
      } catch (err) {
        console.error('Failed to load orders', err)
        setError('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [user, page, statusFilter])

  useEffect(() => {
    if (!user) return

    const socket = getSocket()
    if (!socket) return

    const handleOrdersUpdated = async () => {
      try {
        const res = await ordersApi.getMyOrders(page, 10, statusFilter || undefined)
        const data = res.data?.data
        const rawOrders = data?.orders || []

        const mapped: UserOrder[] = rawOrders.map((o: any) => ({
          order_id: o.order_id,
          order_number: o.order_number,
          status: o.status,
          total_amount: Number(o.total_amount ?? 0),
          created_at: o.created_at,
          vendor: o.vendor
            ? {
                vendor_id: o.vendor.vendor_id,
                business_name: o.vendor.business_name,
                phone: o.vendor.phone,
              }
            : undefined,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.order_item_id || `${it.product?.product_id || ''}-${it.product_name || ''}`,
                name: it.product?.name || it.product_name || 'Item',
                quantity: it.quantity ?? 1,
                unitPrice: Number(it.unit_price ?? it.price ?? 0),
                image: it.product?.main_image,
              }))
            : [],
          rating: o.rating != null ? Number(o.rating) : undefined,
          review: o.review || undefined,
        }))

        setOrders(mapped)

        if (data?.pagination) {
          setTotalPages(data.pagination.total_pages)
        }

        toast.success('Your orders have been updated')
      } catch (err) {
        console.log('WebSocket orders refresh failed', err)
      }
    }

    socket.emit('orders:subscribe', { role: 'buyer' })
    socket.on('orders:updated', handleOrdersUpdated)

    return () => {
      socket.off('orders:updated', handleOrdersUpdated)
    }
  }, [user, page, statusFilter])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      try {
        const res = await ordersApi.getMyOrders(page, 10, statusFilter || undefined)
        const data = res.data?.data
        const rawOrders = data?.orders || []

        const mapped: UserOrder[] = rawOrders.map((o: any) => ({
          order_id: o.order_id,
          order_number: o.order_number,
          status: o.status,
          total_amount: Number(o.total_amount ?? 0),
          created_at: o.created_at,
          vendor: o.vendor
            ? {
                vendor_id: o.vendor.vendor_id,
                business_name: o.vendor.business_name,
                phone: o.vendor.phone,
              }
            : undefined,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.order_item_id || `${it.product?.product_id || ''}-${it.product_name || ''}`,
                name: it.product?.name || it.product_name || 'Item',
                quantity: it.quantity ?? 1,
                unitPrice: Number(it.unit_price ?? it.price ?? 0),
                image: it.product?.main_image,
              }))
            : [],
          rating: o.rating != null ? Number(o.rating) : undefined,
          review: o.review || undefined,
        }))

        setOrders(mapped)

        if (data?.pagination) {
          setTotalPages(data.pagination.total_pages)
        }
      } catch {
        // Ignore background polling errors
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [user, page, statusFilter])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access denied</h1>
          <p className="text-accent-300">Please sign in to view your orders.</p>
        </div>
      </div>
    )
  }

  const handleCancelOrder = async (order: UserOrder) => {
    if (!['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)) {
      toast.error('This order can no longer be cancelled')
      return
    }

    const reason = window.prompt('Reason for cancellation (optional):') || undefined

    try {
      await ordersApi.cancelOrder(order.order_id, reason)
      toast.success('Order cancelled')
      // Refresh current page
      const res = await ordersApi.getMyOrders(page, 10, statusFilter || undefined)
      const data = res.data?.data
      const rawOrders = data?.orders || []
      const mapped: UserOrder[] = rawOrders.map((o: any) => ({
        order_id: o.order_id,
        order_number: o.order_number,
        status: o.status,
        total_amount: Number(o.total_amount ?? 0),
        created_at: o.created_at,
        vendor: o.vendor
          ? {
              vendor_id: o.vendor.vendor_id,
              business_name: o.vendor.business_name,
              phone: o.vendor.phone,
            }
          : undefined,
        items: Array.isArray(o.items)
          ? o.items.map((it: any) => ({
              id: it.order_item_id || `${it.product?.product_id || ''}-${it.product_name || ''}`,
              name: it.product?.name || it.product_name || 'Item',
              quantity: it.quantity ?? 1,
              unitPrice: Number(it.unit_price ?? it.price ?? 0),
              image: it.product?.main_image,
            }))
          : [],
        rating: o.rating != null ? Number(o.rating) : undefined,
        review: o.review || undefined,
      }))
      setOrders(mapped)
    } catch (err: any) {
      console.error('Failed to cancel order', err)
      const message = err?.response?.data?.message || 'Failed to cancel order'
      toast.error(message)
    }
  }

  const prettyStatus = (status: string) =>
    status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

  const handleSubmitReview = async (orderId: string) => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating between 1 and 5')
      return
    }

    try {
      setIsSubmittingReview(true)
      await ordersApi.addReview(orderId, reviewRating, reviewText || undefined)
      toast.success('Review submitted')

      const res = await ordersApi.getMyOrders(page, 10, statusFilter || undefined)
      const data = res.data?.data
      const rawOrders = data?.orders || []
      const mapped: UserOrder[] = rawOrders.map((o: any) => ({
        order_id: o.order_id,
        order_number: o.order_number,
        status: o.status,
        total_amount: Number(o.total_amount ?? 0),
        created_at: o.created_at,
        vendor: o.vendor
          ? {
              vendor_id: o.vendor.vendor_id,
              business_name: o.vendor.business_name,
              phone: o.vendor.phone,
            }
          : undefined,
        items: Array.isArray(o.items)
          ? o.items.map((it: any) => ({
              id: it.order_item_id || `${it.product?.product_id || ''}-${it.product_name || ''}`,
              name: it.product?.name || it.product_name || 'Item',
              quantity: it.quantity ?? 1,
              unitPrice: Number(it.unit_price ?? it.price ?? 0),
              image: it.product?.main_image,
            }))
          : [],
        rating: o.rating != null ? Number(o.rating) : undefined,
        review: o.review || undefined,
      }))
      setOrders(mapped)
      setReviewingOrderId(null)
      setReviewText('')
    } catch (err: any) {
      console.error('Failed to submit review', err)
      const message = err?.response?.data?.message || 'Failed to submit review'
      toast.error(message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Orders</h1>
            <p className="text-accent-300 text-sm">Track your marketplace purchases and delivery status</p>
          </div>
          <ShoppingCart className="w-8 h-8 text-accent-400" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-accent-300">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-1 rounded-lg bg-accent-800 border border-accent-600 text-accent-100 text-xs"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'ALL'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <p className="text-accent-300 text-sm">Loading orders...</p>}
        {!isLoading && error && <p className="text-red-300 text-sm">{error}</p>}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-12 text-accent-400">
            <p>You have not placed any orders yet.</p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                onClick={() => router.push(`/orders/${order.order_id}`)}
                className="glass-effect rounded-xl p-4 flex flex-col space-y-3 cursor-pointer hover:bg-accent-800/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-semibold text-sm">
                        Order #{order.order_number || order.order_id.slice(-8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-500/20 text-green-300'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-accent-700 text-accent-100'
                        }`}
                      >
                        {prettyStatus(order.status)}
                      </span>
                    </div>
                    <div className="text-xs text-accent-400">
                      Placed on {new Date(order.created_at).toLocaleString()}
                    </div>
                    {order.vendor && (
                      <div className="text-xs text-accent-300 mt-1">
                        From {order.vendor.business_name}
                        {order.vendor.phone ? ` • ${order.vendor.phone}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{order.total_amount} ETB</div>
                  </div>
                </div>

                {order.items.length > 0 && (
                  <div className="border-t border-accent-700 pt-2 mt-1 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-accent-200">
                        <div className="flex items-center space-x-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover bg-accent-800"
                            />
                          )}
                          <span className="line-clamp-1">{item.name}</span>
                        </div>
                        <div className="text-right text-accent-300">
                          <span className="mr-2">x{item.quantity}</span>
                          <span>{item.unitPrice * item.quantity} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-accent-400 pt-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Wallet payment</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Truck className="w-3 h-3" />
                    <span>Delivery in progress</span>
                  </div>

                  {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelOrder(order)
                      }}
                      className="flex items-center space-x-1 text-red-300 hover:text-red-200"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>Cancel order</span>
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-green-300">
                        <CheckCircle className="w-3 h-3" />
                        <span>Delivered</span>
                      </div>
                      {order.rating ? (
                        <span className="text-[10px] text-accent-300">
                          Rated {order.rating}/5
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setReviewingOrderId(order.order_id)
                            setReviewRating(5)
                            setReviewText('')
                          }}
                          className="text-[10px] text-accent-200 hover:text-white underline"
                        >
                          Leave a review
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {reviewingOrderId === order.order_id && (
                  <div className="mt-2 border-t border-accent-700 pt-2">
                    <div className="flex items-center space-x-2 mb-2 text-[11px] text-accent-200">
                      <span>Rating:</span>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value, 10) || 5)}
                        className="px-2 py-1 rounded bg-accent-800 border border-accent-600 text-xs text-accent-100"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 bg-accent-800 border border-accent-600 rounded text-[11px] text-accent-100"
                      placeholder="Share feedback about this order (optional)"
                    />
                    <div className="flex items-center justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setReviewingOrderId(null)}
                        className="px-3 py-1 text-[11px] rounded border border-accent-600 text-accent-300 hover:text-white hover:bg-accent-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReview}
                        onClick={() => handleSubmitReview(order.order_id)}
                        className={`px-3 py-1 text-[11px] rounded bg-accent-500 text-white hover:bg-accent-600 ${
                          isSubmittingReview ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-accent-300 mt-4">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className={`px-3 py-1 rounded bg-accent-800 hover:bg-accent-700 ${
                  page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className={`px-3 py-1 rounded bg-accent-800 hover:bg-accent-700 ${
                  page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
