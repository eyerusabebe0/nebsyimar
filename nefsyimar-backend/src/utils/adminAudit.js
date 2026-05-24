const { AdminActionLog } = require('../models');

const logAdminAction = async (req, details) => {
  try {
    if (!req || !req.user || !req.user.user_id) {
      return;
    }

    const payload = {
      admin_id: req.user.user_id,
      action: details.action,
      target_type: details.targetType || 'OTHER',
      target_id: details.targetId || null,
      target_label: details.targetLabel || null,
      reason: details.reason || null,
      metadata: details.metadata || {},
      ip_address: req.ip || null,
      user_agent: req.headers ? req.headers['user-agent'] || null : null,
    };

    await AdminActionLog.create(payload);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

module.exports = {
  logAdminAction,
};
