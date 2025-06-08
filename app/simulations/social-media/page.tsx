'use client'

import { useState, useEffect } from 'react'
import { Play, ThumbsUp, Share2, MessageCircle } from 'lucide-react'
import SplitScreenSimulation from '@/components/simulations/SplitScreenSimulation'
import { supabase } from '@/lib/supabase'

export default function SocialMediaSimulation() {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [attackSuccess, setAttackSuccess] = useState(false)
  const [showFacebookNotification, setShowFacebookNotification] = useState(false)
  const [iframeOpacity, setIframeOpacity] = useState(0)

  const resetSimulation = () => {
    setClickPosition(null)
    setAttackSuccess(false)
    setShowFacebookNotification(false)
    setIframeOpacity(0)
  }

  // Listen for messages from fake Facebook tab
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'facebook_success') {
        setAttackSuccess(true)
        
        // Show the spam notification after a delay
        setTimeout(() => {
          setShowFacebookNotification(true)
        }, 1000)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])


  const handleVideoClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setClickPosition({ x, y })
    
    // Open fake Facebook login in a new tab
    window.open('/fake-facebook', '_blank')

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
        
        {/* Hidden Facebook iframe overlay - controlled by opacity slider */}
        <div 
          className="absolute inset-0 bg-blue-600 flex items-center justify-center transition-opacity"
          style={{ opacity: iframeOpacity }}
        >
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
            Share on Facebook
          </button>
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
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
          Attacker's Control Panel
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Control the invisible Facebook iframe overlay. As you increase opacity, the cat video fades and the share button appears!
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Iframe Opacity: {Math.round(iframeOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={iframeOpacity * 100}
              onChange={(e) => setIframeOpacity(Number(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          
          <div className="relative bg-white dark:bg-gray-800 p-4 rounded border-2 border-dashed border-red-500">
            <div 
              className="absolute inset-0 bg-blue-600 flex items-center justify-center rounded transition-opacity z-10"
              style={{ opacity: iframeOpacity }}
            >
              <button className="bg-white text-blue-600 px-4 py-2 rounded font-semibold">
                Share on Facebook
              </button>
            </div>
            <div className="text-center py-8 text-gray-400" style={{ opacity: 1 - iframeOpacity * 0.8 }}>
              <Play size={40} className="mx-auto mb-2" />
              <p>Victim's Play Button</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
            <p className="text-yellow-800 dark:text-yellow-400 font-medium">
              {iframeOpacity === 0 
                ? "⚠️ Iframe is invisible but still clickable!" 
                : iframeOpacity < 0.5 
                ? "👁️ Barely visible - victims won't notice!" 
                : "🎯 More visible - easier to spot the attack"}
            </p>
          </div>
        </div>
      </div>
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