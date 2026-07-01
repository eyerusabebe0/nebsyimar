'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Heart, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { memorialApi } from '@/lib/api'

interface MemorialCommentsProps {
  memorialId: string
  isMemorialOwner?: boolean
  memorialSettings?: {
    allow_comments: boolean
    comment_moderation: 'none' | 'moderate' | 'approval_required'
    auto_approve_family: boolean
    blocked_users: string[]
  }
}

interface MemorialComment {
  id: string
  author: string
  time: string
  message: string
  likes: number
}

export default function MemorialComments({ 
  memorialId, 
  isMemorialOwner = false,
  memorialSettings = {
    allow_comments: true,
    comment_moderation: 'none',
    auto_approve_family: false,
    blocked_users: []
  }
}: MemorialCommentsProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Administrator'
  const currentUserInitials =
    user?.name
      ? user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
      : 'You'

  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<MemorialComment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const res = await memorialApi.getComments(memorialId, 1, 50)
      const apiComments = res.data?.data?.comments || []
      const mapped: MemorialComment[] = apiComments.map((c: any) => ({
        id: c.comment_id as string,
        author: c.author?.name || 'Anonymous',
        time: c.created_at ? new Date(c.created_at).toLocaleString() : '',
        message: c.message as string,
        likes: typeof c.likes_count === 'number' ? c.likes_count : 0,
      }))

      const initialLiked: Record<string, boolean> = {}
      apiComments.forEach((c: any) => {
        if (c.liked_by_current_user) {
          initialLiked[c.comment_id as string] = true
        }
      })

      setComments(mapped)
      setLikedComments(initialLiked)
    } catch (err) {
      // Swallow error for now; UI will just show no comments
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!memorialId) return
    loadComments()
  }, [memorialId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newComment.trim()
    if (!trimmed) return

    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
      return
    }

    try {
      setIsSubmitting(true)
      const finalMessage =
        replyTo && !trimmed.startsWith('@') ? `@${replyTo.author} ${trimmed}` : trimmed

      const res = await memorialApi.addComment(memorialId, finalMessage)
      const created = res.data?.data?.comment
      
      if (created) {
        // Show different behavior based on moderation settings
        if (memorialSettings.comment_moderation === 'approval_required') {
          // Don't add to visible comments, show pending message
          if (typeof window !== 'undefined') {
            window.alert('Your comment has been submitted and is pending approval by the memorial creator.')
          }
        } else {
          // Add to visible comments immediately
          const mapped: MemorialComment = {
            id: created.comment_id as string,
            author: created.author?.name || user?.name || 'You',
            time: created.created_at ? new Date(created.created_at).toLocaleString() : '',
            message: created.message as string,
            likes: 0,
          }
          setComments((prev) => [mapped, ...prev])
        }
      }
      setNewComment('')
      setReplyTo(null)
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.alert('Failed to post comment')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeToggle = async (id: string) => {
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
      return
    }

    try {
      const res = await memorialApi.toggleLike(memorialId, id)
      const data = res.data?.data || {}
      const liked = !!data.liked
      const likesCount = typeof data.likes_count === 'number' ? data.likes_count : undefined

      setLikedComments((prev) => ({
        ...prev,
        [id]: liked,
      }))

      if (likesCount !== undefined) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === id ? { ...comment, likes: likesCount } : comment
          )
        )
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.alert('Failed to update like')
      }
    }
  }

  const handleReplyClick = (comment: MemorialComment) => {
    setReplyTo({ id: comment.id, author: comment.author })
    if (!newComment.trim()) {
      setNewComment(`@${comment.author} `)
    }
    // Focus textarea after state updates
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleDeleteComment = async (id: string) => {
    const canDeleteComments = isAdmin

    if (!user || !canDeleteComments) return
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this comment?')
      if (!confirmed) return
    }

    try {
      await memorialApi.deleteComment(memorialId, id)
      setComments((prev) => prev.filter((comment) => comment.id !== id))
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.alert('Failed to delete comment')
      }
    }
  }

  return (
    <div className="memorial-card rounded-lg p-3 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center space-x-2 text-lg font-semibold text-white hover:text-accent-300 transition-colors focus:outline-none"
        >
          <MessageCircle className="w-5 h-5 text-accent-400" />
          <span>Comments</span>
          <span className="text-accent-500 text-sm">({comments.length})</span>
        </button>
        <span className="text-accent-500 text-xs">
          {isOpen ? 'Hide comments' : 'Show comments'}
        </span>
      </div>

      {isOpen && (
        <>
          {/* Comments Disabled Notice */}
          {!memorialSettings.allow_comments && (
            <div className="bg-primary-800/10 border border-white/20 rounded-xl p-4 text-center">
              <MessageCircle className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <div className="text-accent-200 font-medium">Comments are disabled</div>
              <div className="text-accent-400 text-sm">
                The memorial creator has disabled comments for this memorial.
              </div>
            </div>
          )}

          {/* Moderation Notice */}
          {memorialSettings.allow_comments &&
            memorialSettings.comment_moderation === 'approval_required' &&
            !isMemorialOwner && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                <div className="text-blue-200 text-sm">
                  <strong>Moderated Comments:</strong> Your comments will be reviewed before
                  appearing on this memorial.
                </div>
              </div>
            )}

          {!memorialSettings.allow_comments ? null : (
            <>
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="space-y-3">
                  {replyTo && (
                    <div className="flex items-center justify-between text-xs text-accent-300">
                      <span>Replying to {replyTo.author}</span>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-accent-400 hover:text-accent-200"
                      >
                        Cancel reply
                      </button>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs">
                        {currentUserInitials}
                      </span>
                    </div>
                    <div className="flex-1 bg-primary-900/70 rounded-2xl px-3 py-2">
                      <textarea
                        ref={textareaRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="w-full bg-transparent border-none text-white text-sm placeholder-accent-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pl-10 pt-1">
                    <span className="text-accent-500 text-sm">
                      {newComment.length}/500 characters
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="flex items-center space-x-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-accent-700 disabled:to-accent-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {isLoading && comments.length === 0 ? (
                  <p className="text-sm text-accent-300">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-accent-300">
                    No comments yet. Be the first to comment.
                  </p>
                ) : (
                  comments.map((comment) => {
                    const isLiked = !!likedComments[comment.id]

                    return (
                      <div key={comment.id} className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-xs">
                            {comment.author
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="inline-block bg-primary-900/70 rounded-2xl px-3 py-2">
                            <span className="block text-white text-sm font-semibold mb-0.5">
                              {comment.author}
                            </span>
                            <p className="text-accent-200 text-sm leading-snug">
                              {comment.message}
                            </p>
                          </div>
                          <div className="flex items-center flex-wrap gap-3 mt-1 text-xs text-accent-500">
                            <button
                              type="button"
                              onClick={() => handleLikeToggle(comment.id)}
                              className={`flex items-center space-x-1 transition-colors ${
                                isLiked
                                  ? 'text-rose-400'
                                  : 'text-accent-500 hover:text-accent-400'
                              }`}
                            >
                              <Heart className="w-3 h-3" />
                              <span>
                                Like{comment.likes > 0 ? ` · ${comment.likes}` : ''}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplyClick(comment)}
                              className="text-accent-500 hover:text-accent-400"
                            >
                              Reply
                            </button>
                            <span className="text-accent-600 text-[11px]">{comment.time}</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="ml-auto text-[11px] text-red-300 hover:text-red-200"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
