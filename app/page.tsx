'use client'

import Link from 'next/link'
import { Eye, AlertTriangle } from 'lucide-react'
import { ATTACKER_DASHBOARD_URL } from '@/lib/config'

export default function Home() {
  const simulations = [
    {
      id: 'social-media',
      title: 'Social Media Clickjacking',
      description: 'Watch funny cat videos',
      icon: <Eye className="w-8 h-8" />,
      site: 'CatTube',
      url: '/simulations/social-media',
    },
    {
      id: 'banking',
      title: 'Banking Credential Theft',
      description: 'Special offer iPhone deals',
      icon: <AlertTriangle className="w-8 h-8" />,
      site: 'TechDeals',
      url: '/simulations/banking',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Experience
        </h1>
        <p className="text-gray-600">
          Visit different sites - each one has a hidden surprise
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {simulations.map((sim) => (
          <Link key={sim.id} href={sim.url}>
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border-2 hover:border-blue-400">
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4 text-blue-600">
                  {sim.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sim.site}
                </h3>
                <p className="text-gray-600 mb-4">
                  {sim.description}
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <span className="text-sm text-blue-700 font-medium">
                    Visit Site →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            🎯 Demo Instructions
          </h2>
          <p className="text-yellow-700 text-sm">
            1. Open <strong>Attacker Dashboard</strong> in another tab: 
            <a href={ATTACKER_DASHBOARD_URL} target="_blank" className="text-blue-600 hover:underline ml-2">
              {ATTACKER_DASHBOARD_URL}
            </a>
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            2. Visit any site above and interact with it
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            3. Watch the attacker dashboard capture your data in real-time!
          </p>
        </div>
      </div>
    </div>
  )
}