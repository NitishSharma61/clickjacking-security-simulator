import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // Get event store from global
      const eventStore = (global as any).eventStore
      
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ 
          type: 'connection_established',
          timestamp: new Date().toISOString()
        })}\n\n`)
      )
      
      // Subscribe to new events
      const unsubscribe = eventStore?.subscribe((event: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          )
        } catch (error) {
          console.error('Failed to send event:', error)
        }
      })
      
      // Keep connection alive with heartbeat
      const interval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`)
          )
        } catch (error) {
          clearInterval(interval)
        }
      }, 30000)
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        unsubscribe?.()
        controller.close()
      })
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}