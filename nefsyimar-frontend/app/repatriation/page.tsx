'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Upload, AlertCircle, Plane, ShieldCheck, Truck, PhoneCall, Mail, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api, repatriationApi } from '@/lib/api'
import { getSafeRedirectPath } from '@/lib/authRedirects'

type RepatriationFields = {
  deceased_full_name: string
  nationality: string
  passport_or_id: string
  current_location_body: string
  applicant_full_name: string
  relationship: string
  applicant_phone: string
  applicant_email: string
  receiver_full_name: string
  receiver_phone: string
  receiver_email: string
  receiver_alternative_phone: string
}

type Errors = Record<string, string>

const validEmail = (val: string) => !val.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? 'Enter a valid email address' : ''
const validPhone = (val: string) => !val.trim() ? 'Phone is required' : !/^\+?[\d\s\-()]{7,}$/.test(val) ? 'Enter a valid phone number' : ''

const WHATSAPP_NUMBER = '+251963175963' // formatted for wa.me link
const WHATSAPP_DISPLAY = '+251 96 317 5963'
const CONTACT_EMAIL = 'nefsyimar@gmail.com'

function WhatsAppIcon({ size = 15, color = '#D4AF37' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.347-.347.521-.521.174-.174.232-.298.347-.498.116-.198.058-.347-.034-.495-.092-.149-1.198-2.886-1.323-3.207-.124-.32-.247-.276-.347-.276-.099 0-.246.025-.395.025-.149 0-.396.05-.643.247-.247.198-1.155.987-1.155 2.4 0 1.412 1.067 2.875 1.215 3.073.149.198 2.073 3.169 5.02 4.317 2.944 1.149 2.944.764 3.479.715.534-.05 1.758-.717 2.006-1.41.247-.692.247-1.286.173-1.41-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.005a9.683 9.683 0 0 1-4.93-1.347l-.353-.21-3.671.964.98-3.583-.23-.367a9.642 9.642 0 0 1-1.477-5.156c.001-5.345 4.351-9.694 9.689-9.694 2.589 0 5.024 1.011 6.854 2.846a9.621 9.621 0 0 1 2.846 6.85c-.003 5.344-4.352 9.692-9.703 9.697zm8.262-17.96A11.815 11.815 0 0 0 12.05 0C5.503 0 .163 5.339.16 11.892c0 2.096.547 4.142 1.595 5.945L0 24l6.335-1.654a11.882 11.882 0 0 0 5.71 1.452h.005c6.546 0 11.886-5.339 11.889-11.892a11.821 11.821 0 0 0-3.479-8.418z" />
    </svg>
  )
}

export default function RepatriationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#07080d', color: 'white' }}>Loading...</div>}>
      <RepatriationPageContent />
    </Suspense>
  )
}

