export function generateFingerprint(): string {
  // Generate a browser fingerprint for anonymous tracking
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx?.fillText('fingerprint', 2, 2)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  return btoa(fingerprint).slice(0, 16)
}

export function getDeviceInfo() {
  return {
    browser: navigator.userAgent.split(' ').pop() || 'unknown',
    os: navigator.platform,
    screen_size: `${screen.width}x${screen.height}`,
    mobile: /Mobi|Android/i.test(navigator.userAgent),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateTypingSpeed(text: string, timeMs: number): number {
  const wordsPerMinute = (text.length / 5) / (timeMs / 60000)
  return Math.round(wordsPerMinute)
}

export function isRealLookingData(input: string, type: 'email' | 'card' | 'password'): boolean {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && 
             !input.includes('demo') && 
             !input.includes('test') &&
             !input.includes('example')
    
    case 'card':
      const digits = input.replace(/\D/g, '')
      return digits.length >= 13 && 
             digits !== '1234567812345678' &&
             digits !== '4111111111111111'
    
    case 'password':
      return input.length >= 8 && 
             /[A-Z]/.test(input) && 
             /[0-9]/.test(input) &&
             input !== 'Demo123!' &&
             input !== 'Password123'
    
    default:
      return false
  }
}

export function sanitizeForDemo(input: string): string {
  // Replace potentially real data with demo equivalents
  return input
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '1234 5678 1234 5678')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'demo@example.com')
}