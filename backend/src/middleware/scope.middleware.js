/**
 * Scope & Multi-Center Resource Authorization Middleware - Nabha Telemedicine Backend
 * Enforces health center and village level operational access boundaries
 */

const { AuthorizationError, AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

function requireCenterScope(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  // Global ADMIN role has system-wide operational scope
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Attach health center filter context for repository queries
  req.centerScope = {
    userId: req.user.id,
    role: req.user.role,
    isScoped: true
  };

  logger.debug(`[CenterScope Middleware] Applied center scope restriction for user ${req.user.id} (${req.user.role})`);
  next();
}

module.exports = {
  requireCenterScope
};
