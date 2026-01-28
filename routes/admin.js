const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Categories
router.get('/categories', adminController.getCategories);
router.get('/categories/new', adminController.showCreateCategory);
router.post('/categories', adminController.createCategory);
router.get('/categories/:id/edit', adminController.showEditCategory);
router.post('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Products
router.get('/products', adminController.getProducts);
router.get('/products/new', adminController.showCreateProduct);
router.post('/products', uploadMultiple, adminController.createProduct);
router.get('/products/:id/edit', adminController.showEditProduct);
router.post('/products/:id', uploadMultiple, adminController.updateProduct);
router.put('/products/:id/reactivate', adminController.reactivateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
