'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Shield, AlertTriangle } from 'lucide-react'

export default function AttackStats() {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successfulAttacks: 0,
    defendedAttacks: 0,
    successRate: 0,
    mostVulnerable: 'social-media',
    peakTime: '14:00-16:00',
  })

  useEffect(() => {
    // Initial fetch
    fetchStats()
    
    // Smart polling - only when tab is active
    let interval: NodeJS.Timeout
    
    const startPolling = () => {
      // Poll every 10 seconds instead of 5 seconds
      interval = setInterval(fetchStats, 10000)
    }
    
    const stopPolling = () => {
      if (interval) clearInterval(interval)
    }
    
    // Start polling if document is visible
    if (!document.hidden) {
      startPolling()
    }
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchStats() // Fetch immediately when tab becomes active
        startPolling()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-sm">ATTACK STATISTICS</span>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/50 rounded border border-hacker-green/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-hacker-green/50">Total</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.totalAttempts}</div>
            <div className="text-xs text-hacker-green/50">Attempts</div>
          </div>
          
          <div className="bg-black/50 rounded border border-hacker-green/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-xs text-hacker-green/50">Success</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.successfulAttacks}</div>
            <div className="text-xs text-hacker-green/50">Attacks</div>
          </div>
          
          <div className="bg-black/50 rounded border border-hacker-green/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-hacker-green/50">Defended</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.defendedAttacks}</div>
            <div className="text-xs text-hacker-green/50">Blocks</div>
          </div>
          
          <div className="bg-black/50 rounded border border-hacker-green/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-hacker-green/50">Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.successRate}%</div>
            <div className="text-xs text-hacker-green/50">Success</div>
          </div>
        </div>
        
        {/* Attack Vector Performance */}
        <div className="bg-black/50 rounded border border-hacker-green/20 p-4">
          <h3 className="text-sm text-hacker-green/70 mb-3">ATTACK VECTOR PERFORMANCE</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Social Media Clickjacking</span>
                <span className="text-yellow-400">92%</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{width: '92%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Banking Credential Theft</span>
                <span className="text-red-400">78%</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{width: '78%'}}></div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-black/50 rounded border border-hacker-green/20 p-3">
            <div className="text-hacker-green/50 mb-1">Most Vulnerable</div>
            <div className="text-yellow-400 font-bold">{stats.mostVulnerable}</div>
          </div>
          <div className="bg-black/50 rounded border border-hacker-green/20 p-3">
            <div className="text-hacker-green/50 mb-1">Peak Attack Time</div>
            <div className="text-green-400 font-bold">{stats.peakTime}</div>
          </div>
        </div>
      </div>
    </div>
  )
}