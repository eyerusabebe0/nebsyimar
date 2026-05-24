'use client'

import React, { useState } from 'react'
import { BookOpen, Heart, Sparkles, Users, Trophy, Smile, ChevronRight, ChevronDown, Lightbulb } from 'lucide-react'
import { useWizard } from '../WizardProvider'

const lifeStoryTemplates = [
  {
    id: 'earlyLife',
    title: 'Their Early Life',
    icon: Sparkles,
    description: 'Childhood, family, and formative years',
    prompts: [
      'Where were they born and raised?',
      'What was their family like growing up?',
      'What were their favorite childhood activities?',
      'What dreams did they have as a child?',
      'Who were the important people in their early life?'
    ],
    placeholder: 'Share stories about their childhood, family background, and the experiences that shaped who they became...'
  },
  {
    id: 'values',
    title: 'Their Values & Beliefs',
    icon: Heart,
    description: 'What they stood for and believed in',
    prompts: [
      'What principles guided their life?',
      'How did they treat others?',
      'What causes did they care about?',
      'What wisdom did they share?',
      'How did their faith or beliefs shape them?'
    ],
    placeholder: 'Describe the values that defined them, the principles they lived by, and the beliefs that gave their life meaning...'
  },
  {
    id: 'memories',
    title: 'What We\'ll Remember',
    icon: Smile,
    description: 'Special moments and cherished memories',
    prompts: [
      'What are your favorite memories with them?',
      'What made them laugh?',
      'What traditions did they love?',
      'What was their special way of showing love?',
      'What moments will you treasure forever?'
    ],
    placeholder: 'Share the beautiful memories, funny stories, and special moments that capture who they were...'
  },
  {
    id: 'achievements',
    title: 'Their Accomplishments',
    icon: Trophy,
    description: 'Professional and personal achievements',
    prompts: [
      'What were they most proud of?',
      'How did they make a difference in their work?',
      'What goals did they achieve?',
      'How did they help others succeed?',
      'What legacy did they build?'
    ],
    placeholder: 'Celebrate their achievements, both big and small, and the positive impact they had on others...'
  },
  {
    id: 'relationships',
    title: 'Their Relationships',
    icon: Users,
    description: 'How they connected with family and friends',
    prompts: [
      'What kind of friend/family member were they?',
      'How did they show they cared?',
      'What role did they play in your family?',
      'How did they bring people together?',
      'What would their friends say about them?'
    ],
    placeholder: 'Describe the relationships that mattered to them and how they touched the lives of others...'
  }
]

const personalityTraits = [
  'Kind', 'Generous', 'Funny', 'Wise', 'Strong', 'Gentle', 'Brave', 'Creative',
  'Loving', 'Patient', 'Inspiring', 'Hardworking', 'Compassionate', 'Loyal',
  'Adventurous', 'Thoughtful', 'Optimistic', 'Determined', 'Humble', 'Joyful'
]

