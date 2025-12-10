import { startWebSocketServer } from './websocket';

// Start WebSocket server
const wss = startWebSocketServer();

console.log('Service Manager WebSocket server is running');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

