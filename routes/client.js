const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

// All client routes require authentication
router.use(isAuthenticated);

// Favorites
router.get('/favorites', favoriteController.getFavorites);
router.post('/favorites', favoriteController.addFavorite);
router.delete('/favorites/:id', favoriteController.removeFavorite);

// Orders
router.get('/orders', orderController.getClientOrders);
router.get('/orders/:id', orderController.getOrderDetail);

module.exports = router;