export default function Step2LifeStory() {
  const { memorialData, updateLifeStory } = useWizard()
  const { lifeStory } = memorialData
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [showPrompts, setShowPrompts] = useState<{ [key: string]: boolean }>({})

  const togglePrompts = (templateId: string) => {
    setShowPrompts(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }))
  }

  const handleTraitToggle = (trait: string) => {
    const currentTraits = lifeStory.personalityTraits || []
    const updatedTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait]
    
    updateLifeStory({ personalityTraits: updatedTraits })
  }

  const updateTemplateContent = (templateId: string, content: string) => {
    updateLifeStory({ [templateId]: content })
  }

  const getCompletionCount = () => {
    const sections = ['earlyLife', 'values', 'memories', 'achievements', 'relationships']
    return sections.filter(section => {
      const value = lifeStory[section as keyof typeof lifeStory]
      return typeof value === 'string' && value.trim()
    }).length
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Emotional Support Header */}
      <div className="memorial-card rounded-3xl p-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-accent-400" />
          </div>
          <h3 className="text-2xl font-semibold text-accent-100 mb-3">
            Sharing Their Story
          </h3>
          <p className="text-accent-300 max-w-2xl mx-auto leading-relaxed">
            Take your time with this section. Each story you share helps others understand who they were 
            and keeps their memory alive. You don't need to fill everything at once - focus on what feels right to share.
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="text-sm text-accent-400">
              {getCompletionCount()} of 5 sections completed
            </div>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-500 transition-all duration-500"
                style={{ width: `${(getCompletionCount() / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Life Story Templates */}
      <div className="space-y-6">
        {lifeStoryTemplates.map((template) => {
          const Icon = template.icon
          const isActive = activeTemplate === template.id
          const value = lifeStory[template.id as keyof typeof lifeStory]
          const hasContent = typeof value === 'string' && value.trim()
          const showPromptsForTemplate = showPrompts[template.id]

          return (
            <div
              key={template.id}
              className={`memorial-card rounded-3xl transition-all duration-300 ${
                isActive ? 'ring-2 ring-accent-500/50' : ''
              }`}
            >
              {/* Template Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => setActiveTemplate(isActive ? null : template.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      hasContent ? 'bg-accent-500/20 text-accent-400' : 'bg-white/10 text-accent-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-accent-100 flex items-center space-x-2">
                        <span>{template.title}</span>
                        {hasContent && (
                          <div className="w-2 h-2 bg-accent-500 rounded-full" />
                        )}
                      </h4>
                      <p className="text-accent-400 text-sm">{template.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-accent-400 transition-transform ${
                    isActive ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Template Content */}
              {isActive && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Writing Prompts */}
                  <div className="bg-accent-500/5 border border-accent-500/20 rounded-xl p-4">
                    <button
                      onClick={() => togglePrompts(template.id)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-accent-400" />
                        <span className="text-accent-200 font-medium">Writing prompts to help you get started</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-accent-400 transition-transform ${
                        showPromptsForTemplate ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {showPromptsForTemplate && (
                      <div className="mt-3 space-y-2">
                        {template.prompts.map((prompt, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-accent-300 text-sm">{prompt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Area */}
                  <textarea
                    value={lifeStory[template.id as keyof typeof lifeStory] || ''}
                    onChange={(e) => updateTemplateContent(template.id, e.target.value)}
                    placeholder={template.placeholder}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all resize-none"
                  />

                  {/* Character count and encouragement */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-accent-400">
                      {(lifeStory[template.id as keyof typeof lifeStory] || '').length} characters
                    </span>
                    {hasContent && (
                      <span className="text-accent-300 flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>Beautiful memories shared</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Personality Traits Section */}
      <div className="memorial-card rounded-3xl p-6 mt-8">
        <h4 className="text-lg font-semibold text-accent-100 mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-accent-400" />
          <span>Words That Describe Them</span>
        </h4>
        <p className="text-accent-300 text-sm mb-6">
          Select the words that best capture their personality. These will help visitors understand who they were.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {personalityTraits.map((trait) => {
            const isSelected = lifeStory.personalityTraits?.includes(trait)
            return (
              <button
                key={trait}
                onClick={() => handleTraitToggle(trait)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-white/10 text-accent-300 hover:bg-white/20 hover:text-accent-200'
                }`}
              >
                {trait}
              </button>
            )
          })}
        </div>
        
        {lifeStory.personalityTraits && lifeStory.personalityTraits.length > 0 && (
          <div className="mt-4 text-sm text-accent-400">
            {lifeStory.personalityTraits.length} traits selected
          </div>
        )}
      </div>

      {/* Encouragement Footer */}
      <div className="memorial-card rounded-3xl p-6 mt-8 bg-gradient-to-r from-accent-500/10 to-primary-800/50 border border-accent-500/20">
        <div className="text-center">
          <Heart className="w-8 h-8 text-accent-400 mx-auto mb-3" />
          <p className="text-accent-200 leading-relaxed">
            <span className="font-medium">Remember:</span> There's no rush to complete everything now. 
            You can always come back to add more stories as memories come to you. 
            Every word you share is a gift to those who will visit this memorial.
          </p>
        </div>
      </div>
    </div>
  )
}
