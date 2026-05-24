'use client'

import React from 'react'
import { Check, Heart, BookOpen, MapPin, Gift } from 'lucide-react'
import { useWizard } from './WizardProvider'

const steps = [
  {
    number: 1,
    title: 'Basic Information',
    description: 'Name, dates, and photo',
    icon: Heart
  },
  {
    number: 2,
    title: 'Life Story',
    description: 'Their journey and memories',
    icon: BookOpen
  },
  {
    number: 3,
    title: 'Service Details',
    description: 'Funeral and event information',
    icon: MapPin
  },
  {
    number: 4,
    title: 'Tribute Options',
    description: 'Donations and support',
    icon: Gift
  }
]

export default function WizardProgress() {
  const { currentStep, goToStep, isStepComplete } = useWizard()

  return (
    <div className="mb-12">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10"></div>
        <div 
          className="absolute top-5 left-0 h-0.5 bg-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        ></div>
        
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isActive = currentStep === step.number
            const isCompleted = isStepComplete(step.number)
            const isPast = currentStep > step.number
            const Icon = step.icon

            return (
              <button
                key={step.number}
                onClick={() => goToStep(step.number)}
                className={`
                  flex flex-col items-center group transition-all duration-300
                  ${isActive || isPast || isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
                disabled={!isActive && !isPast && !isCompleted}
              >
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                  ${isActive 
                    ? 'bg-accent-500 text-white shadow-[0_0_20px_rgba(198,144,62,0.4)]' 
                    : isPast || isCompleted
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                  }
                  ${(isActive || isPast || isCompleted) ? 'group-hover:scale-110' : ''}
                `}>
                  {isPast || isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Info */}
                <div className="text-center max-w-[120px]">
                  <div className={`
                    text-sm font-semibold mb-1 transition-colors duration-300
                    ${isActive 
                      ? 'text-accent-100' 
                      : isPast || isCompleted
                      ? 'text-accent-300'
                      : 'text-gray-500'
                    }
                  `}>
                    {step.title}
                  </div>
                  <div className={`
                    text-xs leading-tight transition-colors duration-300
                    ${isActive 
                      ? 'text-accent-200' 
                      : isPast || isCompleted
                      ? 'text-accent-400'
                      : 'text-gray-600'
                    }
                  `}>
                    {step.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current Step Title */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-accent-50 mb-2">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-accent-300 text-lg">
          {steps[currentStep - 1].description}
        </p>
      </div>
    </div>
  )
}
