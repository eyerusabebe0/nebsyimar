'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Upload, AlertCircle, Plane, ShieldCheck, Truck, PhoneCall, Mail } from 'lucide-react'

type Errors = Record<string, string>

const required = (val: string) => !val.trim() ? 'This field is required' : ''
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
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams?.get('submitted') === 'true') {
      setSubmitted(true)
      router.replace('/repatriation')
    }
  }, [searchParams, router])

  const [fields, setFields] = useState({
    deceased_full_name: '',
    date_of_birth: '',
    date_of_death: '',
    place_of_death: '',
    passport_or_id: '',
    shipping_agency: '',
    air_waybill_no: '',
    flight_number: '',
    departure_date: '',
    estimated_arrival_time: '',
    receiver_full_name: '',
    receiver_phone: '',
    receiver_email: '',
  })

  const [files, setFiles] = useState<{ death_certificate_file?: File; embatming_cert_file?: File; embassy_permit_file?: File }>({})

  const validate = (f = fields, fl = files): Errors => {
    const e: Errors = {}
    if (!f.deceased_full_name.trim()) e.deceased_full_name = 'Full name is required'
    if (!f.date_of_birth.trim()) e.date_of_birth = 'Date of birth is required'
    if (!f.date_of_death.trim()) e.date_of_death = 'Date of death is required'
    if (!f.place_of_death.trim()) e.place_of_death = 'Place of death is required'
    if (!f.passport_or_id.trim()) e.passport_or_id = 'Passport / ID is required'
    if (!f.shipping_agency.trim()) e.shipping_agency = 'Shipping agency is required'
    if (!f.air_waybill_no.trim()) e.air_waybill_no = 'Air waybill number is required'
    if (!f.flight_number.trim()) e.flight_number = 'Flight number is required'
    if (!f.departure_date.trim()) e.departure_date = 'Departure date is required'
    if (!f.estimated_arrival_time.trim()) e.estimated_arrival_time = 'Estimated arrival is required'
    if (!f.receiver_full_name.trim()) e.receiver_full_name = 'Receiver name is required'
    const phoneErr = validPhone(f.receiver_phone); if (phoneErr) e.receiver_phone = phoneErr
    const emailErr = validEmail(f.receiver_email); if (emailErr) e.receiver_email = emailErr
    if (!fl.death_certificate_file) e.death_certificate_file = 'Death certificate is required'
    if (!fl.embatming_cert_file) e.embatming_cert_file = 'Embalming certificate is required'
    if (!fl.embassy_permit_file) e.embassy_permit_file = 'Embassy permit is required'
    return e
  }

  const set = (name: string, val: string) => {
    const updated = { ...fields, [name]: val }
    setFields(updated)
    if (touched[name]) {
      const errs = validate(updated, files)
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
    }
  }

  const blur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const errs = validate(fields, files)
    setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
  }

  const setFile = (name: string, file?: File) => {
    const updated = { ...files, [name]: file }
    setFiles(updated)
    if (touched[name]) {
      const errs = validate(fields, updated)
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Record<string, boolean> = {}
    Object.keys(fields).forEach(k => allTouched[k] = true)
    ;['death_certificate_file', 'embatming_cert_file', 'embassy_permit_file'].forEach(k => allTouched[k] = true)
    setTouched(allTouched)

    const errs = validate(fields, files)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
      if (files.death_certificate_file) formData.append('death_certificate_file', files.death_certificate_file)
      if (files.embatming_cert_file) formData.append('embatming_cert_file', files.embatming_cert_file)
      if (files.embassy_permit_file) formData.append('embassy_permit_file', files.embassy_permit_file)

      // Submitting to the admin endpoint
      const res = await fetch('/api/admin/repatriation-submissions', { method: 'POST', body: formData })
      if (res.ok) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert('Submission failed. Please try again.')
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = "w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder-white/25"
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
          <h1 className="text-2xl font-serif font-bold text-white mb-3">Submitted Successfully</h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Your body shipping request has been received and forwarded to the admin team for review.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFields({ deceased_full_name:'',date_of_birth:'',date_of_death:'',place_of_death:'',passport_or_id:'',shipping_agency:'',air_waybill_no:'',flight_number:'',departure_date:'',estimated_arrival_time:'',receiver_full_name:'',receiver_phone:'',receiver_email:'' }); setFiles({}); setErrors({}); setTouched({}) }}
            className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide"
            style={{ background: '#D4AF37', color: '#000' }}
          >
            Submit Another Body Shipping Request
          </button>
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
            Bringing your loved one back home to Ethiopia should not be a burden. We handle everything
            with care, respect, and full legal compliance.
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
            Available 24/7. Fill out the form below or contact us immediately.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
         <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
              // Updated background color to WhatsApp green
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
            Body Shipping Request
          </p>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">Submit Details</h2>
          <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Fill in all details below to submit a body shipping request. All fields are required.
          </p>
          <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.35), transparent)' }} />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader step="1" label="About the Deceased" title="Deceased Details" />
            <div className="space-y-4">
              <div id="deceased_full_name">
                <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Full Name *</label>
                <input className={inputBase} style={inputStyle('deceased_full_name')} placeholder="e.g. Girma Assefa Wolde"
                  value={fields.deceased_full_name} onChange={e => set('deceased_full_name', e.target.value)} onBlur={() => blur('deceased_full_name')} />
                <ErrorMsg name="deceased_full_name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="date_of_birth">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Date of Birth *</label>
                  <input 
                    type="date" 
                    className={`${inputBase} [color-scheme:dark]`}
                    style={inputStyle('date_of_birth')}
                    value={fields.date_of_birth} 
                    onChange={e => set('date_of_birth', e.target.value)} 
                    onBlur={() => blur('date_of_birth')} 
                  />
                  <ErrorMsg name="date_of_birth" />
                </div>
                <div id="date_of_death">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Date of Death *</label>
                  <input 
                    type="date" 
                    className={`${inputBase} [color-scheme:dark]`}
                    style={inputStyle('date_of_death')}
                    value={fields.date_of_death} 
                    onChange={e => set('date_of_death', e.target.value)} 
                    onBlur={() => blur('date_of_death')} 
                  />
                  <ErrorMsg name="date_of_death" />
                </div>
              </div>
              <div id="place_of_death">
                <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Place of Death *</label>
                <input className={inputBase} style={inputStyle('place_of_death')} placeholder="e.g. Howard University Hospital, Washington D.C., USA"
                  value={fields.place_of_death} onChange={e => set('place_of_death', e.target.value)} onBlur={() => blur('place_of_death')} />
                <ErrorMsg name="place_of_death" />
              </div>
              <div id="passport_or_id">
                <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Passport / ID *</label>
                <input className={inputBase} style={inputStyle('passport_or_id')} placeholder="e.g. US Passport: A1234567 / Yellow Card: ETH-9876"
                  value={fields.passport_or_id} onChange={e => set('passport_or_id', e.target.value)} onBlur={() => blur('passport_or_id')} />
                <ErrorMsg name="passport_or_id" />
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader step="2" label="Logistics & Flight" title="Shipment Information" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div id="shipping_agency">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Shipping Agency *</label>
                  <input className={inputBase} style={inputStyle('shipping_agency')} placeholder="e.g. Fairfax Funeral Home, VA"
                    value={fields.shipping_agency} onChange={e => set('shipping_agency', e.target.value)} onBlur={() => blur('shipping_agency')} />
                  <ErrorMsg name="shipping_agency" />
                </div>
                <div id="air_waybill_no">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Air Waybill No. *</label>
                  <input className={inputBase} style={inputStyle('air_waybill_no')} placeholder="e.g. 071-12345678"
                    value={fields.air_waybill_no} onChange={e => set('air_waybill_no', e.target.value)} onBlur={() => blur('air_waybill_no')} />
                  <ErrorMsg name="air_waybill_no" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="flight_number">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Flight Number *</label>
                  <input className={inputBase} style={inputStyle('flight_number')} placeholder="e.g. ET 501"
                    value={fields.flight_number} onChange={e => set('flight_number', e.target.value)} onBlur={() => blur('flight_number')} />
                  <ErrorMsg name="flight_number" />
                </div>
                <div id="departure_date">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Departure Date *</label>
                  <input className={inputBase} style={inputStyle('departure_date')} placeholder="e.g. June 26, 2026"
                    value={fields.departure_date} onChange={e => set('departure_date', e.target.value)} onBlur={() => blur('departure_date')} />
                  <ErrorMsg name="departure_date" />
                </div>
              </div>
              <div id="estimated_arrival_time">
                <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Estimated Arrival *</label>
                <input className={inputBase} style={inputStyle('estimated_arrival_time')} placeholder="e.g. June 27, 2026 @ 07:15 AM (Bole Airport)"
                  value={fields.estimated_arrival_time} onChange={e => set('estimated_arrival_time', e.target.value)} onBlur={() => blur('estimated_arrival_time')} />
                <ErrorMsg name="estimated_arrival_time" />
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader step="3" label="Receiving Family" title="Receiver Contact" />
            <div className="space-y-4">
              <div id="receiver_full_name">
                <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Receiver Full Name *</label>
                <input className={inputBase} style={inputStyle('receiver_full_name')} placeholder="e.g. Almaz Assefa Wolde"
                  value={fields.receiver_full_name} onChange={e => set('receiver_full_name', e.target.value)} onBlur={() => blur('receiver_full_name')} />
                <ErrorMsg name="receiver_full_name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="receiver_phone">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Phone *</label>
                  <input className={inputBase} style={inputStyle('receiver_phone')} placeholder="e.g. +251-911-234567" type="tel"
                    value={fields.receiver_phone} onChange={e => set('receiver_phone', e.target.value)} onBlur={() => blur('receiver_phone')} />
                  <ErrorMsg name="receiver_phone" />
                </div>
                <div id="receiver_email">
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>Email *</label>
                  <input className={inputBase} style={inputStyle('receiver_email')} placeholder="e.g. almaz@gmail.com" type="email"
                    value={fields.receiver_email} onChange={e => set('receiver_email', e.target.value)} onBlur={() => blur('receiver_email')} />
                  <ErrorMsg name="receiver_email" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader step="4" label="Required Documents" title="Upload Documents" />
            <div className="space-y-4">
              {([
                { label: 'Death Certificate', name: 'death_certificate_file', example: 'death_certificate_name.pdf' },
                { label: 'Embalming Certificate', name: 'embatming_cert_file', example: 'embalming_cert_name.pdf' },
                { label: 'Embassy / Consular Permit', name: 'embassy_permit_file', example: 'consular_permit_name.pdf' },
              ] as const).map(({ label, name, example }) => (
                <div key={name} id={name}>
                  <label className="text-[11px] font-medium tracking-wide block mb-1.5" style={{ color: 'rgba(212,175,55,0.70)' }}>{label} *</label>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px dashed ${errors[name] && touched[name] ? 'rgba(239,68,68,0.55)' : files[name] ? 'rgba(212,175,55,0.50)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: files[name] ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)' }}>
                      <Upload size={15} style={{ color: files[name] ? '#D4AF37' : 'rgba(255,255,255,0.40)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {files[name] ? (
                        <p className="text-xs font-medium truncate" style={{ color: '#D4AF37' }}>{files[name]!.name}</p>
                      ) : (
                        <>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Tap to upload PDF</p>
                          <p className="text-[9px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>e.g. {example}</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      name={name}
                      accept="application/pdf"
                      className="hidden"
                      onChange={e => {
                        setTouched(prev => ({ ...prev, [name]: true }))
                        setFile(name, e.target.files?.[0])
                      }}
                    />
                  </label>
                  <ErrorMsg name={name} />
                </div>
              ))}
            </div>
          </div>

          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="flex items-center gap-2 p-4 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.85)' }}>
              <AlertCircle size={14} className="flex-shrink-0" />
              Please fix the errors above before submitting.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-sm font-bold tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            style={{ background: '#D4AF37', color: '#000' }}
          >
            {loading ? 'Submitting...' : 'Submit Body Shipping Request'}
          </button>
        </form>
      </div>
    </div>
  )
}