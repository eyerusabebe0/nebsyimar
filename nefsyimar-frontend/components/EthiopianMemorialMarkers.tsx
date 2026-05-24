'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Heart, Users, Book, Flame, Star, ChevronDown, ChevronUp, Bell } from 'lucide-react'

interface MemorialMarker {
  id: string
  name: string
  nameAmharic: string
  day: number
  date: Date
  isPast: boolean
  isToday: boolean
  isUpcoming: boolean
  description: string
  descriptionAmharic: string
  traditions: string[]
  prayers?: string
  prayersAmharic?: string
  significance: string
  significanceAmharic: string
}

interface EthiopianMemorialMarkersProps {
  dateOfPassing: string
  deceasedName: string
  deceasedNameAmharic?: string
  className?: string
  onMarkerClick?: (marker: MemorialMarker) => void
}

export default function EthiopianMemorialMarkers({ 
  dateOfPassing, 
  deceasedName, 
  deceasedNameAmharic,
  className = '',
  onMarkerClick 
}: EthiopianMemorialMarkersProps) {
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null)
  const [showAmharic, setShowAmharic] = useState(false)

  const calculateMarkers = (): MemorialMarker[] => {
    const passingDate = new Date(dateOfPassing)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const markers: MemorialMarker[] = [
      {
        id: 'salest',
        name: 'Salest',
        nameAmharic: 'ሳለስት',
        day: 3,
        date: new Date(passingDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 3rd day
        isPast: false,
        isToday: false,
        isUpcoming: false,
        description: 'The third day memorial service, a time for family and close friends to gather in prayer and remembrance.',
        descriptionAmharic: 'የሦስተኛው ቀን የመታሰቢያ አገልግሎት፣ ቤተሰብ እና የቅርብ ጓደኞች በጸሎት እና በመታሰቢያ የሚሰበሰቡበት ጊዜ።',
        traditions: [
          'Family gathering for prayers',
          'Reading of psalms and religious texts',
          'Sharing of meals with visitors',
          'Lighting of candles',
          'Community support and condolences'
        ],
        prayers: 'Lord, grant eternal rest to the soul of our beloved. May they find peace in Your presence.',
        prayersAmharic: 'እግዚአብሔር ሆይ፣ ለወዳጃችን ነፍስ ዘላለማዊ እረፍት ስጥ። በአንተ ፊት ሰላም ያገኙ።',
        significance: 'The third day marks the early period of mourning, representing the time for immediate family to come together in prayer and support.',
        significanceAmharic: 'ሦስተኛው ቀን የመጀመሪያ የሐዘን ጊዜን ያመለክታል፣ ቅርብ ቤተሰብ በጸሎት እና በመደጋገፍ የሚሰበሰቡበት ጊዜ ይወክላል።'
      },
      {
        id: 'arba',
        name: 'Arba',
        nameAmharic: 'አርባ',
        day: 40,
        date: new Date(passingDate.getTime() + 39 * 24 * 60 * 60 * 1000), // 40th day
        isPast: false,
        isToday: false,
        isUpcoming: false,
        description: 'The fortieth day memorial, marking the end of the traditional mourning period with prayers and community gathering.',
        descriptionAmharic: 'አርባኛው ቀን መታሰቢያ፣ ባህላዊ የሐዘን ጊዜ መጨረሻን በጸሎት እና በማህበረሰብ ስብሰባ ያመለክታል።',
        traditions: [
          'Major memorial service at church',
          'Extended family and community gathering',
          'Special prayers and liturgy',
          'Memorial feast (Gursha)',
          'Distribution of alms to the poor',
          'Reading of the deceased\'s favorite scriptures'
        ],
        prayers: 'Almighty God, as we mark forty days since our beloved departed, we pray for their soul\'s journey to eternal peace.',
        prayersAmharic: 'ሁሉን የሚችል እግዚአብሔር፣ ወዳጃችን ከሄደበት ከአርባ ቀን በኋላ፣ ለነፍሳቸው ወደ ዘላለማዊ ሰላም ጉዞ እንጸልያለን።',
        significance: 'Forty days represents spiritual purification and transition, echoing biblical traditions of fasting and prayer periods.',
        significanceAmharic: 'አርባ ቀናት መንፈሳዊ ማጽዳትን እና ሽግግርን ይወክላል፣ የመጽሐፍ ቅዱስ የጾም እና የጸሎት ጊዜዎች ወግ ይከተላል።'
      },
      {
        id: 'mut-amet',
        name: 'Mut Amet',
        nameAmharic: 'ሙት አመት',
        day: 365,
        date: new Date(passingDate.getFullYear() + 1, passingDate.getMonth(), passingDate.getDate()),
        isPast: false,
        isToday: false,
        isUpcoming: false,
        description: 'The one-year anniversary memorial service, celebrating the completed cycle of mourning and the eternal memory of the departed.',
        descriptionAmharic: 'የአንድ አመት የመታሰቢያ አገልግሎት፣ የተጠናቀቀውን የሐዘን ዑደት እና የሟቹን ዘላለማዊ ትውስታ ያከብራል።',
        traditions: [
          'Grand memorial service',
          'Community-wide gathering',
          'Special memorial liturgy',
          'Charitable giving in their name',
          'Sharing of life stories and memories',
          'Blessing of memorial items',
          'Renewal of family bonds'
        ],
        prayers: 'Eternal God, one year has passed since You called our beloved home. We celebrate their life and pray for continued blessings.',
        prayersAmharic: 'ዘላለማዊ እግዚአብሔር፣ ወዳጃችንን ወደ ቤትህ ከጠራህበት አንድ አመት አልፏል። ህይወታቸውን እናከብራለን እና ቀጣይ በረከቶችን እንጸልያለን።',
        significance: 'The first anniversary marks the completion of the full mourning cycle, representing renewal, hope, and the continuation of love beyond death.',
        significanceAmharic: 'የመጀመሪያው አመታዊ ዝግጅት ሙሉ የሐዘን ዑደት መጠናቀቅን ያመለክታል፣ ማደስ፣ ተስፋ እና ከሞት በላይ የሆነ ፍቅር ቀጣይነትን ይወክላል።'
      }
    ]

    // Calculate status for each marker
    markers.forEach(marker => {
      const markerDate = new Date(marker.date)
      markerDate.setHours(0, 0, 0, 0)
      
      marker.isPast = markerDate < today
      marker.isToday = markerDate.getTime() === today.getTime()
      marker.isUpcoming = markerDate > today
    })

    return markers
  }

  const [markers, setMarkers] = useState<MemorialMarker[]>([])

  useEffect(() => {
    setMarkers(calculateMarkers())
  }, [dateOfPassing])

  const toggleMarkerExpansion = (markerId: string) => {
    setExpandedMarker(expandedMarker === markerId ? null : markerId)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateAmharic = (date: Date) => {
    // Simple Amharic date formatting (can be enhanced with proper Ethiopian calendar)
    const months = [
      'ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
      'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር'
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const getMarkerStatusColor = (marker: MemorialMarker) => {
    if (marker.isToday) return 'border-yellow-400 bg-yellow-400/20'
    if (marker.isPast) return 'border-accent-500 bg-accent-500/20'
    return 'border-blue-400 bg-blue-400/20'
  }

  const getMarkerStatusText = (marker: MemorialMarker) => {
    if (marker.isToday) return 'Today'
    if (marker.isPast) return 'Completed'
    return 'Upcoming'
  }

  return (
    <div className={`memorial-card rounded-3xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-accent-100 flex items-center space-x-2">
            <Star className="w-6 h-6 text-accent-400" />
            <span>Ethiopian Memorial Observances</span>
          </h3>
          <p className="text-accent-400 text-sm mt-1">
            Traditional mourning periods and memorial services
          </p>
        </div>
        <button
          onClick={() => setShowAmharic(!showAmharic)}
          className="px-3 py-1 bg-accent-500/20 hover:bg-accent-500/30 text-accent-200 rounded-lg text-sm transition-colors"
        >
          {showAmharic ? 'English' : 'አማርኛ'}
        </button>
      </div>

      {/* Memorial Markers */}
      <div className="space-y-4">
        {markers.map((marker) => {
          const isExpanded = expandedMarker === marker.id
          const statusColor = getMarkerStatusColor(marker)
          
          return (
            <div
              key={marker.id}
              className={`border-2 rounded-xl transition-all ${statusColor}`}
            >
              {/* Marker Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  toggleMarkerExpansion(marker.id)
                  onMarkerClick?.(marker)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-accent-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-accent-100">
                        {showAmharic ? marker.nameAmharic : marker.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-accent-300">
                          {showAmharic ? formatDateAmharic(marker.date) : formatDate(marker.date)}
                        </span>
                        <span className="text-accent-500">•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          marker.isToday ? 'bg-yellow-400/20 text-yellow-200' :
                          marker.isPast ? 'bg-accent-500/20 text-accent-200' :
                          'bg-blue-400/20 text-blue-200'
                        }`}>
                          {getMarkerStatusText(marker)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-accent-400 text-sm">
                      Day {marker.day}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-accent-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-accent-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/10">
                  
                  {/* Description */}
                  <div className="pt-4">
                    <p className="text-accent-200 leading-relaxed">
                      {showAmharic ? marker.descriptionAmharic : marker.description}
                    </p>
                  </div>

                  {/* Significance */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h5 className="text-accent-200 font-medium mb-2 flex items-center space-x-2">
                      <Book className="w-4 h-4" />
                      <span>{showAmharic ? 'ትርጉም' : 'Significance'}</span>
                    </h5>
                    <p className="text-accent-300 text-sm leading-relaxed">
                      {showAmharic ? marker.significanceAmharic : marker.significance}
                    </p>
                  </div>

                  {/* Traditions */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h5 className="text-accent-200 font-medium mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{showAmharic ? 'ባህላዊ ወጎች' : 'Traditional Observances'}</span>
                    </h5>
                    <ul className="space-y-2">
                      {marker.traditions.map((tradition, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-accent-300 text-sm">{tradition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prayers */}
                  {marker.prayers && (
                    <div className="bg-gradient-to-r from-accent-500/10 to-primary-800/50 border border-accent-500/20 rounded-xl p-4">
                      <h5 className="text-accent-200 font-medium mb-2 flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{showAmharic ? 'ጸሎት' : 'Prayer'}</span>
                      </h5>
                      <p className="text-accent-200 text-sm italic leading-relaxed">
                        "{showAmharic ? marker.prayersAmharic : marker.prayers}"
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-200 rounded-lg text-sm transition-colors">
                      <Bell className="w-4 h-4" />
                      <span>{showAmharic ? 'ማስታወሻ ያዘጋጁ' : 'Set Reminder'}</span>
                    </button>
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg text-sm transition-colors">
                      <Users className="w-4 h-4" />
                      <span>{showAmharic ? 'ቤተሰብን ጋብዙ' : 'Invite Family'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cultural Note */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="bg-accent-500/5 border border-accent-500/20 rounded-xl p-4">
          <h5 className="text-accent-200 font-medium mb-2">
            {showAmharic ? 'ባህላዊ ማስታወሻ' : 'Cultural Note'}
          </h5>
          <p className="text-accent-300 text-sm leading-relaxed">
            {showAmharic 
              ? 'እነዚህ የመታሰቢያ ቀናት በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ወግ ላይ የተመሰረቱ ናቸው። እያንዳንዱ ቀን ልዩ መንፈሳዊ ትርጉም አለው እና ማህበረሰቡ በሐዘን እና በመታሰቢያ ጊዜ ቤተሰቦችን ለመደገፍ ይሰበሰባል።'
              : 'These memorial observances are rooted in Ethiopian Orthodox Tewahedo Church tradition. Each day holds special spiritual significance and brings the community together to support families during times of grief and remembrance.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
