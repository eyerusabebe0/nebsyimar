'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AdminUserDetail {
  user_id: string
  name: string
  email?: string | null
  phone?: string | null
  role: string
  is_active: boolean
  is_banned?: boolean
  ban_reason?: string | null
  gender?: string | null
  city?: string | null
  country?: string | null
  last_login?: string | null
  can_create_memorials?: boolean
  can_comment?: boolean
  wallet?: {
    wallet_id: string
    balance: string
    is_frozen: boolean
    frozen_reason?: string | null
  }
}

interface AdminUserStats {
  memorial_count: number
  comment_count: number
  total_donations_sent: number
  total_donations_received: number
}

interface AdminUserStatusHistoryItem {
  id: string
  user_id: string
  changed_by: string
  action: 'DEACTIVATE' | 'REACTIVATE' | 'BAN' | 'UNBAN'
  reason?: string | null
  note?: string | null
  previous_is_active: boolean
  previous_is_banned: boolean
  new_is_active: boolean
  new_is_banned: boolean
  created_at: string
  changed_by_user?: {
    user_id: string
    name: string
    email?: string
  }
}

interface PaginationMeta {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

interface AdminUserMemorialSummary {
  memorial_id: string
  deceased_name: string
  deceased_name_amharic?: string | null
  visibility: string
  paid_status?: boolean
  is_active?: boolean
  is_hidden_by_admin?: boolean
  created_at: string
}

interface AdminUserCommentSummary {
  comment_id: string
  memorial_id: string
  message: string
  visibility: string
  is_deleted: boolean
  created_at: string
  memorial?: {
    memorial_id: string
    deceased_name: string
  }
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()

  const userId = (params?.userId as string) || ''

  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [stats, setStats] = useState<AdminUserStats | null>(null)
  const [history, setHistory] = useState<AdminUserStatusHistoryItem[]>([])
  const [historyPagination, setHistoryPagination] = useState<PaginationMeta | null>(null)
  const [memorials, setMemorials] = useState<AdminUserMemorialSummary[]>([])
  const [memorialsPagination, setMemorialsPagination] = useState<PaginationMeta | null>(null)
  const [comments, setComments] = useState<AdminUserCommentSummary[]>([])
  const [commentsPagination, setCommentsPagination] = useState<PaginationMeta | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const isSuperAdmin =
    (user as any)?.role === 'Administrator' &&
    (user as any)?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL

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

    if (!userId) {
      setError('Missing user identifier')
      setLoading(false)
      return
    }

    const loadAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const [detailRes, historyRes, memRes, comRes] = await Promise.all([
          adminApi.getUser(userId),
          adminApi.getUserStatusHistory(userId, 1, 10),
          adminApi.getUserMemorials(userId, 1, 10),
          adminApi.getUserComments(userId, 1, 10),
        ])

        const d = detailRes.data?.data
        setDetail(d?.user || null)
        setStats(d?.stats || null)

        const hData = historyRes.data?.data
        setHistory(hData?.history || [])
        setHistoryPagination(hData?.pagination || null)

        const mData = memRes.data?.data
        setMemorials(mData?.memorials || [])
        setMemorialsPagination(mData?.pagination || null)

        const cData = comRes.data?.data
        setComments(cData?.comments || [])
        setCommentsPagination(cData?.pagination || null)
      } catch (err: any) {
        console.error('Failed to load user detail', err)
        setError(err?.response?.data?.message || 'Failed to load user detail')
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [user, isLoading, router, userId])

  const role = (user as any)?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const refreshDetail = async () => {
    if (!userId) return
    try {
      const res = await adminApi.getUser(userId)
      const d = res.data?.data
      setDetail(d?.user || null)
      setStats(d?.stats || null)
    } catch (err) {
      console.error('Failed to refresh user detail', err)
    }
  }

  const refreshHistoryPage = async (page: number) => {
    try {
      const res = await adminApi.getUserStatusHistory(userId, page, 10)
      const hData = res.data?.data
      setHistory(hData?.history || [])
      setHistoryPagination(hData?.pagination || null)
    } catch (err) {
      console.error('Failed to refresh status history', err)
    }
  }

  const refreshMemorialsPage = async (page: number) => {
    try {
      const res = await adminApi.getUserMemorials(userId, page, 10)
      const data = res.data?.data
      setMemorials(data?.memorials || [])
      setMemorialsPagination(data?.pagination || null)
    } catch (err) {
      console.error('Failed to refresh user memorials', err)
    }
  }

