/**
 * Error Handling Middleware - Nabha Telemedicine Backend
 * Centralized error handler suppressing stack traces in production
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  const requestId = req.requestId || 'unknown';

  // If operational error (AppError sub-class)
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.statusCode} - ${err.message}`, {
      requestId,
      errorCode: err.errorCode,
      path: req.originalUrl,
      method: req.method
    });

    return errorResponse(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  // Handle SyntaxErrors (e.g. malformed JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('[SyntaxError] Malformed JSON in request body', { requestId, path: req.originalUrl });
    return errorResponse(res, 'Malformed JSON payload in request body', 400, 'MALFORMED_JSON');
  }

  // Unexpected internal server errors
  logger.error('[UnhandledError] Unexpected exception caught:', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return errorResponse(res, message, 500, 'INTERNAL_SERVER_ERROR');
}

function notFoundHandler(req, res) {
  return errorResponse(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
}

module.exports = {
  errorHandler,
  notFoundHandler
};
