'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi, walletApi, settingsApi } from '@/lib/api'

interface AdminOverview {
  overview: {
    total_users: number
    total_memorials: number
    verified_vendors: number
    total_orders: number
    total_transaction_volume: number
    total_transactions: number
  }
  timestamp: string
}

interface AdminUser {
  user_id: string
  name: string
  email: string
  role: string
  is_active: boolean
  is_banned?: boolean
  ban_reason?: string | null
  wallet?: {
    wallet_id: string
    balance: string
    is_frozen: boolean
    frozen_reason?: string | null
  }
  // Optional fields returned by backend for richer admin overview
  total_donations_sent?: number
  total_donations_received?: number
  can_create_memorials?: boolean
  can_comment?: boolean
}

interface AdminTransaction {
  txn_id: string
  type: string
  status: string
  amount: string
  created_at: string
  user?: {
    user_id: string
    name: string
    email: string
  }
}

interface AdminVendor {
  vendor_id: string
  business_name: string
  service_type: string
  verification_status: string
  user?: {
    user_id: string
    name: string
    email: string
    phone: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [giftPlatformFee, setGiftPlatformFee] = useState<number | null>(null)
  const [isSavingFee, setIsSavingFee] = useState(false)
  const [feeError, setFeeError] = useState<string | null>(null)

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

    const loadData = async () => {
      try {
        setIsDataLoading(true)
        setError(null)

        const [overviewRes, usersRes, txRes, vendorsRes, settingsRes] = await Promise.all([
          adminApi.getOverviewStats(),
          adminApi.getUsers(1, 10),
          adminApi.getTransactions(1, 10),
          adminApi.getPendingVendors(1, 10),
          settingsApi.getAdminSettings(),
        ])

        setOverview(overviewRes.data.data)
        setUsers(usersRes.data.data.users || [])
        setTransactions(txRes.data.data.transactions || [])
        setVendors(vendorsRes.data.data.vendors || [])

        const giftFee = settingsRes.data?.data?.fees?.gift_platform_fee_percentage
        setGiftPlatformFee(
          typeof giftFee === 'number' && !Number.isNaN(giftFee) ? giftFee : null,
        )
      } catch (err: any) {
        console.error('Failed to load admin data', err)
        setError(err?.response?.data?.message || 'Failed to load admin data')
      } finally {
        setIsDataLoading(false)
      }
    }

    loadData()
  }, [user, isLoading, router])

  const role = user?.role
  const isSuperAdmin = !!(user?.is_super_admin || user?.isSuperAdmin)
  const filteredUsers = users.filter((u) => u.role !== 'Administrator')

  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const refreshUsers = async () => {
    try {
      const res = await adminApi.getUsers(1, 10)
      setUsers(res.data.data.users || [])
    } catch (err) {
      console.error('Failed to refresh users', err)
    }
  }

  const refreshVendors = async () => {
    try {
      const res = await adminApi.getPendingVendors(1, 10)
      setVendors(res.data.data.vendors || [])
    } catch (err) {
      console.error('Failed to refresh vendors', err)
    }
  }

	const handleToggleMemorialPermission = async (targetUser: AdminUser) => {
	  const currentlyBlocked = targetUser.can_create_memorials === false
	  const confirmMessage = currentlyBlocked
		? 'Allow this user to create new memorials again?'
		: 'Block this user from creating new memorials?'

	  if (typeof window !== 'undefined' && !window.confirm(confirmMessage)) {
		return
	  }

	  try {
		await adminApi.updateUserRestrictions(targetUser.user_id, {
		  canCreateMemorials: currentlyBlocked,
		})
		await refreshUsers()
	  } catch (err) {
		console.error('Failed to update memorial creation permission', err)
		if (typeof window !== 'undefined') {
		  window.alert('Failed to update memorial creation permission')
		}
	  }
	}

	const handleToggleCommentPermission = async (targetUser: AdminUser) => {
	  const currentlyBlocked = targetUser.can_comment === false
	  const confirmMessage = currentlyBlocked
		? 'Allow this user to post comments again?'
		: 'Block this user from posting comments?'

	  if (typeof window !== 'undefined' && !window.confirm(confirmMessage)) {
		return
	  }

	  try {
		await adminApi.updateUserRestrictions(targetUser.user_id, {
		  canComment: currentlyBlocked,
		})
		await refreshUsers()
	  } catch (err) {
		console.error('Failed to update comment permission', err)
		if (typeof window !== 'undefined') {
		  window.alert('Failed to update comment permission')
		}
	  }
	}

  const handleFreeze = async (userId: string) => {
    const reason = window.prompt('Enter reason for freezing this wallet:', 'Suspicious activity') || 'Admin action'
    try {
      await walletApi.freezeWallet(userId, reason)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to freeze wallet', err)
      alert('Failed to freeze wallet')
    }
  }

  const handleUnfreeze = async (userId: string) => {
    try {
      await walletApi.unfreezeWallet(userId)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to unfreeze wallet', err)
      alert('Failed to unfreeze wallet')
    }
  }

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      await adminApi.verifyVendor(vendorId)
      await refreshVendors()
    } catch (err) {
      console.error('Failed to verify vendor', err)
      alert('Failed to verify vendor')
    }
  }

  const handleRejectVendor = async (vendorId: string) => {
    const reason = window.prompt('Enter rejection reason:', 'Incomplete or invalid documents') || 'Rejected by admin'
    try {
      await adminApi.rejectVendor(vendorId, reason)
      await refreshVendors()
    } catch (err) {
      console.error('Failed to reject vendor', err)
      alert('Failed to reject vendor')
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    const reason =
      window.prompt('Enter reason for deactivating this account:', 'Temporary deactivation') || 'Admin action'
    try {
      await adminApi.deactivateUser(userId, reason)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to deactivate user', err)
      alert('Failed to deactivate user')
    }
  }

  const handleReactivateUser = async (userId: string) => {
    const reason = window.prompt('Optional note for reactivation:', '') || undefined
    try {
      await adminApi.reactivateUser(userId, reason)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to reactivate user', err)
      alert('Failed to reactivate user')
    }
  }

  const handleBanUser = async (userId: string) => {
    const reason =
      window.prompt('Enter reason for permanently banning this user:', 'Severe abuse or policy violation') ||
      'Banned by admin'
    try {
      await adminApi.banUser(userId, reason)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to ban user', err)
      alert('Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    const reason = window.prompt('Optional note for unban/reactivation:', '') || undefined
    try {
      await adminApi.unbanUser(userId, reason)
      await refreshUsers()
    } catch (err) {
      console.error('Failed to unban user', err)
      alert('Failed to unban user')
    }
  }

  const handleViewStatusHistory = async (userId: string) => {
    try {
      const res = await adminApi.getUserStatusHistory(userId, 1, 10)
      const history = res.data?.data?.history || []

      if (!history.length) {
        alert('No status history found for this user.')
        return
      }

      const lines = history.map((h: any) => {
        const actor = h.changed_by_user?.name || 'Unknown admin'
        const when = h.created_at ? new Date(h.created_at).toLocaleString() : 'Unknown time'
        const reason = h.reason || '—'
        return `${when} • ${h.action} • by ${actor} • reason: ${reason}`
      })

      alert(lines.join('\n'))
    } catch (err) {
      console.error('Failed to load status history', err)
      alert('Failed to load status history')
    }
  }

  const handleImpersonateUser = async (userId: string) => {
    if (!isSuperAdmin) return

    if (
      typeof window !== 'undefined' &&
      !window.confirm('You are about to view the platform as this user in read-only mode. Continue?')
    ) {
      return
    }

    try {
      const res = await adminApi.impersonateUser(userId)
      const token: string | undefined = res.data?.data?.token

      if (!token) {
        alert('Failed to start impersonation: no token returned')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nefsyimar_impersonation_token', token)
      }

      // Redirect to standard user dashboard while impersonating
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to impersonate user', err)
      alert('Failed to impersonate user')
    }
  }

  const formatTransactionDate = (t: AdminTransaction) => {
    const raw =
      (t as any).processed_at ||
      (t as any).processedAt ||
      (t as any).created_at ||
      (t as any).createdAt

    if (!raw) return '—'

    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleString()
  }

  const handleSaveGiftPlatformFee = async () => {
    if (giftPlatformFee === null || Number.isNaN(giftPlatformFee)) {
      setFeeError('Please enter a valid platform fee percentage.')
      return
    }

    try {
      setIsSavingFee(true)
      setFeeError(null)

      await settingsApi.updateAdminSettings({
        fees: {
          gift_platform_fee_percentage: giftPlatformFee,
        },
      })
    } catch (err: any) {
      console.error('Failed to update platform fee', err)
      setFeeError(err?.response?.data?.message || 'Failed to update platform fee')
    } finally {
      setIsSavingFee(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-accent-300">
            Single administrator control panel for finances, users, vendors, and system monitoring.
          </p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <button
              onClick={() => router.push('/admin/vendor-management')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-accent-600 hover:bg-accent-500 rounded-lg transition-colors"
            >
              <span>👥</span>
              <span>Vendor Management</span>
            </button>
            <button
              onClick={() => router.push('/admin/marketplace')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>🏪</span>
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>📊</span>
              <span>Analytics</span>
            </button>
            <button
              onClick={() => router.push('/admin/memorials')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>🕯️</span>
              <span>Memorials</span>
            </button>
            <button
              onClick={() => router.push('/admin/comments')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>💬</span>
              <span>Comment Moderation</span>
            </button>
            <button
              onClick={() => router.push('/admin/disputes')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>⚖️</span>
              <span>Disputes</span>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>🙍‍♂️</span>
              <span>Users</span>
            </button>
            <button
              onClick={() => router.push('/admin/appeals')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>📨</span>
              <span>Appeals</span>
            </button>
            <button
              onClick={() => router.push('/admin/body-shipping')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>✈️</span>
              <span>Body Shipping</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings/fees')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <button
              onClick={refreshUsers}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>🔄</span>
              <span>Refresh Data</span>
            </button>
            <button
              onClick={refreshVendors}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <span>✅</span>
              <span>Refresh Vendors</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => router.push('/admin/create-admin')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
              >
                <span>🛡️</span>
                <span>Create New Admin</span>
              </button>
            )}
          </div>
        </section>

        {/* Overview cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
            <div className="text-sm text-accent-300 mb-1">Users & Memorials</div>
            <div className="text-2xl font-semibold">
              {overview ? overview.overview.total_users : '—'} users
            </div>
            <div className="text-sm text-accent-400">
              {overview ? overview.overview.total_memorials : '—'} paid memorials
            </div>
          </div>
          <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
            <div className="text-sm text-accent-300 mb-1">Transactions</div>
            <div className="text-2xl font-semibold">
              {overview ? overview.overview.total_transactions : '—'} txns
            </div>
            <div className="text-sm text-accent-400">
              Volume: {overview ? overview.overview.total_transaction_volume.toFixed(2) : '—'} ETB
            </div>
          </div>
          <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
            <div className="text-sm text-accent-300 mb-1">Vendors & Orders</div>
            <div className="text-2xl font-semibold">
              {overview ? overview.overview.verified_vendors : '—'} vendors
            </div>
            <div className="text-sm text-accent-400">
              {overview ? overview.overview.total_orders : '—'} orders
            </div>
          </div>
        </section>

        {/* Users & wallet freeze/unfreeze */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Users & Wallet Status</h2>
            <button
              className="text-xs px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
              onClick={refreshUsers}
            >
              Refresh
            </button>
          </div>
          {isDataLoading && filteredUsers.length === 0 ? (
            <p className="text-sm text-accent-300">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-accent-300">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Gender</th>
                    <th className="py-2 pr-4">Balance</th>
                    <th className="py-2 pr-4">Wallet</th>
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-accent-300">{u.email}</div>
                        {(u as any).total_donations_sent !== undefined && (
                          <div className="text-[10px] text-accent-300 mt-1">
                            Sent: {((u as any).total_donations_sent ?? 0).toFixed(2)} ETB • Received:{' '}
                            {((u as any).total_donations_received ?? 0).toFixed(2)} ETB
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">{u.role}</td>
                      <td className="py-2 pr-4 text-xs capitalize">{(u as any).gender || '—'}</td>
                      <td className="py-2 pr-4 text-xs">
                        {u.wallet ? `${u.wallet.balance} ETB` : '—'}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {u.wallet?.is_frozen ? (
                          <span className="text-red-300">Frozen</span>
                        ) : (
                          <span className="text-emerald-300">Active</span>
                        )}
                        {u.wallet?.frozen_reason && (
                          <div className="text-[10px] text-accent-300 mt-1">
                            {u.wallet.frozen_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {u.is_banned ? (
                          <span className="text-red-300">Banned</span>
                        ) : u.is_active ? (
                          <span className="text-emerald-300">Active</span>
                        ) : (
                          <span className="text-yellow-300">Deactivated</span>
                        )}
                        {u.ban_reason && (
                          <div className="text-[10px] text-accent-300 mt-1">{u.ban_reason}</div>
                        )}
                        <div className="text-[10px] text-accent-300 mt-1">
                          Memorials:{' '}
                          {(u as any).can_create_memorials === false ? (
                            <span className="text-red-300">blocked</span>
                          ) : (
                            <span className="text-emerald-300">allowed</span>
                          )}
                          {' • '}Comments:{' '}
                          {(u as any).can_comment === false ? (
                            <span className="text-red-300">blocked</span>
                          ) : (
                            <span className="text-emerald-300">allowed</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {u.wallet && (
                            u.wallet.is_frozen ? (
                              <button
                                onClick={() => handleUnfreeze(u.user_id)}
                                className="text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500"
                              >
                                Unfreeze Wallet
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFreeze(u.user_id)}
                                className="text-[11px] px-2 py-1 rounded bg-red-600 hover:bg-red-500"
                              >
                                Freeze Wallet
                              </button>
                            )
                          )}

                          {!u.is_banned && u.is_active && (
                            <button
                              onClick={() => handleDeactivateUser(u.user_id)}
                              className="text-[11px] px-2 py-1 rounded bg-primary-700 hover:bg-primary-600"
                            >
                              Deactivate
                            </button>
                          )}

                          {!u.is_banned && !u.is_active && (
                            <button
                              onClick={() => handleReactivateUser(u.user_id)}
                              className="text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500"
                            >
                              Reactivate
                            </button>
                          )}

                          {!u.is_banned && (
                            <button
                              onClick={() => handleBanUser(u.user_id)}
                              className="text-[11px] px-2 py-1 rounded bg-red-700 hover:bg-red-600"
                            >
                              Ban
                            </button>
                          )}

                          {u.is_banned && (
                            <button
                              onClick={() => handleUnbanUser(u.user_id)}
                              className="text-[11px] px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600"
                            >
                              Unban
                            </button>
                          )}

                          <button
                            onClick={() => handleViewStatusHistory(u.user_id)}
                            className="text-[11px] px-2 py-1 rounded bg-primary-700 hover:bg-primary-600"
                          >
                            History
                          </button>

                          <button
                            onClick={() => handleToggleMemorialPermission(u)}
                            className="text-[11px] px-2 py-1 rounded bg-primary-700 hover:bg-primary-600"
                          >
                            {(u as any).can_create_memorials === false ? 'Allow memorials' : 'Block memorials'}
                          </button>

                          <button
                            onClick={() => handleToggleCommentPermission(u)}
                            className="text-[11px] px-2 py-1 rounded bg-primary-700 hover:bg-primary-600"
                          >
                            {(u as any).can_comment === false ? 'Allow comments' : 'Block comments'}
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleImpersonateUser(u.user_id)}
                              className="text-[11px] px-2 py-1 rounded bg-purple-600 hover:bg-purple-500"
                            >
                              View as User
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
        </section>

        {/* Recent transactions */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Wallet Transactions</h2>
          </div>
          {isDataLoading && transactions.length === 0 ? (
            <p className="text-sm text-accent-300">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-accent-300">No recent transactions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.txn_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4 text-xs">
                        <div>{t.user?.name || '—'}</div>
                        <div className="text-[10px] text-accent-300">{t.user?.email}</div>
                      </td>
                      <td className="py-2 pr-4 text-xs">{t.type}</td>
                      <td className="py-2 pr-4 text-xs">{t.status}</td>
                      <td className="py-2 pr-4 text-xs">{t.amount} ETB</td>
                      <td className="py-2 text-xs">
                        {formatTransactionDate(t)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pending vendor approvals */}
        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pending Vendor Approvals</h2>
            <button
              className="text-xs px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
              onClick={refreshVendors}
            >
              Refresh
            </button>
          </div>
          {isDataLoading && vendors.length === 0 ? (
            <p className="text-sm text-accent-300">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-sm text-accent-300">No pending vendors.</p>
          ) : (
            <div className="space-y-3">
              {vendors.map((v) => (
                <div
                  key={v.vendor_id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-primary-700 rounded-lg p-3"
                >
                  <div>
                    <div className="font-medium">{v.business_name}</div>
                    <div className="text-xs text-accent-300">
                      Service: {v.service_type} • Status: {v.verification_status}
                    </div>
                    {v.user && (
                      <div className="text-[11px] text-accent-300 mt-1">
                        Owner: {v.user.name} ({v.user.email})
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleVerifyVendor(v.vendor_id)}
                      className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleRejectVendor(v.vendor_id)}
                      className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
