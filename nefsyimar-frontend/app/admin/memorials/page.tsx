'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AdminMemorialCreator {
  user_id: string
  name: string
  email: string
}

interface AdminMemorial {
  memorial_id: string
  deceased_name: string
  deceased_name_amharic?: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY'
  paid_status: boolean
  is_active: boolean
  created_at: string
  view_count: number
  gift_count: number
  total_gifts_value: string
  memorial_url?: string | null
  creator?: AdminMemorialCreator
  admin_status?: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED'
}

interface AdminMemorialPagination {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export default function AdminMemorialsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [memorials, setMemorials] = useState<AdminMemorial[]>([])
  const [statusFilter, setStatusFilter] = useState<
    | 'all'
    | 'active'
    | 'inactive'
    | 'draft'
    | 'pending_review'
    | 'published'
    | 'suspended'
    | 'archived'
    | 'hidden'
    | 'sensitive'
  >('all')
  const [search, setSearch] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'any' | 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY'>('any')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'high_traffic'>('newest')
  const [pagination, setPagination] = useState<AdminMemorialPagination | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMemorials = async (page: number = 1) => {
    try {
      setIsDataLoading(true)
      setError(null)

      const statusParam = statusFilter === 'all' ? undefined : statusFilter
      const res = await adminApi.getMemorials(page, 20, statusParam, search || undefined, {
        ownerId: ownerId || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        visibility: visibilityFilter === 'any' ? undefined : visibilityFilter,
        sort,
      })
      const data = res.data?.data

      setMemorials(data?.memorials || [])
      setPagination(data?.pagination || null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load memorials')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) return

    const role = (user as any)?.role

    if (!user) {
      router.replace('/signin')
      return
    }

    if (role !== 'Administrator') {
      router.replace('/dashboard')
      return
    }

    loadMemorials(1)
  }, [user, isLoading, router])

  const role = (user as any)?.role

  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const handleDelete = async (memorialId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete (archive) this memorial?')
    if (!confirmDelete) return

    try {
      await adminApi.deleteMemorial(memorialId)
      const page = pagination?.current_page || 1
      await loadMemorials(page)
    } catch (err) {
      alert('Failed to delete memorial')
    }
  }

  const handleApplyFilters = () => {
    loadMemorials(1)
  }

  const handlePageChange = (page: number) => {
    if (!pagination) return
    if (page < 1 || page > pagination.total_pages) return
    loadMemorials(page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold mb-2">Memorial Administration</h1>
          <p className="text-accent-300">
            Review and manage all memorials on the platform. This is the admin-only view, separate from the
            public memorials listing.
          </p>
        </header>

        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm text-accent-300 mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by deceased name or Amharic name"
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm text-accent-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending review</option>
                  <option value="published">Published</option>
                  <option value="suspended">Suspended / Hidden</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm text-accent-300 mb-1">Visibility</label>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="any">Any</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="FAMILY_ONLY">Family only</option>
                </select>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm text-accent-300 mb-1">Owner user ID</label>
                <input
                  type="text"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  placeholder="Filter by owner user_id"
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="w-full md:w-64 flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-accent-300 mb-1">Created from</label>
                  <input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-accent-300 mb-1">Created to</label>
                  <input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm text-accent-300 mb-1">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="high_traffic">High traffic</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-sm font-semibold"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setOwnerId('')
                  setCreatedFrom('')
                  setCreatedTo('')
                  setVisibilityFilter('any')
                  setSort('newest')
                  loadMemorials(1)
                }}
                className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {isDataLoading && memorials.length === 0 ? (
            <p className="text-sm text-accent-300">Loading memorials...</p>
          ) : memorials.length === 0 ? (
            <p className="text-sm text-accent-300">No memorials found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">Memorial</th>
                    <th className="py-2 pr-4">Creator</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Metrics</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memorials.map((m) => {
                    const memorialLink = m.memorial_url ? `/memorials/${m.memorial_url}` : `/memorials/${m.memorial_id}`
                    return (
                      <tr key={m.memorial_id} className="border-b border-primary-700/60">
                        <td className="py-2 pr-4 align-top">
                          <div className="font-medium">{m.deceased_name}</div>
                          {m.deceased_name_amharic && (
                            <div className="text-xs text-accent-300">{m.deceased_name_amharic}</div>
                          )}
                          <div className="text-[11px] text-accent-400 mt-1">
                            {new Date(m.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          {m.creator ? (
                            <>
                              <div>{m.creator.name}</div>
                              <div className="text-[11px] text-accent-300">{m.creator.email}</div>
                            </>
                          ) : (
                            <span className="text-accent-300">Unknown</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] mr-1 bg-primary-700 text-accent-200">
                              {m.visibility}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                                m.is_active
                                  ? 'bg-emerald-600/20 text-emerald-200'
                                  : 'bg-red-700/30 text-red-200'
                              }`}
                            >
                              {m.is_active ? 'Active' : 'Archived'}
                            </span>
                          </div>
                          {m.admin_status && (
                            <div className="mt-1 text-[11px] text-accent-300">
                              Admin status: {m.admin_status}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          <div>Views: {m.view_count}</div>
                          <div>Gifts: {m.gift_count}</div>
                          <div>Total gifts: {m.total_gifts_value} ETB</div>
                        </td>
                        <td className="py-2 align-top text-xs">
                          <div className="flex flex-col gap-2">
                            <a
                              href={memorialLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded bg-primary-700 hover:bg-primary-600 text-accent-100 text-center"
                            >
                              View
                            </a>
                            <button
                              onClick={() => router.push(`/admin/memorials/${m.memorial_id}`)}
                              className="px-3 py-1 rounded bg-accent-600 hover:bg-accent-500 text-white"
                            >
                              Moderate
                            </button>
                            <button
                              onClick={() => handleDelete(m.memorial_id)}
                              className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs text-accent-300">
              <div>
                Page {pagination.current_page} of {pagination.total_pages}  b7 {pagination.total_records} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
