'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowLeft, Send, Clock, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { appealsApi } from '@/lib/api'

interface Appeal {
  appeal_id: string
  target_type: 'MEMORIAL' | 'COMMENT' | 'USER' | 'DISPUTE' | 'ORDER' | 'OTHER'
  target_id: string
  reason?: string | null
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  decision?: 'UPHELD' | 'OVERTURNED' | 'PARTIALLY_OVERTURNED' | 'OTHER' | null
  resolution_notes?: string | null
  created_at: string
  decided_at?: string | null
}

interface PaginationMeta {
  current_page: number
  total_pages: number
  total_records: number
  per_page: number
}

export default function MyAppealsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace('/signin')
      return
    }

    if (user.role === 'Administrator') {
      router.replace('/admin')
      return
    }

    loadAppeals(1)
  }, [user, authLoading, router])

  const loadAppeals = async (targetPage: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await appealsApi.getMyAppeals(targetPage, 20)
      const data = res.data?.data
      setAppeals(data?.appeals || [])
      setPagination(data?.pagination || null)
      setPage(targetPage)
    } catch (err: any) {
      console.error('Failed to load appeals', err)
      setError(err?.response?.data?.message || 'Failed to load your appeals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    if (!user) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      // For now, appeals are account-related, so target is the current user
      const userId = user?.user_id ?? user?.id
      if (!userId) {
        throw new Error('Missing user id for appeal')
      }

      await appealsApi.submitAppeal({
        target_type: 'USER',
        target_id: userId,
        reason: message.trim(),
      })

      setMessage('')
      setSubmitSuccess('Your appeal has been submitted. Our team will review it and get back to you.')
      await loadAppeals(1)
    } catch (err: any) {
      console.error('Failed to submit appeal', err)
      const msg = err?.response?.data?.message || 'Failed to submit appeal'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePageChange = (target: number) => {
    if (!pagination) return
    if (target < 1 || target > pagination.total_pages) return
    loadAppeals(target)
  }

  const formatStatus = (status: Appeal['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pending review'
      case 'IN_REVIEW':
        return 'In review'
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const statusBadgeClasses = (status: Appeal['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'IN_REVIEW':
        return 'bg-blue-500/20 text-blue-300'
      case 'APPROVED':
        return 'bg-green-500/20 text-green-300'
      case 'REJECTED':
        return 'bg-red-500/20 text-red-300'
      case 'CANCELLED':
        return 'bg-gray-500/20 text-gray-300'
      default:
        return 'bg-primary-700 text-accent-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-accent-300 hover:text-accent-100 text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <header className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-accent-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Appeals & Support</h1>
              <p className="text-accent-300 text-sm">
                Send a request to our admin team if you believe a decision was unfair, or if you need help with
                your account or memorials.
              </p>
            </div>
          </div>
        </header>

        {/* Layout: form + list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit form */}
          <section className="lg:col-span-1 bg-primary-800/80 border border-primary-700 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-accent-300" />
              <span>Submit a new appeal</span>
            </h2>
            <p className="text-xs text-accent-400">
              This message will be visible to administrators and super admins. Please be clear about what happened
              and what you would like us to review.
            </p>

            {submitError && (
              <div className="text-xs text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="text-xs text-green-300 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-accent-300 mb-1">Your message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Describe your issue, which memorial or decision it relates to (if any), and how we can help."
                  className="w-full px-3 py-2 rounded-lg bg-primary-900/60 border border-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-accent-800 disabled:text-accent-400 text-sm font-semibold transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send appeal
                  </>
                )}
              </button>

              <p className="text-[11px] text-accent-500">
                We aim to review most appeals within a few days. You can track the status of your requests on the
                right.
              </p>
            </form>
          </section>

          {/* Appeals list */}
          <section className="lg:col-span-2 bg-primary-800/80 border border-primary-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-accent-300" />
                <span>My appeals</span>
              </h2>
              {pagination && (
                <span className="text-xs text-accent-400">
                  Showing page {pagination.current_page} of {pagination.total_pages}
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-accent-300">Loading your appeals...</p>
            ) : error ? (
              <p className="text-sm text-red-300">{error}</p>
            ) : appeals.length === 0 ? (
              <p className="text-sm text-accent-300">
                You have not submitted any appeals yet. Use the form on the left to send your first request.
              </p>
            ) : (
              <div className="space-y-3">
                {appeals.map((appeal) => (
                  <div
                    key={appeal.appeal_id}
                    className="bg-primary-900/60 border border-primary-700 rounded-xl p-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {appeal.status === 'APPROVED' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : appeal.status === 'REJECTED' ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-accent-400" />
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusBadgeClasses(appeal.status)}`}>
                          {formatStatus(appeal.status)}
                        </span>
                      </div>
                      <span className="text-[11px] text-accent-400">
                        {new Date(appeal.created_at).toLocaleString()}
                      </span>
                    </div>

                    {appeal.reason && (
                      <p className="text-accent-200 whitespace-pre-wrap break-words">
                        {appeal.reason}
                      </p>
                    )}

                    <div className="text-[11px] text-accent-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Appeal ID: {appeal.appeal_id}</span>
                      <span>Target: {appeal.target_type}</span>
                      {appeal.decision && <span>Decision: {appeal.decision}</span>}
                    </div>

                    {appeal.resolution_notes && (
                      <div className="mt-1 text-[11px] text-green-200 bg-green-900/20 border border-green-700/40 rounded-lg px-2 py-1">
                        <span className="font-semibold mr-1">From admin:</span>
                        {appeal.resolution_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-accent-300">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {pagination.total_pages} • {pagination.total_records} appeals
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.total_pages}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
