'use client'

import { useState, useEffect } from 'react'
import CapturedData from '../components/CapturedData'

export default function AttackerDashboard() {
  const [totalDataCaptured, setTotalDataCaptured] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Terminal Header */}
        <div className="bg-black border border-gray-600 rounded-t-lg">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-300 text-sm font-mono ml-4">Terminal - Hacker@system:~$</span>
            </div>
            <span className="text-red-400 text-sm font-mono">● LIVE</span>
          </div>
          <div className="p-4 font-mono">
            <div className="text-red-400 mb-2">
              [SYSTEM] Clickjacking attack framework initialized...
            </div>
            <div className="text-yellow-400 mb-2">
              [INFO] Monitoring victim sites for credential theft
            </div>
            <div className="text-blue-400">
              [STATUS] Data collection: ACTIVE | Victims monitored: REAL-TIME
            </div>
          </div>
        </div>


        {/* Main Data Display */}
        <CapturedData />
      </div>
    </div>
  )
}