'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import CountryCodeSelector from './CountryCodeSelector'
import { Country, defaultCountry } from '@/data/countryCodes'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  label = "Phone Number",
  required = false,
  className = ''
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value
    // Combine country code with phone number
    const fullPhoneNumber = selectedCountry.dialCode + phoneNumber
    onChange(fullPhoneNumber)
  }

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country)
    // Update the phone number with new country code
    const phoneWithoutCode = value.replace(selectedCountry.dialCode, '')
    const newFullNumber = country.dialCode + phoneWithoutCode
    onChange(newFullNumber)
  }

  // Extract just the phone number part (without country code)
  const phoneNumberOnly = value.startsWith(selectedCountry.dialCode) 
    ? value.slice(selectedCountry.dialCode.length)
    : value

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-accent-300 mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="flex space-x-2">
        {/* Country Code Selector */}
        <CountryCodeSelector
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          className="w-32"
        />
        
        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
          <input
            type="tel"
            value={phoneNumberOnly}
            onChange={handlePhoneChange}
            required={required}
            className="w-full pl-10 pr-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            placeholder={placeholder}
          />
        </div>
      </div>
      
      {/* Preview of full number */}
      {value && (
        <div className="mt-2 text-xs text-accent-400">
          Full number: <span className="text-accent-300 font-medium">{value}</span>
        </div>
      )}
    </div>
  )
}
