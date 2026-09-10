/**
 * Rate Limiting Middleware - Nabha Telemedicine Backend
 * Protects endpoints against brute-force attacks and abuse
 */

const rateLimitModule = require('express-rate-limit');
const rateLimit = rateLimitModule.rateLimit || rateLimitModule.default || rateLimitModule;
const { errorResponse } = require('../utils/response');

const globalLimiter = rateLimit({
  windowMs: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX || 300),
  skip: (req) => req.path.startsWith('/auth/'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this IP. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  }
});

const publicAiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => errorResponse(res, 'Too many symptom-check requests. Please try again later.', 429, 'AI_RATE_LIMIT_EXCEEDED')
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  keyGenerator: (req) => {
    const identifier = typeof req.body?.identifier === 'string'
      ? req.body.identifier.trim().toLowerCase()
      : typeof req.body?.mobile === 'string'
        ? req.body.mobile.trim()
        : '';
    return `${req.ip || 'unknown'}:${identifier || 'unknown'}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many authentication attempts. Please try again later.', 429, 'AUTH_RATE_LIMIT_EXCEEDED');
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  publicAiLimiter
};
