const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const { validateRepatriationSubmission } = require('../middleware/validationMiddleware');
const { createRepatriationSubmission } = require('../controllers/repatriationController');
const { uploadMiddleware } = require('../utils/fileUpload');

router.post(
  '/',
  authenticate,
  uploadMiddleware.single('death_certificate_file', 'repatriation'),
  validateRepatriationSubmission,
  createRepatriationSubmission
);

module.exports = router;
