'use client'

import React, { useState } from 'react'
import { Heart, Phone, MessageCircle, Book, Users, Clock, ChevronRight, X, ExternalLink } from 'lucide-react'

interface GriefResource {
  id: string
  title: string
  description: string
  type: 'hotline' | 'article' | 'support_group' | 'professional' | 'book'
  contact?: string
  url?: string
  availability?: string
}

const griefResources: GriefResource[] = [
  {
    id: '1',
    title: 'Crisis Support Hotline',
    description: '24/7 emotional support for those experiencing acute grief',
    type: 'hotline',
    contact: '988',
    availability: '24/7'
  },
  {
    id: '2',
    title: 'Understanding the Grief Process',
    description: 'Learn about the stages of grief and what to expect',
    type: 'article',
    url: '#'
  },
  {
    id: '3',
    title: 'Local Grief Support Groups',
    description: 'Connect with others who understand your journey',
    type: 'support_group',
    contact: 'Find groups near you'
  },
  {
    id: '4',
    title: 'Professional Counseling Services',
    description: 'Licensed therapists specializing in grief and loss',
    type: 'professional',
    contact: 'Schedule consultation'
  },
  {
    id: '5',
    title: 'Healing After Loss: A Guide',
    description: 'Practical strategies for navigating grief',
    type: 'book',
    url: '#'
  }
]

const griefTips = [
  {
    title: 'Allow Yourself to Feel',
    description: 'Grief is a natural response to loss. There\'s no "right" way to grieve.'
  },
  {
    title: 'Take Care of Your Body',
    description: 'Eat regularly, stay hydrated, and try to get enough sleep.'
  },
  {
    title: 'Accept Help from Others',
    description: 'Let friends and family support you during this difficult time.'
  },
  {
    title: 'Create Meaningful Rituals',
    description: 'Honor your loved one\'s memory in ways that feel right to you.'
  },
  {
    title: 'Be Patient with Yourself',
    description: 'Healing takes time. Some days will be harder than others.'
  }
]

interface GriefSupportProps {
  isOpen: boolean
  onClose: () => void
  context?: 'memorial_creation' | 'viewing' | 'general'
}

export default function GriefSupport({ isOpen, onClose, context = 'general' }: GriefSupportProps) {
  const [activeTab, setActiveTab] = useState<'resources' | 'tips'>('resources')

  if (!isOpen) return null

  const getContextMessage = () => {
    switch (context) {
      case 'memorial_creation':
        return 'Creating a memorial can bring up many emotions. Remember that this is a healing process, and it\'s okay to take breaks when you need them.'
      case 'viewing':
        return 'Visiting memorials can evoke strong emotions and memories. Take your time and be gentle with yourself.'
      default:
        return 'Grief is a personal journey. These resources are here to support you whenever you need them.'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hotline':
        return Phone
      case 'article':
        return Book
      case 'support_group':
        return Users
      case 'professional':
        return MessageCircle
      case 'book':
        return Book
      default:
        return Heart
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-primary-800 border border-primary-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Grief Support</h2>
                <p className="text-accent-400 text-sm">You're not alone in this journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-accent-400 hover:text-accent-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Context Message */}
        <div className="p-6 bg-accent-500/10 border-b border-primary-700">
          <p className="text-accent-200 leading-relaxed">
            {getContextMessage()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary-700">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'text-accent-100 border-b-2 border-accent-500'
                : 'text-accent-400 hover:text-accent-300'
            }`}
          >
            Resources & Support
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'text-accent-100 border-b-2 border-accent-500'
                : 'text-accent-400 hover:text-accent-300'
            }`}
          >
            Coping Tips
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'resources' ? (
            <div className="space-y-4">
              {griefResources.map((resource) => {
                const Icon = getResourceIcon(resource.type)
                
                return (
                  <div
                    key={resource.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-accent-100 font-semibold mb-1">
                          {resource.title}
                        </h4>
                        <p className="text-accent-300 text-sm mb-2">
                          {resource.description}
                        </p>
                        
                        {resource.contact && (
                          <div className="flex items-center space-x-2">
                            <span className="text-accent-400 text-sm">Contact:</span>
                            <span className="text-accent-200 text-sm font-medium">
                              {resource.contact}
                            </span>
                            {resource.availability && (
                              <>
                                <span className="text-accent-500">•</span>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-accent-400" />
                                  <span className="text-accent-400 text-xs">
                                    {resource.availability}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {resource.url && (
                          <button className="inline-flex items-center space-x-1 text-accent-400 hover:text-accent-300 text-sm mt-2 transition-colors">
                            <span>Learn more</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {griefTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <h4 className="text-accent-100 font-semibold mb-2 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-accent-500/20 rounded-full flex items-center justify-center text-xs text-accent-400 font-bold">
                      {index + 1}
                    </div>
                    <span>{tip.title}</span>
                  </h4>
                  <p className="text-accent-300 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary-700 bg-primary-900/50">
          <div className="text-center">
            <p className="text-accent-300 text-sm mb-3">
              If you're experiencing thoughts of self-harm, please reach out immediately:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
                <Phone className="w-4 h-4" />
                <span>Emergency: 911</span>
              </button>
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Crisis Text Line: 988</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easy grief support integration
export function useGriefSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<'memorial_creation' | 'viewing' | 'general'>('general')

  const openSupport = (supportContext?: 'memorial_creation' | 'viewing' | 'general') => {
    if (supportContext) setContext(supportContext)
    setIsOpen(true)
  }

  const closeSupport = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    context,
    openSupport,
    closeSupport
  }
}
