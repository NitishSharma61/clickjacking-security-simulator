'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react'

interface SplitScreenSimulationProps {
  title: string
  victimView: React.ReactNode
  attackerView: React.ReactNode
  onAttackSuccess: () => void
  onAttackDefended: () => void
  explanation: string
  warningSignsComponent?: React.ReactNode
  maliciousOverlay?: React.ComponentType<{ transparencyLevel: number }>
}

export default function SplitScreenSimulation({
  title,
  victimView,
  attackerView,
  onAttackSuccess,
  onAttackDefended,
  explanation,
  warningSignsComponent,
  maliciousOverlay: MaliciousOverlay
}: SplitScreenSimulationProps) {
  const [showAttackerView, setShowAttackerView] = useState(true)
  const [attackRevealed, setAttackRevealed] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [transparencyLevel, setTransparencyLevel] = useState(0)

  const handleAttackAttempt = (successful: boolean) => {
    setWasSuccessful(successful)
    setAttackRevealed(true)
    setShowResult(true)
    if (successful) {
      onAttackSuccess()
    } else {
      onAttackDefended()
    }
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAttackerView(!showAttackerView)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showAttackerView ? <EyeOff size={20} /> : <Eye size={20} />}
            {showAttackerView ? 'Hide' : 'Show'} Attacker View
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Victim View */}
        <div className="relative">
          <div className="absolute -top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-t-lg text-sm font-semibold z-10">
            Victim's View {transparencyLevel > 0 && '(with Hidden Layer Revealed)'}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-blue-600 p-6 pt-8">
            <div className="relative">
              {/* Legitimate layer */}
              <div style={{ opacity: 1 - transparencyLevel / 100 }}>
                {victimView}
              </div>
              
              {/* Malicious layer overlay - only visible when transparency is applied */}
              {transparencyLevel > 0 && (
                MaliciousOverlay ? (
                  <MaliciousOverlay transparencyLevel={transparencyLevel} />
                ) : (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: transparencyLevel / 100 }}
                  >
                    <div className="bg-red-500/20 border-2 border-red-500 border-dashed rounded-lg p-4 text-center">
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                        📤 Share "Get Rich Quick!" to Timeline
                      </div>
                      <p className="text-red-700 font-semibold mt-2 text-sm">
                        ⚠️ HIDDEN MALICIOUS BUTTON
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        This is what you actually clicked!
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Attacker View */}
        <AnimatePresence>
          {showAttackerView && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative"
            >
              <div className="absolute -top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-t-lg text-sm font-semibold z-10">
                Attacker's View
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-red-600 p-6 pt-8">
                {attackerView}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transparency Slider */}
      {showAttackerView && (
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Transparency Control</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Adjust the slider to see through the legitimate layer and reveal the hidden malicious elements
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm">Opaque</span>
            <input
              type="range"
              min="0"
              max="100"
              value={transparencyLevel}
              onChange={(e) => setTransparencyLevel(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">Transparent</span>
            <span className="ml-4 font-mono text-sm">{transparencyLevel}%</span>
          </div>
        </div>
      )}

      {/* Warning Signs */}
      {warningSignsComponent && (
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Warning Signs to Watch For
            </h3>
          </div>
          {warningSignsComponent}
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`text-center mb-6 ${wasSuccessful ? 'text-red-600' : 'text-green-600'}`}>
                {wasSuccessful ? (
                  <>
                    <AlertTriangle size={64} className="mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">You Were Clickjacked!</h2>
                  </>
                ) : (
                  <>
                    <Shield size={64} className="mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Attack Defended!</h2>
                  </>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">What Happened:</h3>
                <p className="text-gray-600 dark:text-gray-400">{explanation}</p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowResult(false)
                    setShowAttackerView(true)
                    setAttackRevealed(false)
                    setTransparencyLevel(0)
                    setWasSuccessful(false)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowResult(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}