'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Key, 
  Settings,
  Eye,
  Users,
  Package,
  ShoppingCart
} from 'lucide-react'
import toast from 'react-hot-toast'
import { handleApiError } from '@/lib/api-utils'
import { vendorManagementApi } from '@/lib/api'

interface VendorAccount {
  vendor_id: string
  vendor_name: string
  service_type: string
  contact_person: string
  phone_number: string
  address: string
  description: string
  business_license_no: string
  logo_url: string
  working_hours: any
  delivery_areas: string[]
  can_add_products: boolean
  can_edit_products: boolean
  can_manage_orders: boolean
  can_update_stock: boolean
  can_edit_profile: boolean
  is_active: boolean
  created_at: string
  user: {
    user_id: string
    name: string
    username: string
    phone: string
    last_login: string
    is_active: boolean
  }
}

interface CreateVendorData {
  vendor_name: string
  service_type: string
  contact_person: string
  phone_number: string
  address: string
  city: string
  description: string
  business_license_no: string
  logo_url: string
  working_hours: any
  delivery_areas: string[]
  username: string
  password: string
  permissions: {
    can_add_products: boolean
    can_edit_products: boolean
    can_manage_orders: boolean
    can_update_stock: boolean
    can_edit_profile: boolean
  }
}

const SERVICE_TYPES = [
  'FLORIST',
  'COFFIN_MAKER',
  'CATERER',
  'PHOTOGRAPHER',
  'VIDEOGRAPHER',
  'FUNERAL_HOME',
  'TRANSPORT',
  'RELIGIOUS_SERVICES',
  'MEMORIAL_ITEMS',
  'CLOTHING',
  'MUSIC',
  'OTHER'
]

