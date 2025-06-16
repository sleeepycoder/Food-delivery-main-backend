const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsInRadius,
  uploadRestaurantPhoto
} = require('../controllers/restaurants');
const { protect, authorize } = require('../middleware/auth');
const {
  validateRestaurantCreation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

router.route('/radius/:zipcode/:distance')
  .get(getRestaurantsInRadius);

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('restaurant', 'admin'), validateRestaurantCreation, handleValidationErrors, createRestaurant);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('restaurant', 'admin'), updateRestaurant)
  .delete(protect, authorize('restaurant', 'admin'), deleteRestaurant);

router.route('/:id/photo')
  .put(protect, authorize('restaurant', 'admin'), uploadRestaurantPhoto);

module.exports = router;