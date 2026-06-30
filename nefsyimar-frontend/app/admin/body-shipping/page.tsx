'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface BodyShippingSubmission {
  deceased_full_name: string
  date_of_birth: string
  date_of_death: string
  place_of_death: string
  passport_or_id: string
  shipping_agency: string
  air_waybill_no: string
  flight_number: string
  departure_date: string
  estimated_arrival_time: string
  receiver_full_name: string
  receiver_phone: string
  receiver_email: string
  submitted_at: string
}

export default function BodyShippingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [submissions, setSubmissions] = useState<BodyShippingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ current_page: number; total_pages: number; total_records: number; per_page: number } | null>(null)

  const loadSubmissions = async (targetPage = 1) => {
    setLoading(true)
    setError(null)

    try {
      const response = await adminApi.getRepatriationSubmissions(targetPage, 20)
      const data = response.data?.data
      setSubmissions(data?.submissions || [])
      setPagination(data?.pagination || null)
      setPage(targetPage)
    } catch (err: any) {
      console.error('Failed to load repatriation submissions', err)
      setError(err?.response?.data?.message || 'Unable to load body shipping requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/signin')
      return
    }
    if (user.role !== 'Administrator') {
      router.replace('/dashboard')
      return
    }
    loadSubmissions(1)
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Admin</p>
            <h1 className="text-3xl font-bold text-white">Body Shipping Requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Review repatriation and body transport requests received through the platform.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 bg-slate-800/70 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Incoming requests</h2>
                <p className="text-sm text-slate-400">{submissions.length} submission(s) available</p>
              </div>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No body shipping submissions have been received yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {submissions.map((submission, index) => (
                <div key={`${submission.submitted_at}-${index}`} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                          Request #{index + 1}
                        </span>
                        <span className="text-xs text-slate-500">
                          Submitted {new Date(submission.submitted_at).toLocaleString('en-US')}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{submission.deceased_full_name}</h3>
                      <p className="text-sm text-slate-400">
                        {submission.place_of_death}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-300">
                      <p className="font-semibold text-white">Transport details</p>
                      <p className="mt-2">Agency: {submission.shipping_agency || 'Not provided'}</p>
                      <p>Air waybill: {submission.air_waybill_no || 'Not provided'}</p>
                      <p>Flight: {submission.flight_number || 'Not provided'}</p>
                      <p>Departure: {submission.departure_date || 'Not provided'}</p>
                      <p>Arrival: {submission.estimated_arrival_time || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Personal details</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-300">
                        <p>Born: {submission.date_of_birth || 'Not provided'}</p>
                        <p>Died: {submission.date_of_death || 'Not provided'}</p>
                        <p>ID / Passport: {submission.passport_or_id || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Receiver</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-300">
                        <p>Name: {submission.receiver_full_name || 'Not provided'}</p>
                        <p>Phone: {submission.receiver_phone || 'Not provided'}</p>
                        <p>Email: {submission.receiver_email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
