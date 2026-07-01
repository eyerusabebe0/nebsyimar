'use client'

import React, { useState } from 'react'
import { ArrowLeft, Shield, MessageCircle, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import MemorialComments from '@/components/MemorialComments'
import CommentModerationPanel from '@/components/CommentModerationPanel'

export default function CommentModerationDemoPage() {
  const [memorialSettings, setMemorialSettings] = useState({
    allow_comments: true,
    comment_moderation: 'moderate' as 'none' | 'moderate' | 'approval_required',
    auto_approve_family: false,
    blocked_users: [] as string[]
  })

  const [isMemorialOwner, setIsMemorialOwner] = useState(true)

  const sampleMemorial = {
    id: 'demo-memorial-1',
    name: 'Ato Bekele Tadesse',
    nameAmharic: 'አቶ በቀለ ታደሰ',
    dateOfPassing: '2024-01-15'
  }

  const handleModerationSettingsUpdate = (newSettings: any) => {
    setMemorialSettings(newSettings)
    console.log('Updated moderation settings:', newSettings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/memorials"
            className="inline-flex items-center space-x-2 text-accent-300 hover:text-accent-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Memorials</span>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Comment Moderation System
            </h1>
            <p className="text-accent-200 text-lg max-w-3xl mx-auto leading-relaxed">
              Giving memorial creators control over comments to create safe, respectful spaces 
              during times of grief. Different comfort levels require different levels of control.
            </p>
          </div>

          {/* Demo Controls */}
          <div className="memorial-card rounded-3xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-accent-100 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-accent-400" />
              <span>Demo Controls</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  View as Memorial Owner
                </label>
                <button
                  onClick={() => setIsMemorialOwner(!isMemorialOwner)}
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    isMemorialOwner
                      ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                      : 'bg-accent-500/20 border border-accent-500/30 text-accent-200'
                  }`}
                >
                  {isMemorialOwner ? 'Memorial Owner (You)' : 'Regular Visitor'}
                </button>
              </div>
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Current Moderation Level
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-accent-100 font-medium capitalize">
                    {memorialSettings.comment_moderation.replace('_', ' ')}
                  </div>
                  <div className="text-accent-400 text-sm">
                    Comments: {memorialSettings.allow_comments ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memorial Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="memorial-card rounded-3xl p-6 text-center">
              <div className="w-24 h-24 bg-accent-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-accent-100 mb-2">
                {sampleMemorial.name}
              </h3>
              <p className="text-accent-300 mb-2">
                {sampleMemorial.nameAmharic}
              </p>
              <div className="text-accent-400 text-sm">
                Demo Memorial
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="memorial-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-accent-100 mb-4">
                Comment Moderation Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="font-medium text-accent-200 mb-2">No Moderation</div>
                  <div className="text-accent-300">Comments appear immediately, full visibility</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="font-medium text-accent-200 mb-2">Light Moderation</div>
                  <div className="text-accent-300">Comments appear but owner gets notifications</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="font-medium text-accent-200 mb-2">Approval Required</div>
                  <div className="text-accent-300">All comments need approval before showing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Shield,
              title: 'Comment Control',
              description: 'Enable/disable comments entirely'
            },
            {
              icon: MessageCircle,
              title: 'Moderation Levels',
              description: 'None, light, or approval required'
            },
            {
              icon: Users,
              title: 'User Blocking',
              description: 'Block specific users from commenting'
            },
            {
              icon: Settings,
              title: 'Family Auto-Approval',
              description: 'Automatically approve family members'
            }
          ].map((feature, index) => (
            <div key={index} className="memorial-card rounded-xl p-4 text-center">
              <feature.icon className="w-8 h-8 text-accent-400 mx-auto mb-3" />
              <h4 className="text-accent-200 font-medium mb-2">{feature.title}</h4>
              <p className="text-accent-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Live Comments Demo */}
        <div className="mb-8">
          <MemorialComments 
            memorialId={sampleMemorial.id}
            isMemorialOwner={isMemorialOwner}
            memorialSettings={memorialSettings}
          />
        </div>

        {/* Benefits Section */}
        <div className="memorial-card rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-accent-100 mb-6 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span>Why Comment Moderation Matters</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-accent-200 font-medium mb-3">For Grieving Families</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Control what appears during vulnerable times</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Prevent inappropriate or hurtful comments</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Create a safe space for genuine condolences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Manage family privacy preferences</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-200 font-medium mb-3">Platform Benefits</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Builds trust with families during grief</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Reduces need for manual content moderation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Encourages more memorial creation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Maintains respectful community standards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="memorial-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-accent-100 mb-4">
            Technical Implementation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Frontend Features</h4>
              <ul className="space-y-1 text-accent-400">
                <li>• Floating moderation panel for owners</li>
                <li>• Real-time pending comment notifications</li>
                <li>• Contextual user interface changes</li>
                <li>• Approval/rejection workflow</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-200 font-medium mb-2">Backend Integration</h4>
              <ul className="space-y-1 text-accent-400">
                <li>• Memorial settings in database</li>
                <li>• Comment visibility controls</li>
                <li>• User blocking system</li>
                <li>• Notification system hooks</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-200 font-medium mb-2">User Experience</h4>
              <ul className="space-y-1 text-accent-400">
                <li>• Clear status indicators</li>
                <li>• Graceful degradation</li>
                <li>• Mobile-responsive design</li>
                <li>• Accessibility compliant</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comment Moderation Panel (only shows for memorial owners) */}
        <CommentModerationPanel
          memorialId={sampleMemorial.id}
          isMemorialOwner={isMemorialOwner}
          currentSettings={memorialSettings}
          onSettingsUpdate={handleModerationSettingsUpdate}
        />
      </div>
    </div>
  )
}
