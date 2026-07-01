'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface DisputeUser {
  user_id: string
  name: string
  email?: string
  phone?: string
}

interface DisputeVendor {
  vendor_id: string
  business_name: string
  phone?: string
}

interface DisputeOrderItemProduct {
  product_id: string
  name: string
  main_image?: string
}

interface DisputeOrderItem {
  order_item_id?: string
  product_id: string
  quantity: number
  total_price: string
  product?: DisputeOrderItemProduct
}

interface DisputeOrderDetail {
  order_id: string
  order_number: string
  status: string
  total_amount: string
  currency: string
  vendor_amount: string
  refund_amount?: string | null
  buyer?: DisputeUser
  vendor?: DisputeVendor
  items?: DisputeOrderItem[]
}

interface DisputeDetail {
  dispute_id: string
  order_id: string
  raised_by: string
  against_party: 'VENDOR' | 'BUYER' | 'PLATFORM'
  category: 'QUALITY' | 'LATE_DELIVERY' | 'NON_DELIVERY' | 'WRONG_ITEM' | 'OTHER'
  reason?: string
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CANCELLED'
  resolution?: 'NO_REFUND' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'NON_MONETARY' | 'OTHER' | null
  requested_refund_amount?: string | null
  approved_refund_amount?: string | null
  currency: string
  assigned_to?: string | null
  closed_by?: string | null
  closed_at?: string | null
  admin_notes?: string | null
  created_at: string
  metadata?: any
  order?: DisputeOrderDetail
  raised_by_user?: DisputeUser
  assignee?: DisputeUser
  closed_by_user?: DisputeUser
}

