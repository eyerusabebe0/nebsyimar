'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/api'

interface AdminMemorialOwner {
  user_id: string
  name: string
  email: string
}

interface AdminMemorialSettings {
  allow_comments?: boolean
  allow_gifts?: boolean
  allow_stories?: boolean
  show_gift_amounts?: boolean
  comment_moderation?: string
}

interface AdminMemorialData {
  memorial_id: string
  deceased_name: string
  deceased_name_amharic?: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY'
  admin_visibility?: 'NONE' | 'FORCE_PUBLIC' | 'FORCE_PRIVATE' | 'FORCE_FAMILY_ONLY'
  paid_status?: boolean
  is_active?: boolean
  comments_locked?: boolean
  is_hidden_by_admin?: boolean
  is_featured?: boolean
  sensitivity_level?: 'NORMAL' | 'SENSITIVE'
  review_status?: 'NORMAL' | 'NEEDS_REVIEW' | 'SENSITIVE' | 'HIDDEN'
  admin_notes?: string | null
  view_count?: number
  gift_count?: number
  total_gifts_value?: string
  created_at: string
  memorial_settings?: AdminMemorialSettings
  creator?: AdminMemorialOwner
}

interface AdminMemorialCommentAuthor {
  user_id: string
  name: string
  email?: string
}

interface AdminMemorialComment {
  comment_id: string
  user_id: string
  memorial_id: string
  message: string
  visibility: string
  is_deleted: boolean
  created_at: string
  author?: AdminMemorialCommentAuthor
}

interface AdminMemorialGiftSender {
  user_id: string
  name: string
}

interface AdminMemorialGiftGift {
  gift_id: string
  name: string
  animation_type?: string | null
  icon_url?: string | null
}

interface AdminMemorialGift {
  txn_id: string
  amount: string
  currency: string
  created_at: string
  sender?: AdminMemorialGiftSender
  gift?: AdminMemorialGiftGift
}

interface AdminMemorialDetailResponse {
  memorial: AdminMemorialData
  comments: AdminMemorialComment[]
  gifts: AdminMemorialGift[]
}

interface ModerationFormState {
  comments_locked: boolean
  admin_visibility: 'NONE' | 'FORCE_PUBLIC' | 'FORCE_PRIVATE' | 'FORCE_FAMILY_ONLY'
  is_hidden_by_admin: boolean
  is_featured: boolean
  sensitivity_level: 'NORMAL' | 'SENSITIVE'
  admin_notes: string
}

