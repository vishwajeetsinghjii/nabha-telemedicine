/**
 * Request ID Middleware - Nabha Telemedicine Backend
 * Assigns unique X-Request-ID to all incoming requests for log correlation
 */

const { v4: uuidv4 } = require('uuid');

function requestIdMiddleware(req, res, next) {
  const existingId = req.header('X-Request-ID');
  const requestId = existingId || uuidv4();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}

module.exports = requestIdMiddleware;
