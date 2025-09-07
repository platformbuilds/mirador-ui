import { config } from './config.js';
import { logger } from './logger.js';
import { createApp } from './app.js';

async function main() {
  const app = await createApp();
  app.listen(config.port, () => {
    logger.info(`Backend listening on :${config.port} (${config.env})`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
