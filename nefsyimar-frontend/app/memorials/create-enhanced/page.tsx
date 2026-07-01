'use client'

import React from 'react'
import { ArrowLeft, Heart, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import EnhancedMemorialWizard from '@/components/MemorialWizard/EnhancedMemorialWizard'
import GriefSupport, { useGriefSupport } from '@/components/GriefSupport'

export default function CreateEnhancedMemorialPage() {
  const { isOpen, context, openSupport, closeSupport } = useGriefSupport()

  return (
    <>
      {/* Enhanced Memorial Creation Wizard */}
      <div className="relative">
        {/* Support Button - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => openSupport('memorial_creation')}
            className="w-14 h-14 bg-accent-600 hover:bg-accent-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            title="Grief Support & Resources"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Back Navigation */}
        <div className="absolute top-8 left-8 z-30">
          <Link
            href="/memorials/create"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-800/80 backdrop-blur-sm border border-primary-700/60 rounded-xl text-accent-300 hover:text-accent-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Simple Form</span>
          </Link>
        </div>

        {/* Enhanced Wizard */}
        <EnhancedMemorialWizard />
      </div>

      {/* Grief Support Modal */}
      <GriefSupport
        isOpen={isOpen}
        onClose={closeSupport}
        context={context}
      />
    </>
  )
}