function RepatriationPageContent() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const submissionId = searchParams?.get('submissionId') || null
  const isEditMode = Boolean(submissionId)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (searchParams?.get('submitted') === 'true') {
      setSubmitted(true)
      router.replace('/repatriation')
    }
  }, [searchParams, router])

  // Fetch existing submission data when editing
  useEffect(() => {
    if (!submissionId || authLoading || !user) return
    let cancelled = false
    const fetchSubmission = async () => {
      setEditLoading(true)
      try {
        const res = await repatriationApi.getRequest(submissionId)
        const data = res.data?.data || res.data
        if (!cancelled && data) {
          setFields({
            deceased_full_name: data.deceased_full_name || '',
            nationality: data.nationality || '',
            passport_or_id: data.passport_or_id || '',
            current_location_body: data.current_location_body || '',
            applicant_full_name: data.applicant_full_name || '',
            relationship: data.relationship || '',
            applicant_phone: data.applicant_phone || '',
            applicant_email: data.applicant_email || '',
            receiver_full_name: data.receiver_full_name || '',
            receiver_phone: data.receiver_phone || '',
            receiver_email: data.receiver_email || '',
            receiver_alternative_phone: data.receiver_alternative_phone || '',
          })
        }
      } catch (err) {
        console.error('Failed to load submission for editing:', err)
        alert('Failed to load the submission for editing.')
      } finally {
        if (!cancelled) setEditLoading(false)
      }
    }
    fetchSubmission()
    return () => { cancelled = true }
  }, [submissionId, authLoading, user])

  const [fields, setFields] = useState<RepatriationFields>({
    // Step 1: Deceased Information
    deceased_full_name: '',
    nationality: '',
    passport_or_id: '',
    current_location_body: '',
    // Step 2: Applicant / Sender Information
    applicant_full_name: '',
    relationship: '',
    applicant_phone: '',
    applicant_email: '',
    // Step 3: Receiver Information (In Ethiopia)
    receiver_full_name: '',
    receiver_phone: '',
    receiver_email: '',
    receiver_alternative_phone: '',
  })

  const [files, setFiles] = useState<{ death_certificate_file?: File }>({})

  const validateStep = (step: number, f = fields, fl = files): Errors => {
    const e: Errors = {}
    
    if (step === 1) {
      if (!f.deceased_full_name.trim()) e.deceased_full_name = 'Full name of the deceased is required'
      if (!f.nationality.trim()) e.nationality = 'Nationality selection is required'
      if (!f.passport_or_id.trim()) e.passport_or_id = 'Passport or ID number is required'
      if (!f.current_location_body.trim()) e.current_location_body = 'Current location of the body is required'
    }
    
    if (step === 2) {
      if (!f.applicant_full_name.trim()) e.applicant_full_name = 'Your full name is required'
      if (!f.relationship.trim()) e.relationship = 'Relationship to the deceased is required'
      const phoneErr = validPhone(f.applicant_phone); if (phoneErr) e.applicant_phone = phoneErr
      const emailErr = validEmail(f.applicant_email); if (emailErr) e.applicant_email = emailErr
    }
    
    if (step === 3) {
      if (!f.receiver_full_name.trim()) e.receiver_full_name = 'Receiver full name is required'
      const phoneErr = validPhone(f.receiver_phone); if (phoneErr) e.receiver_phone = phoneErr
      if (f.receiver_alternative_phone.trim()) {
        const altPhoneErr = validPhone(f.receiver_alternative_phone); if (altPhoneErr) e.receiver_alternative_phone = altPhoneErr
      }
    }
    
    if (step === 4) {
      if (!fl.death_certificate_file && !isEditMode) e.death_certificate_file = 'Death certificate or medical notification file is required'
    }

    return e
  }

  const set = (name: string, val: string) => {
    const updated = { ...fields, [name]: val }
    setFields(updated)
    if (touched[name]) {
      const errs = validateStep(currentStep, updated, files)
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
    }
  }

  const blur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const errs = validateStep(currentStep, fields, files)
    setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
  }

  const setFile = (name: string, file?: File) => {
    const updated = { ...files, [name]: file }
    setFiles(updated)
    if (touched[name]) {
      const errs = validateStep(currentStep, fields, updated)
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
    }
  }

  const handleNextStep = () => {
    // Touch all fields in the current step to reveal existing validation issues
    const stepFields: Record<string, string[]> = {
      1: ['deceased_full_name', 'nationality', 'passport_or_id', 'current_location_body'],
      2: ['applicant_full_name', 'relationship', 'applicant_phone', 'applicant_email'],
      3: ['receiver_full_name', 'receiver_phone', 'receiver_alternative_phone'],
      4: ['death_certificate_file']
    }

    const allTouched = { ...touched }
    stepFields[currentStep].forEach(k => allTouched[k] = true)
    setTouched(allTouched)

    const errs = validateStep(currentStep, fields, files)
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authLoading && !user) {
      const redirectTarget = getSafeRedirectPath('/repatriation', '/dashboard')
      router.push(`/signup?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    // Double check step 4 validation
    const errs = validateStep(4, fields, files)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
      if (files.death_certificate_file) formData.append('death_certificate_file', files.death_certificate_file)

      if (isEditMode && submissionId) {
        const res = await repatriationApi.updateRequest(submissionId, formData)
        if (res.status === 200) {
          setSubmitted(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          alert('Update failed. Please try again.')
        }
      } else {
        const res = await api.post('/repatriation', formData)
        if (res.status === 201) {
          setSubmitted(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          alert('Submission failed. Please try again.')
        }
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = "w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder-white/25"
  const selectBase = "w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition bg-[#12131a] border"
  const inputStyle = (name: string) => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${errors[name] && touched[name] ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.10)'}`,
    caretColor: '#D4AF37',
  })

  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] && touched[name] ? (
      <p className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: 'rgba(239,68,68,0.85)' }}>
        <AlertCircle size={10} /> {errors[name]}
      </p>
    ) : null

  const SectionHeader = ({ step, label, title }: { step: string; label: string; title: string }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37' }}>
        {step}
      </div>
      <div>
        <p className="text-[9px] font-medium tracking-[0.20em] uppercase" style={{ color: 'rgba(212,175,55,0.60)' }}>{label}</p>
        <h2 className="text-base md:text-lg font-semibold text-white leading-tight">{title}</h2>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#07080d' }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.30)' }}>
            <CheckCircle size={32} style={{ color: '#D4AF37' }} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-3">{isEditMode ? 'Updated Successfully' : 'Submitted Successfully'}</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {isEditMode
              ? 'Your body shipping request has been updated successfully.'
              : 'Your body shipping request has been received and forwarded to the admin team for review.'}
          </p>
          {isEditMode ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide"
              style={{ background: '#D4AF37', color: '#000' }}
            >
              Back to Dashboard
            </button>
          ) : (
            <button
              onClick={() => {
                setSubmitted(false)
                setCurrentStep(1)
                setFields({
                  deceased_full_name: '',
                  nationality: '',
                  passport_or_id: '',
                  current_location_body: '',
                  applicant_full_name: '',
                  relationship: '',
                  applicant_phone: '',
                  applicant_email: '',
                  receiver_full_name: '',
                  receiver_phone: '',
                  receiver_email: '',
                  receiver_alternative_phone: ''
                })
                setFiles({})
                setErrors({})
                setTouched({})
              }}
              className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide"
              style={{ background: '#D4AF37', color: '#000' }}
            >
              Submit Another Body Shipping Request
            </button>
          )}
        </div>
      </div>
    )
  }

  if (editLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#07080d' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4AF37' }}></div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>Loading request details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#07080d' }}>
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }} />

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">

        <div className="mb-8 md:mb-10 p-5 md:p-7 rounded-2xl"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.20)' }}>

          <p className="text-[9px] md:text-[11px] font-medium tracking-[0.22em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.70)' }}>
            Repatriation &amp; Funeral Services
          </p>
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-3 leading-tight">
            Dignified Repatriation &amp; Funeral Services
          </h1>
          <p className="text-xs md:text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Body shipping means bringing a beloved one back to Ethiopia from another country with dignity, care,
            and full legal support. We coordinate the journey, paperwork, airport handling, and local funeral arrangements
            so your family can focus on remembrance.
          </p>

          <div className="space-y-3 mb-5">
            {[
              { icon: <Plane size={15} style={{ color: '#D4AF37' }} />, title: 'Global Body Shipping', desc: 'From the US, Europe, or Middle East to Addis Ababa.' },
              { icon: <ShieldCheck size={15} style={{ color: '#D4AF37' }} />, title: 'Bole Airport Clearance', desc: 'Fast customs processing and reception.' },
              { icon: <Truck size={15} style={{ color: '#D4AF37' }} />, title: 'Local Funeral Logistics', desc: 'Premium caskets, professional hearses, and burial setup.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.22)' }}>
                  {icon}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px mb-5" style={{ background: 'rgba(212,175,55,0.18)' }} />

          <p className="flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: '#D4AF37' }}>
            <PhoneCall size={13} />
            Available 24/7. Create an account to continue your request, then share the details below.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
              style={{ background: '#25D366', color: '#fff', border: '1px solid #128C7E' }}
            >
              <WhatsAppIcon size={15} color="#fff" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.40)', color: '#D4AF37' }}
            >
              <Mail size={15} />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mb-8 md:mb-10">
          <p className="text-[9px] md:text-[11px] font-medium tracking-[0.22em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.62)' }}>
            {isEditMode ? 'Edit Request' : 'Body Shipping Request'}
          </p>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">{isEditMode ? 'Edit Details' : 'Submit Details'}</h2>
          <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
            {isEditMode
              ? 'Update the details of your body shipping request. All fields marked with * are required.'
              : 'Fill in details step by step to submit a body shipping request. All fields marked with * are required.'}
          </p>
          
          {/* Step Indicators */}
          <div className="flex gap-2 mt-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <div 
                key={stepNum} 
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{ background: stepNum <= currentStep ? '#D4AF37' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* STEP 1: DECEASED INFORMATION */}
          {currentStep === 1 && (
            <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SectionHeader step="1" label="About the Deceased" title="Deceased Information" />
              <div className="space-y-4">
                <div id="deceased_full_name">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Full Name of the Deceased *</label>
                  <input className={inputBase} style={inputStyle('deceased_full_name')} placeholder="As it appears on the passport"
                    value={fields.deceased_full_name} onChange={e => set('deceased_full_name', e.target.value)} onBlur={() => blur('deceased_full_name')} />
                  <ErrorMsg name="deceased_full_name" />
                </div>
                
                <div id="nationality">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Nationality *</label>
                  <select 
                    className={selectBase} 
                    style={{ borderColor: errors.nationality && touched.nationality ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.10)' }}
                    value={fields.nationality} 
                    onChange={e => set('nationality', e.target.value)} 
                    onBlur={() => blur('nationality')}
                  >
                    <option value="" disabled className="text-white/40">Select Nationality</option>
                    <option value="Ethiopian">Ethiopian</option>
                    <option value="Ethiopian Diaspora (Yellow Card Holder)">Ethiopian Diaspora (Yellow Card Holder)</option>
                    <option value="Foreign National">Foreign National</option>
                  </select>
                  <ErrorMsg name="nationality" />
                </div>

                <div id="passport_or_id">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Passport / ID Number *</label>
                  <input className={inputBase} style={inputStyle('passport_or_id')} placeholder="e.g. EP0123456"
                    value={fields.passport_or_id} onChange={e => set('passport_or_id', e.target.value)} onBlur={() => blur('passport_or_id')} />
                  <ErrorMsg name="passport_or_id" />
                </div>

                <div id="current_location_body">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Current Location of the Body *</label>
                  <input className={inputBase} style={inputStyle('current_location_body')} placeholder="e.g. Country &amp; City (Where our team needs to contact local handlers)"
                    value={fields.current_location_body} onChange={e => set('current_location_body', e.target.value)} onBlur={() => blur('current_location_body')} />
                  <ErrorMsg name="current_location_body" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: APPLICANT / SENDER INFORMATION */}
          {currentStep === 2 && (
            <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SectionHeader step="2" label="Sender Details" title="Applicant / Sender Information" />
              <div className="space-y-4">
                <div id="applicant_full_name">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Your Full Name *</label>
                  <input className={inputBase} style={inputStyle('applicant_full_name')} placeholder="Enter your full name"
                    value={fields.applicant_full_name} onChange={e => set('applicant_full_name', e.target.value)} onBlur={() => blur('applicant_full_name')} />
                  <ErrorMsg name="applicant_full_name" />
                </div>

                <div id="relationship">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Relationship to the Deceased *</label>
                  <select 
                    className={selectBase} 
                    style={{ borderColor: errors.relationship && touched.relationship ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.10)' }}
                    value={fields.relationship} 
                    onChange={e => set('relationship', e.target.value)} 
                    onBlur={() => blur('relationship')}
                  >
                    <option value="" disabled>Select Relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Legal Representative">Legal Representative</option>
                  </select>
                  <ErrorMsg name="relationship" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div id="applicant_phone">
                    <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Phone Number *</label>
                    <input className={inputBase} style={inputStyle('applicant_phone')} placeholder="e.g. +1 415 555 2671 (WhatsApp/Viber)" type="tel"
                      value={fields.applicant_phone} onChange={e => set('applicant_phone', e.target.value)} onBlur={() => blur('applicant_phone')} />
                    <ErrorMsg name="applicant_phone" />
                  </div>
                  <div id="applicant_email">
                    <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Email Address *</label>
                    <input className={inputBase} style={inputStyle('applicant_email')} placeholder="e.g. sender@example.com" type="email"
                      value={fields.applicant_email} onChange={e => set('applicant_email', e.target.value)} onBlur={() => blur('applicant_email')} />
                    <ErrorMsg name="applicant_email" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RECEIVER INFORMATION IN ETHIOPIA */}
          {currentStep === 3 && (
            <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SectionHeader step="3" label="Local Contact" title="Receiver Information (In Ethiopia)" />
              <div className="space-y-4">
                <div id="receiver_full_name">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Full Name of Receiver *</label>
                  <input className={inputBase} style={inputStyle('receiver_full_name')} placeholder="The family member picking up or coordinating in Addis Ababa"
                    value={fields.receiver_full_name} onChange={e => set('receiver_full_name', e.target.value)} onBlur={() => blur('receiver_full_name')} />
                  <ErrorMsg name="receiver_full_name" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div id="receiver_phone">
                    <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Primary Phone Number *</label>
                    <input className={inputBase} style={inputStyle('receiver_phone')} placeholder="e.g. +251911234567" type="tel"
                      value={fields.receiver_phone} onChange={e => set('receiver_phone', e.target.value)} onBlur={() => blur('receiver_phone')} />
                    <ErrorMsg name="receiver_phone" />
                  </div>
                  <div id="receiver_email">
                    <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Receiver Email</label>
                    <input className={inputBase} style={inputStyle('receiver_email')} placeholder="Optional receiver email" type="email"
                      value={fields.receiver_email} onChange={e => set('receiver_email', e.target.value)} onBlur={() => blur('receiver_email')} />
                    <ErrorMsg name="receiver_email" />
                  </div>
                </div>
                <div id="receiver_alternative_phone">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Alternative Phone Number</label>
                  <input className={inputBase} style={inputStyle('receiver_alternative_phone')} placeholder="Optional second number" type="tel"
                    value={fields.receiver_alternative_phone} onChange={e => set('receiver_alternative_phone', e.target.value)} onBlur={() => blur('receiver_alternative_phone')} />
                  <ErrorMsg name="receiver_alternative_phone" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REQUIRED DOCUMENT UPLOAD */}
          {currentStep === 4 && (
            <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SectionHeader step="4" label="Required Documents" title="Upload Documents" />
              <div className="space-y-4">
                <div id="death_certificate_file">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Death Certificate or Medical Notification *</label>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px dashed ${errors.death_certificate_file && touched.death_certificate_file ? 'rgba(239,68,68,0.55)' : files.death_certificate_file ? 'rgba(212,175,55,0.50)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: files.death_certificate_file ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)' }}>
                      <Upload size={15} style={{ color: files.death_certificate_file ? '#D4AF37' : 'rgba(255,255,255,0.40)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {files.death_certificate_file ? (
                        <p className="text-xs font-medium truncate" style={{ color: '#D4AF37' }}>{files.death_certificate_file.name}</p>
                      ) : (
                        <>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Tap to upload PDF or Image</p>
                          <p className="text-[9px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>e.g. death_certificate.pdf / .jpg</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      name="death_certificate_file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={e => {
                        setTouched(prev => ({ ...prev, death_certificate_file: true }))
                        setFile('death_certificate_file', e.target.files?.[0])
                      }}
                    />
                  </label>
                  <ErrorMsg name="death_certificate_file" />
                </div>
              </div>
            </div>
          )}

          {/* Form Step Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center justify-center gap-1.5 px-4 py-4 rounded-xl text-sm font-bold tracking-[0.05em] transition-all duration-200 active:scale-[0.98]"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#fff', background: 'transparent' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl text-sm font-bold tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98]"
                style={{ background: '#D4AF37', color: '#000' }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-xl text-sm font-bold tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                style={{ background: '#D4AF37', color: '#000' }}
              >
                {loading
                  ? (isEditMode ? 'Updating...' : 'Submitting...')
                  : user
                    ? (isEditMode ? 'Update Request' : 'Submit Body Repatriation Request')
                    : 'Sign In to Continue'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}