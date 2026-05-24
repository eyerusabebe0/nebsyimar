'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { HeadstoneStone } from '@/components/HeadstoneMemorial'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MapPin,
  Upload
} from 'lucide-react'

interface MemorialFormData {
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  dateOfDeath: string
  relationship: string
  tributeTitle: string
  placeOfBirth: string
  placeOfDeath: string
  shortBio: string
  lifeStory: string
  funeralDate: string
  funeralTime: string
  funeralLocation: string
  receptionDetails: string
  googleMapsLink: string
  obituaryText: string
}

const relationshipOptions = [
  'Family member',
  'Friend',
  'Colleague',
  'Funeral director',
  'Charity staff',
  'Other'
]

type HeadstoneDesignId =
  | 'stone_1'
  | 'stone_2'
  | 'stone_3'
  | 'stone_4'
  | 'stone_5'
  | 'stone_6'
  | 'stone_7'
  | 'stone_8'
  | 'stone_9'
  | 'stone_10'
  | 'stone_11'
  | 'stone_12'
  | 'stone_13'

const STONE_OPTIONS: Array<{
  id: HeadstoneDesignId
  label: string
  description: string
  src: string
  price: number
}> = [
  { id: 'stone_1', label: 'Rugged Sandstone', description: 'Natural, earthy character.', src: '/STONES/stone_1.png', price: 100 },
  { id: 'stone_2', label: 'Classic Granite', description: 'Timeless arched silhouette.', src: '/STONES/stone_2.png', price: 250 },
  { id: 'stone_3', label: 'Black Granite Rose', description: 'Elegant polished black granite.', src: '/STONES/stone_3.png', price: 500 },
  { id: 'stone_4', label: 'Cream Marble', description: 'Soft, peaceful cream finish.', src: '/STONES/stone_4.png', price: 1000 },
  { id: 'stone_5', label: 'Tan 3D Arch', description: 'Sculpted tan stone with depth.', src: '/STONES/stone_5.png', price: 2000 },
  { id: 'stone_6', label: 'Marble Cathedral', description: 'Ornate marble with carved arch.', src: '/STONES/stone_6.png', price: 5000 },
  { id: 'stone_7', label: 'Garden Granite', description: 'Granite framed in greenery.', src: '/STONES/stone_7.png', price: 8000 },
  { id: 'stone_8', label: 'Cross of Faith', description: 'Black granite with carved cross.', src: '/STONES/stone_8.png', price: 12000 },
  { id: 'stone_9', label: 'Angel Heart', description: 'Black granite heart with angel.', src: '/STONES/stone_9.png', price: 18000 },
  { id: 'stone_10', label: 'Royal Mausoleum', description: 'Grand columned tribute.', src: '/STONES/stone_10.png', price: 25000 },
  { id: 'stone_11', label: 'White Dome Shrine', description: 'Stunning white marble dome.', src: '/STONES/stone_11.png', price: 32000 },
  { id: 'stone_12', label: 'Black Dome Shrine', description: 'Majestic black ornate dome.', src: '/STONES/stone_12.png', price: 40000 },
  { id: 'stone_13', label: 'Heritage Bust', description: 'Statue tribute with scroll banner.', src: '/STONES/stone_13.png', price: 50000 },
]

