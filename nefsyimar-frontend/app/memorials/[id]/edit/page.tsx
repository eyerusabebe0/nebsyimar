'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { memorialApi } from '@/lib/api'

interface EditMemorialPageProps {
  params: {
    id: string
  }
}

export default function EditMemorialPage({ params }: EditMemorialPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [memorial, setMemorial] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    deceased_name: '',
    deceased_name_amharic: '',
    bio: '',
    bio_amharic: '',
    date_of_birth: '',
    date_of_death: '',
    place_of_birth: '',
    place_of_death: '',
    cause_of_death: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY',
    cultural_template: 'MODERN' as 'ORTHODOX' | 'PROTESTANT' | 'MUSLIM' | 'TRADITIONAL' | 'MODERN' | 'CUSTOM'
  })

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }
    loadMemorial()
  }, [user, params.id])

  const loadMemorial = async () => {
    try {
      setIsLoading(true)
      const response = await memorialApi.getMemorial(params.id)
      
      if (response.data.success) {
        const memorialData = response.data.data.memorial

        // Check if user owns this memorial
        if (memorialData.user_id !== user?.user_id) {
          setError('You do not have permission to edit this memorial')
          return
        }

        setMemorial(memorialData)
        setFormData({
          deceased_name: memorialData.deceased_name || '',
          deceased_name_amharic: memorialData.deceased_name_amharic || '',
          bio: memorialData.bio || '',
          bio_amharic: memorialData.bio_amharic || '',
          date_of_birth: memorialData.date_of_birth ? memorialData.date_of_birth.split('T')[0] : '',
          date_of_death: memorialData.date_of_death ? memorialData.date_of_death.split('T')[0] : '',
          place_of_birth: memorialData.place_of_birth || '',
          place_of_death: memorialData.place_of_death || '',
          cause_of_death: memorialData.cause_of_death || '',
          visibility: (memorialData.visibility || 'PUBLIC') as 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY',
          cultural_template: (memorialData.cultural_template || 'MODERN') as 'ORTHODOX' | 'PROTESTANT' | 'MUSLIM' | 'TRADITIONAL' | 'MODERN' | 'CUSTOM'
        })
      } else {
        setError('Memorial not found')
      }
    } catch (err: any) {
      console.error('Failed to load memorial:', err)
      if (err.response?.status === 404) {
        setError('Memorial not found')
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this memorial')
      } else {
        setError('Failed to load memorial')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      const response = await memorialApi.updateMemorial(params.id, formData)
      
      if (response.data.success) {
        router.push(`/memorials/${params.id}`)
      } else {
        setError('Failed to save memorial')
      }
    } catch (err: any) {
      console.error('Failed to save memorial:', err)
      if (err.response?.status === 403) {
        setError('You do not have permission to edit this memorial')
      } else if (err.response?.status === 404) {
        setError('Memorial not found')
      } else {
        setError('Failed to save memorial')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400 mx-auto mb-4" />
          <p className="text-accent-300">Loading memorial...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-accent-300 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/memorials/${params.id}`}
            className="inline-flex items-center space-x-2 text-accent-300 hover:text-accent-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Memorial</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Memorial
          </h1>
          <p className="text-accent-300">
            Update the information for this memorial
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="memorial-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-accent-100 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="deceased_name"
                  value={formData.deceased_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Name in Amharic
                </label>
                <input
                  type="text"
                  name="deceased_name_amharic"
                  value={formData.deceased_name_amharic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="በአማርኛ ስም"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Date of Death
                </label>
                <input
                  type="date"
                  name="date_of_death"
                  value={formData.date_of_death}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Enter place of birth"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Place of Death
                </label>
                <input
                  type="text"
                  name="place_of_death"
                  value={formData.place_of_death}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Enter place of death"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Cause of Death
                </label>
                <input
                  type="text"
                  name="cause_of_death"
                  value={formData.cause_of_death}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Enter cause of death (optional)"
                />
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="memorial-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-accent-100 mb-6">Biography</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Biography (English)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                  placeholder="Share their life story, achievements, and memories..."
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Biography (Amharic)
                </label>
                <textarea
                  name="bio_amharic"
                  value={formData.bio_amharic}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white placeholder-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                  placeholder="የህይወት ታሪካቸውን፣ ስኬታቸውን እና ትውስታዎችን ያካፍሉ..."
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="memorial-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-accent-100 mb-6">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Memorial Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="PUBLIC">Public - Anyone can view</option>
                  <option value="PRIVATE">Private - Only you can view</option>
                  <option value="FAMILY_ONLY">Family Only - Only family members can view</option>
                </select>
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Cultural Template
                </label>
                <select
                  name="cultural_template"
                  value={formData.cultural_template}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-accent-800 border border-accent-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="MODERN">Modern</option>
                  <option value="ORTHODOX">Ethiopian Orthodox</option>
                  <option value="PROTESTANT">Protestant</option>
                  <option value="MUSLIM">Muslim</option>
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/memorials/${params.id}`}
              className="px-6 py-3 bg-accent-700 hover:bg-accent-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-accent-700 disabled:to-accent-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
