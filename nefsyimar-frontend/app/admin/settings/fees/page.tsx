'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { settingsApi } from '@/lib/api'

export default function AdminFeeSettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [giftPlatformFee, setGiftPlatformFee] = useState<number | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingFee, setIsSavingFee] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feeError, setFeeError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true)
        setError(null)

        const res = await settingsApi.getAdminSettings()
        const giftFee = res.data?.data?.fees?.gift_platform_fee_percentage

        setGiftPlatformFee(
          typeof giftFee === 'number' && !Number.isNaN(giftFee) ? giftFee : null,
        )
      } catch (err: any) {
        console.error('Failed to load admin settings', err)
        setError(err?.response?.data?.message || 'Failed to load admin settings')
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [user, isLoading, router])

  const role = user?.role
  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const handleSaveGiftPlatformFee = async () => {
    if (giftPlatformFee === null || Number.isNaN(giftPlatformFee)) {
      setFeeError('Please enter a valid platform fee percentage.')
      return
    }

    try {
      setIsSavingFee(true)
      setFeeError(null)
      setSuccessMessage(null)

      await settingsApi.updateAdminSettings({
        fees: {
          gift_platform_fee_percentage: giftPlatformFee,
        },
      })

      setSuccessMessage('Platform fee updated successfully.')
    } catch (err: any) {
      console.error('Failed to update platform fee', err)
      setFeeError(err?.response?.data?.message || 'Failed to update platform fee')
    } finally {
      setIsSavingFee(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Settings</h1>
            <p className="text-accent-300 text-sm">Configure platform fees for gifts.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
          >
            Back to Dashboard
          </button>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
          <div className="mb-3">
            <h2 className="font-semibold">Platform Fee Settings</h2>
            <p className="text-xs text-accent-300">
              Controls the percentage the platform keeps from gift transactions.
            </p>
          </div>

          {isLoadingSettings ? (
            <p className="text-sm text-accent-300">Loading settings...</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
              <div className="flex-1">
                <label className="block text-xs text-accent-300 mb-1">Gift platform fee (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={giftPlatformFee ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (Number.isNaN(val)) {
                      setGiftPlatformFee(null)
                    } else {
                      setGiftPlatformFee(val)
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-primary-900 border border-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="e.g. 10"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveGiftPlatformFee}
                disabled={isSavingFee}
                className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:bg-accent-800 text-sm font-semibold"
              >
                {isSavingFee ? 'Saving…' : 'Save fee'}
              </button>
            </div>
          )}

          {feeError && (
            <p className="mt-2 text-xs text-red-300">{feeError}</p>
          )}

          {successMessage && !feeError && (
            <p className="mt-2 text-xs text-emerald-300">{successMessage}</p>
          )}

          {giftPlatformFee !== null && !feeError && (
            <p className="mt-2 text-xs text-accent-400">
              Current platform fee on gifts: <span className="font-semibold">{giftPlatformFee.toFixed(2)}%</span>
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
