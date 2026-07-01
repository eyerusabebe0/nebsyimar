const express = require('express');
const router = express.Router();

const { submitAppeal, getMyAppeals } = require('../controllers/appealController');
const { authenticate } = require('../middleware/authMiddleware');
const { validatePagination } = require('../middleware/validationMiddleware');

// All appeal routes require authentication
router.use(authenticate);

// Submit a new appeal
router.post('/', submitAppeal);

// List current user's appeals
router.get('/my', validatePagination, getMyAppeals);

module.exports = router;
