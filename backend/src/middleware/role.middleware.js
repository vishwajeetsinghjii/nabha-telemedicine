function requireRoles(...allowedRoles) {
  const roles = allowedRoles.map(r => String(r).toUpperCase());
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success:false,error:{code:'AUTH_REQUIRED',message:'Authentication required'} });
    if (!roles.includes(String(req.user.role).toUpperCase())) {
      return res.status(403).json({ success:false,error:{code:'FORBIDDEN',message:'You do not have permission to access this resource'} });
    }
    next();
  };
}
module.exports = { requireRoles, requireRole: requireRoles };
