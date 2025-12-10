import { WebSocketServer, WebSocket } from 'ws';
import { serviceManager } from '../lib/serviceManager';
import db from '../lib/db';
import { verifyToken } from '../lib/auth';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const WS_PORT = parseInt(process.env.WS_PORT || '3001');

export function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ 
    port: WS_PORT,
    host: '0.0.0.0' // Listen on all network interfaces
  });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    let authenticated = false;
    let userId: number | null = null;
    let subscribedServiceId: number | null = null;
    let unsubscribeLogs: (() => void) | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'authenticate') {
          // Verify token
          if (!data.token) {
            console.error('WebSocket: No token provided');
            ws.send(JSON.stringify({ type: 'error', message: 'No token provided' }));
            ws.close();
            return;
          }
          
          const user = verifyToken(data.token);
          if (!user) {
            console.error('WebSocket: Invalid token - JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            ws.close();
            return;
          }

          authenticated = true;
          userId = user.id;
          ws.send(JSON.stringify({ type: 'authenticated' }));
        } else         if (data.type === 'subscribe' && authenticated) {
          // Subscribe to service logs
          const serviceId = parseInt(data.serviceId);
          
          if (isNaN(serviceId)) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid service ID' }));
            return;
          }

          // Verify user has access to this service (optional - can be enhanced with permissions)
          try {
            const [services] = await db.execute(
              'SELECT id FROM services WHERE id = ?',
              [serviceId]
            );

            if (!Array.isArray(services) || services.length === 0) {
              ws.send(JSON.stringify({ type: 'error', message: 'Service not found' }));
              return;
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
            ws.send(JSON.stringify({ type: 'error', message: 'Database error' }));
            return;
          }

          // Unsubscribe from previous service if any
          if (unsubscribeLogs) {
            unsubscribeLogs();
          }

          subscribedServiceId = serviceId;

          // Subscribe to logs
          unsubscribeLogs = serviceManager.subscribeToLogs(serviceId, (logData, logType) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'log',
                serviceId,
                data: logData,
                logType,
                timestamp: new Date().toISOString(),
              }));
            }
          });

          ws.send(JSON.stringify({
            type: 'subscribed',
            serviceId,
          }));
        } else if (data.type === 'unsubscribe' && authenticated) {
          if (unsubscribeLogs) {
            unsubscribeLogs();
            unsubscribeLogs = null;
            subscribedServiceId = null;
          }
          ws.send(JSON.stringify({ type: 'unsubscribed' }));
        }
      } catch (error: any) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message || 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (unsubscribeLogs) {
        unsubscribeLogs();
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  console.log(`WebSocket server started on port ${WS_PORT}`);
  
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  return wss;
}

