/**
 * Response Utility - Nabha Telemedicine Backend
 * Standardized API JSON response formatters
 */

function successResponse(res, data = {}, statusCode = 200, meta = null) {
  const payload = {
    success: true,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message
    }
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
