'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, AlertTriangle, Lock, Eye } from 'lucide-react'

export default function Home() {
  const simulations = [
    {
      id: 'social-media',
      title: 'Social Media Clickjacking',
      description: 'Experience how attackers trick you into sharing unwanted content',
      icon: <Eye className="w-8 h-8" />,
      difficulty: 'Beginner',
      color: 'bg-blue-500',
    },
    {
      id: 'banking',
      title: 'Banking Credential Theft',
      description: 'See how fake forms can steal your sensitive information',
      icon: <AlertTriangle className="w-8 h-8" />,
      difficulty: 'Intermediate',
      color: 'bg-orange-500',
    },
    {
      id: 'permissions',
      title: 'Permission Hijacking',
      description: 'Learn how sites trick you into granting dangerous permissions',
      icon: <Lock className="w-8 h-8" />,
      difficulty: 'Advanced',
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Clickjacking Attack Simulation Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Learn to identify and prevent clickjacking attacks through interactive simulations.
          Experience real attack techniques in a safe environment.
        </p>
      </motion.div>


      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {simulations.map((sim, index) => (
          <motion.div
            key={sim.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/simulations/${sim.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
                <div className={`${sim.color} p-6 text-white`}>
                  <div className="flex justify-between items-start">
                    {sim.icon}
                    <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">
                      {sim.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {sim.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {sim.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
                    <span className="text-sm font-medium">Start Simulation</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How This Platform Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Experience the Attack</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Interact with realistic interfaces that hide malicious elements
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">See the Revelation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Watch as we reveal the hidden attack layers and explain the deception
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Learn Protection</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Understand warning signs and how to protect yourself in the future
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}