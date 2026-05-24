"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AdminCommentAuthor {
  user_id: string
  name: string
  email?: string
}

interface AdminCommentMemorial {
  memorial_id: string
  deceased_name: string
}

interface AdminComment {
  comment_id: string
  memorial_id: string
  user_id: string
  message: string
  visibility: string
  is_deleted: boolean
  created_at: string
  author?: AdminCommentAuthor
  memorial?: AdminCommentMemorial
  report_count?: number
  last_report_at?: string | null
}

interface AdminCommentPagination {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export default function AdminCommentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [comments, setComments] = useState<AdminComment[]>([])
  const [pagination, setPagination] = useState<AdminCommentPagination | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [queue, setQueue] = useState<'PENDING' | 'REJECTED' | 'REPORTED' | 'RECENT'>('RECENT')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [memorialId, setMemorialId] = useState('')
  const [userId, setUserId] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const loadComments = async (page: number = 1) => {
    try {
      setIsDataLoading(true)
      setError(null)

      const res = await adminApi.getCommentsQueue({
        page,
        limit: 50,
        queue,
        memorialId: memorialId || undefined,
        userId: userId || undefined,
        status: statusFilter || undefined,
      })

      const data = res.data?.data
      setComments(data?.comments || [])
      setPagination(data?.pagination || null)
      setSelectedIds([])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load comments')
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

    loadComments(1)
  }, [user, isLoading, router])

  const role = user?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const handlePageChange = (page: number) => {
    if (!pagination) return
    if (page < 1 || page > pagination.total_pages) return
    loadComments(page)
  }

  const toggleSelect = (commentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
    )
  }

  const selectAllVisible = () => {
    setSelectedIds(comments.map((c) => c.comment_id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const runBulkAction = async (
    action: 'APPROVE' | 'REJECT' | 'DELETE' | 'BAN_USER_AND_DELETE_RECENT',
  ) => {
    if (!selectedIds.length) {
      alert('Select at least one comment first')
      return
    }

    let confirmation = ''
    if (action === 'APPROVE') confirmation = 'Approve selected comments?'
    if (action === 'REJECT') confirmation = 'Reject (mark as REJECTED) selected comments?'
    if (action === 'DELETE') confirmation = 'Soft-delete selected comments?'
    if (action === 'BAN_USER_AND_DELETE_RECENT') {
      confirmation =
        'Ban the authors of selected comments and remove their recent comments? This is irreversible.'
    }

    if (typeof window !== 'undefined' && !window.confirm(confirmation)) {
      return
    }

    let days: number | undefined
    if (action === 'BAN_USER_AND_DELETE_RECENT') {
      const value = window.prompt('Delete comments from how many past days? (default 30)', '30')
      if (value) {
        const parsed = parseInt(value, 10)
        if (!isNaN(parsed) && parsed > 0) {
          days = parsed
        }
      }
    }

    try {
      await adminApi.bulkModerateComments({
        commentIds: selectedIds,
        action,
        days,
      })
      const page = pagination?.current_page || 1
      await loadComments(page)
    } catch (err) {
      console.error('Bulk moderation failed', err)
      alert('Failed to apply bulk action')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold mb-2">Global Comment Moderation</h1>
          <p className="text-accent-300">
            Review, filter, and take bulk actions on comments across all memorials.
          </p>
        </header>

        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-full md:w-40">
                <label className="block text-sm text-accent-300 mb-1">Queue</label>
                <select
                  value={queue}
                  onChange={(e) => setQueue(e.target.value as typeof queue)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="REPORTED">Reported</option>
                  <option value="RECENT">Recent</option>
                </select>
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm text-accent-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-accent-300 mb-1">Memorial ID</label>
                <input
                  type="text"
                  value={memorialId}
                  onChange={(e) => setMemorialId(e.target.value)}
                  placeholder="Filter by memorial_id"
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-accent-300 mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Filter by user_id"
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => loadComments(1)}
                className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-sm font-semibold"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setQueue('RECENT')
                  setStatusFilter('')
                  setMemorialId('')
                  setUserId('')
                  loadComments(1)
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-accent-300">
            <div>
              Selected: {selectedIds.length}
              {selectedIds.length > 0 && (
                <button onClick={clearSelection} className="ml-2 underline">
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAllVisible}
                className="px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
              >
                Select all on page
              </button>
              <button
                onClick={() => runBulkAction('DELETE')}
                className="px-3 py-1 rounded bg-red-700 hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => runBulkAction('BAN_USER_AND_DELETE_RECENT')}
                className="px-3 py-1 rounded bg-red-900 hover:bg-red-800"
              >
                Ban user & delete recent
              </button>
            </div>
          </div>

          {isDataLoading && comments.length === 0 ? (
            <p className="text-sm text-accent-300">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-accent-300">No comments found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-2 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="py-2 pr-4">Comment</th>
                    <th className="py-2 pr-4">Author</th>
                    <th className="py-2 pr-4">Memorial</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c) => {
                    const isSelected = selectedIds.includes(c.comment_id)
                    return (
                      <tr key={c.comment_id} className="border-b border-primary-700/60">
                        <td className="py-2 pr-2 align-top">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(c.comment_id)}
                          />
                        </td>
                        <td className="py-2 pr-4 align-top text-xs max-w-md">
                          <div className="whitespace-pre-wrap break-words text-accent-100">
                            {c.message}
                          </div>
                          <div className="text-[11px] text-accent-400 mt-1">
                            {new Date(c.created_at).toLocaleString()} • ID: {c.comment_id}
                          </div>
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          {c.author ? (
                            <>
                              <div>{c.author.name}</div>
                              <div className="text-[11px] text-accent-300">{c.author.email}</div>
                              <div className="text-[11px] text-accent-400 mt-1">user_id: {c.user_id}</div>
                            </>
                          ) : (
                            <span className="text-accent-300">Unknown</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          {c.memorial ? (
                            <>
                              <div>{c.memorial.deceased_name}</div>
                              <div className="text-[11px] text-accent-400 mt-1">memorial_id: {c.memorial_id}</div>
                            </>
                          ) : (
                            <div className="text-[11px] text-accent-400">memorial_id: {c.memorial_id}</div>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-primary-700 text-accent-200">
                              {c.visibility}
                            </span>
                          </div>
                          {c.is_deleted && (
                            <div className="mt-1 text-[11px] text-red-300">Deleted</div>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top text-xs">
                          {c.report_count ? (
                            <div>
                              <div>{c.report_count} reports</div>
                              {c.last_report_at && (
                                <div className="text-[11px] text-accent-400">
                                  last: {new Date(c.last_report_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-accent-400">No open reports</span>
                          )}
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
                Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_records} records
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
