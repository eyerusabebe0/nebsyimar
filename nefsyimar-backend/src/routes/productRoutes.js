const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  updateProductStock,
  getFeaturedProducts,
  getPopularProducts,
  searchProducts,
  getProductsByCategory
} = require('../controllers/productController');

const { authenticate, requireVendorVerification } = require('../middleware/authMiddleware');
const { validateProductCreation, validateUUIDParam, validatePagination, validateSearch } = require('../middleware/validationMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');

// Public routes
router.get('/', validatePagination, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/popular', getPopularProducts);
router.get('/search', validateSearch, searchProducts);
router.get('/category/:category', validatePagination, getProductsByCategory);
router.get('/:productId', validateUUIDParam('productId'), getProduct);

// Protected routes (require authentication)
router.use(authenticate);

// Vendor-specific routes (require vendor verification)
router.post('/', requireVendorVerification, uploadMiddleware.product, validateProductCreation, createProduct);
router.get('/my/products', requireVendorVerification, validatePagination, getMyProducts);

router.put('/:productId', 
  requireVendorVerification,
  validateUUIDParam('productId'),
  uploadMiddleware.product,
  updateProduct
);

router.delete('/:productId', 
  requireVendorVerification,
  validateUUIDParam('productId'),
  deleteProduct
);

router.patch('/:productId/stock', 
  requireVendorVerification,
  validateUUIDParam('productId'),
  updateProductStock
);

module.exports = router;