export default function AdminMemorialModerationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()

  const memorialId = (params?.memorialId as string) || ''

  const [detail, setDetail] = useState<AdminMemorialDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ModerationFormState | null>(null)

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

    if (!memorialId) {
      setError('Missing memorial identifier')
      setLoading(false)
      return
    }

    const loadDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await adminApi.getMemorialDetail(memorialId)
        const data = res.data?.data as AdminMemorialDetailResponse
        setDetail(data)
        if (data?.memorial) {
          const m = data.memorial
          setForm({
            comments_locked: m.comments_locked ?? false,
            admin_visibility: (m.admin_visibility as ModerationFormState['admin_visibility']) || 'NONE',
            is_hidden_by_admin: m.is_hidden_by_admin ?? false,
            is_featured: m.is_featured ?? false,
            sensitivity_level: (m.sensitivity_level as ModerationFormState['sensitivity_level']) || 'NORMAL',
            admin_notes: m.admin_notes || '',
          })
        } else {
          setForm({
            comments_locked: false,
            admin_visibility: 'NONE',
            is_hidden_by_admin: false,
            is_featured: false,
            sensitivity_level: 'NORMAL',
            admin_notes: '',
          })
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load memorial detail')
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [user, isLoading, router, memorialId])

  const role = (user as any)?.role

  if (isLoading || !user || role !== 'Administrator') {
    return null
  }

  const memorial = detail?.memorial
  const comments = detail?.comments || []
  const gifts = detail?.gifts || []

  const handleSave = async () => {
    if (!form || !memorial) return
    try {
      setSaving(true)
      const res = await adminApi.moderateMemorial(memorial.memorial_id, form)
      const updated = (res.data?.data?.memorial || memorial) as AdminMemorialData
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              memorial: updated,
            }
          : prev,
      )
      setForm({
        comments_locked: updated.comments_locked ?? form.comments_locked,
        admin_visibility:
          (updated.admin_visibility as ModerationFormState['admin_visibility']) || form.admin_visibility,
        is_hidden_by_admin: updated.is_hidden_by_admin ?? form.is_hidden_by_admin,
        is_featured: updated.is_featured ?? form.is_featured,
        sensitivity_level:
          (updated.sensitivity_level as ModerationFormState['sensitivity_level']) || form.sensitivity_level,
        admin_notes: updated.admin_notes || form.admin_notes,
      })
      if (typeof window !== 'undefined') {
        window.alert('Memorial moderation updated')
      }
    } catch (err) {
      console.error('Failed to update memorial moderation', err)
      if (typeof window !== 'undefined') {
        window.alert('Failed to update memorial moderation')
      }
    } finally {
      setSaving(false)
    }
  }

  const renderSettingsSummary = () => {
    const settings = memorial?.memorial_settings || {}
    const allowComments = (settings.allow_comments ?? true) ? 'On' : 'Off'
    const allowGifts = (settings.allow_gifts ?? true) ? 'On' : 'Off'
    const allowStories = (settings.allow_stories ?? true) ? 'On' : 'Off'
    const showGiftAmounts = (settings.show_gift_amounts ?? true) ? 'On' : 'Off'
    const moderationMode = settings.comment_moderation || 'none'

    return (
      <div className="space-y-1 text-xs text-accent-200">
        <div>Comments: {allowComments}</div>
        <div>Gifts: {allowGifts}</div>
        <div>Stories: {allowStories}</div>
        <div>Show gift amounts: {showGiftAmounts}</div>
        <div>Comment moderation: {moderationMode}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Moderate Memorial</h1>
            <p className="text-accent-300 text-sm">
              Review this memorial, its comments, and gifts, and apply admin-only moderation controls.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/memorials')}
            className="px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
          >
            Back to list
          </button>
        </header>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading && !memorial ? (
          <div className="text-sm text-accent-200">Loading memorial...</div>
        ) : !memorial ? (
          <div className="text-sm text-accent-200">Memorial not found.</div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-accent-300 mb-1">Memorial</div>
                      <div className="text-xl font-semibold">{memorial.deceased_name}</div>
                      {memorial.deceased_name_amharic && (
                        <div className="text-sm text-accent-200 mt-1">{memorial.deceased_name_amharic}</div>
                      )}
                      <div className="text-xs text-accent-400 mt-2">
                        Created {new Date(memorial.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1 text-xs">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 mr-1">
                          {memorial.visibility}
                        </span>
                        {memorial.admin_visibility && memorial.admin_visibility !== 'NONE' && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-700/70 text-purple-100">
                            Admin visibility: {memorial.admin_visibility.replace('FORCE_', '')}
                          </span>
                        )}
                      </div>
                      <div className="space-x-1 mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full ${
                            memorial.is_active ? 'bg-emerald-600/20 text-emerald-200' : 'bg-red-700/30 text-red-200'
                          }`}
                        >
                          {memorial.is_active ? 'Active' : 'Archived'}
                        </span>
                        {memorial.review_status && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200">
                            Review: {memorial.review_status}
                          </span>
                        )}
                        {memorial.sensitivity_level === 'SENSITIVE' && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-700/60 text-yellow-100">
                            Sensitive
                          </span>
                        )}
                        {memorial.is_hidden_by_admin && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-red-800/70 text-red-100">
                            Hidden by admin
                          </span>
                        )}
                        {memorial.is_featured && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-700/70 text-amber-100">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-accent-200">
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Metrics</div>
                      <div>Views: {memorial.view_count ?? 0}</div>
                      <div>Gifts: {memorial.gift_count ?? 0}</div>
                      <div>Total gifts: {memorial.total_gifts_value ?? '0.00'} ETB</div>
                    </div>
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Owner</div>
                      {memorial.creator ? (
                        <>
                          <div>{memorial.creator.name}</div>
                          <div className="text-[11px] text-accent-300">{memorial.creator.email}</div>
                          <div className="text-[11px] text-accent-400 mt-1">
                            user_id: {memorial.creator.user_id}
                          </div>
                        </>
                      ) : (
                        <div className="text-accent-300">Unknown owner</div>
                      )}
                    </div>
                    <div>
                      <div className="text-accent-300 text-[11px] mb-1">Memorial settings</div>
                      {renderSettingsSummary()}
                    </div>
                  </div>
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-2">Comments on this memorial</div>
                  {comments.length === 0 ? (
                    <div className="text-xs text-accent-300">No comments found.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="text-accent-300 border-b border-primary-700">
                          <tr>
                            <th className="py-1 pr-2 text-left">Comment</th>
                            <th className="py-1 pr-2 text-left">Author</th>
                            <th className="py-1 pr-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comments.map((c) => (
                            <tr key={c.comment_id} className="border-b border-primary-700/60 align-top">
                              <td className="py-1 pr-2 max-w-xs">
                                <div className="whitespace-pre-wrap break-words text-accent-100">{c.message}</div>
                                <div className="text-[11px] text-accent-400 mt-1">
                                  {new Date(c.created_at).toLocaleString()} • id: {c.comment_id}
                                </div>
                              </td>
                              <td className="py-1 pr-2">
                                {c.author ? (
                                  <>
                                    <div>{c.author.name}</div>
                                    <div className="text-[11px] text-accent-300">{c.author.email}</div>
                                    <div className="text-[11px] text-accent-400 mt-1">user_id: {c.user_id}</div>
                                  </>
                                ) : (
                                  <div className="text-[11px] text-accent-300">user_id: {c.user_id}</div>
                                )}
                              </td>
                              <td className="py-1 pr-2">
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 text-[11px]">
                                    {c.visibility}
                                  </span>
                                </div>
                                {c.is_deleted && (
                                  <div className="text-[11px] text-red-300 mt-1">Deleted</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-primary-800/70 border border-primary-700 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-2">Recent gifts on this memorial</div>
                  {gifts.length === 0 ? (
                    <div className="text-xs text-accent-300">No gifts found.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="text-accent-300 border-b border-primary-700">
                          <tr>
                            <th className="py-1 pr-2 text-left">Gift</th>
                            <th className="py-1 pr-2 text-left">Sender</th>
                            <th className="py-1 pr-2 text-left">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gifts.map((g) => (
                            <tr key={g.txn_id} className="border-b border-primary-700/60 align-top">
                              <td className="py-1 pr-2">
                                {g.gift ? (
                                  <div>
                                    <div>{g.gift.name}</div>
                                    {g.gift.animation_type && (
                                      <div className="text-[11px] text-accent-300">
                                        {g.gift.animation_type} animation
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-accent-300">Gift</div>
                                )}
                              </td>
                              <td className="py-1 pr-2">
                                {g.sender ? (
                                  <>
                                    <div>{g.sender.name}</div>
                                    <div className="text-[11px] text-accent-400 mt-1">user_id: {g.sender.user_id}</div>
                                  </>
                                ) : (
                                  <div className="text-[11px] text-accent-300">Unknown sender</div>
                                )}
                              </td>
                              <td className="py-1 pr-2">
                                <div>
                                  {g.amount} {g.currency}
                                </div>
                                <div className="text-[11px] text-accent-400 mt-1">
                                  {new Date(g.created_at).toLocaleString()}
                                </div>
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
                  <div className="text-sm font-semibold mb-3">Moderation controls</div>
                  {!form ? (
                    <div className="text-xs text-accent-300">Loading moderation state...</div>
                  ) : (
                    <div className="space-y-4 text-xs text-accent-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Lock comments</div>
                          <div className="text-[11px] text-accent-300">
                            When locked, no new comments can be added to this memorial.
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.comments_locked}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                comments_locked: e.target.checked,
                              })
                            }
                          />
                          <span>{form.comments_locked ? 'Locked' : 'Unlocked'}</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">Admin visibility override</div>
                          <div className="text-[11px] text-accent-300">
                            Force this memorial to be public, private, or family-only regardless of owner setting.
                          </div>
                        </div>
                        <select
                          value={form.admin_visibility}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              admin_visibility: e.target.value as ModerationFormState['admin_visibility'],
                            })
                          }
                          className="px-2 py-1 rounded bg-primary-700 border border-primary-600 text-xs"
                        >
                          <option value="NONE">No override</option>
                          <option value="FORCE_PUBLIC">Force public</option>
                          <option value="FORCE_PRIVATE">Force private</option>
                          <option value="FORCE_FAMILY_ONLY">Force family only</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Hide from public</div>
                          <div className="text-[11px] text-accent-300">
                            When hidden, the memorial is removed from public listings and views.
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.is_hidden_by_admin}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                is_hidden_by_admin: e.target.checked,
                              })
                            }
                          />
                          <span>{form.is_hidden_by_admin ? 'Hidden' : 'Visible'}</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Featured memorial</div>
                          <div className="text-[11px] text-accent-300">
                            Mark this memorial as featured for higher prominence in lists.
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                is_featured: e.target.checked,
                              })
                            }
                          />
                          <span>{form.is_featured ? 'Featured' : 'Normal'}</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">Content sensitivity</div>
                          <div className="text-[11px] text-accent-300">
                            Flag this memorial as sensitive to handle it more carefully in the UI.
                          </div>
                        </div>
                        <select
                          value={form.sensitivity_level}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              sensitivity_level: e.target.value as ModerationFormState['sensitivity_level'],
                            })
                          }
                          className="px-2 py-1 rounded bg-primary-700 border border-primary-600 text-xs"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="SENSITIVE">Sensitive</option>
                        </select>
                      </div>

                      <div>
                        <div className="font-medium mb-1">Admin notes</div>
                        <textarea
                          value={form.admin_notes}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              admin_notes: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="Internal notes about why this memorial was moderated, policy references, etc."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-60 text-sm font-semibold"
                        >
                          {saving ? 'Saving...' : 'Save moderation changes'}
                        </button>
                      </div>
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
