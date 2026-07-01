'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MemorialComments from '@/components/MemorialComments'
import { userDashboardApi } from '@/lib/api'

interface MemorialPageClientProps {
  memorial: {
    memorialId: string
    creatorId: string
    memorialSettings: any
  }
}

export default function MemorialPageClient({ memorial }: MemorialPageClientProps) {
  const { user } = useAuth()
  const [memorialSettings, setMemorialSettings] = useState(memorial.memorialSettings)
  const [isUpdating, setIsUpdating] = useState(false)

  const isMemorialOwner = user?.user_id === memorial.creatorId

  const handleModerationSettingsUpdate = async (newSettings: any) => {
    try {
      setIsUpdating(true)
      await userDashboardApi.updateMemorialSettings(memorial.memorialId, newSettings)
      setMemorialSettings(newSettings)
    } catch (error) {
      console.error('Failed to update memorial settings:', error)
      // You could show a toast notification here
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <MemorialComments 
        memorialId={memorial.memorialId}
        isMemorialOwner={isMemorialOwner}
        memorialSettings={memorialSettings}
      />
    </>
  )
}
