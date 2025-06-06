'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Shield, AlertTriangle, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalSessions: number
    totalClicks: number
    successfulAttacks: number
    defendedAttacks: number
    defenseRate: number
  }
  scenarios: Array<{
    scenario: string
    attempts: number
    successes: number
    defenses: number
    defenseRate: number
  }>
  recentActivity: {
    last24Hours: number
    successRate: number
  }
  credentialCaptures: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Analytics Error
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const scenarioNames = {
    social: 'Social Media',
    banking: 'Banking',
    permission: 'Permissions'
  }

  const chartData = analytics.scenarios.map(scenario => ({
    name: scenarioNames[scenario.scenario as keyof typeof scenarioNames],
    defenseRate: scenario.defenseRate,
    attacks: scenario.successes,
    defenses: scenario.defenses
  }))

  const pieData = [
    { name: 'Defended', value: analytics.overview.defendedAttacks, color: '#10b981' },
    { name: 'Successful Attacks', value: analytics.overview.successfulAttacks, color: '#dc2626' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Security Training Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time insights into clickjacking simulation performance and learning outcomes
        </p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overview.totalSessions}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Defense Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.overview.defenseRate}%
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attacks Defended</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.overview.defendedAttacks}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Attacks</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.overview.successfulAttacks}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Defense Rate by Scenario
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="defenseRate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Overall Attack Outcomes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Scenario Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Scenario Performance Details
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Scenario
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Total Attempts
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Successful Attacks
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Defended
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Defense Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.scenarios.map((scenario, index) => (
                <tr key={scenario.scenario} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {scenarioNames[scenario.scenario as keyof typeof scenarioNames]}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {scenario.attempts}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-600 font-semibold">{scenario.successes}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-semibold">{scenario.defenses}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      scenario.defenseRate >= 70 ? 'text-green-600' :
                      scenario.defenseRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {scenario.defenseRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-600 rounded-lg p-6"
      >
        <div className="flex items-center mb-4">
          <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
            Recent Activity (Last 24 Hours)
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">New Attempts</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {analytics.recentActivity.last24Hours}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Attack Success Rate</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {analytics.recentActivity.successRate}%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}