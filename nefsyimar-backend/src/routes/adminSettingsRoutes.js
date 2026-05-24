const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getAdminSettings, updateAdminSettings } = require('../controllers/systemSettingsController');

// All settings routes require Administrator
router.use(authenticate);
router.use(authorize('Administrator'));

router.get('/', getAdminSettings);
router.put('/', updateAdminSettings);

module.exports = router;
