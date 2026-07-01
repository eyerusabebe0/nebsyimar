'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'

export default function TestCredentials() {
  const [showCredentials, setShowCredentials] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const testCredentials = {
    email: 'test@example.com',
    password: 'password123'
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!showCredentials) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowCredentials(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Test Credentials</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-primary-800 border border-primary-700 rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Test Account</h3>
        <button
          onClick={() => setShowCredentials(false)}
          className="text-accent-400 hover:text-white transition-colors"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-accent-300 text-sm">Email:</label>
          <div className="flex items-center space-x-2 mt-1">
            <code className="bg-primary-700 text-accent-200 px-2 py-1 rounded text-sm flex-1">
              {testCredentials.email}
            </code>
            <button
              onClick={() => copyToClipboard(testCredentials.email, 'email')}
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              {copied === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-accent-300 text-sm">Password:</label>
          <div className="flex items-center space-x-2 mt-1">
            <code className="bg-primary-700 text-accent-200 px-2 py-1 rounded text-sm flex-1">
              {testCredentials.password}
            </code>
            <button
              onClick={() => copyToClipboard(testCredentials.password, 'password')}
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              {copied === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-accent-400 text-xs mt-3">
        Use these credentials to test the authentication system, or create your own account.
      </p>
    </div>
  )
}
