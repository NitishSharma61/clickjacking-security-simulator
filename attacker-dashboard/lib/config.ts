export const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000'

export const getMainAppUrl = (path: string) => {
  return `${MAIN_APP_URL}${path}`
}