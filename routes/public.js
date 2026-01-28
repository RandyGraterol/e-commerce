const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

// Landing page
router.get('/', productController.getLanding);

// Products
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);

// Search
router.get('/search', productController.searchProducts);

// Cart
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.put('/cart/:productId', cartController.updateCartItem);
router.delete('/cart/:productId', cartController.removeFromCart);
router.post('/cart/clear', cartController.clearCart);

// Checkout (requires authentication)
router.get('/checkout', isAuthenticated, orderController.getCheckout);
router.post('/checkout', isAuthenticated, orderController.processCheckout);

module.exports = router;
