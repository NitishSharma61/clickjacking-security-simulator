export const ATTACKER_DASHBOARD_URL = process.env.NEXT_PUBLIC_ATTACKER_DASHBOARD_URL || 'http://localhost:3001'

export const getAttackerApiUrl = (endpoint: string) => {
  return `${ATTACKER_DASHBOARD_URL}/api/${endpoint}`
}