export default function VendorManagementPage() {
  const { user } = useAuth()
  const [vendorAccounts, setVendorAccounts] = useState<VendorAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const getInitialFormData = (): CreateVendorData => ({
    vendor_name: '',
    service_type: '',
    contact_person: '',
    phone_number: '',
    address: '',
    city: '',
    description: '',
    business_license_no: '',
    logo_url: '',
    working_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    },
    delivery_areas: [],
    username: '',
    password: '',
    permissions: {
      can_add_products: true,
      can_edit_products: true,
      can_manage_orders: true,
      can_update_stock: true,
      can_edit_profile: false
    }
  })

  const [createFormData, setCreateFormData] = useState<CreateVendorData>(getInitialFormData())
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  // Check authentication and authorization
  const checkAuth = () => {
    const token = localStorage.getItem('nefsyimar_token')
    if (!token) {
      toast.error('Please log in to access this page')
      window.location.href = '/signin'
      return false
    }
    if (user && user.role !== 'Administrator') {
      toast.error('Administrator access required')
      window.location.href = '/dashboard'
      return false
    }
    return true
  }

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'Administrator') {
      window.location.href = '/dashboard'
    }
  }, [user])

  // Load vendor accounts
  const loadVendorAccounts = async () => {
    if (!checkAuth()) return
    
    try {
      setIsLoading(true)
      const response = await vendorManagementApi.getVendorAccounts(1, 100)
      setVendorAccounts(response.data.data?.vendors || response.data.data?.vendor_accounts || [])
    } catch (error) {
      handleApiError(error, 'Failed to load vendor accounts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'Administrator') {
      loadVendorAccounts()
    }
  }, [user])

  // Create vendor account
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkAuth()) return
    
    if (!createFormData.vendor_name || !createFormData.service_type || 
        !createFormData.contact_person || !createFormData.phone_number || 
        !createFormData.address || !createFormData.city || !createFormData.username || !createFormData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = createFormData.phone_number.trim()
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Phone number must start with a digit (1-9) and contain only digits, optionally starting with +')
      return
    }

    // Update form data with cleaned phone number
    const cleanedFormData = {
      ...createFormData,
      phone_number: cleanPhone
    }

    // Validate username length
    if (createFormData.username.length < 3 || createFormData.username.length > 50) {
      toast.error('Username must be between 3 and 50 characters')
      return
    }

    // Validate password length
    if (createFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      setIsCreating(true)
      console.log('Creating vendor with data (admin):', {
        ...cleanedFormData,
        password: '[HIDDEN]',
        hasLogoFile: !!logoFile
      })

      const formData = new FormData()
      formData.append('vendor_name', cleanedFormData.vendor_name)
      formData.append('service_type', cleanedFormData.service_type)
      formData.append('contact_person', cleanedFormData.contact_person)
      formData.append('phone_number', cleanedFormData.phone_number)
      formData.append('address', cleanedFormData.address)
      formData.append('city', cleanedFormData.city)
      if (cleanedFormData.description) {
        formData.append('description', cleanedFormData.description)
      }
      if (cleanedFormData.business_license_no) {
        formData.append('business_license_no', cleanedFormData.business_license_no)
      }
      formData.append('username', cleanedFormData.username)
      formData.append('password', cleanedFormData.password)
      formData.append('permissions', JSON.stringify(cleanedFormData.permissions))

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      if (documentFiles.length > 0) {
        documentFiles.forEach((file) => {
          formData.append('documents', file)
        })
      }

      await vendorManagementApi.createVendorAccount(formData)
      
      toast.success('Vendor account created successfully')
      setShowCreateForm(false)
      setCreateFormData(getInitialFormData())
      setLogoFile(null)
      setDocumentFiles([])
      await loadVendorAccounts()
    } catch (error) {
      console.error('Full error object:', error)
      handleApiError(error, 'Failed to create vendor account')
    } finally {
      setIsCreating(false)
    }
  }

  // Toggle vendor status
  const handleToggleStatus = async (vendorId: string) => {
    try {
      await vendorManagementApi.toggleVendorStatus(vendorId)
      toast.success('Vendor status updated')
      await loadVendorAccounts()
    } catch (error) {
      handleApiError(error, 'Failed to update vendor status')
    }
  }

  // Reset vendor password
  const handleResetPassword = async (vendorId: string) => {
    const newPassword = prompt('Enter new password for vendor:')
    if (!newPassword) return

    try {
      await vendorManagementApi.resetVendorPassword(vendorId, newPassword)
      toast.success('Password reset successfully')
    } catch (error) {
      handleApiError(error, 'Failed to reset password')
    }
  }

  // Delete vendor account
  const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
    if (!confirm(`Are you sure you want to delete vendor "${vendorName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await vendorManagementApi.deleteVendorAccount(vendorId)
      toast.success('Vendor account deleted')
      await loadVendorAccounts()
    } catch (error) {
      handleApiError(error, 'Failed to delete vendor account')
    }
  }

  // Filter vendor accounts
  const filteredVendors = vendorAccounts.filter(vendor => {
    const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServiceType = !selectedServiceType || vendor.service_type === selectedServiceType
    return matchesSearch && matchesServiceType
  })

  if (!user || user.role !== 'Administrator') {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Account Management</h1>
          <p className="text-accent-300">Create and manage vendor accounts for funeral service providers</p>
          <p className="text-accent-400 text-sm mt-2">Onboarding flow: vendors contact you outside the platform, and you create their account here, then share the login so they can access the vendor dashboard and manage their business.</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-accent-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              {/* Service Type Filter */}
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="px-4 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">All Service Types</option>
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vendor Account</span>
            </button>
          </div>
        </div>

        {/* Vendor Accounts List */}
        <div className="bg-accent-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-accent-300">Loading vendor accounts...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-center text-accent-300">No vendor accounts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-accent-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-700">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.vendor_id} className="hover:bg-accent-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{vendor.vendor_name}</div>
                          <div className="text-accent-400 text-sm">{vendor.contact_person}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-accent-600 text-accent-200 text-xs rounded-full">
                          {vendor.service_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-accent-300 text-sm">{vendor.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-accent-300 text-sm">{vendor.user.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {vendor.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`text-sm ${vendor.is_active ? 'text-green-400' : 'text-red-400'}`}>
                            {vendor.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-accent-300 text-sm">
                          {vendor.user.last_login ? new Date(vendor.user.last_login).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(vendor.vendor_id)}
                            className="p-1 text-accent-400 hover:text-white transition-colors"
                            title={vendor.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {vendor.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleResetPassword(vendor.vendor_id)}
                            className="p-1 text-accent-400 hover:text-white transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor.vendor_id, vendor.vendor_name)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Vendor Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-accent-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create Vendor Account</h2>
                <button
                  type="button"
                  onClick={() => setCreateFormData({
                    ...getInitialFormData(),
                    vendor_name: 'Test Funeral Home',
                    service_type: 'FUNERAL_HOME',
                    contact_person: 'John Doe',
                    phone_number: '911234567',
                    address: 'Test Address, Addis Ababa',
                    city: 'Addis Ababa',
                    description: 'Test funeral home description',
                    username: 'testvendor' + Date.now(),
                    password: 'testpass123'
                  })}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                >
                  Fill Test Data
                </button>
              </div>
              
              <form onSubmit={handleCreateVendor} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Vendor Name *</label>
                    <input
                      type="text"
                      value={createFormData.vendor_name}
                      onChange={(e) => setCreateFormData({...createFormData, vendor_name: e.target.value})}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Service Type *</label>
                    <select
                      value={createFormData.service_type}
                      onChange={(e) => setCreateFormData({...createFormData, service_type: e.target.value})}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    >
                      <option value="">Select Service Type</option>
                      {SERVICE_TYPES.map(type => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Contact Person *</label>
                    <input
                      type="text"
                      value={createFormData.contact_person}
                      onChange={(e) => setCreateFormData({...createFormData, contact_person: e.target.value})}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={createFormData.phone_number}
                      onChange={(e) => setCreateFormData({...createFormData, phone_number: e.target.value})}
                      placeholder="e.g., +251911234567 or 911234567"
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                    <p className="text-xs text-accent-400 mt-1">Must start with a digit (1-9), can include + prefix</p>
                  </div>
                </div>

                <div>
                  <label className="block text-accent-300 text-sm font-medium mb-1">Address *</label>
                  <textarea
                    value={createFormData.address}
                    onChange={(e) => setCreateFormData({...createFormData, address: e.target.value})}
                    className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={createFormData.city}
                      onChange={(e) => setCreateFormData({...createFormData, city: e.target.value})}
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-accent-300 text-sm font-medium mb-1">Delivery Areas</label>
                    <input
                      type="text"
                      value={createFormData.delivery_areas.join(', ')}
                      onChange={(e) => setCreateFormData({
                        ...createFormData,
                        delivery_areas: e.target.value
                          .split(',')
                          .map(area => area.trim())
                          .filter(area => area.length > 0)
                      })}
                      placeholder="e.g., Bole, Piassa, Sar Bet"
                      className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                    <p className="text-xs text-accent-400 mt-1">Optional: comma-separated list of areas this vendor delivers to.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-accent-300 text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-accent-300 text-sm font-medium mb-1">Business License No.</label>
                  <input
                    type="text"
                    value={createFormData.business_license_no}
                    onChange={(e) => setCreateFormData({...createFormData, business_license_no: e.target.value})}
                    className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                <div>
                  <label className="block text-accent-300 text-sm font-medium mb-1">Vendor Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setLogoFile(file)
                    }}
                    className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:bg-accent-500"
                  />
                  <p className="text-xs text-accent-400 mt-1">Optional: upload a logo to display for this vendor in the marketplace.</p>
                </div>

                <div>
                  <label className="block text-accent-300 text-sm font-medium mb-1">Verification Documents</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setDocumentFiles(files)
                    }}
                    className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:bg-accent-500"
                  />
                  <p className="text-xs text-accent-400 mt-1">Optional: upload business license and other verification documents for this vendor.</p>
                </div>

                {/* Login Credentials */}
                <div className="border-t border-accent-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3">Login Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-accent-300 text-sm font-medium mb-1">Username *</label>
                      <input
                        type="text"
                        value={createFormData.username}
                        onChange={(e) => setCreateFormData({...createFormData, username: e.target.value})}
                        placeholder="3-50 characters"
                        className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                        minLength={3}
                        maxLength={50}
                      />
                      <p className="text-xs text-accent-400 mt-1">Must be 3-50 characters long</p>
                    </div>
                    
                    <div>
                      <label className="block text-accent-300 text-sm font-medium mb-1">Password *</label>
                      <input
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 bg-accent-700 border border-accent-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-accent-400 mt-1">Must be at least 6 characters long</p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="border-t border-accent-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(createFormData.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setCreateFormData({
                            ...createFormData,
                            permissions: {
                              ...createFormData.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-accent-500 bg-accent-700 border-accent-600 rounded focus:ring-accent-500"
                        />
                        <span className="text-accent-300 text-sm">
                          {key.replace('can_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-accent-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Vendor Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
