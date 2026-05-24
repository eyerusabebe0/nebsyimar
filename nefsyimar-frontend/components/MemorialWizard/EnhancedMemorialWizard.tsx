'use client'

import React from 'react'
import { ArrowLeft, ArrowRight, Check, Heart, Save } from 'lucide-react'
import { WizardProvider, useWizard } from './WizardProvider'
import WizardProgress from './WizardProgress'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2LifeStory from './steps/Step2LifeStory'
import Step3FuneralDetails from './steps/Step3FuneralDetails'
import Step4TributeOptions from './steps/Step4TributeOptions'

function WizardContent() {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    isStepComplete, 
    submitMemorial,
    memorialData 
  } = useWizard()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const handleNext = () => {
    if (currentStep < 4) {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      prevStep()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitMemorial()
    } catch (error) {
      console.error('Error submitting memorial:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />
      case 2:
        return <Step2LifeStory />
      case 3:
        return <Step3FuneralDetails />
      case 4:
        return <Step4TributeOptions />
      default:
        return <Step1BasicInfo />
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information'
      case 2:
        return 'Life Story'
      case 3:
        return 'Service Details'
      case 4:
        return 'Tribute Options'
      default:
        return 'Memorial Creation'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Let\'s start with the essential information about your loved one'
      case 2:
        return 'Share the stories and memories that capture who they were'
      case 3:
        return 'Help others know when and where to gather in remembrance'
      case 4:
        return 'Set up ways for visitors to show their support and love'
      default:
        return 'Create a beautiful memorial'
    }
  }

  const canProceed = isStepComplete(currentStep)
  const isLastStep = currentStep === 4

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-500/20 rounded-full mb-6">
            <Heart className="w-10 h-10 text-accent-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Their Memorial
          </h1>
          <p className="text-accent-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Honor their memory with a beautiful, personalized memorial that celebrates their life 
            and provides comfort to those who loved them.
          </p>
        </div>

        {/* Progress Indicator */}
        <WizardProgress />

        {/* Step Content */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="max-w-3xl mx-auto">
          <div className="memorial-card rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'text-accent-500 cursor-not-allowed'
                    : 'text-accent-200 hover:text-accent-100 hover:bg-white/5'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {/* Step Info */}
              <div className="text-center">
                <div className="text-accent-100 font-semibold">
                  Step {currentStep} of 4
                </div>
                <div className="text-accent-400 text-sm">
                  {getStepTitle()}
                </div>
              </div>

              {/* Next/Submit Button */}
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Memorial...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Create Memorial</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`inline-flex items-center space-x-2 px-8 py-3 font-semibold rounded-xl transition-all ${
                    canProceed
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg'
                      : 'bg-white/10 text-accent-400 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Hint */}
            {!canProceed && currentStep < 4 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-accent-400 text-sm text-center">
                  Please complete the required fields above to continue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Draft Option */}
        <div className="max-w-3xl mx-auto mt-6">
          <div className="text-center">
            <button className="inline-flex items-center space-x-2 text-accent-400 hover:text-accent-300 transition-colors">
              <Save className="w-4 h-4" />
              <span className="text-sm">Save as draft and continue later</span>
            </button>
          </div>
        </div>

        {/* Encouragement Footer */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="memorial-card rounded-3xl p-6 bg-gradient-to-r from-accent-500/10 to-primary-800/50 border border-accent-500/20">
            <Heart className="w-8 h-8 text-accent-400 mx-auto mb-3" />
            <p className="text-accent-200 leading-relaxed">
              <span className="font-medium">Take your time.</span> Creating a memorial is an act of love. 
              Every detail you add helps preserve their memory and brings comfort to those who visit. 
              You're doing something beautiful.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EnhancedMemorialWizard() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
