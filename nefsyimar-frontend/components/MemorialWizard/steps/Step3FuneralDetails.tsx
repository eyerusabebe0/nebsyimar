'use client'

import React, { useState } from 'react'
import { MapPin, Calendar, Clock, Users, Globe, Lock, Info, ExternalLink, Search, Navigation } from 'lucide-react'
import { useWizard } from '../WizardProvider'

const serviceTypes = [
  {
    id: 'funeral',
    title: 'Funeral Service',
    description: 'Traditional funeral ceremony',
    icon: '⛪'
  },
  {
    id: 'memorial',
    title: 'Memorial Service',
    description: 'Celebration of life without the body present',
    icon: '🕊️'
  },
  {
    id: 'celebration',
    title: 'Celebration of Life',
    description: 'Uplifting gathering focusing on joyful memories',
    icon: '🌟'
  },
  {
    id: 'viewing',
    title: 'Viewing/Wake',
    description: 'Time for family and friends to pay respects',
    icon: '🌹'
  }
]

export default function Step3FuneralDetails() {
  const { memorialData, updateFuneralDetails } = useWizard()
  const { funeralDetails } = memorialData
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  const handleLocationSearch = async (query: string) => {
    updateFuneralDetails({
      location: { ...funeralDetails.location, address: query }
    })

    if (query.length > 2) {
      setIsSearchingLocation(true)
      // Simulate location search - in real app, integrate with Google Places API
      setTimeout(() => {
        const suggestions = [
          `${query} - Church`,
          `${query} - Funeral Home`,
          `${query} - Community Center`,
          `${query} - Cemetery`
        ]
        setLocationSuggestions(suggestions)
        setIsSearchingLocation(false)
      }, 500)
    } else {
      setLocationSuggestions([])
    }
  }

  const selectLocation = (location: string) => {
    updateFuneralDetails({
      location: { ...funeralDetails.location, address: location }
    })
    setLocationSuggestions([])
  }

  const generateGoogleMapsLink = () => {
    if (funeralDetails.location.address) {
      const encodedAddress = encodeURIComponent(funeralDetails.location.address)
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    }
    return ''
  }

  const openInMaps = () => {
    const mapsLink = generateGoogleMapsLink()
    if (mapsLink) {
      window.open(mapsLink, '_blank')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="memorial-card rounded-3xl p-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-accent-400" />
          </div>
          <h3 className="text-2xl font-semibold text-accent-100 mb-3">
            Service Information
          </h3>
          <p className="text-accent-300 max-w-2xl mx-auto leading-relaxed">
            Help family and friends know when and where to gather. You can add multiple events 
            and update details as plans are finalized.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Service Type Selection */}
        <div className="memorial-card rounded-3xl p-6">
          <h4 className="text-lg font-semibold text-accent-100 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-accent-400" />
            <span>Type of Service</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceTypes.map((type) => {
              const isSelected = funeralDetails.serviceType === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => updateFuneralDetails({ serviceType: type.id as any })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-accent-500 bg-accent-500/10'
                      : 'border-white/10 hover:border-accent-500/50 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className={`font-semibold ${isSelected ? 'text-accent-100' : 'text-accent-200'}`}>
                        {type.title}
                      </div>
                      <div className={`text-sm ${isSelected ? 'text-accent-300' : 'text-accent-400'}`}>
                        {type.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Service Details */}
        <div className="memorial-card rounded-3xl p-6">
          <h4 className="text-lg font-semibold text-accent-100 mb-6 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-accent-400" />
            <span>Service Details</span>
          </h4>

          <div className="space-y-6">
            {/* Service Name */}
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={funeralDetails.serviceName}
                onChange={(e) => updateFuneralDetails({ serviceName: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                placeholder="e.g., Funeral Service for John Doe"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Service Date</span>
                </label>
                <input
                  type="date"
                  value={funeralDetails.serviceDate}
                  onChange={(e) => updateFuneralDetails({ serviceDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Service Time</span>
                </label>
                <input
                  type="time"
                  value={funeralDetails.serviceTime}
                  onChange={(e) => updateFuneralDetails({ serviceTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="memorial-card rounded-3xl p-6">
          <h4 className="text-lg font-semibold text-accent-100 mb-6 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-accent-400" />
            <span>Location Information</span>
          </h4>

          <div className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2">
                Venue Name
              </label>
              <input
                type="text"
                value={funeralDetails.location.name}
                onChange={(e) => updateFuneralDetails({
                  location: { ...funeralDetails.location, name: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                placeholder="e.g., St. Mary's Church, Johnson Funeral Home"
              />
            </div>

            {/* Address with Search */}
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2 flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Address</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={funeralDetails.location.address}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                  placeholder="Start typing the address..."
                />
                
                {/* Location Suggestions */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-primary-800 border border-white/10 rounded-xl shadow-lg z-10">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(suggestion)}
                        className="w-full px-4 py-3 text-left text-accent-200 hover:bg-white/5 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-accent-400" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Link */}
              {funeralDetails.location.address && (
                <button
                  onClick={openInMaps}
                  className="mt-3 inline-flex items-center space-x-2 text-accent-400 hover:text-accent-300 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-accent-200 text-sm font-medium mb-2">
                Additional Information
              </label>
              <textarea
                value={funeralDetails.additionalInfo}
                onChange={(e) => updateFuneralDetails({ additionalInfo: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 placeholder-accent-400 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all resize-none"
                placeholder="Parking instructions, dress code, reception details, or any other important information for attendees..."
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="memorial-card rounded-3xl p-6">
          <h4 className="text-lg font-semibold text-accent-100 mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-accent-400" />
            <span>Privacy Settings</span>
          </h4>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <input
                type="radio"
                id="public"
                name="privacy"
                checked={funeralDetails.isPublic}
                onChange={() => updateFuneralDetails({ isPublic: true })}
                className="mt-1 w-4 h-4 text-accent-500 border-white/20 focus:ring-accent-500"
              />
              <div>
                <label htmlFor="public" className="text-accent-200 font-medium cursor-pointer">
                  Public Service
                </label>
                <p className="text-accent-400 text-sm mt-1">
                  Anyone can view the service details. Recommended for larger gatherings.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <input
                type="radio"
                id="private"
                name="privacy"
                checked={!funeralDetails.isPublic}
                onChange={() => updateFuneralDetails({ isPublic: false })}
                className="mt-1 w-4 h-4 text-accent-500 border-white/20 focus:ring-accent-500"
              />
              <div>
                <label htmlFor="private" className="text-accent-200 font-medium cursor-pointer">
                  Private Service
                </label>
                <p className="text-accent-400 text-sm mt-1">
                  Only people with the memorial link can view service details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="memorial-card rounded-3xl p-6 bg-gradient-to-r from-accent-500/10 to-primary-800/50 border border-accent-500/20">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-accent-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-accent-200 font-medium mb-2">Helpful Tips</h5>
              <ul className="text-accent-300 text-sm space-y-1">
                <li>• You can update service details anytime before the event</li>
                <li>• Consider adding parking information and accessibility details</li>
                <li>• If plans change, visitors will see the updated information automatically</li>
                <li>• Reception details can be added in the additional information section</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
