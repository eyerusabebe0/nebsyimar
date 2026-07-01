'use client'

import React, { useState } from 'react'
import { ArrowLeft, Calendar, Heart, Star, Bell } from 'lucide-react'
import Link from 'next/link'
import EthiopianMemorialMarkers from '@/components/EthiopianMemorialMarkers'
import MemorialTimeline from '@/components/MemorialTimeline'
import { generateEthiopianMemorialEvents, getEthiopianMemorialStatus } from '@/utils/ethiopianMemorialUtils'

export default function EthiopianMarkersDemoPage() {
  // Sample memorial data
  const sampleMemorial = {
    deceasedName: 'Ato Bekele Tadesse',
    deceasedNameAmharic: 'አቶ በቀለ ታደሰ',
    dateOfPassing: '2024-01-15', // Adjust this date to see different marker statuses
    dateOfBirth: '1955-03-20'
  }

  const [selectedDate, setSelectedDate] = useState(sampleMemorial.dateOfPassing)
  
  // Generate Ethiopian memorial events for timeline
  const ethiopianEvents = generateEthiopianMemorialEvents(selectedDate, sampleMemorial.deceasedName)
  
  // Sample additional timeline events
  const additionalEvents = [
    {
      id: 'birth',
      type: 'birth' as const,
      date: sampleMemorial.dateOfBirth,
      title: 'Born in Addis Ababa',
      description: 'Born to a loving family in the heart of Ethiopia',
      location: 'Addis Ababa, Ethiopia',
      isHighlight: true
    },
    {
      id: 'passing',
      type: 'milestone' as const,
      date: selectedDate,
      title: 'Passed Away Peacefully',
      description: 'Surrounded by family and loved ones, went to eternal rest',
      location: 'Home',
      isHighlight: true
    }
  ]

  const allTimelineEvents = [...additionalEvents, ...ethiopianEvents]
  const memorialStatus = getEthiopianMemorialStatus(selectedDate)

  const handleMarkerClick = (marker: any) => {
    console.log('Marker clicked:', marker)
    // Here you could open a detailed view, set reminders, etc.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/memorials"
            className="inline-flex items-center space-x-2 text-accent-300 hover:text-accent-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Memorials</span>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-500/20 rounded-full mb-6">
              <Star className="w-10 h-10 text-accent-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ethiopian Memorial Observances
            </h1>
            <p className="text-accent-200 text-lg max-w-3xl mx-auto leading-relaxed">
              Experience the traditional Ethiopian memorial markers that honor the 7th day, 40th day, 
              and 1-year anniversary observances rooted in Ethiopian Orthodox Tewahedo Church tradition.
            </p>
          </div>

          {/* Demo Controls */}
          <div className="memorial-card rounded-3xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-accent-100 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-accent-400" />
              <span>Demo Controls</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Date of Passing (Change to see different marker statuses)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-accent-100 focus:outline-none focus:border-accent-500 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-accent-200 text-sm font-medium mb-2">
                  Memorial Status
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-accent-100 font-medium">
                    {memorialStatus.daysSincePassing} days since passing
                  </div>
                  <div className="text-accent-400 text-sm">
                    {memorialStatus.completedMarkers} of 3 markers completed
                  </div>
                  {memorialStatus.nextMarker && (
                    <div className="text-accent-300 text-sm mt-1">
                      Next: {memorialStatus.nextMarker.name} (Day {memorialStatus.nextMarker.day})
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memorial Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="memorial-card rounded-3xl p-6 text-center">
              <div className="w-24 h-24 bg-accent-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-accent-100 mb-2">
                {sampleMemorial.deceasedName}
              </h3>
              <p className="text-accent-300 mb-2">
                {sampleMemorial.deceasedNameAmharic}
              </p>
              <div className="text-accent-400 text-sm">
                {new Date(sampleMemorial.dateOfBirth).getFullYear()} - {new Date(selectedDate).getFullYear()}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="memorial-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-accent-100 mb-4">
                About Ethiopian Memorial Traditions
              </h3>
              <div className="space-y-4 text-accent-300">
                <p>
                  Ethiopian Orthodox Tewahedo Church tradition includes specific memorial observances 
                  that provide structure and community support during the grieving process.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="font-medium text-accent-200 mb-1">Sebat Elet (7th Day)</div>
                    <div>Family gathering for prayers and community support</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="font-medium text-accent-200 mb-1">Arbaegnaw Elet (40th Day)</div>
                    <div>Major memorial service marking end of mourning period</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="font-medium text-accent-200 mb-1">Amet Tawaheedo (1 Year)</div>
                    <div>Anniversary celebration of life and renewal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ethiopian Memorial Markers Component */}
        <div className="mb-8">
          <EthiopianMemorialMarkers
            dateOfPassing={selectedDate}
            deceasedName={sampleMemorial.deceasedName}
            deceasedNameAmharic={sampleMemorial.deceasedNameAmharic}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Memorial Timeline with Ethiopian Events */}
        <div className="mb-8">
          <MemorialTimeline 
            events={allTimelineEvents}
          />
        </div>

        {/* Integration Information */}
        <div className="memorial-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold text-accent-100 mb-4 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-accent-400" />
            <span>How This Enhances Your Memorial Platform</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-accent-200 font-medium mb-3">Automatic Integration</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Memorial markers automatically calculated from date of passing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Timeline events generated and integrated seamlessly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Bilingual support (English and Amharic)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Cultural context and traditional prayers included</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent-200 font-medium mb-3">Enhanced Features</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Reminder notifications for upcoming observances</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Family invitation system for memorial services</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Traditional observance guidance and prayers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Integration with existing memorial timeline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
