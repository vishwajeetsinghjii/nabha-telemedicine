/**
 * Logger Utility - Nabha Telemedicine Backend
 * Structured logging with request correlation IDs and log level control
 */

const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nabha-telemed-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, requestId, stack, ...meta }) => {
          const reqIdStr = requestId ? ` [req:${requestId}]` : '';
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}:${reqIdStr} ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
        })
      )
    })
  ]
});

module.exports = logger;
