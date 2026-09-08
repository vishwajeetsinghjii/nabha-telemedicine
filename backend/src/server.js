require('dotenv').config();
/**
 * Server Entry Point - Nabha Telemedicine Backend
 * Launches HTTP listener with graceful shutdown handling for SIGTERM/SIGINT
 */

const app = require('./app');
const env = require('./config/env');
const db = require('./config/database');
const logger = require('./utils/logger');

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`[Nabha Backend] Server running on http://${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode.`);
});

// Graceful Shutdown Manager
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  // Force exit after 10 seconds if shutdown hangs
  const forceExitTimeout = setTimeout(() => {
    logger.error('[Shutdown] Forced exit due to timeout.');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('[Shutdown] HTTP server closed.');
    await db.close();
    clearTimeout(forceExitTimeout);
    logger.info('[Shutdown] Graceful shutdown completed cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('[Unhandled Rejection]', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('[Uncaught Exception]', { error: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION');
});