  const refreshCommentsPage = async (page: number) => {
    try {
      const res = await adminApi.getUserComments(userId, page, 10)
      const data = res.data?.data
      setComments(data?.comments || [])
      setCommentsPagination(data?.pagination || null)
    } catch (err) {
      console.error('Failed to refresh user comments', err)
    }
  }

  const withConfirm = async (label: string, fn: () => Promise<void>) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(label)
      if (!ok) return
    }
    await fn()
  }

  const handleDeactivate = async () => {
    if (!detail) return
    await withConfirm('Deactivate this user account?', async () => {
      try {
        setBusyAction('deactivate')
        const reason =
          (typeof window !== 'undefined' &&
            window.prompt('Reason for deactivation (optional):', 'Admin action')) || undefined
        await adminApi.deactivateUser(detail.user_id, reason)
        await refreshDetail()
      } catch (err) {
        console.error('Failed to deactivate user', err)
        typeof window !== 'undefined' && window.alert('Failed to deactivate user')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleReactivate = async () => {
    if (!detail) return
    await withConfirm('Reactivate this user account?', async () => {
      try {
        setBusyAction('reactivate')
        const note =
          (typeof window !== 'undefined' && window.prompt('Note for reactivation (optional):', '')) || undefined
        await adminApi.reactivateUser(detail.user_id, note)
        await refreshDetail()
      } catch (err) {
        console.error('Failed to reactivate user', err)
        typeof window !== 'undefined' && window.alert('Failed to reactivate user')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleBan = async () => {
    if (!detail) return
    await withConfirm('Permanently ban this user?', async () => {
      try {
        setBusyAction('ban')
        const reason =
          (typeof window !== 'undefined' &&
            window.prompt('Reason for ban:', 'Severe abuse or policy violation')) || 'Banned by admin'
        await adminApi.banUser(detail.user_id, reason)
        await refreshDetail()
      } catch (err) {
        console.error('Failed to ban user', err)
        typeof window !== 'undefined' && window.alert('Failed to ban user')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleUnban = async () => {
    if (!detail) return
    await withConfirm('Unban and reactivate this user?', async () => {
      try {
        setBusyAction('unban')
        const reason =
          (typeof window !== 'undefined' &&
            window.prompt('Optional note for unban/reactivation:', '')) || undefined
        await adminApi.unbanUser(detail.user_id, reason)
        await refreshDetail()
      } catch (err) {
        console.error('Failed to unban user', err)
        typeof window !== 'undefined' && window.alert('Failed to unban user')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleToggleMemorialPermission = async () => {
    if (!detail) return
    const currentlyBlocked = detail.can_create_memorials === false
    await withConfirm(
      currentlyBlocked
        ? 'Allow this user to create new memorials again?'
        : 'Block this user from creating new memorials?',
      async () => {
        try {
          setBusyAction('memorial-permission')
          await adminApi.updateUserRestrictions(detail.user_id, {
            canCreateMemorials: currentlyBlocked,
          })
          await refreshDetail()
        } catch (err) {
          console.error('Failed to update memorial permission', err)
          typeof window !== 'undefined' && window.alert('Failed to update memorial permission')
        } finally {
          setBusyAction(null)
        }
      },
    )
  }

  const handleToggleCommentPermission = async () => {
    if (!detail) return
    const currentlyBlocked = detail.can_comment === false
    await withConfirm(
      currentlyBlocked ? 'Allow this user to comment again?' : 'Block this user from commenting?',
      async () => {
        try {
          setBusyAction('comment-permission')
          await adminApi.updateUserRestrictions(detail.user_id, {
            canComment: currentlyBlocked,
          })
          await refreshDetail()
        } catch (err) {
          console.error('Failed to update comment permission', err)
          typeof window !== 'undefined' && window.alert('Failed to update comment permission')
        } finally {
          setBusyAction(null)
        }
      },
    )
  }

  const handleImpersonate = async () => {
    if (!detail || !isSuperAdmin) return
    await withConfirm('View the platform as this user in read-only mode?', async () => {
      try {
        setBusyAction('impersonate')
        const res = await adminApi.impersonateUser(detail.user_id)
        const token: string | undefined = res.data?.data?.token
        if (!token) {
          typeof window !== 'undefined' && window.alert('Failed to start impersonation: no token returned')
          return
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('nefsyimar_impersonation_token', token)
        }
        router.push('/dashboard')
      } catch (err) {
        console.error('Failed to impersonate user', err)
        typeof window !== 'undefined' && window.alert('Failed to impersonate user')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleExport = async () => {
    if (!detail) return
    await withConfirm('Generate export of this user\'s data?', async () => {
      try {
        setBusyAction('export')
        const reason =
          (typeof window !== 'undefined' &&
            window.prompt('Reason for export (for audit trail):', 'Support / compliance request')) || undefined
        const res = await adminApi.exportUserData(detail.user_id, reason)
        const data = res.data?.data
        if (typeof window !== 'undefined') {
          console.log('User export data:', data)
          window.alert('User data export generated (check console for JSON payload).')
        }
      } catch (err) {
        console.error('Failed to export user data', err)
        typeof window !== 'undefined' && window.alert('Failed to export user data')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleAnonymize = async () => {
    if (!detail || !isSuperAdmin) return
    await withConfirm(
      'Anonymize this user? This will scrub identifying info but keep memorials/comments as anonymized.',
      async () => {
        try {
          setBusyAction('anonymize')
          const reason =
            (typeof window !== 'undefined' &&
              window.prompt('Reason for anonymization:', 'User data deletion / privacy request')) || undefined
          const legalNote =
            (typeof window !== 'undefined' &&
              window.prompt('Internal legal note (optional):', '')) || undefined
          await adminApi.anonymizeUser(detail.user_id, { reason, legalNote })
          await refreshDetail()
        } catch (err) {
          console.error('Failed to anonymize user', err)
          typeof window !== 'undefined' && window.alert('Failed to anonymize user')
        } finally {
          setBusyAction(null)
        }
      },
    )
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  const formatAmount = (value?: number) => {
    if (value === undefined || value === null) return '0.00'
    return value.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">User Case View</h1>
            <p className="text-accent-300 text-sm">
              Inspect this user\'s profile, memorials, comments, and moderation history.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
          >
            Back to users
          </button>
        </header>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading && !detail ? (
          <div className="text-sm text-accent-200">Loading user...</div>
        ) : !detail ? (
          <div className="text-sm text-accent-200">User not found.</div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-accent-300 mb-1">User</div>
                      <div className="text-xl font-semibold">{detail.name}</div>
                      {detail.email && (
                        <div className="text-sm text-accent-200 mt-1">{detail.email}</div>
                      )}
                      {detail.phone && (
                        <div className="text-xs text-accent-300 mt-1">{detail.phone}</div>
                      )}
                      <div className="text-xs text-accent-400 mt-2">user_id: {detail.user_id}</div>
                      <div className="text-xs text-accent-400 mt-1">
                        Role: {detail.role} • Last login: {formatDateTime(detail.last_login)}
                      </div>
                    </div>
                    <div className="text-right space-y-1 text-xs">
                      <div>
                        {detail.is_banned ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-red-800/80 text-red-100 mr-1">
                            Banned
                          </span>
                        ) : detail.is_active ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 mr-1">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-700/80 text-yellow-100 mr-1">
                            Deactivated
                          </span>
                        )}
                        {detail.gender && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200">
                            {detail.gender}
                          </span>
                        )}
                      </div>
                      {detail.ban_reason && (
                        <div className="text-[11px] text-red-200 max-w-xs ml-auto mt-1">
                          Ban reason: {detail.ban_reason}
                        </div>
                      )}
                      <div className="text-[11px] text-accent-300 mt-2">
                        Memorials:{' '}
                        {detail.can_create_memorials === false ? (
                          <span className="text-red-300">blocked</span>
                        ) : (
                          <span className="text-emerald-300">allowed</span>
                        )}
                        {' • '}Comments:{' '}
                        {detail.can_comment === false ? (
                          <span className="text-red-300">blocked</span>
                        ) : (
                          <span className="text-emerald-300">allowed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-accent-200">
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Activity</div>
                      <div>Memorials: {stats?.memorial_count ?? 0}</div>
                      <div>Comments: {stats?.comment_count ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Donations</div>
                      <div>Sent: {formatAmount(stats?.total_donations_sent)} ETB</div>
                      <div>Received: {formatAmount(stats?.total_donations_received)} ETB</div>
                    </div>
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Wallet</div>
                      {detail.wallet ? (
                        <>
                          <div>Balance: {detail.wallet.balance} ETB</div>
                          <div className="text-[11px] mt-1">
                            {detail.wallet.is_frozen ? (
                              <span className="text-red-300">Frozen</span>
                            ) : (
                              <span className="text-emerald-300">Active</span>
                            )}
                          </div>
                          {detail.wallet.frozen_reason && (
                            <div className="text-[11px] text-accent-300 mt-1">
                              {detail.wallet.frozen_reason}
                            </div>
                          )}
                        </>
                      ) : (
                        <div>No wallet</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Memorials by this user</div>
                    {memorialsPagination && memorialsPagination.total_pages > 1 && (
                      <div className="flex gap-2 text-[11px]">
                        <button
                          onClick={() =>
                            refreshMemorialsPage((memorialsPagination.current_page || 1) - 1)
                          }
                          disabled={memorialsPagination.current_page === 1}
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            refreshMemorialsPage((memorialsPagination.current_page || 1) + 1)
                          }
                          disabled={
                            memorialsPagination.current_page === memorialsPagination.total_pages
                          }
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                  {memorials.length === 0 ? (
                    <div className="text-xs text-accent-300">No memorials found.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="text-accent-300 border-b border-primary-700">
                          <tr>
                            <th className="py-1 pr-2 text-left">Memorial</th>
                            <th className="py-1 pr-2 text-left">Visibility</th>
                            <th className="py-1 pr-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memorials.map((m) => (
                            <tr key={m.memorial_id} className="border-b border-primary-700/60 align-top">
                              <td className="py-1 pr-2">
                                <div>{m.deceased_name}</div>
                                {m.deceased_name_amharic && (
                                  <div className="text-[11px] text-accent-300">
                                    {m.deceased_name_amharic}
                                  </div>
                                )}
                                <div className="text-[11px] text-accent-400 mt-1">
                                  memorial_id: {m.memorial_id}
                                </div>
                              </td>
                              <td className="py-1 pr-2 text-[11px]">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200">
                                  {m.visibility}
                                </span>
                              </td>
                              <td className="py-1 pr-2 text-[11px]">
                                {m.is_hidden_by_admin ? (
                                  <span className="text-red-300">Hidden by admin</span>
                                ) : m.is_active ? (
                                  <span className="text-emerald-300">Active</span>
                                ) : (
                                  <span className="text-yellow-300">Archived</span>
                                )}
                                <div className="mt-1">
                                  <button
                                    onClick={() =>
                                      router.push(`/admin/memorials/${m.memorial_id}`)
                                    }
                                    className="mt-1 text-[11px] px-2 py-1 rounded bg-primary-700 hover:bg-primary-600"
                                  >
                                    Moderate memorial
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

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Comments by this user</div>
                    {commentsPagination && commentsPagination.total_pages > 1 && (
                      <div className="flex gap-2 text-[11px]">
                        <button
                          onClick={() =>
                            refreshCommentsPage((commentsPagination.current_page || 1) - 1)
                          }
                          disabled={commentsPagination.current_page === 1}
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            refreshCommentsPage((commentsPagination.current_page || 1) + 1)
                          }
                          disabled={
                            commentsPagination.current_page === commentsPagination.total_pages
                          }
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                  {comments.length === 0 ? (
                    <div className="text-xs text-accent-300">No comments found.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="text-accent-300 border-b border-primary-700">
                          <tr>
                            <th className="py-1 pr-2 text-left">Comment</th>
                            <th className="py-1 pr-2 text-left">Memorial</th>
                            <th className="py-1 pr-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comments.map((c) => (
                            <tr key={c.comment_id} className="border-b border-primary-700/60 align-top">
                              <td className="py-1 pr-2 max-w-xs">
                                <div className="whitespace-pre-wrap break-words text-accent-100">
                                  {c.message}
                                </div>
                                <div className="text-[11px] text-accent-400 mt-1">
                                  {formatDateTime(c.created_at)} • id: {c.comment_id}
                                </div>
                              </td>
                              <td className="py-1 pr-2">
                                {c.memorial ? (
                                  <>
                                    <div>{c.memorial.deceased_name}</div>
                                    <div className="text-[11px] text-accent-400 mt-1">
                                      memorial_id: {c.memorial.memorial_id}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-[11px] text-accent-400">
                                    memorial_id: {c.memorial_id}
                                  </div>
                                )}
                              </td>
                              <td className="py-1 pr-2 text-[11px]">
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200">
                                    {c.visibility}
                                  </span>
                                </div>
                                {c.is_deleted && (
                                  <div className="mt-1 text-red-300">Deleted</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3">Account actions</div>
                  <div className="space-y-2 text-xs">
                    {!detail.is_banned && detail.is_active && (
                      <button
                        onClick={handleDeactivate}
                        disabled={busyAction === 'deactivate'}
                        className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                      >
                        {busyAction === 'deactivate' ? 'Deactivating...' : 'Deactivate account'}
                      </button>
                    )}

                    {!detail.is_banned && !detail.is_active && (
                      <button
                        onClick={handleReactivate}
                        disabled={busyAction === 'reactivate'}
                        className="w-full px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {busyAction === 'reactivate' ? 'Reactivating...' : 'Reactivate account'}
                      </button>
                    )}

                    {!detail.is_banned && (
                      <button
                        onClick={handleBan}
                        disabled={busyAction === 'ban'}
                        className="w-full px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 disabled:opacity-60"
                      >
                        {busyAction === 'ban' ? 'Banning...' : 'Ban user'}
                      </button>
                    )}

                    {detail.is_banned && (
                      <button
                        onClick={handleUnban}
                        disabled={busyAction === 'unban'}
                        className="w-full px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {busyAction === 'unban' ? 'Unbanning...' : 'Unban user'}
                      </button>
                    )}

                    <button
                      onClick={handleToggleMemorialPermission}
                      disabled={busyAction === 'memorial-permission'}
                      className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                    >
                      {detail.can_create_memorials === false
                        ? busyAction === 'memorial-permission'
                          ? 'Updating...'
                          : 'Allow memorial creation'
                        : busyAction === 'memorial-permission'
                        ? 'Updating...'
                        : 'Block memorial creation'}
                    </button>

                    <button
                      onClick={handleToggleCommentPermission}
                      disabled={busyAction === 'comment-permission'}
                      className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                    >
                      {detail.can_comment === false
                        ? busyAction === 'comment-permission'
                          ? 'Updating...'
                          : 'Allow commenting'
                        : busyAction === 'comment-permission'
                        ? 'Updating...'
                        : 'Block commenting'}
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={handleImpersonate}
                        disabled={busyAction === 'impersonate'}
                        className="w-full px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-60"
                      >
                        {busyAction === 'impersonate' ? 'Starting impersonation...' : 'View as this user'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3">Data operations</div>
                  <div className="space-y-2 text-xs">
                    <button
                      onClick={handleExport}
                      disabled={busyAction === 'export'}
                      className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                    >
                      {busyAction === 'export' ? 'Exporting...' : 'Export user data'}
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={handleAnonymize}
                        disabled={busyAction === 'anonymize'}
                        className="w-full px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyAction === 'anonymize' ? 'Anonymizing...' : 'Anonymize user'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Status history</div>
                    {historyPagination && historyPagination.total_pages > 1 && (
                      <div className="flex gap-2 text-[11px]">
                        <button
                          onClick={() => refreshHistoryPage((historyPagination.current_page || 1) - 1)}
                          disabled={historyPagination.current_page === 1}
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => refreshHistoryPage((historyPagination.current_page || 1) + 1)}
                          disabled={historyPagination.current_page === historyPagination.total_pages}
                          className="px-2 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="text-xs text-accent-300">No status history recorded.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto text-xs text-accent-200 space-y-2">
                      {history.map((h) => (
                        <div
                          key={h.id}
                          className="border border-primary-700 rounded-lg px-3 py-2 bg-primary-900/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{h.action}</div>
                            <div className="text-[11px] text-accent-400">
                              {formatDateTime(h.created_at)}
                            </div>
                          </div>
                          <div className="text-[11px] mt-1">
                            By: {h.changed_by_user?.name || 'Unknown admin'} ({
                              h.changed_by_user?.email || h.changed_by_user?.user_id || '—'
                            })
                          </div>
                          {h.reason && (
                            <div className="text-[11px] mt-1">Reason: {h.reason}</div>
                          )}
                          {h.note && (
                            <div className="text-[11px] mt-1 text-accent-300">Note: {h.note}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
