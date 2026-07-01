'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AppealUser {
  user_id: string
  name: string
  email?: string
}

interface AppealRecord {
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
  created_at: string
  metadata?: any
  user?: AppealUser
  assigned_to_user?: AppealUser
  decided_by_user?: AppealUser
  related_report?: any
  related_dispute?: any
}

export default function AdminAppealDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()

  const appealId = (params?.appealId as string) || ''

  const [appeal, setAppeal] = useState<AppealRecord | null>(null)
  const [target, setTarget] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [decisionStatus, setDecisionStatus] = useState<'APPROVED' | 'REJECTED' | 'CANCELLED'>('APPROVED')
  const [decisionChoice, setDecisionChoice] = useState<
    'UPHELD' | 'OVERTURNED' | 'PARTIALLY_OVERTURNED' | 'OTHER'
  >('UPHELD')
  const [resolutionNotes, setResolutionNotes] = useState<string>('')
  const [autoApply, setAutoApply] = useState<boolean>(true)

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

    if (!appealId) {
      setError('Missing appeal identifier')
      setLoading(false)
      return
    }

    const loadAppeal = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await adminApi.getAppeal(appealId)
        const data = res.data?.data as { appeal: AppealRecord; target: any | null }
        if (!data || !data.appeal) {
          setAppeal(null)
          setTarget(null)
          return
        }
        setAppeal(data.appeal)
        setTarget(data.target || null)

        const a = data.appeal
        if (a.status === 'APPROVED' || a.status === 'REJECTED' || a.status === 'CANCELLED') {
          setDecisionStatus(a.status as any)
        } else {
          setDecisionStatus('APPROVED')
        }
        setDecisionChoice((a.decision as any) || 'UPHELD')
        setResolutionNotes(a.resolution_notes || '')
        if (a.metadata && typeof a.metadata.auto_applied === 'boolean') {
          setAutoApply(a.metadata.auto_applied)
        } else {
          setAutoApply(true)
        }
      } catch (err: any) {
        console.error('Failed to load appeal detail', err)
        setError(err?.response?.data?.message || 'Failed to load appeal detail')
      } finally {
        setLoading(false)
      }
    }

    loadAppeal()
  }, [user, isLoading, router, appealId])

  const role = (user as any)?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const refreshAppeal = async () => {
    if (!appealId) return
    try {
      const res = await adminApi.getAppeal(appealId)
      const data = res.data?.data as { appeal: AppealRecord; target: any | null }
      if (!data || !data.appeal) {
        setAppeal(null)
        setTarget(null)
        return
      }
      setAppeal(data.appeal)
      setTarget(data.target || null)
    } catch (err) {
      console.error('Failed to refresh appeal detail', err)
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
    if (!user || !appeal) return
    await withConfirm('Assign this appeal to yourself?', async () => {
      try {
        setBusyAction('assign')
        await adminApi.assignAppeal(appeal.appeal_id, (user as any).user_id)
        await refreshAppeal()
      } catch (err) {
        console.error('Failed to assign appeal', err)
        if (typeof window !== 'undefined') {
          window.alert('Failed to assign appeal')
        }
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleUnassign = async () => {
    if (!appeal) return
    await withConfirm('Unassign this appeal?', async () => {
      try {
        setBusyAction('unassign')
        await adminApi.assignAppeal(appeal.appeal_id, undefined)
        await refreshAppeal()
      } catch (err) {
        console.error('Failed to unassign appeal', err)
        if (typeof window !== 'undefined') {
          window.alert('Failed to unassign appeal')
        }
      } finally {
        setBusyAction(null)
      }
    })
  }

  const handleDecide = async () => {
    if (!appeal) return

    if (appeal.status !== 'PENDING' && appeal.status !== 'IN_REVIEW') {
      if (typeof window !== 'undefined') {
        window.alert('This appeal is already decided and cannot be changed')
      }
      return
    }

    await withConfirm('Apply this decision to the appeal?', async () => {
      try {
        setBusyAction('decide')
        await adminApi.decideAppeal(appeal.appeal_id, {
          status: decisionStatus,
          decision: decisionChoice,
          resolutionNotes,
          autoApply,
        })
        await refreshAppeal()
        if (typeof window !== 'undefined') {
          window.alert('Appeal decision recorded successfully')
        }
      } catch (err) {
        console.error('Failed to decide appeal', err)
        if (typeof window !== 'undefined') {
          window.alert('Failed to decide appeal')
        }
      } finally {
        setBusyAction(null)
      }
    })
  }

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

  const renderTargetSummary = () => {
    if (!appeal) return null

    if (!target) {
      return <div className='text-xs text-accent-300'>Target entity not found or no longer available.</div>
    }

    if (appeal.target_type === 'MEMORIAL') {
      return (
        <div className='text-xs text-accent-200 space-y-1'>
          <div className='font-medium'>Memorial: {target.deceased_name || target.memorial_id}</div>
          <div className='text-[11px] text-accent-300'>
            memorial_id: {target.memorial_id}
          </div>
          <div className='text-[11px] text-accent-300'>
            Visibility: {target.visibility} • Review status: {target.review_status}
          </div>
          <div className='text-[11px] text-accent-300'>
            Admin hidden: {target.is_hidden_by_admin ? 'yes' : 'no'} • Sensitivity: {target.sensitivity_level}
          </div>
        </div>
      )
    }

    if (appeal.target_type === 'COMMENT') {
      return (
        <div className='text-xs text-accent-200 space-y-1'>
          <div className='font-medium'>Comment on memorial {target.memorial?.deceased_name || target.memorial_id}</div>
          <div className='text-[11px] text-accent-300'>comment_id: {target.comment_id}</div>
          <div className='text-[11px] text-accent-300'>Visibility: {target.visibility}</div>
          {target.is_deleted && (
            <div className='text-[11px] text-red-300'>Marked as deleted</div>
          )}
          {target.message && (
            <div className='text-[11px] text-accent-100 mt-1 whitespace-pre-wrap break-words'>
              {target.message}
            </div>
          )}
        </div>
      )
    }

    if (appeal.target_type === 'USER') {
      return (
        <div className='text-xs text-accent-200 space-y-1'>
          <div className='font-medium'>User account: {target.name || target.user_id}</div>
          <div className='text-[11px] text-accent-300'>user_id: {target.user_id}</div>
          {target.email && <div className='text-[11px] text-accent-300'>{target.email}</div>}
          <div className='text-[11px] text-accent-300'>
            Status: {target.is_banned ? 'banned' : target.is_active ? 'active' : 'deactivated'}
          </div>
          {target.ban_reason && (
            <div className='text-[11px] text-accent-200 mt-1'>Ban reason: {target.ban_reason}</div>
          )}
        </div>
      )
    }

    if (appeal.target_type === 'DISPUTE') {
      return (
        <div className='text-xs text-accent-200 space-y-1'>
          <div className='font-medium'>Dispute: {target.dispute_id}</div>
          <div className='text-[11px] text-accent-300'>Status: {target.status}</div>
          <div className='text-[11px] text-accent-300'>Against: {target.against_party}</div>
          <div className='text-[11px] text-accent-300'>Category: {target.category}</div>
          {target.reason && (
            <div className='text-[11px] text-accent-100 mt-1 whitespace-pre-wrap break-words'>
              {target.reason}
            </div>
          )}
        </div>
      )
    }

    if (appeal.target_type === 'ORDER') {
      return (
        <div className='text-xs text-accent-200 space-y-1'>
          <div className='font-medium'>Order: #{target.order_number || target.order_id}</div>
          <div className='text-[11px] text-accent-300'>order_id: {target.order_id}</div>
          <div className='text-[11px] text-accent-300'>Status: {target.status}</div>
          <div className='text-[11px] text-accent-300'>
            Total: {target.total_amount} {target.currency}
          </div>
          {target.refund_amount && (
            <div className='text-[11px] text-accent-300'>
              Refunded: {target.refund_amount} {target.currency}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className='text-xs text-accent-200'>
        Appeal target type: {formatTargetType(appeal.target_type)} (generic view)
      </div>
    )
  }

  if (!appeal && !loading && !error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white'>
        <div className='max-w-5xl mx-auto'>
          <button
            onClick={() => router.push('/admin/appeals')}
            className='mb-4 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm'
          >
            Back to appeals
          </button>
          <div className='text-sm text-accent-200'>Appeal not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <header className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-1'>Appeal Case View</h1>
            <p className='text-accent-300 text-sm'>
              Review this appeal, its target, and apply a final decision.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/appeals')}
            className='px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm'
          >
            Back to appeals
          </button>
        </header>

        {error && (
          <div className='text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2'>
            {error}
          </div>
        )}

        {loading && !appeal ? (
          <div className='text-sm text-accent-200'>Loading appeal...</div>
        ) : appeal ? (
          <>
            <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
              <div className='lg:col-span-2 space-y-4'>
                <div className='bg-primary-800/70 border border-primary-700 rounded-xl p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <div className='text-xs text-accent-300 mb-1'>Appeal</div>
                      <div className='text-xl font-semibold mb-1'>
                        {formatTargetType(appeal.target_type)} appeal
                      </div>
                      {appeal.reason && (
                        <div className='text-xs text-accent-100 mt-1 whitespace-pre-wrap break-words'>
                          {appeal.reason}
                        </div>
                      )}
                      <div className='text-[11px] text-accent-400 mt-2'>appeal_id: {appeal.appeal_id}</div>
                      <div className='text-[11px] text-accent-400'>Created: {formatDateTime(appeal.created_at)}</div>
                      <div className='text-[11px] text-accent-300 mt-2'>
                        Appellant: {appeal.user?.name || appeal.user_id}
                      </div>
                      {appeal.user?.email && (
                        <div className='text-[11px] text-accent-300'>{appeal.user.email}</div>
                      )}
                    </div>
                    <div className='text-right text-xs space-y-1'>
                      <div>
                        <span className='inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 text-[11px]'>
                          {appeal.status}
                        </span>
                      </div>
                      {appeal.decision && (
                        <div className='text-[11px] text-accent-300'>Decision: {appeal.decision}</div>
                      )}
                      {appeal.decided_at && (
                        <div className='text-[11px] text-accent-400'>
                          Decided: {formatDateTime(appeal.decided_at)}
                        </div>
                      )}
                      {appeal.decided_by_user && (
                        <div className='text-[11px] text-accent-300'>
                          By: {appeal.decided_by_user.name}
                        </div>
                      )}
                      <div className='text-[11px] text-accent-300 mt-2'>
                        Assigned:{' '}
                        {appeal.assigned_to_user
                          ? appeal.assigned_to_user.name
                          : appeal.assigned_to
                          ? appeal.assigned_to
                          : 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-accent-200'>
                    <div>
                      <div className='text-accent-300 text-[11px] mb-1'>Related objects</div>
                      <div className='text-[11px] text-accent-300'>target_id: {appeal.target_id}</div>
                      {appeal.related_report_id && (
                        <div className='text-[11px] text-accent-300'>
                          related_report_id: {appeal.related_report_id}
                        </div>
                      )}
                      {appeal.related_dispute_id && (
                        <div className='text-[11px] text-accent-300'>
                          related_dispute_id: {appeal.related_dispute_id}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className='text-accent-300 text-[11px] mb-1'>Resolution notes</div>
                      {appeal.resolution_notes ? (
                        <div className='text-[11px] text-accent-200 whitespace-pre-wrap break-words'>
                          {appeal.resolution_notes}
                        </div>
                      ) : (
                        <div className='text-[11px] text-accent-400'>No resolution notes recorded yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='bg-primary-800/70 border border-primary-700 rounded-xl p-4'>
                  <div className='text-sm font-semibold mb-2'>Target summary</div>
                  {renderTargetSummary()}
                </div>
              </div>

              <div className='space-y-4'>
                <div className='bg-primary-800/70 border border-primary-700 rounded-xl p-4'>
                  <div className='text-sm font-semibold mb-3'>Assignment</div>
                  <div className='text-xs text-accent-200 mb-2'>
                    Currently assigned to:{' '}
                    {appeal.assigned_to_user
                      ? appeal.assigned_to_user.name
                      : appeal.assigned_to
                      ? appeal.assigned_to
                      : 'Unassigned'}
                  </div>
                  <div className='flex flex-col gap-2 text-xs'>
                    <button
                      onClick={handleAssignToMe}
                      disabled={busyAction === 'assign'}
                      className='w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60'
                    >
                      {busyAction === 'assign' ? 'Assigning...' : 'Assign to me'}
                    </button>
                    {appeal.assigned_to && (
                      <button
                        onClick={handleUnassign}
                        disabled={busyAction === 'unassign'}
                        className='w-full px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-600 disabled:opacity-60'
                      >
                        {busyAction === 'unassign' ? 'Unassigning...' : 'Unassign'}
                      </button>
                    )}
                  </div>
                </div>

                <div className='bg-primary-800/70 border border-primary-700 rounded-xl p-4'>
                  <div className='text-sm font-semibold mb-3'>Decision</div>
                  <div className='space-y-3 text-xs'>
                    <div>
                      <label className='block text-accent-300 text-[11px] mb-1'>Final status</label>
                      <select
                        value={decisionStatus}
                        onChange={(e) => setDecisionStatus(e.target.value as any)}
                        className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500'
                      >
                        <option value='APPROVED'>Approved</option>
                        <option value='REJECTED'>Rejected</option>
                        <option value='CANCELLED'>Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-accent-300 text-[11px] mb-1'>Decision outcome</label>
                      <select
                        value={decisionChoice}
                        onChange={(e) => setDecisionChoice(e.target.value as any)}
                        className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500'
                      >
                        <option value='UPHELD'>Uphold original decision</option>
                        <option value='OVERTURNED'>Overturn original decision</option>
                        <option value='PARTIALLY_OVERTURNED'>Partially overturn</option>
                        <option value='OTHER'>Other</option>
                      </select>
                    </div>

                    <div className='flex items-center gap-2 mt-1'>
                      <input
                        id='auto-apply-toggle'
                        type='checkbox'
                        checked={autoApply}
                        onChange={(e) => setAutoApply(e.target.checked)}
                        className='h-4 w-4 rounded border-primary-600 bg-primary-800 text-accent-500'
                      />
                      <label htmlFor='auto-apply-toggle' className='text-[11px] text-accent-200'>
                        Automatically reverse simple moderation effects when overturning (for memorials/comments/users)
                      </label>
                    </div>

                    <div>
                      <label className='block text-accent-300 text-[11px] mb-1'>Resolution notes</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={4}
                        className='w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500'
                        placeholder='Internal notes about why this appeal was approved or rejected, policy references, etc.'
                      />
                    </div>

                    <div className='pt-2'>
                      <button
                        onClick={handleDecide}
                        disabled={busyAction === 'decide'}
                        className='w-full px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-60 text-sm font-semibold'
                      >
                        {busyAction === 'decide' ? 'Recording decision...' : 'Record decision'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
