'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Country, countryCodes, defaultCountry } from '@/data/countryCodes'

interface CountryCodeSelectorProps {
  selectedCountry: Country
  onCountryChange: (country: Country) => void
  className?: string
}

export default function CountryCodeSelector({
  selectedCountry,
  onCountryChange,
  className = ''
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Country Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white hover:bg-primary-700/70 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="font-medium">{selectedCountry.dialCode}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-accent-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-primary-800 border border-primary-600 rounded-lg shadow-2xl z-50 max-h-64 overflow-hidden">
          {/* Search */}
          <div className="sticky top-0 p-3 bg-primary-800 border-b border-primary-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-10 pr-4 py-2 bg-primary-700/50 border border-primary-600 rounded-md text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-primary-700/70 transition-colors ${
                    selectedCountry.code === country.code ? 'bg-accent-500/20' : ''
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate mr-2">
                        {country.name}
                      </span>
                      <span className="text-accent-300 text-sm font-medium">
                        {country.dialCode}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-accent-400 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