export default function AdminDisputeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()

  const disputeId = (params?.disputeId as string) || ''

  const [dispute, setDispute] = useState<DisputeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [resolution, setResolution] = useState<
    'NO_REFUND' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'NON_MONETARY' | 'OTHER'
  >('NO_REFUND')
  const [finalStatus, setFinalStatus] = useState<'RESOLVED' | 'REJECTED'>('RESOLVED')
  const [approvedAmount, setApprovedAmount] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')

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

    if (!disputeId) {
      setError('Missing dispute identifier')
      setLoading(false)
      return
    }

    const loadDispute = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await adminApi.getDispute(disputeId)
        const data = res.data?.data?.dispute as DisputeDetail
        setDispute(data)

        if (data) {
          setResolution((data.resolution as any) || 'NO_REFUND')
          setFinalStatus('RESOLVED')
          if (data.requested_refund_amount) {
            setApprovedAmount(data.requested_refund_amount)
          } else if (data.order?.total_amount) {
            setApprovedAmount(data.order.total_amount)
          }
          setAdminNotes(data.admin_notes || '')
        }
      } catch (err: any) {
        console.error('Failed to load dispute detail', err)
        setError(err?.response?.data?.message || 'Failed to load dispute detail')
      } finally {
        setLoading(false)
      }
    }

    loadDispute()
  }, [user, isLoading, router, disputeId])

  const role = user?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const refreshDispute = async () => {
    if (!disputeId) return
    try {
      const res = await adminApi.getDispute(disputeId)
      const data = res.data?.data?.dispute as DisputeDetail
      setDispute(data)
    } catch (err) {
      console.error('Failed to refresh dispute detail', err)
    }
  }

  const withConfirm = async (label: string, fn: () => Promise<void>) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(label)
      if (!ok) return
    }
    await fn()
  }

  const handleAssignToMe = async () => {
    if (!user || !dispute) return
    await withConfirm('Assign this dispute to yourself?', async () => {
      try {
        setBusyAction('assign')
        await adminApi.assignDispute(dispute.dispute_id, user.user_id)
        await refreshDispute()
      } catch (err) {
        console.error('Failed to assign dispute', err)
        typeof window !== 'undefined' && window.alert('Failed to assign dispute')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleUnassign = async () => {
    if (!dispute) return
    await withConfirm('Unassign this dispute?', async () => {
      try {
        setBusyAction('unassign')
        await adminApi.assignDispute(dispute.dispute_id, undefined)
        await refreshDispute()
      } catch (err) {
        console.error('Failed to unassign dispute', err)
        typeof window !== 'undefined' && window.alert('Failed to unassign dispute')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleResolve = async () => {
    if (!dispute) return

    const needsRefund = resolution === 'PARTIAL_REFUND' || resolution === 'FULL_REFUND'

    await withConfirm('Apply this resolution to the dispute?', async () => {
      try {
        setBusyAction('resolve')

        let amountNumber: number | undefined
        if (needsRefund) {
          const parsed = parseFloat(approvedAmount || '0')
          if (isNaN(parsed) || parsed <= 0) {
            typeof window !== 'undefined' && window.alert('Please enter a valid refund amount')
            setBusyAction(null)
            return
          }
          amountNumber = parsed
        }

        await adminApi.resolveDispute(dispute.dispute_id, {
          resolution,
          approvedRefundAmount: amountNumber,
          status: finalStatus,
          adminNotes,
        })

        await refreshDispute()
        if (typeof window !== 'undefined') {
          window.alert('Dispute resolved successfully')
        }
      } catch (err) {
        console.error('Failed to resolve dispute', err)
        typeof window !== 'undefined' && window.alert('Failed to resolve dispute')
      } finally {
        setBusyAction(null)
      }
    })
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  const formatMoney = (value?: string | null) => {
    if (!value) return '0.00'
    const n = parseFloat(value)
    if (isNaN(n)) return value
    return n.toFixed(2)
  }

  if (!dispute && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/admin/disputes')}
            className="mb-4 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
          >
            Back to disputes
          </button>
          <div className="text-sm text-accent-200">Dispute not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dispute Case View</h1>
            <p className="text-accent-300 text-sm">
              Review this dispute, its related order, and apply a final resolution.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/disputes')}
            className="px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
          >
            Back to disputes
          </button>
        </header>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading && !dispute ? (
          <div className="text-sm text-accent-200">Loading dispute...</div>
        ) : dispute ? (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-accent-300 mb-1">Dispute</div>
                      <div className="text-xl font-semibold mb-1">
                        {dispute.category
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-xs text-accent-300">
                        Against: {dispute.against_party.toLowerCase()}
                      </div>
                      {dispute.reason && (
                        <div className="text-xs text-accent-100 mt-2 whitespace-pre-wrap break-words">
                          {dispute.reason}
                        </div>
                      )}
                      <div className="text-[11px] text-accent-400 mt-2">
                        dispute_id: {dispute.dispute_id}
                      </div>
                      <div className="text-[11px] text-accent-400">Created: {formatDateTime(dispute.created_at)}</div>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 text-[11px]">
                          {dispute.status}
                        </span>
                      </div>
                      {dispute.resolution && (
                        <div className="text-[11px] text-accent-300">
                          Resolution: {dispute.resolution}
                        </div>
                      )}
                      {dispute.closed_at && (
                        <div className="text-[11px] text-accent-400">
                          Closed: {formatDateTime(dispute.closed_at)}
                        </div>
                      )}
                      <div className="text-[11px] text-accent-300 mt-2">
                        Assigned:{' '}
                        {dispute.assignee
                          ? dispute.assignee.name
                          : dispute.assigned_to
                          ? dispute.assigned_to
                          : 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-accent-200">
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Refunds</div>
                      <div>Requested: {formatMoney(dispute.requested_refund_amount)} {dispute.currency}</div>
                      <div>
                        Approved: {formatMoney(dispute.approved_refund_amount)} {dispute.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Raised By</div>
                      <div>{dispute.raised_by_user?.name || dispute.raised_by}</div>
                      {dispute.raised_by_user?.email && (
                        <div className="text-[11px] text-accent-300">{dispute.raised_by_user.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-2">Related Order</div>
                  {dispute.order ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between text-xs">
                        <div>
                          <div className="font-medium">Order #{dispute.order.order_number}</div>
                          <div className="text-[11px] text-accent-400 mt-1">
                            order_id: {dispute.order.order_id}
                          </div>
                          <div className="text-[11px] text-accent-300 mt-1">
                            Status: {dispute.order.status}
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <div>
                            Total: {formatMoney(dispute.order.total_amount)} {dispute.order.currency}
                          </div>
                          <div className="text-[11px] text-accent-300 mt-1">
                            Refunded: {formatMoney(dispute.order.refund_amount)} {dispute.order.currency}
                          </div>
                          <div className="text-[11px] text-accent-300 mt-1">
                            Vendor share: {formatMoney(dispute.order.vendor_amount)} {dispute.order.currency}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-accent-200">
                        <div>
                          <div className="text-accent-300 text-[11px] mb-1">Buyer</div>
                          <div>{dispute.order.buyer?.name || '—'}</div>
                          {dispute.order.buyer?.email && (
                            <div className="text-[11px] text-accent-300">{dispute.order.buyer.email}</div>
                          )}
                          {dispute.order.buyer?.phone && (
                            <div className="text-[11px] text-accent-400">{dispute.order.buyer.phone}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-accent-300 text-[11px] mb-1">Vendor</div>
                          <div>{dispute.order.vendor?.business_name || '—'}</div>
                          {dispute.order.vendor?.phone && (
                            <div className="text-[11px] text-accent-400">{dispute.order.vendor.phone}</div>
                          )}
                        </div>
                      </div>

                      {dispute.order.items && dispute.order.items.length > 0 && (
                        <div className="mt-4">
                          <div className="text-accent-300 text-[11px] mb-1">Items</div>
                          <div className="max-h-48 overflow-y-auto border border-primary-700 rounded-lg">
                            <table className="w-full text-[11px]">
                              <thead className="bg-primary-900/40 text-accent-300">
                                <tr>
                                  <th className="py-1 px-2 text-left">Product</th>
                                  <th className="py-1 px-2 text-left">Qty</th>
                                  <th className="py-1 px-2 text-left">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dispute.order.items.map((item, idx) => (
                                  <tr key={idx} className="border-t border-primary-700/60">
                                    <td className="py-1 px-2">
                                      <div>{item.product?.name || item.product_id}</div>
                                    </td>
                                    <td className="py-1 px-2">{item.quantity}</td>
                                    <td className="py-1 px-2">
                                      {formatMoney(item.total_price)} {dispute.order?.currency}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-accent-300">Order not found.</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3">Assignment</div>
                  <div className="text-xs text-accent-200 mb-2">
                    Currently assigned to:{' '}
                    {dispute.assignee
                      ? dispute.assignee.name
                      : dispute.assigned_to
                      ? dispute.assigned_to
                      : 'Unassigned'}
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <button
                      onClick={handleAssignToMe}
                      disabled={busyAction === 'assign'}
                      className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                    >
                      {busyAction === 'assign' ? 'Assigning...' : 'Assign to me'}
                    </button>
                    {dispute.assigned_to && (
                      <button
                        onClick={handleUnassign}
                        disabled={busyAction === 'unassign'}
                        className="w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60"
                      >
                        {busyAction === 'unassign' ? 'Unassigning...' : 'Unassign'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-3">Resolution</div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-accent-300 text-[11px] mb-1">Resolution type</label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="NO_REFUND">No refund (policy violation unsubstantiated)</option>
                        <option value="PARTIAL_REFUND">Partial refund</option>
                        <option value="FULL_REFUND">Full refund</option>
                        <option value="NON_MONETARY">Non-monetary resolution (e.g. re-delivery)</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-accent-300 text-[11px] mb-1">Final status</label>
                      <select
                        value={finalStatus}
                        onChange={(e) => setFinalStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    {(resolution === 'PARTIAL_REFUND' || resolution === 'FULL_REFUND') && (
                      <div>
                        <label className="block text-accent-300 text-[11px] mb-1">
                          Approved refund amount ({dispute.currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                        <p className="text-[11px] text-accent-400 mt-1">
                          Must be less than or equal to the remaining refundable amount of the order.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-accent-300 text-[11px] mb-1">Admin notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="Internal notes about this resolution, policy references, etc."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleResolve}
                        disabled={busyAction === 'resolve'}
                        className="w-full px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-60 text-sm font-semibold"
                      >
                        {busyAction === 'resolve' ? 'Applying resolution...' : 'Apply resolution'}
                      </button>
                    </div>
                  </div>
                </div>

                {dispute.admin_notes && (
                  <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                    <div className="text-sm font-semibold mb-2">Existing Admin Notes</div>
                    <div className="text-xs text-accent-200 whitespace-pre-wrap break-words">
                      {dispute.admin_notes}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
