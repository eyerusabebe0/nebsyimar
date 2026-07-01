'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Heart, 
  Plus, 
  Eye, 
  Calendar, 
  LogOut, 
  Edit3,
  BookOpen,
  Bell,
  TrendingUp,
  MessageCircle,
  Gift,
  Shield,
  Plane,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api, { userDashboardApi } from '@/lib/api'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  joinedDate: string
}

interface Memorial {
  id: string
  deceased_name: string
  deceased_name_amharic?: string
  date_of_birth: string
  date_of_death: string
  profile_image?: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY'
  view_count: number
  gift_count: number
  total_gifts_value: number
  created_at: string
  memorial_settings: any
}

interface DashboardStats {
  total_memorials: number
  total_views: number
  total_gifts: number
  total_gifts_value: number
  pending_notifications: number
  pending_comments: number
}

interface RecentActivity {
  comments: Array<{
    id: string
    message: string
    author_name: string
    memorial_name: string
    memorial_id: string
    created_at: string
  }>
  gifts: Array<{
    id: string
    gift_type: string
    amount: number
    sender_name: string
    memorial_name: string
    memorial_id: string
    created_at: string
  }>
}

interface BodyShippingRequest {
  id: string
  deceased_full_name: string
  current_location_body?: string
  receiver_full_name?: string
  status: string
  submitted_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || ''
  const resolveImage = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    return `${apiOrigin}${path}`
  }
  const [stats, setStats] = useState<DashboardStats>({
    total_memorials: 0,
    total_views: 0,
    total_gifts: 0,
    total_gifts_value: 0,
    pending_notifications: 0,
    pending_comments: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    comments: [],
    gifts: []
  })
  const [bodyShippingRequests, setBodyShippingRequests] = useState<BodyShippingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/signin')
      return
    }

    if (user.role === 'Administrator') {
      router.replace('/admin')
      return
    }

    if (user.role === 'Vendor') {
      router.replace('/vendor')
      return
    }

    loadDashboardData()
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await userDashboardApi.getDashboardData()
      
      if (response.data.success) {
        const { memorials, stats, body_shipping_requests, recent_activity } = response.data.data
        setMemorials(memorials)
        setStats(stats)
        setBodyShippingRequests(body_shipping_requests || [])
        setRecentActivity(recent_activity)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err: any) {
      console.error('Dashboard loading error:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMemorial = async (memorialId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to permanently delete this memorial?')
      if (!confirmed) return
    }

    try {
      if (typeof userDashboardApi.deleteMemorial === 'function') {
        await userDashboardApi.deleteMemorial(memorialId)
      } else {
        await api.delete(`/memorials/${memorialId}`)
      }

      setMemorials((prev) => prev.filter((m) => m.id !== memorialId))
      setStats((prev) => ({
        ...prev,
        total_memorials: Math.max(0, prev.total_memorials - 1)
      }))
      toast.success('Memorial successfully deleted.')
    } catch (err: any) {
      console.error('Failed to delete memorial:', err)
      const msg = err.response?.data?.message || 'Failed to delete memorial. Please try again.'
      toast.error(msg)
    }
  }

  const handleDeleteBodyShipping = async (submissionId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this body shipping request?')
      if (!confirmed) return
    }

    try {
      await userDashboardApi.deleteRepatriationSubmission(submissionId)
      setBodyShippingRequests((prev) => prev.filter((submission) => submission.id !== submissionId))
      toast.success('Body shipping request deleted.')
    } catch (err: any) {
      console.error('Failed to delete body shipping request:', err)
      toast.error(err.response?.data?.message || 'Failed to delete body shipping request.')
    }
  }

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  const handleDeleteRecentComment = async (commentId: string, memorialId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this comment?')
      if (!confirmed) return
    }

    try {
      await userDashboardApi.deleteComment(memorialId, commentId)
      setRecentActivity((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment.id !== commentId),
      }))
      toast.success('Comment deleted.')
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.alert('Failed to delete comment')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400 mx-auto mb-4"></div>
          <p className="text-accent-300 text-sm lg:text-base">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-accent-300 text-sm lg:text-base mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      {/* Header */}
      <header className="bg-primary-800/50 backdrop-blur-lg border-b border-primary-700/50 sticky top-0 z-20 lg:static">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1.5 lg:space-x-2">
              <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-accent-400" />
              <span className="text-base lg:text-xl font-bold text-white">Memorial Platform</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button className="relative p-1.5 lg:p-2 text-accent-300 hover:text-accent-200 active:scale-90 transition-all">
                <Bell className="w-5 h-5" />
                {stats.pending_notifications > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] lg:text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                    {stats.pending_notifications > 9 ? '9+' : stats.pending_notifications}
                  </div>
                )}
              </button>
              {stats.pending_comments > 0 && (
                <Link 
                  href="/dashboard?tab=moderation"
                  className="relative p-1.5 lg:p-2 text-blue-400 hover:text-blue-300 active:scale-90 transition-all"
                  title="Pending Comments"
                >
                  <Shield className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] lg:text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                    {stats.pending_comments > 9 ? '9+' : stats.pending_comments}
                  </div>
                </Link>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center ring-2 ring-accent-400/30 lg:ring-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden lg:inline text-white font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 lg:p-2 text-accent-300 hover:text-red-400 active:scale-90 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-accent-300 text-sm lg:text-base">
            Manage your memorials and honor the memories of your loved ones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-5 lg:p-6">
              <div className="text-center mb-5 lg:mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 ring-4 ring-accent-400/20">
                  <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h2 className="text-lg lg:text-xl font-bold text-white mb-1">
                  {user?.name}
                </h2>
                <p className="text-accent-300 text-sm">{user?.email}</p>
                {user?.phone && (
                  <p className="text-accent-400 text-sm">{user.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-0 lg:space-y-3">
                <div className="flex items-center text-accent-300 bg-primary-700/30 lg:bg-transparent rounded-lg p-2 lg:p-0">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center text-accent-300 bg-primary-700/30 lg:bg-transparent rounded-lg p-2 lg:p-0">
                  <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">{stats.total_memorials} Memorial{stats.total_memorials !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-accent-300 bg-primary-700/30 lg:bg-transparent rounded-lg p-2 lg:p-0">
                  <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">{stats.total_views.toLocaleString()} Total Views</span>
                </div>
                <div className="flex items-center text-accent-300 bg-primary-700/30 lg:bg-transparent rounded-lg p-2 lg:p-0">
                  <Gift className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">{stats.total_gifts} Gifts Received</span>
                </div>
              </div>

              <button className="w-full mt-5 lg:mt-6 bg-primary-700 hover:bg-primary-600 active:scale-[0.98] text-white py-2.5 lg:py-2 px-4 rounded-lg transition-all flex items-center justify-center text-sm lg:text-base">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-xs lg:text-sm">Total Views</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{(stats.total_views || 0).toLocaleString()}</p>
                  </div>
                  <Eye className="w-6 h-6 lg:w-8 lg:h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-xs lg:text-sm">Gifts Received</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{stats.total_gifts || 0}</p>
                  </div>
                  <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-xs lg:text-sm">Total Value</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{(stats.total_gifts_value || 0).toFixed(0)} ETB</p>
                  </div>
                  <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-xs lg:text-sm">Pending</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{stats.pending_comments || 0}</p>
                  </div>
                  <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 text-accent-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-5 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                <Link
                  href="/memorials/create"
                  className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 active:scale-[0.98] text-white p-4 rounded-lg transition-all duration-300 lg:transform lg:hover:scale-105"
                >
                  <div className="flex items-center">
                    <Plus className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base">Create Memorial</h4>
                      <p className="text-xs lg:text-sm opacity-90">Honor a loved one</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/memorials"
                  className="group bg-primary-700 hover:bg-primary-600 active:scale-[0.98] text-white p-4 rounded-lg transition-all duration-300 lg:transform lg:hover:scale-105"
                >
                  <div className="flex items-center">
                    <Eye className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base">Browse Memorials</h4>
                      <p className="text-xs lg:text-sm opacity-90">Explore memories</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/repatriation"
                  className="group bg-primary-700 hover:bg-primary-600 active:scale-[0.98] text-white p-4 rounded-lg transition-all duration-300 lg:transform lg:hover:scale-105"
                >
                  <div className="flex items-center">
                    <Plane className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base">Body Shipping</h4>
                      <p className="text-xs lg:text-sm opacity-90">Submit a repatriation request</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/appeals"
                  className="group bg-primary-700 hover:bg-primary-600 active:scale-[0.98] text-white p-4 rounded-lg transition-all duration-300 lg:transform lg:hover:scale-105"
                >
                  <div className="flex items-center">
                    <MessageCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base">Contact Admin</h4>
                      <p className="text-xs lg:text-sm opacity-90">Send an appeal or support request</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Body Shipping Requests */}
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-white">Body Shipping Requests</h3>
                  <p className="text-accent-400 text-sm">Manage your submitted repatriation requests</p>
                </div>
                <Link
                  href="/repatriation"
                  className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 active:scale-95 text-white px-4 py-2 rounded-lg text-sm lg:text-base transition-all"
                >
                  New Request
                </Link>
              </div>
              {bodyShippingRequests.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-primary-700 rounded-2xl">
                  <p className="text-accent-300 text-sm lg:text-base mb-4">No body shipping requests have been submitted yet.</p>
                  <Link
                    href="/repatriation"
                    className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 active:scale-95 text-white px-5 py-2 rounded-lg text-sm lg:text-base transition-all"
                  >
                    Submit Body Shipping Request
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bodyShippingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-primary-700/60 border border-primary-600 rounded-2xl p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h4 className="text-white font-semibold text-base truncate">{request.deceased_full_name}</h4>
                          <p className="text-accent-300 text-sm mt-1">
                            Submitted {new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                          <p className="text-accent-300 text-sm mt-1">
                            Location: {request.current_location_body || 'Not specified'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          request.status === 'APPROVED' ? 'bg-green-500/20 text-green-200' :
                          request.status === 'DECLINED' ? 'bg-red-500/20 text-red-200' :
                          'bg-yellow-400/15 text-yellow-200'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-1 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <Link
                          href={`/repatriation?submissionId=${request.id}`}
                          className="p-2 rounded-lg text-accent-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                          title="Edit Request"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteBodyShipping(request.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-90 transition-all"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Memorials */}
        {/* My Memorials */}
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-5 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-white">My Memorials</h3>
                <Link
                  href="/memorials/create"
                  className="bg-accent-500 hover:bg-accent-600 active:scale-95 text-white px-3 py-2 lg:px-4 rounded-lg transition-all flex items-center text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4 mr-1.5 lg:mr-2" />
                  <span className="hidden sm:inline">New </span>Memorial
                </Link>
              </div>

              {memorials.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-accent-400 mx-auto mb-4 opacity-50" />
                  <p className="text-accent-300 text-sm lg:text-base mb-4">You haven't created any memorials yet</p>
                  <Link
                    href="/memorials/create"
                    className="bg-accent-500 hover:bg-accent-600 active:scale-95 text-white px-6 py-2.5 lg:py-2 rounded-lg transition-all inline-flex items-center text-sm lg:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Memorial
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {memorials.map((memorial) => (
                    <div
                      key={memorial.id}
                      className="group relative rounded-2xl p-4 sm:p-5 overflow-hidden transition-all duration-300 active:scale-[0.98] lg:hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(150deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
                        border: '1px solid rgba(212,168,83,0.18)',
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }}
                      />

                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="relative flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden"
                          style={{ boxShadow: 'inset 0 0 0 1px rgba(212,168,83,0.25)' }}
                        >
                          <img
                            src={resolveImage(memorial.profile_image)}
                            alt={memorial.deceased_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-white text-sm sm:text-base mb-0.5 truncate">
                            {memorial.deceased_name}
                          </h4>
                          {memorial.deceased_name_amharic && (
                            <p className="text-accent-400 text-xs sm:text-sm mb-1 truncate">
                              {memorial.deceased_name_amharic}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] sm:text-xs text-accent-400">
                              {new Date(memorial.date_of_birth).getFullYear()} – {new Date(memorial.date_of_death).getFullYear()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              memorial.visibility === 'PUBLIC' ? 'bg-green-500/20 text-green-300' :
                              memorial.visibility === 'PRIVATE' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {memorial.visibility === 'PUBLIC' ? 'Public' : memorial.visibility === 'PRIVATE' ? 'Private' : 'Family Only'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="rounded-lg py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="flex items-center justify-center gap-1 text-accent-300 mb-0.5">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-white text-xs sm:text-sm font-semibold">{(memorial.view_count || 0).toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="flex items-center justify-center gap-1 text-accent-300 mb-0.5">
                            <Gift className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-white text-xs sm:text-sm font-semibold">{memorial.gift_count || 0}</p>
                        </div>
                        <div className="rounded-lg py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="flex items-center justify-center gap-1 text-accent-300 mb-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-white text-xs sm:text-sm font-semibold">{(memorial.total_gifts_value || 0).toFixed(0)} ETB</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <Link
                          href={`/memorials/${memorial.id}`}
                          className="p-2 rounded-lg text-accent-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                          title="View Memorial"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/memorials/${memorial.id}/edit`}
                          className="p-2 rounded-lg text-accent-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                          title="Edit Memorial"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemorial(memorial.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-90 transition-all"
                          title="Delete Memorial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {(recentActivity.comments.length > 0 || recentActivity.gifts.length > 0) && (
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-5 lg:p-6">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-5 lg:mb-6">Recent Activity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  {/* Recent Comments */}
                  {recentActivity.comments.length > 0 && (
                    <div>
                      <h4 className="text-base lg:text-lg font-semibold text-accent-200 mb-3 lg:mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Recent Comments
                      </h4>
                      <div className="space-y-3">
                        {recentActivity.comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="bg-primary-700/50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-accent-300 font-medium text-sm">{comment.author_name}</span>
                              <div className="flex items-center space-x-2 text-xs text-accent-500">
                                <span>
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecentComment(comment.id, comment.memorial_id)}
                                  className="flex flex-col items-center text-red-300 hover:text-red-200 active:scale-90 transition-all"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-[10px] leading-tight mt-0.5">Delete</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-accent-300 text-sm line-clamp-2 mb-2">
                              {comment.message}
                            </p>
                            <Link
                              href={`/memorials/${comment.memorial_id}`}
                              className="text-accent-400 hover:text-accent-300 text-xs"
                            >
                              On {comment.memorial_name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Gifts */}
                  {recentActivity.gifts.length > 0 && (
                    <div>
                      <h4 className="text-base lg:text-lg font-semibold text-accent-200 mb-3 lg:mb-4 flex items-center">
                        <Gift className="w-5 h-5 mr-2" />
                        Recent Gifts
                      </h4>
                      <div className="space-y-3">
                        {recentActivity.gifts.slice(0, 3).map((gift) => (
                          <div key={gift.id} className="bg-primary-700/50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-accent-300 font-medium text-sm">{gift.sender_name}</span>
                              <span className="text-accent-500 text-xs">
                                {new Date(gift.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-accent-400 text-sm capitalize">{gift.gift_type}</span>
                              <span className="text-green-400 font-medium text-sm">{gift.amount} ETB</span>
                            </div>
                            <Link
                              href={`/memorials/${gift.memorial_id}`}
                              className="text-accent-400 hover:text-accent-300 text-xs"
                            >
                              For {gift.memorial_name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}