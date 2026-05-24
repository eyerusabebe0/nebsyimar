'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Heart } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-accent-300 mb-6">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-accent-400 mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative w-full max-w-md">
        <Link 
          href="/signin"
          className="inline-flex items-center text-accent-300 hover:text-accent-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        <div className="bg-primary-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-accent-300">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-accent-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-accent-500/50 disabled:to-accent-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-accent-300">
              Remember your password?{' '}
              <Link 
                href="/signin" 
                className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
