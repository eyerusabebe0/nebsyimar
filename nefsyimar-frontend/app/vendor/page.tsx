'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { vendorApi, walletApi } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Settings,
  Bell,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface VendorDashboardData {
  vendor_account: {
    vendor_id: string
    vendor_name: string
    service_type: string
    contact_person: string
    phone_number: string
    address: string
    description: string
    can_add_products: boolean
    can_edit_products: boolean
    can_manage_orders: boolean
    can_update_stock: boolean
    can_edit_profile: boolean
    is_active: boolean
    user: {
      name: string
      username: string
      last_login: string
    }
  }
  order_counts: {
    new: number
    accepted: number
    preparing: number
    out_for_delivery: number
    delivered: number
    cancelled: number
  }
  product_count: number
  recent_orders: Order[]
}

interface Order {
  order_id: string
  order_number?: string
  status: string
  total_amount: number
  created_at: string
  customer: {
    name: string
    phone: string
  }
  items: any[]
}

interface VendorProduct {
  product_id: string
  name: string
  description?: string
  price: number
  category?: string
  stock_quantity?: number
  in_stock?: boolean
  is_active?: boolean
  is_featured?: boolean
  metadata?: {
    moderation_status?: string
  } | null
  created_at?: string
}

interface ProductFormState {
  name: string
  description: string
  price: string
  category: string
  stock_quantity: string
  is_featured: boolean
}

interface WalletSummary {
  balance: number
  currency: string
  totalDeposited: number
  totalSpent: number
  isFrozen: boolean
}

interface WalletTx {
  txn_id: string
  amount: number
  type: string
  status: string
  description?: string
  created_at: string
}

type VendorStatsPeriod = '7d' | '30d' | '90d' | '1y'

interface VendorStats {
  period: string
  vendor_info: {
    business_name: string
    rating: number | null
    total_reviews: number
    total_orders: number
    total_revenue: number
  }
  period_stats: {
    total_orders: number
    total_revenue: number
    average_order_value: number
    completed_orders: number
    cancelled_orders: number
  }
  popular_products: {
    product_id: string
    order_count: number
    total_quantity: number
    total_revenue: number
    product?: {
      product_id: string
      name: string
      main_image?: string | null
      category?: string | null
    }
  }[]
  order_time_series: {
    date: string
    order_count: number
    total_revenue: number
    delivered: number
    cancelled: number
  }[]
  order_funnel: {
    new_or_in_progress: number
    delivered: number
    cancelled: number
  }
}

const PRODUCT_CATEGORIES = [
  'FLOWERS',
  'COFFINS',
  'FOOD_CATERING',
  'PHOTOGRAPHY',
  'VIDEOGRAPHY',
  'TRANSPORT',
  'MEMORIAL_ITEMS',
  'CLOTHING',
  'MUSIC',
  'RELIGIOUS_ITEMS',
  'DECORATIONS',
  'OTHER'
] as const

