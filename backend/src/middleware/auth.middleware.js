const { verifyAccessToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');

async function authMiddleware(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const token = header.slice(7).trim();
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Account no longer exists' } });
    if (!['ACTIVE'].includes(user.accountStatus)) {
      return res.status(403).json({ success: false, error: { code: `ACCOUNT_${user.accountStatus}`, message: 'Your account is not active' } });
    }
    req.user = {
      id: user.id, role: user.role, mobile: user.mobile, email: user.email,
      organizationId: user.organizationId, healthCenterId: user.healthCenterId,
      accountStatus: user.accountStatus
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: error.code || 'INVALID_TOKEN', message: error.message || 'Invalid or expired access token' } });
  }
}

module.exports = authMiddleware;
module.exports.requireAuth = authMiddleware;
