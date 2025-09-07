import { config } from './config.js';
import { logger } from './logger.js';
import { createApp } from './app.js';
import http from 'http';
import { initSocket, startRealtimeDemo } from './websocket/connectionManager.js';

async function main() {
  const app = await createApp();
  const server = http.createServer(app);
  const io = initSocket(server);
  startRealtimeDemo(io);
  server.listen(config.port, () => {
    logger.info(`Backend listening on :${config.port} (${config.env})`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
