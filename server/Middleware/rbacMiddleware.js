// Role hierarchy — higher number = more permissions
const roleHierarchy = {
  viewer: 1,
  rep: 2,
  manager: 3,
  admin: 4
}

// Check if user has minimum required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoleLevel = roleHierarchy[req.user.role] || 0
    const hasPermission = allowedRoles.some(role =>
      userRoleLevel >= roleHierarchy[role]
    )

    if (!hasPermission) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      })
    }
    next()
  }
}

// Specific permission checks
const permissions = {
  // Leads
  canViewAllLeads: (req) => ['admin', 'manager'].includes(req.user.role),
  canEditLead: (req, lead) => {
    if (['admin', 'manager'].includes(req.user.role)) return true
    if (req.user.role === 'rep' && lead.assignedTo?.toString() === req.user.id) return true
    return false
  },
  canDeleteLead: (req) => ['admin', 'manager'].includes(req.user.role),
  canViewAnalytics: (req) => ['admin', 'manager'].includes(req.user.role),
  canManageTeam: (req) => req.user.role === 'admin',
  canUseAI: (req) => ['admin', 'manager', 'rep'].includes(req.user.role),
}

module.exports = { requireRole, permissions }