export default function CreateMemorialPage() {
  const router = useRouter()
  const { wallet, refreshUser } = useAuth()

  const [headstoneDesign, setHeadstoneDesign] = useState<
    HeadstoneDesignId
  >('stone_1')
  const stonesScrollerRef = useRef<HTMLDivElement | null>(null)
  const [formData, setFormData] = useState<MemorialFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    relationship: relationshipOptions[0],
    tributeTitle: '',
    placeOfBirth: '',
    placeOfDeath: '',
    shortBio: '',
    lifeStory: '',
    funeralDate: '',
    funeralTime: '',
    funeralLocation: '',
    receptionDetails: '',
    googleMapsLink: '',
    obituaryText: ''
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([])
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [paymentAgreement, setPaymentAgreement] = useState<'yes' | 'no' | null>(null)

  const selectedStone = STONE_OPTIONS.find((stone) => stone.id === headstoneDesign) || STONE_OPTIONS[0]
  const creationFee = selectedStone.price

  useEffect(() => {
    if (!profilePhoto) {
      setProfilePreviewUrl('')
      return
    }

    const url = URL.createObjectURL(profilePhoto)
    setProfilePreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [profilePhoto])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSingleFileChange = (
    setter: (file: File | null) => void,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null
    setter(file)
  }

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setGalleryPhotos(Array.from(files))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage(null)

    if (paymentAgreement !== 'yes') {
      toast.error(
        `Please agree to deduct ${creationFee.toLocaleString()} birr from your wallet to create this memorial.`
      )
      return
    }

    if (!wallet) {
      toast.error('Wallet information is not available. Please open your profile wallet and try again.')
      return
    }

    const currentBalance = Number(wallet.balance ?? 0)
    if (currentBalance < creationFee) {
      toast.error(
        `Insufficient balance. Please top up your wallet with at least ${creationFee.toLocaleString()} birr.`
      )
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      const nameParts = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean)
      const deceasedName = nameParts.join(' ').trim()

      formDataToSend.append('deceased_name', deceasedName)
      formDataToSend.append('headstone_design', headstoneDesign)

      if (formData.shortBio || formData.lifeStory) {
        const bioText = formData.lifeStory || formData.shortBio
        formDataToSend.append('bio', bioText)
      }

      if (formData.dateOfBirth) {
        formDataToSend.append('date_of_birth', formData.dateOfBirth)
      }

      if (formData.dateOfDeath) {
        formDataToSend.append('date_of_death', formData.dateOfDeath)
      }

      if (formData.placeOfBirth) {
        formDataToSend.append('place_of_birth', formData.placeOfBirth)
      }

      if (formData.placeOfDeath) {
        formDataToSend.append('place_of_death', formData.placeOfDeath)
      }

      // Always publish memorials to public feed
      formDataToSend.append('visibility', 'PUBLIC')
      formDataToSend.append('cultural_template', 'MODERN')

      if (profilePhoto) {
        formDataToSend.append('profile_image', profilePhoto)
      }

      if (coverPhoto) {
        formDataToSend.append('cover_image', coverPhoto)
      }

      if (galleryPhotos.length > 0) {
        galleryPhotos.forEach((file) => {
          formDataToSend.append('gallery_images', file)
        })
      }

      const response = await api.post('/memorials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.success) {
        toast.success(`Memorial created and ${creationFee.toLocaleString()} birr deducted from your wallet.`)
        setSubmitMessage('Your memorial has been created and published to the public feed.')
        await refreshUser()
        router.push('/memorials')
      } else {
        const message = response.data?.message || 'Failed to create memorial. Please try again.'
        toast.error(message)
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to create memorial. Please check your wallet balance and try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-accent-300 hover:text-accent-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to dashboard
        </Link>

        <header className="bg-primary-800/80 backdrop-blur-lg border border-primary-700/60 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
                <Heart className="w-8 h-8 text-accent-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create a Memorial Tribute</h1>
              <p className="text-accent-200 max-w-2xl">
                Capture a loved one&rsquo;s story with required details for publication and optional sections that let
                you craft a beautiful, comprehensive tribute page.
              </p>
            </div>
            <div className="bg-primary-900/60 border border-primary-700 rounded-2xl p-4 text-sm text-accent-200">
              <p className="font-semibold text-white mb-1">Pro tips</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gather photos before you begin.</li>
                <li>Use the life story section for longer narratives.</li>
                <li>You can save a draft now and publish later.</li>
              </ul>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            <section className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Required Information</h2>
                  <p className="text-sm text-accent-300">All fields in this section are mandatory except middle name.</p>
                </div>
                <Calendar className="w-6 h-6 text-accent-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">First name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Middle name (optional)</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="K."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Last name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Date of birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Date of death *</label>
                  <input
                    type="date"
                    name="dateOfDeath"
                    value={formData.dateOfDeath}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Your relationship to the deceased *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relationshipOptions.map((option) => {
                    const isSelected = formData.relationship === option
                    return (
                      <label
                        key={option}
                        className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-accent-400 bg-primary-700/70 text-white'
                            : 'border-primary-600 text-accent-200 hover:border-accent-400/40'
                        }`}
                      >
                        <span className="text-sm font-medium">{option}</span>
                        <input
                          type="radio"
                          name="relationship"
                          value={option}
                          checked={isSelected}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border ${
                            isSelected ? 'bg-accent-400 border-accent-200' : 'border-accent-300'
                          }`}
                        ></span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Tribute title *</label>
                  <input
                    type="text"
                    name="tributeTitle"
                    value={formData.tributeTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="In Loving Memory of John Doe"
                  />
                </div>
              </div>
            </section>

            <section className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Optional Background Details</h2>
                  <p className="text-sm text-accent-300">Commonly asked questions that help visitors connect.</p>
                </div>
                <MapPin className="w-6 h-6 text-accent-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Place of birth</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Place of death</label>
                  <input
                    type="text"
                    name="placeOfDeath"
                    value={formData.placeOfDeath}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Short biography / tribute introduction</label>
                <textarea
                  name="shortBio"
                  value={formData.shortBio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-2xl text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="A paragraph that summarizes their life and legacy."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Main Tribute Story (Life Story)</label>
                <textarea
                  name="lifeStory"
                  value={formData.lifeStory}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-2xl text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Share early life, family, education, career, personality, and legacy."
                ></textarea>
              </div>
            </section>

            <section className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Payment &amp; Publishing</h2>
                  <p className="text-sm text-accent-300">
                    Creating a memorial costs {creationFee.toLocaleString()} birr (price of the chosen headstone) and will be deducted from your wallet balance.
                  </p>
                </div>
              </div>

              <div className="bg-primary-900/60 border border-primary-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-accent-200 mb-1">
                    Do you agree to deduct <span className="font-semibold text-white">{creationFee.toLocaleString()} birr</span> from your wallet?
                  </p>
                  {wallet && (
                    <p className="text-xs text-accent-400">
                      Current wallet balance:{' '}
                      <span className="font-semibold text-accent-200">
                        {Number(wallet.balance ?? 0).toLocaleString()} {wallet.currency || 'ETB'}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentAgreement('yes')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      paymentAgreement === 'yes'
                        ? 'bg-accent-500 text-white'
                        : 'bg-primary-700 text-accent-200 hover:bg-primary-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAgreement('no')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      paymentAgreement === 'no'
                        ? 'bg-red-600 text-white'
                        : 'bg-primary-700 text-accent-200 hover:bg-primary-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Agreement Status Indicator */}
              {paymentAgreement && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300 ${
                  paymentAgreement === 'yes' 
                    ? 'bg-green-500/20 border border-green-400/40 text-green-200' 
                    : 'bg-red-500/20 border border-red-400/40 text-red-200'
                }`}>
                  {paymentAgreement === 'yes' ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold">✅ Agreed to pay {creationFee.toLocaleString()} birr</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold">❌ Disagreed to pay {creationFee.toLocaleString()} birr</span>
                    </>
                  )}
                </div>
              )}

              <p className="text-xs text-accent-400">
                If you select No or your wallet has less than {creationFee.toLocaleString()} birr, the memorial will not be created. You can top up
                your wallet from the profile &gt; wallet section.
              </p>
            </section>

            <section className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Photos &amp; Gallery</h2>
                  <p className="text-sm text-accent-300">Upload profile, cover, and gallery images.</p>
                </div>
                <Upload className="w-6 h-6 text-accent-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Profile photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleSingleFileChange(setProfilePhoto, event)}
                    className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                  />
                  {profilePhoto && (
                    <p className="text-xs text-accent-400 mt-2">Selected: {profilePhoto.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Cover photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleSingleFileChange(setCoverPhoto, event)}
                    className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                  />
                  {coverPhoto && (
                    <p className="text-xs text-accent-400 mt-2">Selected: {coverPhoto.name}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-primary-700/60 pt-6 space-y-5">
                <div className="flex items-end justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">Choose a Headstone</h3>
                    <p className="text-sm text-accent-300">
                      The photo and inscription will be engraved on the stone you select.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-accent-400">Currently selected</p>
                    <p className="text-sm font-semibold text-white">{selectedStone.label}</p>
                    <p className="text-xs text-accent-300">{selectedStone.price.toLocaleString()} ETB</p>
                  </div>
                </div>

                {/* Horizontal scroller of all 13 stones */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Scroll stones left"
                    onClick={() => stonesScrollerRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary-900/80 border border-accent-500/40 text-accent-200 hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-center backdrop-blur"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div
                    ref={stonesScrollerRef}
                    className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-10 stones-scroller"
                  >
                    {STONE_OPTIONS.map((opt) => {
                      const selected = headstoneDesign === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setHeadstoneDesign(opt.id)}
                          className={`group flex-shrink-0 w-44 text-left rounded-2xl border p-3 transition-all duration-300 ${
                            selected
                              ? 'border-accent-400 bg-gradient-to-b from-accent-500/20 to-primary-900/40 shadow-lg shadow-accent-500/20 scale-[1.02]'
                              : 'border-primary-700/60 bg-primary-900/30 hover:border-accent-400/60 hover:-translate-y-1'
                          }`}
                        >
                          <div
                            className={`w-full h-36 flex items-center justify-center rounded-xl mb-3 transition-colors ${
                              selected
                                ? 'bg-gradient-to-b from-black/30 to-black/10'
                                : 'bg-black/20 group-hover:bg-black/30'
                            }`}
                          >
                            <img
                              src={opt.src}
                              alt={opt.label}
                              className="h-32 object-contain drop-shadow-2xl"
                            />
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white truncate">{opt.label}</span>
                            {selected && (
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/30 text-accent-100 border border-accent-400/40">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-accent-300 line-clamp-1 mb-1">{opt.description}</p>
                          <p className="text-xs text-accent-400 font-semibold">
                            {opt.price.toLocaleString()} ETB
                          </p>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    aria-label="Scroll stones right"
                    onClick={() => stonesScrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary-900/80 border border-accent-500/40 text-accent-200 hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-center backdrop-blur"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <style jsx>{`
                    .stones-scroller::-webkit-scrollbar { height: 6px; }
                    .stones-scroller::-webkit-scrollbar-track { background: transparent; }
                    .stones-scroller::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.4); border-radius: 3px; }
                  `}</style>
                </div>

                {/* Live preview on a grassy plot */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-accent-300 mb-3">Live engraved preview</p>
                  <div
                    className="flex items-end justify-center rounded-2xl overflow-hidden relative"
                    style={{
                      background:
                        'radial-gradient(ellipse at top, rgba(135, 169, 107, 0.25), rgba(15,15,26,0.6) 70%), linear-gradient(180deg, #1a2a1a 0%, #0a140a 100%)',
                      paddingBottom: '24px',
                      paddingTop: '24px',
                      minHeight: '380px',
                    }}
                  >
                    {/* Grass strip */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(76,127,79,0.2), rgba(45,87,52,0.85))',
                      }}
                    ></div>
                    <HeadstoneStone
                      memorial={{
                        name:
                          [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ') ||
                          'Full Name',
                        dates:
                          [formData.dateOfBirth, formData.dateOfDeath].filter(Boolean).join(' - ') ||
                          '1990 - 2020',
                        image: profilePreviewUrl || '/images.jpg',
                        headstoneDesign,
                      }}
                      width={260}
                      height={340}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Gallery photos (multiple)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30"
                />
                {galleryPhotos.length > 0 && (
                  <p className="text-xs text-accent-400 mt-2">{galleryPhotos.length} photo(s) selected</p>
                )}
              </div>
            </section>

            <section className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Funeral Details &amp; Notice</h2>
                  <p className="text-sm text-accent-300">Inform supporters about services and share the obituary.</p>
                </div>
                <BookOpen className="w-6 h-6 text-accent-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Funeral date</label>
                  <input
                    type="date"
                    name="funeralDate"
                    value={formData.funeralDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Funeral time</label>
                  <input
                    type="time"
                    name="funeralTime"
                    value={formData.funeralTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Google Maps link</label>
                  <input
                    type="url"
                    name="googleMapsLink"
                    value={formData.googleMapsLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Ceremony location &amp; reception details</label>
                <textarea
                  name="funeralLocation"
                  value={formData.funeralLocation}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-2xl text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Church, cemetery, reception venue, etc."
                ></textarea>
                <textarea
                  name="receptionDetails"
                  value={formData.receptionDetails}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-3 w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-2xl text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Reception time, dress code, or additional instructions."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Funeral notice / obituary text</label>
                <textarea
                  name="obituaryText"
                  value={formData.obituaryText}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-2xl text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Full obituary text to share publicly."
                ></textarea>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
              >
                {isSubmitting ? 'Saving memorial...' : 'Save memorial draft'}
              </button>
              <Link
                href="/memorials"
                className="flex-1 text-center border border-accent-400/60 text-accent-200 hover:border-accent-300 hover:text-white py-3 px-6 rounded-2xl transition-colors"
              >
                Cancel
              </Link>
            </div>

            {submitMessage && (
              <div className="bg-green-500/20 border border-green-400/40 text-green-200 px-4 py-3 rounded-2xl">
                {submitMessage}
              </div>
            )}
          </form>

          <aside className="space-y-6">
            <div className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Info className="w-5 h-5 text-accent-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">What happens next?</h3>
              </div>
              <ol className="list-decimal pl-5 space-y-3 text-accent-200 text-sm">
                <li>Complete the required information so we can generate the tribute URL.</li>
                <li>Save your draft as many times as needed while gathering stories and photos.</li>
                <li>Publish the tribute to share it across social media, messaging apps, or email.</li>
              </ol>
            </div>

            <div className="bg-primary-800/80 border border-primary-700/60 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Checklist</h3>
              <ul className="space-y-3 text-sm text-accent-200">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-accent-400 mr-3 mt-2"></span>
                  Confirm preferred spellings for the tribute URL.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-accent-400 mr-3 mt-2"></span>
                  Ask family members for stories to use in the life story section.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-accent-400 mr-3 mt-2"></span>
                  Collect at least five photos for the gallery (childhood, milestones, celebrations).
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-accent-400 mr-3 mt-2"></span>
                  Double-check funeral logistics before inviting guests.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
