'use client'

import { useState } from 'react'
import { Play, ThumbsUp, Share2, MessageCircle } from 'lucide-react'
import SplitScreenSimulation from '@/components/simulations/SplitScreenSimulation'
import { supabase } from '@/lib/supabase'

export default function SocialMediaSimulation() {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [attackSuccess, setAttackSuccess] = useState(false)
  const [showFacebookNotification, setShowFacebookNotification] = useState(false)
  const [showFacebookLogin, setShowFacebookLogin] = useState(false)
  const [loginStep, setLoginStep] = useState<'login' | 'permissions' | 'loading'>('login')
  const [fakeEmail, setFakeEmail] = useState('')
  const [fakePassword, setFakePassword] = useState('')

  const resetSimulation = () => {
    setClickPosition(null)
    setAttackSuccess(false)
    setShowFacebookNotification(false)
    setShowFacebookLogin(false)
    setLoginStep('login')
    setFakeEmail('')
    setFakePassword('')
  }


  const handleVideoClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setClickPosition({ x, y })
    
    // Show fake Facebook login instead of immediate attack
    setShowFacebookLogin(true)

    // Create session if it doesn't exist and track the click
    try {
      let sessionId = localStorage.getItem('session_id')
      
      if (!sessionId) {
        // Create a new session
        const { data: sessionData, error: sessionError } = await supabase
          .from('simulation_sessions')
          .insert({ user_fingerprint: 'demo-user-' + Date.now() })
          .select()
          .single()
        
        if (sessionData && !sessionError) {
          sessionId = sessionData.session_id
          localStorage.setItem('session_id', sessionId || '')
        }
      }

      if (sessionId) {
        // Track the click event
        await supabase.from('click_events').insert({
          session_id: sessionId,
          scenario_type: 'social',
          click_coordinates: `${x},${y}`,
          target_element: 'malicious',
          was_successful_attack: true,
        })
      }
    } catch (error) {
      console.log('Analytics tracking error (non-critical):', error)
    }
  }

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginStep('permissions')
  }

  const handleGrantPermissions = () => {
    setLoginStep('loading')
    
    // Simulate loading
    setTimeout(() => {
      setShowFacebookLogin(false)
      setAttackSuccess(true)
      
      // Show the spam notification after a delay
      setTimeout(() => {
        setShowFacebookNotification(true)
      }, 1000)
    }, 2000)
  }

  const VictimView = (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">🍕 Cat Uses Zomato App to Order Pizza by Itself! (GONE WRONG)</h2>
      <div 
        className="relative bg-black rounded-lg overflow-hidden cursor-pointer group"
        onClick={handleVideoClick}
      >
        <img 
          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop" 
          alt="Cat video thumbnail"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="relative">
            {/* Main play button with floating animation - YouTube style */}
            <div className="relative bg-white rounded-full p-2 shadow-2xl animate-float mt-16">
              <Play size={20} className="text-red-600 ml-0.5" fill="#dc2626" />
            </div>
          </div>
          
          {/* Compelling message */}
          <div className="mt-4 text-center animate-pulse">
            <p className="text-white text-sm font-semibold drop-shadow-lg">
              ▶ PLAY NOW
            </p>
            <p className="text-yellow-400 text-xs font-medium drop-shadow-md mt-1">
              🔥 2.3M Views • Trending #1
            </p>
            <p className="text-white text-xs mt-1 bg-black/50 px-3 py-0.5 rounded-full inline-block">
              Click to watch! 😂
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ThumbsUp size={20} />
            2.3M
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={20} />
            45K
          </span>
        </div>
        <span>Uploaded 2 days ago</span>
      </div>

      {/* Facebook Notification Toast */}
      {showFacebookNotification && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="bg-white rounded-full p-1">
              <Share2 className="text-blue-600" size={16} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Posted to Facebook</div>
              <div className="text-xs text-blue-100 mt-1">
                "Get Rich Quick! 💰 Click here for INSTANT money! 
                Work from home and earn $5000/week! 
                Limited time offer! 🚨"
              </div>
              <div className="text-xs text-blue-200 mt-2">
                ✅ Shared to your timeline • Just now
              </div>
            </div>
            <button 
              onClick={() => setShowFacebookNotification(false)}
              className="text-blue-200 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Fake Facebook Login Modal */}
      {showFacebookLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Close button - outside the card */}
          <button
            onClick={() => {
              setShowFacebookLogin(false)
              setLoginStep('login')
              setFakeEmail('')
              setFakePassword('')
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <span className="text-white text-3xl leading-none">&times;</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Facebook Header */}
            <div className="bg-[#1877f2] text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-center">facebook</h2>
            </div>

            {loginStep === 'login' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Log in to continue watching
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Connect with Facebook to watch "Cat Uses Zomato App"
                </p>
                
                <form onSubmit={handleFakeLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email or phone number"
                    value={fakeEmail}
                    onChange={(e) => setFakeEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1877f2]"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={fakePassword}
                    onChange={(e) => setFakePassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1877f2]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#1877f2] text-white py-3 rounded-lg font-semibold hover:bg-[#166fe5] transition-colors"
                  >
                    Log In
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <a href="#" className="text-[#1877f2] text-sm hover:underline">
                    Forgot password?
                  </a>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    This is a DEMO - Do not enter real credentials
                  </p>
                </div>
              </div>
            )}

            {loginStep === 'permissions' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  CatVideoApp would like to:
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#1877f2] rounded-full mt-0.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Access your public profile</p>
                      <p className="text-sm text-gray-600">This includes your name, profile picture, and other public info</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#1877f2] rounded-full mt-0.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Access your friends list</p>
                      <p className="text-sm text-gray-600">See who your friends are</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#1877f2] rounded-full mt-0.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Post to Facebook on your behalf</p>
                      <p className="text-sm text-gray-600">Share content to your timeline without asking</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleGrantPermissions}
                    className="w-full bg-[#1877f2] text-white py-3 rounded-lg font-semibold hover:bg-[#166fe5] transition-colors"
                  >
                    Continue as {fakeEmail || 'User'}
                  </button>
                  <button
                    onClick={() => {
                      setShowFacebookLogin(false)
                      setLoginStep('login')
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  This is a DEMO showing how permissions are exploited
                </p>
              </div>
            )}

            {loginStep === 'loading' && (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1877f2] border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Connecting to Facebook...</p>
                <p className="text-sm text-gray-500 mt-2">Granting permissions...</p>
              </div>
            )}
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )

  const AttackerView = (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-red-600">Multi-Stage Clickjacking Attack</h2>
      
      {/* Attack Progress */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border-2 border-red-600">
        <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3">Attack Progress:</h3>
        
        <div className="space-y-3">
          {/* Step 1 */}
          <div className={`flex items-start gap-3 ${clickPosition ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ${clickPosition ? 'bg-green-500' : 'bg-gray-400'}`}>
              {clickPosition && <span className="block w-full h-full text-white text-xs flex items-center justify-center">✓</span>}
            </div>
            <div>
              <p className="font-medium">Step 1: User clicks fake play button</p>
              {clickPosition && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click captured at ({Math.round(clickPosition.x)}, {Math.round(clickPosition.y)})
                </p>
              )}
            </div>
          </div>
          
          {/* Step 2 */}
          <div className={`flex items-start gap-3 ${showFacebookLogin || attackSuccess ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ${showFacebookLogin || attackSuccess ? 'bg-green-500' : 'bg-gray-400'}`}>
              {(showFacebookLogin || attackSuccess) && <span className="block w-full h-full text-white text-xs flex items-center justify-center">✓</span>}
            </div>
            <div>
              <p className="font-medium">Step 2: Fake OAuth login displayed</p>
              {showFacebookLogin && loginStep === 'login' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">User entering credentials...</p>
              )}
              {(loginStep === 'permissions' || loginStep === 'loading' || attackSuccess) && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Credentials captured: {fakeEmail || 'pending...'}</p>
              )}
            </div>
          </div>
          
          {/* Step 3 */}
          <div className={`flex items-start gap-3 ${(loginStep === 'permissions' || loginStep === 'loading' || attackSuccess) ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ${(loginStep === 'permissions' || loginStep === 'loading' || attackSuccess) ? 'bg-green-500' : 'bg-gray-400'}`}>
              {(loginStep === 'permissions' || loginStep === 'loading' || attackSuccess) && <span className="block w-full h-full text-white text-xs flex items-center justify-center">✓</span>}
            </div>
            <div>
              <p className="font-medium">Step 3: Permission harvesting</p>
              {(loginStep === 'permissions' || loginStep === 'loading' || attackSuccess) && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Requesting: Profile, Friends, Post permissions</p>
              )}
            </div>
          </div>
          
          {/* Step 4 */}
          <div className={`flex items-start gap-3 ${attackSuccess ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ${attackSuccess ? 'bg-red-500' : 'bg-gray-400'}`}>
              {attackSuccess && <span className="block w-full h-full text-white text-xs flex items-center justify-center">⚠</span>}
            </div>
            <div>
              <p className="font-medium">Step 4: Attack completed</p>
              {attackSuccess && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Spam posted, credentials stolen, permissions granted</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* What's Really Happening */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Hidden Elements:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span>Invisible Facebook Share iframe (z-index: 9999)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Fake OAuth phishing page</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span>Malicious permission requests</span>
          </div>
        </div>
      </div>
      
      {/* Captured Data */}
      {fakeEmail && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Captured Data:</h3>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <p>• Email: {fakeEmail}</p>
            <p>• Password: {'*'.repeat(fakePassword.length)}</p>
            <p>• Permissions: Profile, Friends List, Post Access</p>
            <p>• Spam Message: "Get Rich Quick! 💰"</p>
          </div>
        </div>
      )}
    </div>
  )

  const WarningSignsComponent = (
    <ul className="space-y-2 text-sm">
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Cursor doesn't change to pointer on hover over interactive elements</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Page asking for social media permissions unexpectedly</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>URL doesn't match the expected video platform</span>
      </li>
      <li className="flex items-start">
        <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
        <span>Browser warnings about cross-origin content</span>
      </li>
    </ul>
  )

  return (
    <SplitScreenSimulation
      title="Social Media Clickjacking Simulation"
      victimView={VictimView}
      attackerView={AttackerView}
      onAttackSuccess={() => setAttackSuccess(true)}
      onAttackDefended={() => setAttackSuccess(false)}
      explanation={
        attackSuccess
          ? "You clicked on what appeared to be a play button, but actually triggered a hidden Facebook share button. This would have posted spam content to your timeline without your knowledge. The attacker used an invisible iframe positioned exactly over the play button."
          : "You successfully identified and avoided the clickjacking attack. The play button was actually a hidden social media share button."
      }
      warningSignsComponent={WarningSignsComponent}
      onReset={resetSimulation}
    />
  )
}