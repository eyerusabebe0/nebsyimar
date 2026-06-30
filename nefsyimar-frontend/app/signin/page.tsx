'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Heart, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import TestCredentials from '@/components/TestCredentials'
import { authApi } from '@/lib/api'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 flex items-center justify-center p-4 text-white">Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  )
}

function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const isRepatriationFlow = searchParams?.get('redirect') === '/repatriation'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        try {
          const statusResponse = await authApi.getAuthStatus()
          const role = statusResponse.data?.data?.user?.role

          const redirectTo = searchParams?.get('redirect')
          const safeRedirect = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'

          if (role === 'Administrator') {
            router.push('/admin')
          } else if (role === 'Vendor') {
            router.push('/vendor')
          } else {
            router.push(safeRedirect)
          }
        } catch {
          router.push(searchParams?.get('redirect') && searchParams.get('redirect')?.startsWith('/') ? searchParams.get('redirect')! : '/dashboard')
        }
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-accent-300 hover:text-accent-200 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-primary-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-accent-700/30 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-accent-300">Sign in to honor and remember</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isRepatriationFlow && (
            <div className="mb-6 rounded-xl border border-accent-500/25 bg-accent-500/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">Repatriation & Funeral Services</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Dignified Repatriation & Funeral Services</h2>
              <p className="mt-2 text-sm leading-relaxed text-accent-100/80">
                Body shipping means bringing a beloved one back to Ethiopia from another country with dignity, care, and legal support.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-accent-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" placeholder="Enter your email" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-accent-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-400" />
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} required className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-300 transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>

            <div className="text-right"><Link href="/forgot-password" className="text-sm text-accent-400 hover:text-accent-300 transition-colors">Forgot your password?</Link></div>

            <button type="submit" disabled={isLoading} className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed">{isLoading ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Signing In...</div>) : ('Sign In')}</button>
          </form>

          <div className="mt-8 text-center"><p className="text-accent-300">Don't have an account? <Link href="/signup" className="text-accent-400 hover:text-accent-300 font-semibold">Sign Up</Link></p></div>
        </div>
      </div>

      <TestCredentials />
    </div>
  )
}
