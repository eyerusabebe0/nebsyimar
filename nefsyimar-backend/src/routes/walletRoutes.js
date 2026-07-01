const express = require('express');
const router = express.Router();

const {
  getWallet,
  getTransactions,
  depositMoney,
  getBalance,
  getTransaction,
  getWalletStats,
  freezeWallet,
  unfreezeWallet
} = require('../controllers/walletController');

const { authenticate, authorize, checkWalletStatus, userRateLimit } = require('../middleware/authMiddleware');
const { validateWalletDeposit, validateUUIDParam, validatePagination } = require('../middleware/validationMiddleware');

// All wallet routes require authentication
router.use(authenticate);

// Wallet management routes
router.get('/', getWallet);
router.get('/balance', getBalance);
router.get('/transactions', validatePagination, getTransactions);
router.get('/transactions/:txnId', validateUUIDParam('txnId'), getTransaction);
router.get('/stats', getWalletStats);

// Deposit money (requires unfrozen wallet)
router.post('/deposit', userRateLimit(20, 15 * 60 * 1000), checkWalletStatus, validateWalletDeposit, depositMoney);

// Admin-only routes for wallet management
router.post('/:userId/freeze', authorize('Administrator'), freezeWallet);
router.post('/:userId/unfreeze', authorize('Administrator'), unfreezeWallet);

module.exports = router;
