'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AppealUser {
  user_id: string
  name: string
  email?: string
}

interface AppealSummary {
  appeal_id: string
  user_id: string
  target_type: 'MEMORIAL' | 'COMMENT' | 'USER' | 'DISPUTE' | 'ORDER' | 'OTHER'
  target_id: string
  related_report_id?: string | null
  related_dispute_id?: string | null
  reason?: string | null
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  decision?: 'UPHELD' | 'OVERTURNED' | 'PARTIALLY_OVERTURNED' | 'OTHER' | null
  resolution_notes?: string | null
  assigned_to?: string | null
  decided_by?: string | null
  decided_at?: string | null
  metadata?: any
  created_at: string
  user?: AppealUser
  assigned_to_user?: AppealUser
  decided_by_user?: AppealUser
}

interface PaginationMeta {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export default function AdminAppealsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [appeals, setAppeals] = useState<AppealSummary[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('')
  const [assignedFilter, setAssignedFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAppeals = async (targetPage: number = 1) => {
    try {
      setIsDataLoading(true)
      setError(null)

      const res = await adminApi.getAppeals({
        page: targetPage,
        limit: 20,
        status: statusFilter || undefined,
        targetType: (targetTypeFilter as any) || undefined,
        userId: userFilter || undefined,
        assignedTo: assignedFilter || undefined,
      })

      const data = res.data?.data
      let rows: AppealSummary[] = data?.appeals || []

      if (search.trim().length > 0) {
        const q = search.trim().toLowerCase()
        rows = rows.filter((a) => {
          const userName = a.user?.name || ''
          const reason = a.reason || ''
          const notes = a.resolution_notes || ''
          const idInfo = `${a.appeal_id} ${a.target_id}`
          const haystack = `${userName} ${reason} ${notes} ${idInfo}`.toLowerCase()
          return haystack.includes(q)
        })
      }

      setAppeals(rows)
      setPagination(data?.pagination || null)
      setPage(targetPage)
    } catch (err: any) {
      console.error('Failed to load appeals', err)
      setError(err?.response?.data?.message || 'Failed to load appeals')
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

    loadAppeals(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router])

  const role = (user as any)?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const handlePageChange = (target: number) => {
    if (!pagination) return
    if (target < 1 || target > pagination.total_pages) return
    loadAppeals(target)
  }

  const applyFilters = () => {
    loadAppeals(1)
  }

  const resetFilters = () => {
    setStatusFilter('PENDING')
    setTargetTypeFilter('')
    setAssignedFilter('')
    setUserFilter('')
    setSearch('')
    loadAppeals(1)
  }

  const handleView = (appealId: string) => {
    router.push(`/admin/appeals/${appealId}`)
  }

  const handleAssignToMe = async (appealId: string) => {
    if (!user) return
    try {
      await adminApi.assignAppeal(appealId, (user as any).user_id)
      await loadAppeals(page)
    } catch (err) {
      console.error('Failed to assign appeal', err)
      if (typeof window !== 'undefined') {
        window.alert('Failed to assign appeal')
      }
    }
  }

  const visibleAppeals = appeals

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  const formatTargetType = (value: string) => {
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <header>
          <h1 className='text-3xl font-bold mb-2'>Appeals & Second Look</h1>
          <p className='text-accent-300'>
            Review appeals submitted by users after moderation, account, dispute, or order decisions.
          </p>
        </header>

        <section className='bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4'>
          <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4'>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
              <div>
                <label className='block text-sm text-accent-300 mb-1'>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500'
                >
                  <option value=''>Any</option>
                  <option value='PENDING'>Pending</option>
                  <option value='IN_REVIEW'>In review</option>
                  <option value='APPROVED'>Approved</option>
                  <option value='REJECTED'>Rejected</option>
                  <option value='CANCELLED'>Cancelled</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-accent-300 mb-1'>Target type</label>
                <select
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500'
                >
                  <option value=''>Any</option>
                  <option value='MEMORIAL'>Memorial</option>
                  <option value='COMMENT'>Comment</option>
                  <option value='USER'>User account</option>
                  <option value='DISPUTE'>Dispute</option>
                  <option value='ORDER'>Order</option>
                  <option value='OTHER'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-accent-300 mb-1'>Assigned to (admin id)</label>
                <input
                  type='text'
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  placeholder='Optional admin user_id'
                  className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500'
                />
              </div>
              <div>
                <label className='block text-sm text-accent-300 mb-1'>User id</label>
                <input
                  type='text'
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder='Optional user_id'
                  className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500'
                />
              </div>
            </div>
            <div className='flex flex-col md:flex-row gap-2'>
              <div className='flex-1'>
                <label className='block text-sm text-accent-300 mb-1'>Search</label>
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='User, reason, notes, ids...'
                  className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500'
                />
              </div>
              <div className='flex md:flex-col gap-2 md:justify-end pt-1 md:pt-0'>
                <button
                  onClick={applyFilters}
                  className='px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-sm font-semibold'
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className='px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm'
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className='text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2'>
              {error}
            </div>
          )}

          {isDataLoading && visibleAppeals.length === 0 ? (
            <p className='text-sm text-accent-300'>Loading appeals...</p>
          ) : visibleAppeals.length === 0 ? (
            <p className='text-sm text-accent-300'>No appeals found for this filter.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead className='text-left text-accent-300 border-b border-primary-700'>
                  <tr>
                    <th className='py-2 pr-4'>Appeal</th>
                    <th className='py-2 pr-4'>User</th>
                    <th className='py-2 pr-4'>Target</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppeals.map((a) => (
                    <tr key={a.appeal_id} className='border-b border-primary-700/60 align-top'>
                      <td className='py-2 pr-4 max-w-xs text-xs'>
                        <div className='font-medium'>{formatTargetType(a.target_type)} appeal</div>
                        {a.reason && (
                          <div className='text-[11px] text-accent-200 mt-1 whitespace-pre-wrap break-words'>
                            {a.reason}
                          </div>
                        )}
                        <div className='text-[11px] text-accent-400 mt-1'>
                          appeal_id: {a.appeal_id}
                        </div>
                        <div className='text-[11px] text-accent-400'>
                          Created: {formatDateTime(a.created_at)}
                        </div>
                      </td>
                      <td className='py-2 pr-4 text-xs'>
                        <div>{a.user?.name || a.user_id}</div>
                        {a.user?.email && (
                          <div className='text-[11px] text-accent-300'>{a.user.email}</div>
                        )}
                      </td>
                      <td className='py-2 pr-4 text-xs'>
                        <div className='text-[11px] text-accent-300'>target_id: {a.target_id}</div>
                        {a.related_report_id && (
                          <div className='text-[11px] text-accent-400 mt-1'>
                            related_report_id: {a.related_report_id}
                          </div>
                        )}
                        {a.related_dispute_id && (
                          <div className='text-[11px] text-accent-400 mt-1'>
                            related_dispute_id: {a.related_dispute_id}
                          </div>
                        )}
                      </td>
                      <td className='py-2 pr-4 text-xs'>
                        <div>
                          <span className='inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 text-[11px]'>
                            {a.status}
                          </span>
                        </div>
                        {a.decision && (
                          <div className='text-[11px] text-accent-300 mt-1'>Decision: {a.decision}</div>
                        )}
                        {a.decided_at && (
                          <div className='text-[11px] text-accent-400 mt-1'>
                            Decided: {formatDateTime(a.decided_at)}
                          </div>
                        )}
                        <div className='text-[11px] text-accent-300 mt-1'>
                          Assigned:{' '}
                          {a.assigned_to_user
                            ? a.assigned_to_user.name
                            : a.assigned_to
                            ? a.assigned_to
                            : 'Unassigned'}
                        </div>
                      </td>
                      <td className='py-2 text-xs'>
                        <div className='flex flex-col gap-1'>
                          <button
                            onClick={() => handleView(a.appeal_id)}
                            className='text-[11px] px-3 py-1 rounded bg-primary-700 hover:bg-primary-600'
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleAssignToMe(a.appeal_id)}
                            className='text-[11px] px-3 py-1 rounded bg-primary-700 hover:bg-primary-600'
                          >
                            Assign to me
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className='flex items-center justify-between pt-3 text-xs text-accent-300'>
              <div>
                Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_records} records
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className='px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500'
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className='px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500'
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
