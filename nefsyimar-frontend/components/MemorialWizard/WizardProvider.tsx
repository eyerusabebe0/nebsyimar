'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface BasicInfo {
  name: string
  dateOfBirth: string
  dateOfPassing: string
  relation: string
  photo: File | null
  photoPreview: string
}

export interface LifeStory {
  earlyLife: string
  values: string
  memories: string
  achievements: string
  personalityTraits: string[]
}

export interface FuneralDetails {
  serviceName: string
  serviceDate: string
  serviceTime: string
  location: {
    name: string
    address: string
    coordinates?: { lat: number; lng: number }
  }
  serviceType: 'funeral' | 'memorial' | 'celebration' | 'viewing'
  isPublic: boolean
  additionalInfo: string
}

export interface TributeOptions {
  enableDonations: boolean
  donationGoal: number
  donationPurpose: string
  enableTributeGifts: boolean
  allowedGifts: string[]
  familyWallet: {
    enabled: boolean
    accountHolder: string
    bankDetails?: string
  }
}

export interface MemorialData {
  basicInfo: BasicInfo
  lifeStory: LifeStory
  funeralDetails: FuneralDetails
  tributeOptions: TributeOptions
}

interface WizardContextType {
  currentStep: number
  memorialData: MemorialData
  updateBasicInfo: (data: Partial<BasicInfo>) => void
  updateLifeStory: (data: Partial<LifeStory>) => void
  updateFuneralDetails: (data: Partial<FuneralDetails>) => void
  updateTributeOptions: (data: Partial<TributeOptions>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  isStepComplete: (step: number) => boolean
  submitMemorial: () => Promise<void>
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

const initialMemorialData: MemorialData = {
  basicInfo: {
    name: '',
    dateOfBirth: '',
    dateOfPassing: '',
    relation: '',
    photo: null,
    photoPreview: ''
  },
  lifeStory: {
    earlyLife: '',
    values: '',
    memories: '',
    achievements: '',
    personalityTraits: []
  },
  funeralDetails: {
    serviceName: '',
    serviceDate: '',
    serviceTime: '',
    location: {
      name: '',
      address: ''
    },
    serviceType: 'funeral',
    isPublic: true,
    additionalInfo: ''
  },
  tributeOptions: {
    enableDonations: false,
    donationGoal: 0,
    donationPurpose: '',
    enableTributeGifts: true,
    allowedGifts: ['flowers', 'candles', 'doves'],
    familyWallet: {
      enabled: false,
      accountHolder: ''
    }
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [memorialData, setMemorialData] = useState<MemorialData>(initialMemorialData)

  const updateBasicInfo = (data: Partial<BasicInfo>) => {
    setMemorialData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data }
    }))
  }

  const updateLifeStory = (data: Partial<LifeStory>) => {
    setMemorialData(prev => ({
      ...prev,
      lifeStory: { ...prev.lifeStory, ...data }
    }))
  }

  const updateFuneralDetails = (data: Partial<FuneralDetails>) => {
    setMemorialData(prev => ({
      ...prev,
      funeralDetails: { ...prev.funeralDetails, ...data }
    }))
  }

  const updateTributeOptions = (data: Partial<TributeOptions>) => {
    setMemorialData(prev => ({
      ...prev,
      tributeOptions: { ...prev.tributeOptions, ...data }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step)
    }
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(memorialData.basicInfo.name && 
                 memorialData.basicInfo.dateOfBirth && 
                 memorialData.basicInfo.dateOfPassing && 
                 memorialData.basicInfo.relation)
      case 2:
        return !!(memorialData.lifeStory.earlyLife || 
                 memorialData.lifeStory.values || 
                 memorialData.lifeStory.memories)
      case 3:
        return !!(memorialData.funeralDetails.serviceName && 
                 memorialData.funeralDetails.serviceDate && 
                 memorialData.funeralDetails.location.name)
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const submitMemorial = async () => {
    try {
      // Here you would submit to your API
      console.log('Submitting memorial:', memorialData)
      
      // Generate Ethiopian memorial markers if date of passing is provided
      if (memorialData.basicInfo.dateOfPassing) {
        console.log('Ethiopian memorial markers will be automatically created for:', memorialData.basicInfo.dateOfPassing)
        // In real implementation, this would be handled by the backend
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset wizard after successful submission
      setMemorialData(initialMemorialData)
      setCurrentStep(1)
      
      // Redirect to memorial page or show success message
      alert('Memorial created successfully with Ethiopian memorial observances!')
    } catch (error) {
      console.error('Error creating memorial:', error)
      throw error
    }
  }

  return (
    <WizardContext.Provider value={{
      currentStep,
      memorialData,
      updateBasicInfo,
      updateLifeStory,
      updateFuneralDetails,
      updateTributeOptions,
      nextStep,
      prevStep,
      goToStep,
      isStepComplete,
      submitMemorial
    }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
