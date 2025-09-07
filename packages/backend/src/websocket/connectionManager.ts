import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

export function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' },
    path: '/ws',
    perMessageDeflate: {
      threshold: 1024,
    },
    pingInterval: 20000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    socket.emit('welcome', { message: 'connected' });
    socket.on('ping', () => socket.emit('pong'));
  });

  return io;
}

export function startRealtimeDemo(io: ReturnType<typeof initSocket>) {
  // naive demo stream: emit a random value for a metric
  const timer = setInterval(() => {
    const value = Math.round(80 + Math.random() * 40);
    io.emit('metrics:update', { metric: 'demo_cpu_utilization', value, ts: Date.now() });
  }, 3000);
  io.of('/').adapter.on('delete-room', () => { /* noop */ });
  return () => clearInterval(timer);
}
