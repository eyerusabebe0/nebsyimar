'use client'

import { useState } from 'react'

export default function TestSignupPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      console.log('🧪 Starting direct API test...')
      
      const testData = {
        email: `test${Date.now()}@test.com`,
        username: `test${Date.now()}@test.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      console.log('📝 Test data:', testData)
      console.log('🎯 API URL: http://127.0.0.1:5000/api/auth/register')
      
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(testData),
      })
      
      console.log('📊 Response status:', response.status)
      console.log('📊 Response ok:', response.ok)
      
      const responseText = await response.text()
      console.log('📊 Response text:', responseText)
      
      if (response.ok) {
        const data = JSON.parse(responseText)
        setResult(`✅ SUCCESS!\nUser created: ${data.data.email}\nID: ${data.data.id}`)
      } else {
        setResult(`❌ FAILED!\nStatus: ${response.status}\nResponse: ${responseText}`)
      }
      
    } catch (error) {
      console.error('❌ Error:', error)
      setResult(`❌ ERROR!\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testBackendHealth = async () => {
    setLoading(true)
    setResult('Testing backend health...')
    
    try {
      const response = await fetch('http://127.0.0.1:5000/health')
      const data = await response.json()
      setResult(`✅ Backend is healthy!\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ Backend not reachable!\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testBackendHealth}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            Test Backend Health
          </button>
          
          <button
            onClick={testSignup}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 ml-4"
          >
            Test Signup API
          </button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">{result || 'Click a button to test...'}</pre>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>Open browser console (F12) to see detailed logs</p>
          <p>Backend should be running on: http://127.0.0.1:5000</p>
          <p>Frontend running on: http://localhost:3001</p>
        </div>
      </div>
    </div>
  )
}
