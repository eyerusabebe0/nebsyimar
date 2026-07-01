'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api, adminApi } from '@/lib/api'
import { getSocket } from '@/lib/socket'

interface AdminVendor {
  vendor_id: string
  business_name: string
  service_type: string
  city?: string
  rating?: number
  total_orders?: number
  total_revenue?: string
}

interface AdminProduct {
  product_id: string
  name: string
  category: string
  price: string
  is_active: boolean
  admin_status?: string
  vendor?: AdminVendor
  is_featured?: boolean
  metadata?: {
    recommended?: boolean
    moderation_status?: string
    [key: string]: any
  } | null
}

interface AdminOrderBuyer {
  user_id: string
  name: string
  email: string
  phone?: string
}

interface AdminOrderVendor {
  vendor_id: string
  business_name: string
  service_type: string
  city?: string
}

interface AdminOrder {
  order_id: string
  order_number: string
  status: string
  total_amount: string
  created_at: string
  buyer?: AdminOrderBuyer
  vendor?: AdminOrderVendor
}

interface AdminOrderPagination {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export default function AdminMarketplacePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [orderPagination, setOrderPagination] = useState<AdminOrderPagination | null>(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (page: number = 1, status?: string) => {
    try {
      setIsDataLoading(true)
      setError(null)

      const [vendorsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/vendors', { params: { page: 1, limit: 10 } }),
        adminApi.getProductsForModeration(1, 10, { queue: 'PENDING_REVIEW' }),
        adminApi.getOrders(page, 10, status),
      ])

      setVendors(vendorsRes.data?.data?.vendors || [])
      const productsData = productsRes.data?.data
      setProducts(productsData?.products || [])

      const orderData = ordersRes.data?.data
      setOrders(orderData?.orders || [])
      setOrderPagination(orderData?.pagination || null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load marketplace data')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) return

    const role = user?.role

    if (!user) {
      router.replace('/signin')
      return
    }

    if (role !== 'Administrator') {
      router.replace('/dashboard')
      return
    }

    loadData(1)
  }, [user, isLoading, router])

  useEffect(() => {
    if (isLoading || !user || user.role !== 'Administrator') return

    const socket = getSocket()
    if (!socket) return

    const handleOrdersUpdated = () => {
      const page = orderPagination?.current_page || 1
      const status = orderStatusFilter || undefined
      loadData(page, status)
    }

    socket.emit('orders:admin-subscribe')
    socket.on('orders:updated', handleOrdersUpdated)

    return () => {
      socket.off('orders:updated', handleOrdersUpdated)
    }
  }, [user, isLoading, orderPagination?.current_page, orderStatusFilter])

  const role = user?.role

  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const handleCancelOrder = async (orderId: string) => {
    const reason = window.prompt('Enter reason for cancelling this order:', 'Admin cancellation') || 'Admin cancellation'
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason })
      const status = orderStatusFilter || undefined
      await loadData(orderPagination?.current_page || 1, status)
    } catch (err) {
      alert('Failed to cancel order')
    }
  }

  const handleOrderStatusFilterChange = (value: string) => {
    setOrderStatusFilter(value)
    const status = value || undefined
    loadData(1, status)
  }

  const handleOrderPageChange = (page: number) => {
    if (!orderPagination) return
    if (page < 1 || page > orderPagination.total_pages) return
    const status = orderStatusFilter || undefined
    loadData(page, status)
  }

  const refreshProducts = async () => {
    try {
      setIsDataLoading(true)
      const productsRes = await adminApi.getProductsForModeration(1, 10, { queue: 'PENDING_REVIEW' })
      const productsData = productsRes.data?.data
      setProducts(productsData?.products || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to refresh products')
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleApproveProduct = async (productId: string) => {
    try {
      await adminApi.approveProduct(productId)
      await refreshProducts()
    } catch (err) {
      alert('Failed to approve product')
    }
  }

  const handleHideProduct = async (productId: string) => {
    const reason = window.prompt('Reason for hiding this product?', 'Policy violation') || 'Policy violation'
    try {
      await adminApi.hideProduct(productId, reason)
      await refreshProducts()
    } catch (err) {
      alert('Failed to hide product')
    }
  }

  const handleToggleFeatured = async (product: AdminProduct) => {
    try {
      await adminApi.featureProduct(product.product_id, !product.is_featured)
      await refreshProducts()
    } catch (err) {
      alert('Failed to update featured status')
    }
  }

  const handleToggleRecommended = async (product: AdminProduct) => {
    const current = product.metadata?.recommended ?? false
    try {
      await adminApi.recommendProduct(product.product_id, !current)
      await refreshProducts()
    } catch (err) {
      alert('Failed to update recommendation status')
    }
  }

  const totalOrderVolume = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold mb-2">Marketplace Administration</h1>
          <p className="text-accent-300">
            Admin-only marketplace controls: vendors, products, orders, and financial oversight.
          </p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Vendors overview */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Vendors</h2>
            <span className="text-xs text-accent-300">Verified &amp; active vendors</span>
          </div>
          {isDataLoading && vendors.length === 0 ? (
            <p className="text-sm text-accent-300">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-accent-300">No vendors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">Vendor</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.vendor_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-sm">{v.business_name}</div>
                      </td>
                      <td className="py-2 pr-4 text-[11px] text-accent-200">{v.service_type}</td>
                      <td className="py-2 pr-4 text-[11px] text-accent-300">{v.city || '—'}</td>
                      <td className="py-2 pr-4 text-[11px] text-accent-300">
                        {v.rating !== undefined && <div>Rating: {v.rating.toFixed ? v.rating.toFixed(1) : v.rating}</div>}
                        {v.total_orders !== undefined && <div>Orders: {v.total_orders}</div>}
                        {v.total_revenue !== undefined && <div>Revenue: {v.total_revenue} ETB</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Product moderation snapshot */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Products (pending review)</h2>
            <span className="text-xs text-accent-300">Sample of products currently in the review queue</span>
          </div>
          {isDataLoading && products.length === 0 ? (
            <p className="text-sm text-accent-300">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-accent-300">No products pending review.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Vendor</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Moderation</th>
                    <th className="py-2 pr-4">Flags</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.product_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4 text-sm">{p.name}</td>
                      <td className="py-2 pr-4 text-[11px] text-accent-300">
                        {p.vendor ? (
                          <>
                            <div>{p.vendor.business_name}</div>
                            <div className="text-[10px]">{p.vendor.service_type}</div>
                            {p.vendor.city && <div className="text-[10px]">{p.vendor.city}</div>}
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-[11px] text-accent-300">{p.category}</td>
                      <td className="py-2 pr-4 text-[11px]">{p.price} ETB</td>
                      <td className="py-2 pr-4 text-[11px]">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full ${
                            p.admin_status === 'PENDING_REVIEW'
                              ? 'bg-amber-600/30 text-amber-200'
                              : p.admin_status === 'HIDDEN'
                              ? 'bg-red-700/30 text-red-200'
                              : 'bg-emerald-600/20 text-emerald-200'
                          }`}
                        >
                          {p.admin_status || (p.is_active ? 'LIVE' : 'INACTIVE')}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-[11px] text-accent-300">
                        <div className="flex flex-col gap-1">
                          <span>
                            Featured:{' '}
                            <span className={p.is_featured ? 'text-emerald-300' : 'text-accent-400'}>
                              {p.is_featured ? 'Yes' : 'No'}
                            </span>
                          </span>
                          <span>
                            Recommended:{' '}
                            <span className={p.metadata?.recommended ? 'text-emerald-300' : 'text-accent-400'}>
                              {p.metadata?.recommended ? 'Yes' : 'No'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-[11px]">
                        <div className="flex flex-col gap-1">
                          {p.admin_status === 'PENDING_REVIEW' && (
                            <button
                              onClick={() => handleApproveProduct(p.product_id)}
                              className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleHideProduct(p.product_id)}
                            className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-red-100"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className="px-2 py-1 rounded bg-primary-700 hover:bg-primary-600 text-xs"
                          >
                            {p.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleToggleRecommended(p)}
                            className="px-2 py-1 rounded bg-primary-700 hover:bg-primary-600 text-xs"
                          >
                            {p.metadata?.recommended ? 'Unrecommend' : 'Recommend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Orders and reconciliation */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Orders</h2>
              <p className="text-xs text-accent-300">Orders placed by public users across all vendors</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-accent-300">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => handleOrderStatusFilterChange(e.target.value)}
                className="px-2 py-1 rounded bg-primary-700 border border-primary-600"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          {isDataLoading && orders.length === 0 ? (
            <p className="text-sm text-accent-300">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-accent-300">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Buyer</th>
                    <th className="py-2 pr-4">Vendor</th>
                    <th className="py-2 pr-4">Amount / Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4 align-top">
                        <div className="font-medium">{o.order_number}</div>
                        <div className="text-[11px] text-accent-400 mt-1">
                          {new Date(o.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2 pr-4 align-top text-[11px] text-accent-300">
                        {o.buyer ? (
                          <>
                            <div>{o.buyer.name}</div>
                            <div className="text-[10px]">{o.buyer.email}</div>
                            {o.buyer.phone && <div className="text-[10px]">{o.buyer.phone}</div>}
                          </>
                        ) : (
                          <span>Unknown</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 align-top text-[11px] text-accent-300">
                        {o.vendor ? (
                          <>
                            <div>{o.vendor.business_name}</div>
                            <div className="text-[10px]">{o.vendor.service_type}</div>
                            {o.vendor.city && <div className="text-[10px]">{o.vendor.city}</div>}
                          </>
                        ) : (
                          <span>Unknown</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 align-top text-[11px]">
                        <div>{o.total_amount} ETB</div>
                        <div
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-600/20 text-emerald-200'
                              : o.status === 'CANCELLED' || o.status === 'REFUNDED'
                              ? 'bg-red-700/30 text-red-200'
                              : 'bg-primary-700 text-accent-200'
                          }`}
                        >
                          {o.status}
                        </div>
                      </td>
                      <td className="py-2 align-top text-[11px]">
                        <div className="flex flex-col gap-2">
                          {['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status) ? null : (
                            <button
                              onClick={() => handleCancelOrder(o.order_id)}
                              className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-red-100"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {orderPagination && orderPagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs text-accent-300">
              <div>
                Page {orderPagination.current_page} of {orderPagination.total_pages} ·{' '}
                {orderPagination.total_records} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOrderPageChange(orderPagination.current_page - 1)}
                  disabled={orderPagination.current_page === 1}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleOrderPageChange(orderPagination.current_page + 1)}
                  disabled={orderPagination.current_page === orderPagination.total_pages}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Simple reconciliation summary based on loaded orders */}
          <div className="mt-4 border-t border-primary-700 pt-3 text-xs text-accent-300 flex justify-between flex-wrap gap-2">
            <div>Total orders in view: {orders.length}</div>
            <div>Total volume (this page): {totalOrderVolume.toFixed(2)} ETB</div>
          </div>
        </section>
      </div>
    </div>
  )
}
