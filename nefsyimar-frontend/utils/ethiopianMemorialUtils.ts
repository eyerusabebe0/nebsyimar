interface TimelineEvent {
  id: string
  type: 'birth' | 'milestone' | 'service' | 'tribute' | 'memory' | 'ethiopian_memorial'
  date: string
  title: string
  description?: string
  location?: string
  author?: string
  isHighlight?: boolean
  isEthiopianMarker?: boolean
  ethiopianDay?: number
}

export function generateEthiopianMemorialEvents(dateOfPassing: string, deceasedName: string): TimelineEvent[] {
  const passingDate = new Date(dateOfPassing)
  
  const events: TimelineEvent[] = [
    {
      id: 'ethiopian-3rd-day',
      type: 'ethiopian_memorial',
      date: new Date(passingDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Salest (3rd Day Memorial)',
      description: `Traditional third day memorial service for ${deceasedName}. Family and close friends gather for prayers, scripture reading, and community support during this important observance.`,
      location: 'Family home or church',
      isHighlight: true,
      isEthiopianMarker: true,
      ethiopianDay: 3
    },
    {
      id: 'ethiopian-40th-day',
      type: 'ethiopian_memorial',
      date: new Date(passingDate.getTime() + 39 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Arba (40th Day Memorial)',
      description: `The fortieth day memorial service marking the end of the traditional mourning period for ${deceasedName}. Extended family and community gather for special prayers, liturgy, and memorial feast.`,
      location: 'Church or community center',
      isHighlight: true,
      isEthiopianMarker: true,
      ethiopianDay: 40
    },
    {
      id: 'ethiopian-1-year',
      type: 'ethiopian_memorial',
      date: new Date(passingDate.getFullYear() + 1, passingDate.getMonth(), passingDate.getDate()).toISOString().split('T')[0],
      title: 'Mut Amet (1-Year Memorial)',
      description: `One-year anniversary memorial service celebrating the completed cycle of mourning for ${deceasedName}. A grand memorial service with community-wide gathering, charitable giving, and renewal of family bonds.`,
      location: 'Church',
      isHighlight: true,
      isEthiopianMarker: true,
      ethiopianDay: 365
    }
  ]

  return events
}

export function getEthiopianMemorialStatus(dateOfPassing: string) {
  const passingDate = new Date(dateOfPassing)
  const today = new Date()
  const daysSincePassing = Math.floor((today.getTime() - passingDate.getTime()) / (1000 * 60 * 60 * 24))

  const markers = [
    { name: 'Salest', day: 3, completed: daysSincePassing >= 3 },
    { name: 'Arba', day: 40, completed: daysSincePassing >= 40 },
    { name: 'Mut Amet', day: 365, completed: daysSincePassing >= 365 }
  ]

  return {
    daysSincePassing,
    markers,
    nextMarker: markers.find(m => !m.completed),
    completedMarkers: markers.filter(m => m.completed).length
  }
}

export function formatEthiopianDate(date: Date): string {
  // Simple Ethiopian calendar approximation
  // In a real implementation, you would use proper Ethiopian calendar conversion
  const ethiopianMonths = [
    'መስከረም', 'ጥቅምት', 'ሕዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
  ]
  
  // Simplified conversion (Ethiopian calendar is about 7-8 years behind)
  const ethiopianYear = date.getFullYear() - 7
  const monthIndex = date.getMonth()
  
  return `${ethiopianMonths[monthIndex]} ${date.getDate()}, ${ethiopianYear}`
}

export function getMemorialPrayer(markerType: 'salest' | 'arba' | 'mut_amet', language: 'en' | 'am' = 'en'): string {
  const prayers = {
    salest: {
      en: 'Lord, grant eternal rest to the soul of our beloved. May they find peace in Your presence as we gather on this third day to honor their memory.',
      am: 'እግዚአብሔር ሆይ፣ ለወዳጃችን ነፍስ ዘላለማዊ እረፍት ስጥ። በዚህ ሦስተኛ ቀን ለማስታወስ ስንሰበሰብ በአንተ ፊት ሰላም ያገኙ።'
    },
    arba: {
      en: 'Almighty God, as we mark forty days since our beloved departed, we pray for their soul\'s journey to eternal peace and for strength for all who mourn.',
      am: 'ሁሉን የሚችል እግዚአብሔር፣ ወዳጃችን ከሄደበት ከአርባ ቀን በኋላ፣ ለነፍሳቸው ወደ ዘላለማዊ ሰላም ጉዞ እና ለሚሐዝኑ ሁሉ ጥንካሬ እንጸልያለን።'
    },
    mut_amet: {
      en: 'Eternal God, one year has passed since You called our beloved home. We celebrate their life, cherish their memory, and pray for continued blessings upon their soul.',
      am: 'ዘላለማዊ እግዚአብሔር፣ ወዳጃችንን ወደ ቤትህ ከጠራህበት አን��� አመት አልፏል። ህይወታቸውን እናከብራለን፣ ትውስታቸውን እንወዳለን፣ እና በነፍሳቸው ላይ ቀጣይ በረከቶችን እንጸልያለን።'
    }
  }

  return prayers[markerType][language]
}

export function getTraditionalObservances(markerType: 'salest' | 'arba' | 'mut_amet'): string[] {
  const observances = {
    salest: [
      'Family gathering for prayers',
      'Reading of psalms and religious texts',
      'Sharing of meals with visitors',
      'Lighting of candles',
      'Community support and condolences',
      'Distribution of blessed bread'
    ],
    arba: [
      'Major memorial service at church',
      'Extended family and community gathering',
      'Special prayers and liturgy',
      'Memorial feast (Gursha)',
      'Distribution of alms to the poor',
      'Reading of the deceased\'s favorite scriptures',
      'Blessing of memorial items'
    ],
    mut_amet: [
      'Grand memorial service',
      'Community-wide gathering',
      'Special memorial liturgy',
      'Charitable giving in their name',
      'Sharing of life stories and memories',
      'Blessing of memorial items',
      'Renewal of family bonds',
      'Memorial scholarship or donation'
    ]
  }

  return observances[markerType]
}
