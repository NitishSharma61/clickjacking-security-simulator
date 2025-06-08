// Global event store for SSE
class EventStore {
  private events: any[] = []
  private subscribers: Set<(event: any) => void> = new Set()
  
  addEvent(event: any) {
    this.events.push({
      ...event,
      id: Date.now(),
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }
    
    // Notify all subscribers
    this.subscribers.forEach(callback => callback(event))
  }
  
  subscribe(callback: (event: any) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
  
  getRecentEvents(count = 10) {
    return this.events.slice(-count)
  }
}

// Create singleton instance
const eventStore = new EventStore()

// Make it available globally for API routes
if (typeof global !== 'undefined') {
  (global as any).eventStore = eventStore
}

export default eventStore