'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, MessageCircle, Settings, Check, X, AlertTriangle, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userDashboardApi } from '@/lib/api'

interface CommentModerationPanelProps {
  memorialId: string
  isMemorialOwner: boolean
  currentSettings: {
    allow_comments: boolean
    comment_moderation: 'none' | 'moderate' | 'approval_required'
    auto_approve_family: boolean
    blocked_users: string[]
  }
  onSettingsUpdate: (settings: any) => void
}

interface PendingComment {
  id: string
  author: string
  authorId: string
  message: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function CommentModerationPanel({ 
  memorialId, 
  isMemorialOwner, 
  currentSettings,
  onSettingsUpdate 
}: CommentModerationPanelProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'pending' | 'blocked'>('settings')
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Don't show panel if user is not the memorial owner
  if (!isMemorialOwner) {
    return null
  }

  const loadPendingComments = async () => {
    try {
      setIsLoading(true)
      const response = await userDashboardApi.getPendingComments()
      
      if (response.data.success) {
        const comments = response.data.data.comments.map((comment: any) => ({
          id: comment.id,
          author: comment.author.name,
          authorId: comment.author.id,
          message: comment.message,
          timestamp: new Date(comment.created_at).toLocaleString(),
          status: 'pending' as const
        }))
        setPendingComments(comments)
      }
    } catch (error) {
      console.error('Failed to load pending comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'pending') {
      loadPendingComments()
    }
  }, [isOpen, activeTab])

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...currentSettings, [key]: value }
    onSettingsUpdate(newSettings)
  }

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      await userDashboardApi.moderateComment(memorialId, commentId, action)
      
      setPendingComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: action === 'approve' ? 'approved' : 'rejected' }
            : comment
        )
      )
    } catch (error) {
      console.error(`Failed to ${action} comment:`, error)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await userDashboardApi.blockUser(memorialId, userId, 'block')
      
      const newBlockedUsers = [...currentSettings.blocked_users, userId]
      handleSettingChange('blocked_users', newBlockedUsers)
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      await userDashboardApi.blockUser(memorialId, userId, 'unblock')
      
      const newBlockedUsers = currentSettings.blocked_users.filter(id => id !== userId)
      handleSettingChange('blocked_users', newBlockedUsers)
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

  const pendingCount = pendingComments.filter(c => c.status === 'pending').length

  return (
    <>
      {/* Floating Moderation Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
        title="Comment Moderation"
      >
        <div className="relative">
          <Shield className="w-6 h-6" />
          {pendingCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingCount}
            </div>
          )}
        </div>
      </button>

      {/* Moderation Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Comment Moderation</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-accent-400 hover:text-accent-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
              {[
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'pending', label: `Pending (${pendingCount})`, icon: MessageCircle },
                { id: 'blocked', label: 'Blocked Users', icon: Users }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-accent-300 hover:text-accent-100 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="memorial-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-accent-100 mb-4">Comment Controls</h3>
                    
                    {/* Allow Comments Toggle */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-accent-200 font-medium">Allow Comments</div>
                        <div className="text-accent-400 text-sm">Enable or disable all comments on this memorial</div>
                      </div>
                      <button
                        onClick={() => handleSettingChange('allow_comments', !currentSettings.allow_comments)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          currentSettings.allow_comments ? 'bg-green-500' : 'bg-accent-600'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          currentSettings.allow_comments ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Moderation Level */}
                    {currentSettings.allow_comments && (
                      <div className="mb-6">
                        <div className="text-accent-200 font-medium mb-3">Moderation Level</div>
                        <div className="space-y-3">
                          {[
                            {
                              value: 'none',
                              label: 'No Moderation',
                              description: 'Comments appear immediately (you can still delete them later)'
                            },
                            {
                              value: 'moderate',
                              label: 'Light Moderation',
                              description: 'Comments appear immediately, but you get notified to review'
                            },
                            {
                              value: 'approval_required',
                              label: 'Approval Required',
                              description: 'All comments must be approved before appearing'
                            }
                          ].map(option => (
                            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="moderation"
                                value={option.value}
                                checked={currentSettings.comment_moderation === option.value}
                                onChange={(e) => handleSettingChange('comment_moderation', e.target.value)}
                                className="mt-1 text-blue-500"
                              />
                              <div>
                                <div className="text-accent-200 font-medium">{option.label}</div>
                                <div className="text-accent-400 text-sm">{option.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-approve Family */}
                    {currentSettings.allow_comments && currentSettings.comment_moderation === 'approval_required' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-accent-200 font-medium">Auto-approve Family</div>
                          <div className="text-accent-400 text-sm">Automatically approve comments from family members</div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('auto_approve_family', !currentSettings.auto_approve_family)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            currentSettings.auto_approve_family ? 'bg-green-500' : 'bg-accent-600'
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            currentSettings.auto_approve_family ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-blue-200 font-medium mb-1">Why Comment Moderation Matters</div>
                        <div className="text-blue-300 text-sm leading-relaxed">
                          During times of grief, families have different comfort levels about what's visible. 
                          These controls help you create a safe, respectful space while still allowing people 
                          to share their condolences and memories.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Comments Tab */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="text-accent-300">Loading pending comments...</div>
                    </div>
                  ) : pendingComments.filter(c => c.status === 'pending').length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-accent-500 mx-auto mb-3" />
                      <div className="text-accent-300">No pending comments</div>
                      <div className="text-accent-500 text-sm">All comments are up to date</div>
                    </div>
                  ) : (
                    pendingComments
                      .filter(comment => comment.status === 'pending')
                      .map(comment => (
                        <div key={comment.id} className="memorial-card rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-accent-200 font-medium">{comment.author}</div>
                              <div className="text-accent-500 text-sm">{comment.timestamp}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCommentAction(comment.id, 'approve')}
                                className="flex items-center space-x-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleCommentAction(comment.id, 'reject')}
                                className="flex items-center space-x-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => handleBlockUser(comment.authorId)}
                                className="flex items-center space-x-1 bg-accent-500/20 hover:bg-accent-500/30 text-accent-200 px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                <EyeOff className="w-4 h-4" />
                                <span>Block</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-accent-300 leading-relaxed">{comment.message}</div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Blocked Users Tab */}
              {activeTab === 'blocked' && (
                <div className="space-y-4">
                  {currentSettings.blocked_users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-accent-500 mx-auto mb-3" />
                      <div className="text-accent-300">No blocked users</div>
                      <div className="text-accent-500 text-sm">Users you block will be listed here</div>
                    </div>
                  ) : (
                    currentSettings.blocked_users.map(userId => (
                      <div key={userId} className="memorial-card rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-accent-200 font-medium">User {userId}</div>
                          <div className="text-accent-500 text-sm">Blocked from commenting</div>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(userId)}
                          className="flex items-center space-x-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Unblock</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
