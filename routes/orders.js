const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  updateOrderStatus,
  rateOrder,
  cancelOrder,
  getOrderStats
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');
const {
  validateOrderCreation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/stats')
  .get(authorize('restaurant', 'admin'), getOrderStats);

router.route('/')
  .get(authorize('restaurant', 'admin'), getOrders)
  .post(validateOrderCreation, handleValidationErrors, createOrder);

router.route('/:id')
  .get(getOrder)
  .put(authorize('restaurant', 'admin'), updateOrder)
  .delete(authorize('admin'), deleteOrder);

router.route('/:id/status')
  .put(authorize('restaurant', 'delivery', 'admin'), updateOrderStatus);

router.route('/:id/rate')
  .put(rateOrder);

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;