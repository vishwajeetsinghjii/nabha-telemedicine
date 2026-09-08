/**
 * Pagination Utility - Nabha Telemedicine Backend
 */

function calculatePagination(pageParam, limitParam) {
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const rawLimit = parseInt(limitParam || '20', 10);
  const limit = Math.min(100, Math.max(1, rawLimit)); // Cap limit at 100 max

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}

module.exports = {
  calculatePagination
};
