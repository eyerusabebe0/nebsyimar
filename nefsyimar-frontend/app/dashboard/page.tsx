'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Heart, 
  Plus, 
  Eye, 
  Calendar, 
  Settings, 
  LogOut, 
  Edit3,
  Users,
  BookOpen,
  Camera,
  Bell,
  TrendingUp,
  MessageCircle,
  Gift,
  Shield,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userDashboardApi } from '@/lib/api'

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

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()
  const [memorials, setMemorials] = useState<Memorial[]>([])
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load dashboard data
  useEffect(() => {
    if (authLoading) return

    // If not authenticated, send to signin
    if (!user) {
      router.push('/signin')
      return
    }

    // Administrators should not use the public dashboard
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
        const { memorials, stats, recent_activity } = response.data.data
        setMemorials(memorials)
        setStats(stats)
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
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.alert('Failed to delete comment')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400 mx-auto mb-4"></div>
          <p className="text-accent-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-accent-300 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors"
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
      <header className="bg-primary-800/50 backdrop-blur-lg border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-accent-400" />
              <span className="text-xl font-bold text-white">Memorial Platform</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-accent-300 hover:text-accent-200 transition-colors">
                <Bell className="w-5 h-5" />
                {stats.pending_notifications > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pending_notifications > 9 ? '9+' : stats.pending_notifications}
                  </div>
                )}
              </button>
              {stats.pending_comments > 0 && (
                <Link 
                  href="/dashboard?tab=moderation"
                  className="relative p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Pending Comments"
                >
                  <Shield className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pending_comments > 9 ? '9+' : stats.pending_comments}
                  </div>
                </Link>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-accent-300 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-accent-300">
            Manage your memorials and honor the memories of your loved ones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {user?.name}
                </h2>
                <p className="text-accent-300 text-sm">{user?.email}</p>
                {user?.phone && (
                  <p className="text-accent-400 text-sm">{user.phone}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-accent-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center text-accent-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">{stats.total_memorials} Memorial{stats.total_memorials !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-accent-300">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-sm">{stats.total_views.toLocaleString()} Total Views</span>
                </div>
                <div className="flex items-center text-accent-300">
                  <Gift className="w-4 h-4 mr-2" />
                  <span className="text-sm">{stats.total_gifts} Gifts Received</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-primary-700 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{(stats.total_views || 0).toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Gifts Received</p>
                    <p className="text-2xl font-bold text-white">{stats.total_gifts || 0}</p>
                  </div>
                  <Gift className="w-8 h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-white">{(stats.total_gifts_value || 0).toFixed(0)} ETB</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent-400" />
                </div>
              </div>
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-xl border border-primary-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">{stats.pending_comments || 0}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-accent-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/memorials/create"
                  className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <Plus className="w-6 h-6 mr-3" />
                    <div>
                      <h4 className="font-semibold">Create Memorial</h4>
                      <p className="text-sm opacity-90">Honor a loved one</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/memorials"
                  className="group bg-primary-700 hover:bg-primary-600 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <Eye className="w-6 h-6 mr-3" />
                    <div>
                      <h4 className="font-semibold">Browse Memorials</h4>
                      <p className="text-sm opacity-90">Explore memories</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/appeals"
                  className="group bg-primary-700 hover:bg-primary-600 text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <MessageCircle className="w-6 h-6 mr-3" />
                    <div>
                      <h4 className="font-semibold">Contact Admin</h4>
                      <p className="text-sm opacity-90">Send an appeal or support request</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* My Memorials */}
            <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">My Memorials</h3>
                <Link
                  href="/memorials/create"
                  className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Memorial
                </Link>
              </div>

              {memorials.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-accent-400 mx-auto mb-4 opacity-50" />
                  <p className="text-accent-300 mb-4">You haven't created any memorials yet</p>
                  <Link
                    href="/memorials/create"
                    className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Memorial
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {memorials.map((memorial) => (
                    <div
                      key={memorial.id}
                      className="bg-primary-700/50 rounded-lg p-4 hover:bg-primary-700/70 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{memorial.deceased_name}</h4>
                          {memorial.deceased_name_amharic && (
                            <p className="text-accent-400 text-sm mb-1">{memorial.deceased_name_amharic}</p>
                          )}
                          <div className="flex items-center text-sm text-accent-400 space-x-4 mb-2">
                            <span>{new Date(memorial.date_of_birth).getFullYear()} - {new Date(memorial.date_of_death).getFullYear()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              memorial.visibility === 'PUBLIC' 
                                ? 'bg-green-500/20 text-green-300' 
                                : memorial.visibility === 'PRIVATE'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {memorial.visibility === 'PUBLIC' ? 'Public' : 
                               memorial.visibility === 'PRIVATE' ? 'Private' : 'Family Only'}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-accent-500 space-x-3">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {(memorial.view_count || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Gift className="w-3 h-3 mr-1" />
                              {memorial.gift_count || 0}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {(memorial.total_gifts_value || 0).toFixed(2)} ETB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/memorials/${memorial.id}`}
                            className="p-2 text-accent-400 hover:text-accent-300 transition-colors"
                            title="View Memorial"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/memorials/${memorial.id}/edit`}
                            className="p-2 text-accent-400 hover:text-accent-300 transition-colors"
                            title="Edit Memorial"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {(recentActivity.comments.length > 0 || recentActivity.gifts.length > 0) && (
              <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Comments */}
                  {recentActivity.comments.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-accent-200 mb-4 flex items-center">
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
                                  className="flex flex-col items-center text-red-300 hover:text-red-200"
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
                      <h4 className="text-lg font-semibold text-accent-200 mb-4 flex items-center">
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
