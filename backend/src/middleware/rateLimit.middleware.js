/**
 * Rate Limiting Middleware - Nabha Telemedicine Backend
 * Protects endpoints against brute-force attacks and abuse
 */

const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit login/OTP attempts to 20 per 15 minutes
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