export default function VendorDashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<VendorDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'payouts' | 'settings'>('overview')
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [productsPage, setProductsPage] = useState(1)
  const [productsTotalPages, setProductsTotalPages] = useState(1)
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit' | null>(null)
  const [productFormData, setProductFormData] = useState<ProductFormState>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    is_featured: false
  })
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('')
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null)
  const [walletSummaryLoading, setWalletSummaryLoading] = useState(false)
  const [walletSummaryError, setWalletSummaryError] = useState<string | null>(null)
  const [walletTransactions, setWalletTransactions] = useState<WalletTx[]>([])
  const [walletTxLoading, setWalletTxLoading] = useState(false)
  const [walletTxError, setWalletTxError] = useState<string | null>(null)
  const [walletTxPage, setWalletTxPage] = useState(1)
  const [walletTxTotalPages, setWalletTxTotalPages] = useState(1)
  const [statsPeriod, setStatsPeriod] = useState<VendorStatsPeriod>('30d')
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Redirect if not vendor
  useEffect(() => {
    if (user && user.role !== 'Vendor') {
      window.location.href = '/dashboard'
    }
  }, [user])

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://127.0.0.1:5000/api/v1/vendor/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nefsyimar_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'Vendor') {
      loadDashboardData()
    }
  }, [user])

  const loadOrders = async (page = 1, status?: string) => {
    try {
      setOrdersLoading(true)
      setOrdersError(null)

      const res = await vendorApi.getOrders(page, 20, status)
      const data = res.data?.data
      const rawOrders = data?.orders || []

      const mapped: Order[] = rawOrders.map((o: any) => ({
        order_id: o.order_id,
        order_number: o.order_number,
        status: o.status,
        total_amount: Number(o.total_amount ?? 0),
        created_at: o.created_at,
        customer: {
          name: o.customer?.name || 'Customer',
          phone: o.customer?.phone || '',
        },
        items: o.items || [],
      }))

      setOrders(mapped)

      if (data?.pagination) {
        setOrdersPage(data.pagination.current_page)
        setOrdersTotalPages(data.pagination.total_pages)
      } else {
        setOrdersPage(1)
        setOrdersTotalPages(1)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrdersError('Failed to load orders')
      toast.error('Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const loadProducts = async (page = 1) => {
    try {
      setProductsLoading(true)
      setProductsError(null)

      const res = await vendorApi.getProducts(page, 20)
      const data = res.data?.data
      const rawProducts = data?.products || []

      const mapped: VendorProduct[] = rawProducts.map((p: any) => ({
        product_id: p.product_id,
        name: p.name,
        description: p.description,
        price: Number(p.price ?? 0),
        category: p.category,
        stock_quantity: p.stock_quantity,
        in_stock: p.in_stock,
        is_active: p.is_active,
        is_featured: p.is_featured,
        metadata: p.metadata || null,
        created_at: p.created_at
      }))

      setProducts(mapped)

      if (data?.pagination) {
        setProductsPage(data.pagination.current_page)
        setProductsTotalPages(data.pagination.total_pages)
      } else {
        setProductsPage(1)
        setProductsTotalPages(1)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProductsError('Failed to load products')
      toast.error('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  const loadWalletSummary = async () => {
    try {
      setWalletSummaryLoading(true)
      setWalletSummaryError(null)

      const res = await walletApi.getBalance()
      const data = res.data?.data
      if (!data) {
        setWalletSummary(null)
        return
      }

      const mapped: WalletSummary = {
        balance: Number(data.balance ?? 0),
        currency: data.currency || 'ETB',
        totalDeposited: Number(data.total_deposited ?? 0),
        totalSpent: Number(data.total_spent ?? 0),
        isFrozen: Boolean(data.is_frozen),
      }

      setWalletSummary(mapped)
    } catch (error: any) {
      console.error('Error loading wallet summary:', error)
      const message = error?.response?.data?.message || 'Failed to load wallet information'
      setWalletSummaryError(message)
    } finally {
      setWalletSummaryLoading(false)
    }
  }

  const loadWalletTransactions = async (page = 1) => {
    try {
      setWalletTxLoading(true)
      setWalletTxError(null)

      const res = await walletApi.getTransactions(page, 20)
      const data = res.data?.data
      const raw = data?.transactions || []

      const filtered = raw.filter((t: any) =>
        t.type === 'MARKETPLACE_SALE' || t.type === 'REFUND',
      )

      const mapped: WalletTx[] = filtered.map((t: any) => ({
        txn_id: t.txn_id,
        amount: Number(t.amount ?? 0),
        type: t.type,
        status: t.status,
        description: t.description || undefined,
        created_at: t.created_at,
      }))

      setWalletTransactions(mapped)

      if (data?.pagination) {
        setWalletTxPage(data.pagination.current_page)
        setWalletTxTotalPages(data.pagination.total_pages)
      } else {
        setWalletTxPage(1)
        setWalletTxTotalPages(1)
      }
    } catch (error: any) {
      console.error('Error loading wallet transactions:', error)
      const message = error?.response?.data?.message || 'Failed to load wallet transactions'
      setWalletTxError(message)
    } finally {
      setWalletTxLoading(false)
    }
  }

  const loadVendorStats = async (period: VendorStatsPeriod = statsPeriod) => {
    try {
      setStatsLoading(true)
      setStatsError(null)

      const res = await vendorApi.getStats(period)
      const data = res.data?.data

      if (!data) {
        setVendorStats(null)
        return
      }

      const mapped: VendorStats = {
        period: data.period || period,
        vendor_info: {
          business_name: data.vendor_info?.business_name || '',
          rating: data.vendor_info?.rating ?? null,
          total_reviews: Number(data.vendor_info?.total_reviews ?? 0),
          total_orders: Number(data.vendor_info?.total_orders ?? 0),
          total_revenue: Number(data.vendor_info?.total_revenue ?? 0),
        },
        period_stats: {
          total_orders: Number(data.period_stats?.total_orders ?? 0),
          total_revenue: Number(data.period_stats?.total_revenue ?? 0),
          average_order_value: Number(data.period_stats?.average_order_value ?? 0),
          completed_orders: Number(data.period_stats?.completed_orders ?? 0),
          cancelled_orders: Number(data.period_stats?.cancelled_orders ?? 0),
        },
        popular_products: (data.popular_products || []).map((p: any) => ({
          product_id: p.product_id,
          order_count: Number(p.order_count ?? 0),
          total_quantity: Number(p.total_quantity ?? 0),
          total_revenue: Number(p.total_revenue ?? 0),
          product: p.product
            ? {
                product_id: p.product.product_id,
                name: p.product.name,
                main_image: p.product.main_image ?? null,
                category: p.product.category ?? null,
              }
            : undefined,
        })),
        order_time_series: (data.order_time_series || []).map((d: any) => ({
          date: d.date,
          order_count: Number(d.order_count ?? 0),
          total_revenue: Number(d.total_revenue ?? 0),
          delivered: Number(d.delivered ?? 0),
          cancelled: Number(d.cancelled ?? 0),
        })),
        order_funnel: {
          new_or_in_progress: Number(data.order_funnel?.new_or_in_progress ?? 0),
          delivered: Number(data.order_funnel?.delivered ?? 0),
          cancelled: Number(data.order_funnel?.cancelled ?? 0),
        },
      }

      setVendorStats(mapped)
    } catch (error: any) {
      console.error('Error loading vendor stats:', error)
      const message = error?.response?.data?.message || 'Failed to load analytics'
      setStatsError(message)
    } finally {
      setStatsLoading(false)
    }
  }

  const openCreateProductForm = () => {
    setProductFormMode('create')
    setEditingProductId(null)
    setProductFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock_quantity: '',
      is_featured: false
    })
    setProductImageFile(null)
  }

  const openEditProductForm = (product: VendorProduct) => {
    setProductFormMode('edit')
    setEditingProductId(product.product_id)
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      category: product.category || '',
      stock_quantity: product.stock_quantity != null ? String(product.stock_quantity) : '',
      is_featured: !!product.is_featured
    })
    setProductImageFile(null)
  }

  const resetProductForm = () => {
    setProductFormMode(null)
    setEditingProductId(null)
    setProductImageFile(null)
  }

  const handleProductFormChange = (field: keyof ProductFormState, value: string | boolean) => {
    setProductFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProduct = async (e: any) => {
    e.preventDefault()

    if (!productFormData.name || !productFormData.price || !productFormData.category) {
      toast.error('Name, price, and category are required')
      return
    }

    const price = parseFloat(productFormData.price)
    const stockQty = productFormData.stock_quantity ? parseInt(productFormData.stock_quantity, 10) : 0

    if (isNaN(price) || price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    if (isNaN(stockQty) || stockQty < 0) {
      toast.error('Stock must be 0 or greater')
      return
    }

    try {
      setIsSavingProduct(true)
      const formData = new FormData()
      formData.append('name', productFormData.name)
      if (productFormData.description) {
        formData.append('description', productFormData.description)
      }
      formData.append('price', String(price))
      formData.append('category', productFormData.category)
      formData.append('stock_quantity', String(stockQty))
      formData.append('is_featured', productFormData.is_featured ? 'true' : 'false')

      if (productImageFile) {
        formData.append('main_image', productImageFile)
      }

      if (productFormMode === 'create') {
        await vendorApi.createProduct(formData)
        toast.success('Product created and sent for review')
      } else if (productFormMode === 'edit' && editingProductId) {
        await vendorApi.updateProduct(editingProductId, formData)
        toast.success('Product updated and sent for review')
      } else {
        return
      }

      resetProductForm()
      await loadProducts(productsPage)
    } catch (error: any) {
      console.error('Error saving product:', error)
      const message = error?.response?.data?.message || 'Failed to save product'
      toast.error(message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleUpdateStock = async (product: VendorProduct, newStock: number, newInStock?: boolean) => {
    if (newStock < 0) return

    try {
      setStockUpdatingId(product.product_id)
      const inStock = newInStock !== undefined ? newInStock : newStock > 0
      await vendorApi.updateProductStock(product.product_id, newStock, inStock)
      toast.success('Stock updated')
      await loadProducts(productsPage)
    } catch (error: any) {
      console.error('Error updating stock:', error)
      const message = error?.response?.data?.message || 'Failed to update stock'
      toast.error(message)
    } finally {
      setStockUpdatingId(null)
    }
  }

  useEffect(() => {
    if (activeTab === 'products' && user?.role === 'Vendor') {
      loadProducts(productsPage)
    }
  }, [activeTab, user, productsPage])

  useEffect(() => {
    if (activeTab === 'orders' && user?.role === 'Vendor') {
      loadOrders(ordersPage, ordersStatusFilter || undefined)
    }
  }, [activeTab, user, ordersPage, ordersStatusFilter])

  useEffect(() => {
    if (activeTab === 'overview' && user?.role === 'Vendor') {
      loadVendorStats(statsPeriod)
    }
  }, [activeTab, user, statsPeriod])

  useEffect(() => {
    if (activeTab === 'payouts' && user?.role === 'Vendor') {
      loadWalletSummary()
      loadWalletTransactions(walletTxPage)
    }
  }, [activeTab, user, walletTxPage])

  useEffect(() => {
    if (activeTab !== 'orders' || user?.role !== 'Vendor') {
      return
    }

    const interval = setInterval(() => {
      loadOrders(ordersPage, ordersStatusFilter || undefined)
    }, 15000)

    return () => clearInterval(interval)
  }, [activeTab, user, ordersPage, ordersStatusFilter])

  useEffect(() => {
    if (!user || user.role !== 'Vendor' || !dashboardData?.vendor_account?.vendor_id) {
      return
    }

    const socket = getSocket()
    if (!socket) return

    const vendorId = dashboardData.vendor_account.vendor_id

    const handleOrdersUpdated = () => {
      if (activeTab === 'orders') {
        loadOrders(ordersPage, ordersStatusFilter || undefined)
        toast.success('Your orders have been updated')
      } else {
        loadDashboardData()
        toast.success('Order statistics have been updated')
      }
    }

    socket.emit('orders:subscribe', { role: 'vendor', vendorId })
    socket.on('orders:updated', handleOrdersUpdated)

    return () => {
      socket.off('orders:updated', handleOrdersUpdated)
    }
  }, [user, dashboardData?.vendor_account?.vendor_id, activeTab, ordersPage, ordersStatusFilter])

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/v1/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nefsyimar_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Order status updated')
        await loadDashboardData()
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  if (!user || user.role !== 'Vendor') {
    return <div>Access denied</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 flex items-center justify-center">
        <div className="text-white text-lg">Failed to load dashboard data</div>
      </div>
    )
  }

  const { vendor_account, order_counts, product_count, recent_orders } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Vendor Dashboard</h1>
              <p className="text-accent-300">Welcome back, {vendor_account.contact_person}</p>
              <p className="text-accent-400 text-sm">{vendor_account.vendor_name} • {vendor_account.service_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm ${vendor_account.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {vendor_account.is_active ? 'Active' : 'Inactive'}
              </div>
              <Bell className="w-6 h-6 text-accent-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-accent-800 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'payouts', label: 'Payouts', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-500 text-white'
                    : 'text-accent-300 hover:text-white hover:bg-accent-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-accent-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">New Orders</p>
                    <p className="text-2xl font-bold text-white">{order_counts.new}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-accent-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">{order_counts.accepted + order_counts.preparing}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-accent-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Out for Delivery</p>
                    <p className="text-2xl font-bold text-white">{order_counts.out_for_delivery}</p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Truck className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-accent-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Products</p>
                    <p className="text-2xl font-bold text-white">{product_count}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Package className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent-300" />
                    <span>Marketplace performance</span>
                  </h2>
                  <p className="text-accent-400 text-xs">
                    Sales, revenue, and cancellations for your storefront.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-accent-300">Period:</span>
                  <select
                    value={statsPeriod}
                    onChange={(e) => setStatsPeriod(e.target.value as VendorStatsPeriod)}
                    className="px-2 py-1 rounded bg-accent-700 border border-accent-600 text-xs text-accent-100"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last 12 months</option>
                  </select>
                </div>
              </div>

              {statsLoading && !vendorStats && (
                <div className="text-sm text-accent-300">Loading analytics...</div>
              )}

              {statsError && (
                <div className="text-sm text-red-300">{statsError}</div>
              )}

              {!statsLoading && !statsError && vendorStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-accent-900 rounded-lg p-4">
                      <p className="text-xs text-accent-300">Total revenue</p>
                      <p className="text-xl font-semibold text-white mt-1">
                        {vendorStats.period_stats.total_revenue.toFixed(2)} ETB
                      </p>
                    </div>
                    <div className="bg-accent-900 rounded-lg p-4">
                      <p className="text-xs text-accent-300">Orders in period</p>
                      <p className="text-xl font-semibold text-white mt-1">
                        {vendorStats.period_stats.total_orders}
                      </p>
                      <p className="text-[11px] text-accent-400">
                        Avg {vendorStats.period_stats.average_order_value.toFixed(2)} ETB / order
                      </p>
                    </div>
                    <div className="bg-accent-900 rounded-lg p-4">
                      <p className="text-xs text-accent-300">Completed</p>
                      <p className="text-xl font-semibold text-emerald-300 mt-1">
                        {vendorStats.period_stats.completed_orders}
                      </p>
                      <p className="text-[11px] text-accent-400">
                        {vendorStats.period_stats.total_orders > 0
                          ? `${Math.round(
                              (vendorStats.period_stats.completed_orders /
                                vendorStats.period_stats.total_orders) *
                                100,
                            )}% of orders`
                          : 'No orders'}
                      </p>
                    </div>
                    <div className="bg-accent-900 rounded-lg p-4">
                      <p className="text-xs text-accent-300">Cancelled (cancel rate)</p>
                      <p className="text-xl font-semibold text-red-300 mt-1">
                        {vendorStats.period_stats.cancelled_orders}
                      </p>
                      <p className="text-[11px] text-accent-400">
                        {vendorStats.period_stats.total_orders > 0
                          ? `${Math.round(
                              (vendorStats.period_stats.cancelled_orders /
                                vendorStats.period_stats.total_orders) *
                                100,
                            )}% of orders`
                          : 'No orders'}
                      </p>
                    </div>
                  </div>

                  {vendorStats.order_time_series.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-accent-900 rounded-lg p-4">
                        <p className="text-xs text-accent-300 mb-2">Sales over time</p>
                        <div className="h-32 flex items-end gap-1">
                          {(() => {
                            const points = vendorStats.order_time_series
                            const maxRevenue = Math.max(
                              ...points.map((p) => p.total_revenue || 0),
                              1,
                            )
                            return points.map((p) => {
                              const height = Math.round((p.total_revenue / maxRevenue) * 100)
                              return (
                                <div
                                  key={p.date}
                                  className="flex-1 flex flex-col items-center"
                                >
                                  <div
                                    className="w-full rounded-t-sm bg-accent-400"
                                    style={{
                                      height: `${height}%`,
                                      minHeight: height > 0 ? '4px' : '0px',
                                    }}
                                    title={`${p.total_revenue.toFixed(2)} ETB on ${new Date(
                                      p.date,
                                    ).toLocaleDateString()}`}
                                  />
                                </div>
                              )
                            })
                          })()}
                        </div>
                        <p className="mt-2 text-[11px] text-accent-400">
                          Height shows revenue per day within the selected period.
                        </p>
                      </div>

                      <div className="bg-accent-900 rounded-lg p-4">
                        <p className="text-xs text-accent-300 mb-2">Order funnel</p>
                        {(() => {
                          const funnel = vendorStats.order_funnel
                          const total =
                            funnel.new_or_in_progress + funnel.delivered + funnel.cancelled
                          const toPercent = (value: number) =>
                            total > 0 ? Math.round((value / total) * 100) : 0
                          const stages = [
                            {
                              key: 'new_or_in_progress',
                              label: 'New / In progress',
                              value: funnel.new_or_in_progress,
                              color: 'bg-blue-500',
                            },
                            {
                              key: 'delivered',
                              label: 'Delivered',
                              value: funnel.delivered,
                              color: 'bg-emerald-500',
                            },
                            {
                              key: 'cancelled',
                              label: 'Cancelled',
                              value: funnel.cancelled,
                              color: 'bg-red-500',
                            },
                          ]

                          return (
                            <div className="space-y-2">
                              {stages.map((stage) => {
                                const pct = toPercent(stage.value)
                                return (
                                  <div key={stage.key} className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] text-accent-300">
                                      <span>{stage.label}</span>
                                      <span>
                                        {stage.value} orders
                                        {total > 0 ? ` • ${pct}%` : ''}
                                      </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-accent-800 overflow-hidden">
                                      <div
                                        className={`h-2 ${stage.color}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {vendorStats.popular_products.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">
                        Top products in this period
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-accent-900">
                            <tr>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-accent-200">
                                Product
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-accent-200">
                                Orders
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-accent-200">
                                Qty sold
                              </th>
                              <th className="px-3 py-2 text-right text-[11px] font-semibold text-accent-200">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-accent-800">
                            {vendorStats.popular_products.map((p) => (
                              <tr key={p.product_id}>
                                <td className="px-3 py-2 text-accent-100">
                                  <div className="font-medium">
                                    {p.product?.name || 'Unnamed product'}
                                  </div>
                                  {p.product?.category && (
                                    <div className="text-[11px] text-accent-400">
                                      {p.product.category
                                        .replace(/_/g, ' ')
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right text-accent-200">
                                  {p.order_count}
                                </td>
                                <td className="px-3 py-2 text-right text-accent-200">
                                  {p.total_quantity}
                                </td>
                                <td className="px-3 py-2 text-right text-accent-200">
                                  {p.total_revenue.toFixed(2)} ETB
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {vendorStats.popular_products.length === 0 && (
                    <p className="text-xs text-accent-300">
                      No product-level sales data for this period yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-accent-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-accent-400 hover:text-white text-sm"
                >
                  View All
                </button>
              </div>

              {recent_orders.length === 0 ? (
                <div className="text-center py-8 text-accent-400">
                  No recent orders
                </div>
              ) : (
                <div className="space-y-4">
                  {recent_orders.slice(0, 5).map((order) => (
                    <div key={order.order_id} className="flex items-center justify-between p-4 bg-accent-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'new' ? 'bg-blue-500' :
                          order.status === 'accepted' ? 'bg-yellow-500' :
                          order.status === 'preparing' ? 'bg-orange-500' :
                          order.status === 'out_for_delivery' ? 'bg-purple-500' :
                          order.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">Order #{order.order_id.slice(-8)}</p>
                          <p className="text-accent-400 text-sm">{order.customer.name} • {order.customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{order.total_amount} ETB</p>
                        <p className="text-accent-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      {vendor_account.can_manage_orders && order.status === 'new' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.order_id, 'accepted')}
                          className="ml-4 px-3 py-1 bg-accent-500 hover:bg-accent-600 text-white text-sm rounded transition-colors"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-accent-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vendor_account.can_add_products && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center space-x-3 p-4 bg-accent-700 hover:bg-accent-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-accent-400" />
                    <span className="text-white">Add New Product</span>
                  </button>
                )}
                
                {vendor_account.can_manage_orders && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center space-x-3 p-4 bg-accent-700 hover:bg-accent-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-accent-400" />
                    <span className="text-white">View All Orders</span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center space-x-3 p-4 bg-accent-700 hover:bg-accent-600 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-accent-400" />
                  <span className="text-white">Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="bg-accent-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Payouts & Wallet</h2>
            </div>

            {/* Wallet summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-accent-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-accent-300 text-xs">Available balance</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                {walletSummaryLoading ? (
                  <div className="text-accent-300 text-sm">Loading...</div>
                ) : walletSummaryError ? (
                  <div className="text-red-300 text-xs">{walletSummaryError}</div>
                ) : walletSummary ? (
                  <>
                    <div className="text-2xl font-bold text-white">
                      {walletSummary.balance.toFixed(2)} {walletSummary.currency}
                    </div>
                    {walletSummary.isFrozen && (
                      <div className="mt-2 text-xs text-red-300">Wallet is currently frozen</div>
                    )}
                  </>
                ) : (
                  <div className="text-accent-300 text-sm">No wallet information available.</div>
                )}
              </div>

              <div className="bg-accent-900 rounded-lg p-4">
                <span className="block text-accent-300 text-xs mb-2">Total credits</span>
                {walletSummaryLoading ? (
                  <div className="text-accent-300 text-sm">Loading...</div>
                ) : walletSummary ? (
                  <div className="text-lg font-semibold text-green-300">
                    {walletSummary.totalDeposited.toFixed(2)} {walletSummary.currency}
                  </div>
                ) : (
                  <div className="text-accent-300 text-sm">—</div>
                )}
              </div>

              <div className="bg-accent-900 rounded-lg p-4">
                <span className="block text-accent-300 text-xs mb-2">Total debits</span>
                {walletSummaryLoading ? (
                  <div className="text-accent-300 text-sm">Loading...</div>
                ) : walletSummary ? (
                  <div className="text-lg font-semibold text-red-300">
                    {walletSummary.totalSpent.toFixed(2)} {walletSummary.currency}
                  </div>
                ) : (
                  <div className="text-accent-300 text-sm">—</div>
                )}
              </div>
            </div>

            {/* Transactions table */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Marketplace payout history</h3>

              {walletTxLoading && (
                <div className="text-accent-300 text-sm">Loading transactions...</div>
              )}
              {!walletTxLoading && walletTxError && (
                <div className="text-red-300 text-sm">{walletTxError}</div>
              )}
              {!walletTxLoading && !walletTxError && walletTransactions.length === 0 && (
                <div className="text-accent-400 text-sm">No payout transactions yet.</div>
              )}

              {!walletTxLoading && !walletTxError && walletTransactions.length > 0 && (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-xs">
                    <thead className="bg-accent-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-accent-200">Date</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-accent-200">Type</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-accent-200">Description</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-accent-200">Amount</th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold text-accent-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent-800">
                      {walletTransactions.map((tx) => {
                        const isCredit = tx.amount >= 0
                        const prettyType = tx.type
                          .toLowerCase()
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())

                        return (
                          <tr key={tx.txn_id}>
                            <td className="px-3 py-2 text-accent-200">
                              {new Date(tx.created_at).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-accent-200">{prettyType}</td>
                            <td className="px-3 py-2 text-accent-300 max-w-xs line-clamp-2">
                              {tx.description || '—'}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-semibold ${
                                isCredit ? 'text-green-300' : 'text-red-300'
                              }`}
                            >
                              {isCredit ? '+' : '-'}
                              {Math.abs(tx.amount).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-accent-200">
                              {tx.status.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {walletTxTotalPages > 1 && (
                <div className="flex items-center justify-between text-[11px] text-accent-300 mt-3">
                  <span>
                    Page {walletTxPage} of {walletTxTotalPages}
                  </span>
                  <div className="space-x-2">
                    <button
                      disabled={walletTxPage <= 1}
                      onClick={() => setWalletTxPage((prev) => Math.max(1, prev - 1))}
                      className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                        walletTxPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      disabled={walletTxPage >= walletTxTotalPages}
                      onClick={() => setWalletTxPage((prev) => Math.min(walletTxTotalPages, prev + 1))}
                      className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                        walletTxPage >= walletTxTotalPages ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-accent-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Order Management</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-accent-300">Filter by status:</span>
                <select
                  value={ordersStatusFilter}
                  onChange={(e) => {
                    setOrdersStatusFilter(e.target.value)
                    setOrdersPage(1)
                  }}
                  className="px-2 py-1 rounded bg-accent-700 border border-accent-600 text-xs text-accent-100"
                >
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {!vendor_account.can_manage_orders ? (
              <div className="text-center py-8 text-accent-400">
                You do not have permission to manage orders
              </div>
            ) : (
              <div className="space-y-4">
                {ordersLoading && (
                  <div className="text-accent-300 text-sm">Loading orders...</div>
                )}
                {!ordersLoading && ordersError && (
                  <div className="text-red-300 text-sm">{ordersError}</div>
                )}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="text-center py-8 text-accent-400">No orders found.</div>
                )}

                {!ordersLoading && !ordersError && orders.length > 0 && (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const statusLabel = order.status
                        ? order.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                        : 'Unknown'

                      return (
                        <div
                          key={order.order_id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-accent-700 rounded-lg"
                        >
                          <div className="flex-1 mb-3 md:mb-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white font-semibold">
                                Order #{order.order_number || order.order_id.slice(-8)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  order.status === 'new'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : order.status === 'accepted'
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : order.status === 'preparing'
                                    ? 'bg-orange-500/20 text-orange-300'
                                    : order.status === 'out_for_delivery'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : order.status === 'delivered'
                                    ? 'bg-green-500/20 text-green-300'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'bg-accent-600 text-accent-100'
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                            <div className="text-xs text-accent-300 mb-1">
                              {order.customer.name} • {order.customer.phone}
                            </div>
                            <div className="text-xs text-accent-400">
                              Placed on {new Date(order.created_at).toLocaleString()} •{' '}
                              {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                            </div>
                            {order.items?.length > 0 && (
                              <div className="text-[11px] text-accent-400 mt-1 line-clamp-1">
                                Items:{' '}
                                {order.items
                                  .slice(0, 2)
                                  .map((it: any) => it.product?.name || it.product_name || 'Item')
                                  .join(', ')}
                                {order.items.length > 2 ? '…' : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-white font-semibold text-sm">
                              {order.total_amount} ETB
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                disabled={!vendor_account.can_manage_orders}
                                value={order.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value
                                  try {
                                    await vendorApi.updateOrderStatus(order.order_id, newStatus)
                                    toast.success('Order status updated')
                                    await loadOrders(ordersPage, ordersStatusFilter || undefined)
                                  } catch (error: any) {
                                    console.error('Error updating order status:', error)
                                    const message = error?.response?.data?.message || 'Failed to update order status'
                                    toast.error(message)
                                  }
                                }}
                                className="px-2 py-1 rounded bg-accent-900 border border-accent-600 text-xs text-accent-100"
                              >
                                <option value={order.status}>{statusLabel}</option>
                                <option value="accepted">Accepted</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for delivery</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {ordersTotalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-accent-300 mt-2">
                    <span>
                      Page {ordersPage} of {ordersTotalPages}
                    </span>
                    <div className="space-x-2">
                      <button
                        disabled={ordersPage <= 1}
                        onClick={() => setOrdersPage(prev => Math.max(1, prev - 1))}
                        className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                          ordersPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        disabled={ordersPage >= ordersTotalPages}
                        onClick={() => setOrdersPage(prev => Math.min(ordersTotalPages, prev + 1))}
                        className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                          ordersPage >= ordersTotalPages ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-accent-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Product Management</h2>
              {vendor_account.can_add_products && (
                <button
                  onClick={openCreateProductForm}
                  className="flex items-center space-x-2 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              )}
            </div>

            {!vendor_account.can_add_products && !vendor_account.can_edit_products && !vendor_account.can_update_stock ? (
              <div className="text-center py-8 text-accent-400">
                You do not have permission to manage products
              </div>
            ) : (
              <div className="space-y-6">
                {productsLoading && (
                  <div className="text-accent-300 text-sm">Loading products...</div>
                )}
                {!productsLoading && productsError && (
                  <div className="text-red-300 text-sm">{productsError}</div>
                )}
                {!productsLoading && !productsError && products.length === 0 && (
                  <div className="text-center py-8 text-accent-400">
                    No products yet.{" "}
                    {vendor_account.can_add_products && 'Click "New Product" to create your first item.'}
                  </div>
                )}

                {!productsLoading && !productsError && products.length > 0 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-accent-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-accent-200">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-accent-200">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-accent-200">Price</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-accent-200">Stock</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-accent-200">Status</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-accent-200">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-accent-700">
                          {products.map((product) => {
                            const moderationStatus = product.metadata?.moderation_status || 'PENDING_REVIEW'
                            const statusLabel = product.is_active
                              ? 'Live'
                              : moderationStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())

                            return (
                              <tr key={product.product_id}>
                                <td className="px-3 py-2 text-white">
                                  <div className="font-medium">{product.name}</div>
                                  {product.description && (
                                    <div className="text-xs text-accent-400 line-clamp-1">{product.description}</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-accent-300">
                                  {product.category
                                    ? product.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                                    : '-'}
                                </td>
                                <td className="px-3 py-2 text-accent-100">
                                  {product.price} ETB
                                </td>
                                <td className="px-3 py-2 text-accent-100">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min={0}
                                      value={product.stock_quantity ?? 0}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value, 10)
                                        if (isNaN(value) || value < 0) return
                                        handleUpdateStock(product, value)
                                      }}
                                      disabled={!vendor_account.can_update_stock || stockUpdatingId === product.product_id}
                                      className="w-20 px-2 py-1 bg-accent-900 border border-accent-600 rounded text-white text-xs"
                                    />
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        product.in_stock
                                          ? 'bg-green-500/20 text-green-400'
                                          : 'bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {product.in_stock ? 'In stock' : 'Out of stock'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-accent-100">
                                  <div className="text-xs">{statusLabel}</div>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    {vendor_account.can_edit_products && (
                                      <button
                                        onClick={() => openEditProductForm(product)}
                                        className="px-2 py-1 bg-accent-700 hover:bg-accent-600 rounded text-white text-xs flex items-center space-x-1"
                                      >
                                        <Edit className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {productsTotalPages > 1 && (
                      <div className="flex items-center justify-between text-xs text-accent-300">
                        <span>
                          Page {productsPage} of {productsTotalPages}
                        </span>
                        <div className="space-x-2">
                          <button
                            disabled={productsPage <= 1}
                            onClick={() => setProductsPage(prev => Math.max(1, prev - 1))}
                            className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                              productsPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Previous
                          </button>
                          <button
                            disabled={productsPage >= productsTotalPages}
                            onClick={() => setProductsPage(prev => Math.min(productsTotalPages, prev + 1))}
                            className={`px-2 py-1 rounded bg-accent-700 hover:bg-accent-600 ${
                              productsPage >= productsTotalPages ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {productFormMode && (
                  <div className="border-t border-accent-700 pt-6 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {productFormMode === 'create' ? 'Add New Product' : 'Edit Product'}
                    </h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveProduct}>
                      <div className="md:col-span-2">
                        <label className="block text-accent-300 text-sm mb-1">Name</label>
                        <input
                          type="text"
                          value={productFormData.name}
                          onChange={(e) => handleProductFormChange('name', e.target.value)}
                          className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-accent-300 text-sm mb-1">Price (ETB)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={productFormData.price}
                          onChange={(e) => handleProductFormChange('price', e.target.value)}
                          className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-accent-300 text-sm mb-1">Category</label>
                        <select
                          value={productFormData.category}
                          onChange={(e) => handleProductFormChange('category', e.target.value)}
                          className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white text-sm"
                          required
                        >
                          <option value="">Select category</option>
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent-300 text-sm mb-1">Initial Stock</label>
                        <input
                          type="number"
                          min={0}
                          value={productFormData.stock_quantity}
                          onChange={(e) => handleProductFormChange('stock_quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-accent-300 text-sm mb-1">Description</label>
                        <textarea
                          value={productFormData.description}
                          onChange={(e) => handleProductFormChange('description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white text-sm"
                          placeholder="Short description of the product"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-accent-300 text-sm mb-1">Product Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setProductImageFile(file)
                          }}
                          className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:bg-accent-500"
                        />
                        <p className="text-xs text-accent-400 mt-1">
                          Optional: Upload a main image that will be shown with this product in the marketplace.
                        </p>
                      </div>
                      <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                        <input
                          id="is_featured"
                          type="checkbox"
                          checked={productFormData.is_featured}
                          onChange={(e) => handleProductFormChange('is_featured', e.target.checked)}
                          className="h-4 w-4 text-accent-500 focus:ring-accent-500 border-accent-600 rounded bg-accent-700"
                        />
                        <label htmlFor="is_featured" className="text-accent-300 text-sm">
                          Request this product to be featured in the marketplace
                        </label>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-end space-x-3 mt-2">
                        <button
                          type="button"
                          onClick={resetProductForm}
                          className="px-4 py-2 text-sm rounded-lg border border-accent-600 text-accent-300 hover:text-white hover:bg-accent-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className={`px-4 py-2 text-sm rounded-lg bg-accent-500 text-white hover:bg-accent-600 ${
                            isSavingProduct ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSavingProduct ? 'Saving...' : 'Save Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-accent-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
            
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Vendor Name</label>
                    <input
                      type="text"
                      value={vendor_account.vendor_name}
                      disabled
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-accent-400"
                    />
                  </div>
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Service Type</label>
                    <input
                      type="text"
                      value={vendor_account.service_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      disabled
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-accent-400"
                    />
                  </div>
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={vendor_account.contact_person}
                      disabled={!vendor_account.can_edit_profile}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={vendor_account.phone_number}
                      disabled={!vendor_account.can_edit_profile}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'can_add_products', label: 'Add Products' },
                    { key: 'can_edit_products', label: 'Edit Products' },
                    { key: 'can_manage_orders', label: 'Manage Orders' },
                    { key: 'can_update_stock', label: 'Update Stock' },
                    { key: 'can_edit_profile', label: 'Edit Profile' }
                  ].map(permission => (
                    <div key={permission.key} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        vendor_account[permission.key as keyof typeof vendor_account] ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-accent-300">{permission.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Password */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Change Password</h3>
                <div className="max-w-md">
                  <button className="w-full px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
