'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { HeadstonePreview } from '../../../components/HeadstoneMemorial'
import {
  ArrowLeft, BookOpen, Calendar, ChevronLeft, ChevronRight,
  Heart, Info, MapPin, Upload
} from 'lucide-react'

interface MemorialFormData {
  firstName: string; middleName: string; lastName: string
  dateOfBirth: string; dateOfDeath: string; relationship: string
  tributeTitle: string; placeOfBirth: string; placeOfDeath: string
  shortBio: string; lifeStory: string; funeralDate: string
  funeralTime: string; funeralLocation: string; receptionDetails: string
  googleMapsLink: string; obituaryText: string
}

type HeadstoneDesignId = 'stone_1'|'stone_2'|'stone_3'|'stone_4'|'stone_6'|'stone_7'|'stone_8'|'stone_9'

const relationshipOptions = ['Family member','Friend','Colleague','Funeral director','Charity staff','Other']

const STONE_OPTIONS: Array<{id: HeadstoneDesignId; label: string; description: string; src: string; price: number; extraFee?: number}> = [
  { id: 'stone_1', label: 'Rugged Sandstone',   description: 'Natural, earthy character.',      src: '/STONES/stone_1.png', price: 100   },
  { id: 'stone_2', label: 'Classic Granite',     description: 'Timeless arched silhouette.',     src: '/STONES/stone_2.png', price: 250   },
  { id: 'stone_3', label: 'Black Granite Rose',  description: 'Elegant polished black granite.', src: '/STONES/stone_3.png', price: 500   },
  { id: 'stone_4', label: 'Cream Marble',        description: 'Soft, peaceful cream finish.',    src: '/STONES/stone_4.png', price: 1000  },
  { id: 'stone_6', label: 'Marble Cathedral',    description: 'Ornate marble with carved arch.', src: '/STONES/stone_6.png', price: 5000  },
  { id: 'stone_7', label: 'Garden Granite',      description: 'Granite framed in greenery.',     src: '/STONES/stone_7.png', price: 8000  },
  { id: 'stone_8', label: 'Cross of Faith',      description: 'Black granite with carved cross.',src: '/STONES/stone_8.png', price: 12000 },
  { id: 'stone_9', label: 'Angel Heart',         description: 'Black granite heart with angel.', src: '/STONES/stone_9.png', price: 18000, extraFee: 300 },
]

const inp = "w-full px-3 py-2.5 bg-primary-700/50 border border-primary-600 rounded-xl text-white text-sm placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
const inpDesktop = "w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500"

