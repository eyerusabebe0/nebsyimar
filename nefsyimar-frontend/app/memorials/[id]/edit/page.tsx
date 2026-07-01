'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { memorialApi } from '@/lib/api'
import { HeadstonePreview, type HeadstoneDesignId } from '@/components/HeadstoneMemorial'

interface EditMemorialPageProps {
  params: {
    id: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

const VALID_HEADSTONE_DESIGNS: HeadstoneDesignId[] = [
  'stone_1','stone_2','stone_3','stone_4','stone_6','stone_8','stone_9'
]

const STONE_OPTIONS: Array<{ id: HeadstoneDesignId; label: string; src: string; extraFee?: number }> = [
  { id: 'stone_1', label: 'Rugged Sandstone', src: '/STONES/stone_1.png' },
  { id: 'stone_2', label: 'Classic Granite', src: '/STONES/stone_2.png' },
  { id: 'stone_3', label: 'Black Granite Rose', src: '/STONES/stone_3.png' },
  { id: 'stone_4', label: 'Cream Marble', src: '/STONES/stone_4.png' },
  { id: 'stone_6', label: 'Marble Cathedral', src: '/STONES/stone_6.png' },
  { id: 'stone_8', label: 'Cross of Faith', src: '/STONES/stone_8.png' },
  { id: 'stone_9', label: 'Angel Heart', src: '/STONES/stone_9.png' },
]

function normalizeHeadstoneDesign(design?: string | null): HeadstoneDesignId | undefined {
  return VALID_HEADSTONE_DESIGNS.includes(design as HeadstoneDesignId) ? (design as HeadstoneDesignId) : undefined
}

function resolveImage(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`
  return path
}

export default function EditMemorialPage({ params }: EditMemorialPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [memorial, setMemorial] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [headstoneDesign, setHeadstoneDesign] = useState<HeadstoneDesignId>('stone_1')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([])
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([])
  const [removedGalleryImages, setRemovedGalleryImages] = useState<string[]>([])
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | undefined>('')
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | undefined>('')

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
        setHeadstoneDesign(normalizeHeadstoneDesign(memorialData.memorial_settings?.headstone_design) || 'stone_1')
        setExistingGalleryImages(Array.isArray(memorialData.gallery_images) ? memorialData.gallery_images : [])
        setRemovedGalleryImages([])
        setProfilePreviewUrl(resolveImage(memorialData.profile_image) || undefined)
        setExistingCoverUrl(resolveImage(memorialData.cover_image) || undefined)
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

  useEffect(() => {
    if (!profilePhoto) {
      setProfilePreviewUrl(resolveImage(memorial?.profile_image) || undefined)
      return
    }

    const url = URL.createObjectURL(profilePhoto)
    setProfilePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [profilePhoto, memorial])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSingleFileChange = (setter: (file: File | null) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] ?? null)
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setGalleryPhotos(Array.from(e.target.files))
  }

  const removeExistingGalleryImage = (image: string) => {
    setRemovedGalleryImages((prev) => [...prev, image])
    setExistingGalleryImages((prev) => prev.filter((src) => src !== image))
  }

  const removeNewGalleryPhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      const fd = new FormData()
      fd.append('deceased_name', formData.deceased_name)
      if (formData.deceased_name_amharic) fd.append('deceased_name_amharic', formData.deceased_name_amharic)
      if (formData.bio) fd.append('bio', formData.bio)
      if (formData.bio_amharic) fd.append('bio_amharic', formData.bio_amharic)
      if (formData.date_of_birth) fd.append('date_of_birth', formData.date_of_birth)
      if (formData.date_of_death) fd.append('date_of_death', formData.date_of_death)
      if (formData.place_of_birth) fd.append('place_of_birth', formData.place_of_birth)
      if (formData.place_of_death) fd.append('place_of_death', formData.place_of_death)
      if (formData.cause_of_death) fd.append('cause_of_death', formData.cause_of_death)
      if (formData.visibility) fd.append('visibility', formData.visibility)
      if (formData.cultural_template) fd.append('cultural_template', formData.cultural_template)
      fd.append('headstone_design', headstoneDesign)

      if (profilePhoto) fd.append('profile_image', profilePhoto)
      if (coverPhoto) fd.append('cover_image', coverPhoto)
      galleryPhotos.forEach((file) => fd.append('gallery_images', file))
      removedGalleryImages.forEach((src) => fd.append('deleted_images', src))

      const response = await memorialApi.updateMemorial(params.id, fd)
      
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
              
           
            </div>
          </div>

          {/* Photo & Headstone Editor */}
          <div className="memorial-card rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-accent-100">Photos & Headstone</h2>
                <p className="text-sm text-accent-300">Update profile, cover, gallery and selected stone.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">Profile photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSingleFileChange(setProfilePhoto, e)}
                  className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                />
                {profilePhoto && <p className="text-xs text-accent-400 mt-2">Selected: {profilePhoto.name}</p>}
                {!profilePhoto && existingGalleryImages && existingGalleryImages.length === 0 && profilePreviewUrl && (
                  <p className="text-xs text-accent-400 mt-2">Current profile photo loaded</p>
                )}
              </div>
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">Cover photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSingleFileChange(setCoverPhoto, e)}
                  className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                />
                {coverPhoto && <p className="text-xs text-accent-400 mt-2">Selected: {coverPhoto.name}</p>}
                {!coverPhoto && existingCoverUrl && <p className="text-xs text-accent-400 mt-2">Current cover photo loaded</p>}
              </div>
            </div>

            <div className="border-t border-accent-700/40 pt-6 grid gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Choose Headstone</p>
                    <p className="text-xs text-accent-400">Selected stone determines the hero preview and memorial layout.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STONE_OPTIONS.map((option) => {
                    const selected = headstoneDesign === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setHeadstoneDesign(option.id)}
                        className={`rounded-3xl border p-3 text-left transition ${selected ? 'border-accent-400 bg-accent-500/10' : 'border-accent-700/40 bg-primary-900/60 hover:border-accent-400/50'}`}
                      >
                        <div className="h-24 flex items-center justify-center rounded-2xl bg-white/5 mb-3">
                          <img src={option.src} alt={option.label} className="h-16 object-contain" />
                        </div>
                        <div className="text-xs text-white font-semibold truncate">{option.label}</div>
                        {option.extraFee ? <div className="text-[10px] text-[#D4AF37]">+{option.extraFee} birr</div> : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-accent-200 text-sm font-medium mb-2">Gallery photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                  />
                  {galleryPhotos.length > 0 && <p className="text-xs text-accent-400 mt-2">{galleryPhotos.length} new photo(s) selected</p>}
                </div>
                {existingGalleryImages.length > 0 && (
                  <div className="rounded-3xl border border-accent-700/30 bg-primary-900/50 p-4">
                    <p className="text-sm text-white font-semibold mb-3">Existing gallery photos</p>
                    <div className="grid grid-cols-3 gap-3">
                      {existingGalleryImages.map((src) => (
                        <div key={src} className="relative overflow-hidden rounded-2xl border border-white/10 aspect-[4/3]">
                          <img src={resolveImage(src)} alt="Existing gallery" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(src)}
                            className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {galleryPhotos.length > 0 && (
                  <div className="rounded-3xl border border-accent-700/30 bg-primary-900/50 p-4">
                    <p className="text-sm text-white font-semibold mb-3">New gallery uploads</p>
                    <div className="space-y-2 text-xs text-accent-300">
                      {galleryPhotos.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-3 py-2">
                          <span className="truncate">{file.name}</span>
                          <button type="button" onClick={() => removeNewGalleryPhoto(index)} className="text-red-400 hover:text-red-200 text-[11px]">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-accent-700/30 bg-primary-900/50 p-4">
                <p className="text-sm font-semibold text-white mb-3">Live headstone preview</p>
                <div className="flex justify-center">
                  <HeadstonePreview
                    memorial={{
                      name: formData.deceased_name || 'In Loving Memory',
                      dates: [formData.date_of_birth, formData.date_of_death].filter(Boolean).join(' - '),
                      image: profilePreviewUrl || undefined,
                      headstoneDesign
                    }}
                    width={260}
                    height={340}
                  />
                </div>
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
