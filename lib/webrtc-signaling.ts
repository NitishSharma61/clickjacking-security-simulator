// WebRTC Signaling Server Connection
export class SignalingClient {
  private ws: WebSocket | null = null
  private sessionId: string
  private role: 'victim' | 'attacker'
  private onMessage: (data: any) => void
  
  constructor(sessionId: string, role: 'victim' | 'attacker', onMessage: (data: any) => void) {
    this.sessionId = sessionId
    this.role = role
    this.onMessage = onMessage
  }
  
  connect() {
    // Use the attacker dashboard's port for WebSocket
    this.ws = new WebSocket('ws://localhost:3001/api/webrtc')
    
    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected')
      this.send({
        type: 'join',
        sessionId: this.sessionId,
        role: this.role
      })
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.onMessage(data)
    }
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
    
    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected')
    }
  }
  
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

// WebRTC Configuration
export const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}