export default function CreateMemorialPage() {
  const router = useRouter()
  const { user, wallet, refreshUser, isLoading } = useAuth()

  const [headstoneDesign, setHeadstoneDesign] = useState<HeadstoneDesignId>('stone_1')
  const [paymentAgreement, setPaymentAgreement] = useState<'yes'|'no'|null>(null)

  const selectedStone = STONE_OPTIONS.find(s => s.id === headstoneDesign) || STONE_OPTIONS[0]
  const premiumFee = selectedStone.extraFee || 0
  const requiresPayment = premiumFee > 0
  const PAYMENT_ACTIVE = requiresPayment
  const creationFee = premiumFee
  const stonesScrollerRef = useRef<HTMLDivElement | null>(null)
  const [formData, setFormData] = useState<MemorialFormData>({
    firstName:'', middleName:'', lastName:'', dateOfBirth:'', dateOfDeath:'',
    relationship: relationshipOptions[0], tributeTitle:'', placeOfBirth:'',
    placeOfDeath:'', shortBio:'', lifeStory:'', funeralDate:'', funeralTime:'',
    funeralLocation:'', receptionDetails:'', googleMapsLink:'', obituaryText:''
  })
  const [profilePhoto, setProfilePhoto]   = useState<File | null>(null)
  const [coverPhoto, setCoverPhoto]       = useState<File | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([])
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string>('')

  useEffect(() => {
    if (!profilePhoto) { setProfilePreviewUrl(''); return }
    const url = URL.createObjectURL(profilePhoto)
    setProfilePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [profilePhoto])

  useEffect(() => {
    if (!isLoading && !user) router.push('/signin')
  }, [isLoading, user, router])

  // Validate dates whenever either changes
  useEffect(() => {
    if (formData.dateOfBirth && formData.dateOfDeath) {
      const dob = new Date(formData.dateOfBirth)
      const dod = new Date(formData.dateOfDeath)
      if (dod < dob) {
        setDateError('Date of death cannot be before date of birth.')
      } else if (dod.getTime() === dob.getTime()) {
        setDateError('Date of death cannot be the same as date of birth.')
      } else {
        setDateError('')
      }
    } else {
      setDateError('')
    }
  }, [formData.dateOfBirth, formData.dateOfDeath])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSingleFileChange = (setter: (f: File|null)=>void, e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] ?? null)
  }
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setGalleryPhotos(Array.from(e.target.files))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitMessage(null)

    // Date validation guard
    if (dateError) {
      toast.error(dateError)
      return
    }
    if (formData.dateOfBirth && formData.dateOfDeath) {
      const dob = new Date(formData.dateOfBirth)
      const dod = new Date(formData.dateOfDeath)
      if (dod <= dob) {
        toast.error('Date of death must be after date of birth.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      const deceasedName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ').trim()
      fd.append('deceased_name', deceasedName)
      fd.append('headstone_design', headstoneDesign)
      if (formData.shortBio || formData.lifeStory) fd.append('bio', formData.lifeStory || formData.shortBio)
      if (formData.dateOfBirth)  fd.append('date_of_birth',  formData.dateOfBirth)
      if (formData.dateOfDeath)  fd.append('date_of_death',  formData.dateOfDeath)
      if (formData.placeOfBirth) fd.append('place_of_birth', formData.placeOfBirth)
      if (formData.placeOfDeath) fd.append('place_of_death', formData.placeOfDeath)
      fd.append('visibility', 'PUBLIC')
      fd.append('cultural_template', 'MODERN')

      if (requiresPayment) {
        if (paymentAgreement !== 'yes') {
          toast.error('You must agree to pay the required premium fee for the selected headstone.')
          setIsSubmitting(false)
          return
        }
        fd.append('skip_payment', 'false')
      } else {
        fd.append('skip_payment', 'true')
      }

      if (profilePhoto) fd.append('profile_image', profilePhoto)
      if (coverPhoto)   fd.append('cover_image',   coverPhoto)
      galleryPhotos.forEach(f => fd.append('gallery_images', f))
      const res = await api.post('/memorials', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res.data?.success) {
        toast.success('Memorial created successfully.')
        setSubmitMessage('Your memorial has been created and published.')
        await refreshUser()
        router.push('/memorials')
      } else {
        toast.error(res.data?.message || 'Failed to create memorial.')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create memorial.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewName  = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ') || 'Full Name'
  const previewDates = [formData.dateOfBirth, formData.dateOfDeath].filter(Boolean).join(' - ') || '1990 - 2020'

  const card  = "bg-primary-800/80 border border-primary-700/60 rounded-2xl"
  const cardM = "bg-primary-800/80 border border-primary-700/60 rounded-2xl p-4 space-y-4"

  // Reusable date error banner
  const DateErrorBanner = () => dateError ? (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-xs font-medium">
      ⚠️ {dateError}
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-8">

        <Link href="/dashboard" className="inline-flex items-center text-accent-300 hover:text-accent-200 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to dashboard
        </Link>

        {/* Desktop header */}
        <header className={`hidden md:block ${card} p-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
                <Heart className="w-8 h-8 text-accent-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create a Memorial Tribute</h1>
              <p className="text-accent-200 max-w-2xl">
                Capture a loved one's story with required details for publication and optional sections
                that let you craft a beautiful, comprehensive tribute page.
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

        {/* Mobile header */}
        <header className={`md:hidden ${card} p-4`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white leading-tight">Create a Memorial</h1>
              <p className="text-[10px] text-accent-400 mt-0.5">Honor a life. Preserve their story.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Add details','Upload photos','Choose stone','Publish'].map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/8">
                  <span className="text-[8px] text-[#D4AF37] font-black">{i+1}</span>
                  <span className="text-[8px] text-white/50 font-medium">{step}</span>
                </div>
                {i < 3 && <span className="text-white/15 text-[8px]">›</span>}
              </div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 md:space-y-8">

            {/* SECTION 1 — Required Info Desktop */}
            <section className={`hidden md:block ${card} p-6 space-y-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Required Information</h2>
                  <p className="text-sm text-accent-300">All fields in this section are mandatory except middle name.</p>
                </div>
                <Calendar className="w-6 h-6 text-accent-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[['First name *','firstName','John',true],['Middle name (optional)','middleName','K.',false],['Last name *','lastName','Doe',true]].map(([label,name,ph,req]) => (
                  <div key={name as string}>
                    <label className="block text-sm font-medium text-accent-300 mb-2">{label as string}</label>
                    <input type="text" name={name as string} value={(formData as any)[name as string]} onChange={handleInputChange} required={req as boolean} maxLength={50} className={inpDesktop} placeholder={ph as string} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Date of birth *</label>
                  <input
                    type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required
                    max={formData.dateOfDeath || undefined}
                    className={`${inpDesktop} ${dateError ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Date of death *</label>
                  <input
                    type="date" name="dateOfDeath" value={formData.dateOfDeath} onChange={handleInputChange} required
                    min={formData.dateOfBirth || undefined}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inpDesktop} ${dateError ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </div>
              </div>
              <DateErrorBanner />
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Your relationship to the deceased *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {relationshipOptions.map(option => {
                    const sel = formData.relationship === option
                    return (
                      <label key={option} className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer transition-all ${sel ? 'border-accent-400 bg-primary-700/70 text-white' : 'border-primary-600 text-accent-200 hover:border-accent-400/40'}`}>
                        <span className="text-sm font-medium">{option}</span>
                        <input type="radio" name="relationship" value={option} checked={sel} onChange={handleInputChange} className="hidden" />
                        <span className={`w-4 h-4 rounded-full border ${sel ? 'bg-accent-400 border-accent-200' : 'border-accent-300'}`} />
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Tribute title *</label>
                <input type="text" name="tributeTitle" value={formData.tributeTitle} onChange={handleInputChange} required className={inpDesktop} placeholder="In Loving Memory of John Doe" />
              </div>
            </section>

            {/* SECTION 1 — Required Info Mobile */}
            <section className={`md:hidden ${cardM}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-bold text-white">Required Info</h2>
                <Calendar className="w-4 h-4 text-accent-400" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['First *','firstName','John',true],['Middle','middleName','K.',false],['Last *','lastName','Doe',true]].map(([label,name,ph,req]) => (
                  <div key={name as string}>
                    <label className="block text-[10px] font-semibold text-accent-400 mb-1">{label as string}</label>
                    <input type="text" name={name as string} value={(formData as any)[name as string]} onChange={handleInputChange} required={req as boolean} maxLength={50} className={inp} placeholder={ph as string} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Date of birth *</label>
                  <input
                    type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required
                    max={formData.dateOfDeath || undefined}
                    className={`${inp} ${dateError ? 'border-red-400' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Date of death *</label>
                  <input
                    type="date" name="dateOfDeath" value={formData.dateOfDeath} onChange={handleInputChange} required
                    min={formData.dateOfBirth || undefined}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inp} ${dateError ? 'border-red-400' : ''}`}
                  />
                </div>
              </div>
              <DateErrorBanner />
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-2">Your relationship *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {relationshipOptions.map(option => {
                    const sel = formData.relationship === option
                    return (
                      <label key={option} className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-all ${sel ? 'border-[#D4AF37]/60 bg-[#D4AF37]/8 text-white' : 'border-white/8 text-white/50'}`}>
                        <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${sel ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30'}`} />
                        <input type="radio" name="relationship" value={option} checked={sel} onChange={handleInputChange} className="hidden" />
                        <span className="text-[10.5px] font-medium">{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Tribute title *</label>
                <input type="text" name="tributeTitle" value={formData.tributeTitle} onChange={handleInputChange} required className={inp} placeholder="In Loving Memory of John Doe" />
              </div>
            </section>

            {/* SECTION 2 — Background Desktop */}
            <section className={`hidden md:block ${card} p-6 space-y-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Optional Background Details</h2>
                  <p className="text-sm text-accent-300">Commonly asked questions that help visitors connect.</p>
                </div>
                <MapPin className="w-6 h-6 text-accent-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Place of birth</label>
                  <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className={inpDesktop} placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Place of death</label>
                  <input type="text" name="placeOfDeath" value={formData.placeOfDeath} onChange={handleInputChange} className={inpDesktop} placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Short biography / tribute introduction</label>
                <textarea name="shortBio" value={formData.shortBio} onChange={handleInputChange} rows={3} className={`${inpDesktop} rounded-2xl`} placeholder="A paragraph that summarizes their life and legacy." />
              </div>
            </section>

            {/* SECTION 2 — Background Mobile */}
            <section className={`md:hidden ${cardM}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-bold text-white">Background Details</h2>
                <MapPin className="w-4 h-4 text-accent-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Place of birth</label>
                  <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className={inp} placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Place of death</label>
                  <input type="text" name="placeOfDeath" value={formData.placeOfDeath} onChange={handleInputChange} className={inp} placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Short biography</label>
                <textarea name="shortBio" value={formData.shortBio} onChange={handleInputChange} rows={3} className={`${inp} rounded-xl`} placeholder="A paragraph summarizing their life and legacy." />
              </div>
            </section>

            {/* SECTION 3 — Payment Desktop */}
            <section className={`hidden md:block ${card} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Payment &amp; Publishing</h2>
                  <p className="text-sm text-accent-300">
                  {requiresPayment
                    ? `A premium fee of ${premiumFee.toLocaleString()} birr is required for the selected Angel Heart headstone.`
                    : 'No premium payment is required for the selected headstone.'}
                </p>
                </div>
                {!PAYMENT_ACTIVE && <div className="text-sm text-accent-400 italic">(Temporarily inactive)</div>}
              </div>
              <div className={`bg-primary-900/60 border border-primary-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${!PAYMENT_ACTIVE ? 'opacity-60 pointer-events-none' : ''}`}>
                <div>
                  <p className="text-sm text-accent-200 mb-1">Deduct <span className="font-semibold text-white">{creationFee.toLocaleString()} birr</span> from wallet?</p>
                  {wallet && <p className="text-xs text-accent-400">Balance: <span className="font-semibold text-accent-200">{Number(wallet.balance ?? 0).toLocaleString()} {wallet.currency || 'ETB'}</span></p>}
                </div>
                <div className="flex gap-3">
                  {(['yes','no'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setPaymentAgreement(v)} disabled={!PAYMENT_ACTIVE}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${paymentAgreement === v ? (v==='yes'?'bg-accent-500 text-white':'bg-red-600 text-white') : 'bg-primary-700 text-accent-200 hover:bg-primary-600'}`}>
                      {v === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
              {paymentAgreement && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${paymentAgreement==='yes' ? 'bg-green-500/20 border border-green-400/40 text-green-200' : 'bg-red-500/20 border border-red-400/40 text-red-200'}`}>
                  <span className="text-sm font-semibold">{paymentAgreement==='yes' ? `✅ Agreed to pay ${creationFee.toLocaleString()} birr` : `❌ Disagreed`}</span>
                </div>
              )}
            </section>

            {/* SECTION 3 — Payment Mobile */}
            <section className={`md:hidden ${cardM}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-bold text-white">Payment</h2>
                {!PAYMENT_ACTIVE && <span className="text-[9px] text-accent-400 italic px-2 py-0.5 rounded-full border border-white/8">Inactive</span>}
              </div>
              <div className={`rounded-xl border border-white/8 p-3 ${!PAYMENT_ACTIVE ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[11px] text-white/70 mb-1">
                  Deduct <span className="font-bold text-white">{creationFee.toLocaleString()} birr</span> from wallet?
                  {selectedStone.extraFee ? <span className="text-[9px] text-[#D4AF37] block mt-0.5">Includes +{selectedStone.extraFee} birr Angel Heart premium</span> : null}
                </p>
                {wallet && <p className="text-[10px] text-white/40 mb-3">Balance: <span className="text-white/70">{Number(wallet.balance ?? 0).toLocaleString()} {wallet.currency || 'ETB'}</span></p>}
                <div className="flex gap-2">
                  {(['yes','no'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setPaymentAgreement(v)} disabled={!PAYMENT_ACTIVE}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-colors ${paymentAgreement === v ? (v==='yes'?'bg-[#D4AF37] text-black':'bg-red-600 text-white') : 'bg-white/5 text-white/50 border border-white/8'}`}>
                      {v === 'yes' ? 'Yes, agree' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
              {paymentAgreement && (
                <div className={`flex items-center gap-2 p-2.5 rounded-xl text-[10.5px] font-semibold ${paymentAgreement==='yes' ? 'bg-green-500/15 border border-green-400/25 text-green-300' : 'bg-red-500/15 border border-red-400/25 text-red-300'}`}>
                  {paymentAgreement==='yes' ? `✅ Agreed — ${creationFee.toLocaleString()} birr` : `❌ Declined`}
                </div>
              )}
            </section>

            {/* SECTION 4 — Photos & Headstone Desktop */}
            <section className={`hidden md:block ${card} p-6 space-y-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Photos &amp; Gallery</h2>
                  <p className="text-sm text-accent-300">Upload profile, cover, and gallery images.</p>
                </div>
                <Upload className="w-6 h-6 text-accent-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Profile photo</label>
                  <input type="file" accept="image/*" onChange={e => handleSingleFileChange(setProfilePhoto, e)} className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30" />
                  {profilePhoto && <p className="text-xs text-accent-400 mt-2">Selected: {profilePhoto.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Cover photo</label>
                  <input type="file" accept="image/*" onChange={e => handleSingleFileChange(setCoverPhoto, e)} className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30" />
                  {coverPhoto && <p className="text-xs text-accent-400 mt-2">Selected: {coverPhoto.name}</p>}
                </div>
              </div>
              <div className="border-t border-primary-700/60 pt-6 space-y-5">
                <div className="flex items-end justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">Choose a Headstone</h3>
                    <p className="text-sm text-accent-300">The photo and inscription will be engraved on the stone you select.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-accent-400">Currently selected</p>
                    <p className="text-sm font-semibold text-white">{selectedStone.label}</p>
                    {selectedStone.extraFee ? <p className="text-xs text-[#D4AF37]">+{selectedStone.extraFee} birr premium</p> : null}
                  </div>
                </div>
                <div className="relative">
                  <button type="button" aria-label="Scroll left" onClick={() => stonesScrollerRef.current?.scrollBy({ left: -320, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary-900/80 border border-accent-500/40 text-accent-200 hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-center backdrop-blur">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div ref={stonesScrollerRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-10 stones-scroller">
                    {STONE_OPTIONS.map(opt => {
                      const sel = headstoneDesign === opt.id
                      return (
                        <button key={opt.id} type="button" onClick={() => setHeadstoneDesign(opt.id)} className={`group flex-shrink-0 w-44 text-left rounded-2xl border p-3 transition-all duration-300 ${sel ? 'border-accent-400 bg-gradient-to-b from-accent-500/20 to-primary-900/40 shadow-lg shadow-accent-500/20 scale-[1.02]' : 'border-primary-700/60 bg-primary-900/30 hover:border-accent-400/60 hover:-translate-y-1'}`}>
                          <div className={`w-full h-36 flex items-center justify-center rounded-xl mb-3 transition-colors ${sel ? 'bg-gradient-to-b from-black/30 to-black/10' : 'bg-black/20 group-hover:bg-black/30'}`}>
                            <img src={opt.src} alt={opt.label} className="h-32 object-contain drop-shadow-2xl" />
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white truncate">{opt.label}</span>
                            {sel && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/30 text-accent-100 border border-accent-400/40">Selected</span>}
                          </div>
                          <p className="text-[11px] text-accent-300 line-clamp-1 mb-1">{opt.description}</p>
                          {opt.extraFee ? <p className="text-[10px] text-[#D4AF37]">+{opt.extraFee} birr</p> : null}
                        </button>
                      )
                    })}
                  </div>
                  <button type="button" aria-label="Scroll right" onClick={() => stonesScrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary-900/80 border border-accent-500/40 text-accent-200 hover:bg-accent-500 hover:text-white transition-colors flex items-center justify-center backdrop-blur">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-accent-300 mb-3">Live engraved preview</p>
                  <div className="flex items-end justify-center rounded-2xl overflow-hidden relative" style={{ background: 'radial-gradient(circle at 50% 14%, rgba(238,192,192,0.08),transparent 100%), linear-gradient(to top, rgba(15,15,15,0.98), rgba(23,30,22,0.62) 38%, rgba(53,124,59,0.12) 100%), url("/cemetery_bg.png") center bottom / cover no-repeat', paddingBottom: '5px', paddingTop: '20px', minHeight: '450px', boxShadow: 'inset 0 0 42px rgba(0,0,0,0.88)' }}>
                    <button type="button" aria-label="Previous stone" onClick={() => { const i = STONE_OPTIONS.findIndex(o=>o.id===headstoneDesign); setHeadstoneDesign(STONE_OPTIONS[(i-1+STONE_OPTIONS.length)%STONE_OPTIONS.length].id) }} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', zIndex:50, width:44, height:44, borderRadius:'9999px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>‹</button>
                    <button type="button" aria-label="Next stone" onClick={() => { const i = STONE_OPTIONS.findIndex(o=>o.id===headstoneDesign); setHeadstoneDesign(STONE_OPTIONS[(i+1)%STONE_OPTIONS.length].id) }} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', zIndex:50, width:44, height:44, borderRadius:'9999px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>›</button>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(circle at 50% 30%, rgba(212,168,83,0.08) 0%, rgba(0,0,0,0) 60%)' }} />
                    <div className="relative z-10" style={{ transform:'translateY(2px)' }}>
                      <HeadstonePreview memorial={{ name: previewName, dates: previewDates, image: profilePreviewUrl||'/images.jpg', headstoneDesign }} width={260} height={340} />
                    </div>
                    {[{ h:'h-16', z:'z-20', size:'120px', brightness:'0.32', blur:'0.5px', ty:'4px' }, { h:'h-14', z:'z-25', size:'135px', brightness:'0.48', blur:'0', ty:'2px' }, { h:'h-11', z:'z-30', size:'150px', brightness:'0.62', blur:'0', ty:'0' }].map((l,i) => (
                      <div key={i} className={`absolute bottom-0 left-0 right-0 ${l.h} pointer-events-none ${l.z}`} style={{ backgroundImage:'url("https://upload.wikimedia.org/wikipedia/commons/1/1a/Grass_01.png")', backgroundRepeat:'repeat-x', backgroundSize:`${l.size} auto`, backgroundPosition:'bottom center', filter:`brightness(${l.brightness}) contrast(1.1) saturate(0.8)${l.blur?` blur(${l.blur})`:''}`, transform:`translateY(${l.ty})` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Gallery photos (multiple)</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="block w-full text-sm text-accent-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-500/20 file:text-white hover:file:bg-accent-500/30" />
                {galleryPhotos.length > 0 && <p className="text-xs text-accent-400 mt-2">{galleryPhotos.length} photo(s) selected</p>}
              </div>
            </section>

            {/* SECTION 4 — Photos & Headstone Mobile */}
            <section className={`md:hidden ${cardM}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-bold text-white">Photos &amp; Headstone</h2>
                <Upload className="w-4 h-4 text-accent-400" />
              </div>
              {[['Profile photo', setProfilePhoto, profilePhoto],['Cover photo', setCoverPhoto, coverPhoto]].map(([label, setter, file]) => (
                <div key={label as string} className="rounded-xl border border-white/8 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-2">{label as string}</label>
                  <input type="file" accept="image/*" onChange={e => handleSingleFileChange(setter as any, e)} className="block w-full text-[11px] text-accent-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#D4AF37]/15 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/25" />
                  {(file as File|null) && <p className="text-[9px] text-accent-400 mt-1">✓ {(file as File).name}</p>}
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold text-accent-400">Choose headstone</label>
                  <div className="text-right">
                    <span className="text-[10px] text-[#D4AF37] font-bold">{selectedStone.label}</span>
                    {selectedStone.extraFee ? <span className="block text-[9px] text-[#D4AF37]/70">+{selectedStone.extraFee} birr</span> : null}
                  </div>
                </div>
                <div className="overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                  <div className="flex gap-2" style={{ width: 'max-content' }}>
                    {STONE_OPTIONS.map(opt => {
                      const sel = headstoneDesign === opt.id
                      return (
                        <button key={opt.id} type="button" onClick={() => setHeadstoneDesign(opt.id)}
                          className={`flex-shrink-0 w-20 rounded-xl border p-2 transition-all ${sel ? 'border-[#D4AF37]/70 bg-[#D4AF37]/8' : 'border-white/8 bg-white/3'}`}
                        >
                          <div className="w-full h-14 flex items-center justify-center rounded-lg mb-1.5" style={{ background: sel ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.2)' }}>
                            <img src={opt.src} alt={opt.label} className="h-12 object-contain" />
                          </div>
                          <p className="text-[8px] font-semibold text-white text-center leading-tight line-clamp-1">{opt.label}</p>
                          <p className="text-[7px] text-[#D4AF37] text-center mt-0.5">
                            {opt.price.toLocaleString()} br
                            {opt.extraFee ? <span className="block">+{opt.extraFee}</span> : null}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-accent-400 mb-2">Live preview</p>
                <div className="relative flex items-end justify-center rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.98), rgba(20,30,20,0.7) 50%, rgba(40,80,45,0.15) 100%), url("/cemetery_bg.png") center bottom / cover no-repeat', minHeight: '240px', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}>
                  <button type="button" onClick={() => { const i=STONE_OPTIONS.findIndex(o=>o.id===headstoneDesign); setHeadstoneDesign(STONE_OPTIONS[(i-1+STONE_OPTIONS.length)%STONE_OPTIONS.length].id) }} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg" style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)' }}>‹</button>
                  <button type="button" onClick={() => { const i=STONE_OPTIONS.findIndex(o=>o.id===headstoneDesign); setHeadstoneDesign(STONE_OPTIONS[(i+1)%STONE_OPTIONS.length].id) }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg" style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)' }}>›</button>
                  <div className="relative z-10 scale-[0.62] origin-bottom mb-1">
                    <HeadstonePreview memorial={{ name: previewName, dates: previewDates, image: profilePreviewUrl||'/images.jpg', headstoneDesign }} width={260} height={340} />
                  </div>
                  {[{ h:'32px', size:'90px', brightness:'0.45' }, { h:'24px', size:'105px', brightness:'0.6' }].map((l,i) => (
                    <div key={i} className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height:l.h, backgroundImage:'url("https://upload.wikimedia.org/wikipedia/commons/1/1a/Grass_01.png")', backgroundRepeat:'repeat-x', backgroundSize:`${l.size} auto`, backgroundPosition:'bottom center', filter:`brightness(${l.brightness}) saturate(0.8)`, zIndex:20+i }} />
                  ))}
                </div>
                <p className="text-center text-[9px] text-white/25 mt-1.5">← swipe stones or tap arrows →</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Gallery photos</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="block w-full text-[11px] text-accent-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#D4AF37]/15 file:text-[#D4AF37]" />
                {galleryPhotos.length > 0 && <p className="text-[9px] text-accent-400 mt-1">✓ {galleryPhotos.length} photo(s) selected</p>}
              </div>
            </section>

            {/* SECTION 5 — Funeral Details Desktop */}
            <section className={`hidden md:block ${card} p-6 space-y-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Funeral Details &amp; Notice</h2>
                  <p className="text-sm text-accent-300">Inform supporters about services and share the obituary.</p>
                </div>
                <BookOpen className="w-6 h-6 text-accent-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Funeral date</label>
                  <input type="date" name="funeralDate" value={formData.funeralDate} onChange={handleInputChange} className={inpDesktop} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Funeral time</label>
                  <input type="time" name="funeralTime" value={formData.funeralTime} onChange={handleInputChange} className={inpDesktop} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-300 mb-2">Google Maps link</label>
                  <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleInputChange} className={inpDesktop} placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Ceremony location &amp; reception</label>
                <textarea name="funeralLocation" value={formData.funeralLocation} onChange={handleInputChange} rows={3} className={`${inpDesktop} rounded-2xl`} placeholder="Church, cemetery, reception venue, etc." />
                <textarea name="receptionDetails" value={formData.receptionDetails} onChange={handleInputChange} rows={2} className={`mt-3 ${inpDesktop} rounded-2xl`} placeholder="Reception time, dress code, or additional instructions." />
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-300 mb-2">Obituary text</label>
                <textarea name="obituaryText" value={formData.obituaryText} onChange={handleInputChange} rows={5} className={`${inpDesktop} rounded-2xl`} placeholder="Full obituary text to share publicly." />
              </div>
            </section>

            {/* SECTION 5 — Funeral Details Mobile */}
            <section className={`md:hidden ${cardM}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-bold text-white">Funeral Details</h2>
                <BookOpen className="w-4 h-4 text-accent-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Funeral date</label>
                  <input type="date" name="funeralDate" value={formData.funeralDate} onChange={handleInputChange} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-accent-400 mb-1">Funeral time</label>
                  <input type="time" name="funeralTime" value={formData.funeralTime} onChange={handleInputChange} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Google Maps link</label>
                <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleInputChange} className={inp} placeholder="https://maps.app.goo.gl/..." />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Location &amp; reception</label>
                <textarea name="funeralLocation" value={formData.funeralLocation} onChange={handleInputChange} rows={2} className={`${inp} rounded-xl`} placeholder="Church, cemetery, reception venue…" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-accent-400 mb-1">Obituary</label>
                <textarea name="obituaryText" value={formData.obituaryText} onChange={handleInputChange} rows={4} className={`${inp} rounded-xl`} placeholder="Full obituary text to share publicly." />
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !!dateError}
                className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-xl md:rounded-2xl transition-all duration-300 text-[12px] md:text-sm"
              >
                {isSubmitting ? 'Creating...' : 'Post memorial'}
              </button>
              <Link
                href="/memorials"
                className="flex-1 text-center border border-accent-400/60 text-accent-200 hover:border-accent-300 hover:text-white py-2 md:py-3 px-4 md:px-6 rounded-xl md:rounded-2xl transition-colors text-[12px] md:text-sm"
              >
                Cancel
              </Link>
            </div>

            {submitMessage && (
              <div className="bg-green-500/20 border border-green-400/40 text-green-200 px-4 py-3 rounded-2xl text-sm">
                {submitMessage}
              </div>
            )}
          </form>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block space-y-6">
            <div className={`${card} p-6`}>
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
            <div className={`${card} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4">Checklist</h3>
              <ul className="space-y-3 text-sm text-accent-200">
                {['Confirm preferred spellings for the tribute URL.','Ask family members for stories to use in the life story section.','Collect at least five photos for the gallery.','Double-check funeral logistics before inviting guests.'].map(item => (
                  <li key={item} className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-accent-400 mr-3 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .stones-scroller::-webkit-scrollbar { height: 6px; }
        .stones-scroller::-webkit-scrollbar-track { background: transparent; }
        .stones-scroller::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.4); border-radius: 3px; }
      `}</style>
    </div>
  )
}