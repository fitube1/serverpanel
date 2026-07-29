import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Simulate terminal or metric streaming
    const interval = setInterval(() => {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    }, 10000);

    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    ws.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected');
    });
  });
}
