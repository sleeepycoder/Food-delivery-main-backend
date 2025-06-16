const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByRestaurant,
  searchMenuItems,
  uploadMenuItemPhoto
} = require('../controllers/menu');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateMenuItemCreation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

router.route('/search')
  .get(optionalAuth, searchMenuItems);

router.route('/restaurant/:restaurantId')
  .get(optionalAuth, getMenuItemsByRestaurant);

router.route('/')
  .get(optionalAuth, getMenuItems)
  .post(protect, authorize('restaurant', 'admin'), validateMenuItemCreation, handleValidationErrors, createMenuItem);

router.route('/:id')
  .get(optionalAuth, getMenuItem)
  .put(protect, authorize('restaurant', 'admin'), updateMenuItem)
  .delete(protect, authorize('restaurant', 'admin'), deleteMenuItem);

router.route('/:id/photo')
  .put(protect, authorize('restaurant', 'admin'), uploadMenuItemPhoto);

module.exports = router;