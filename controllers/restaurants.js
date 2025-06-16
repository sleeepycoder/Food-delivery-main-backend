const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    let query = Restaurant.find({ isActive: true });

    // Filtering
    if (req.query.cuisine) {
      query = query.where('cuisine').in(req.query.cuisine.split(','));
    }

    if (req.query.priceRange) {
      query = query.where('priceRange').equals(req.query.priceRange);
    }

    if (req.query.rating) {
      query = query.where('rating.average').gte(req.query.rating);
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-rating.average');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Restaurant.countDocuments({ isActive: true });

    query = query.skip(startIndex).limit(limit);

    const restaurants = await query.populate('menuItems');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      pagination,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('menuItems');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Restaurant/Admin
exports.createRestaurant = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Restaurant/Admin
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Restaurant/Admin
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this restaurant'
      });
    }

    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurants within a radius
// @route   GET /api/restaurants/radius/:zipcode/:distance
// @access  Public
exports.getRestaurantsInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    // For demo purposes, return all restaurants
    // In production, you would geocode the zipcode and use MongoDB geospatial queries
    const restaurants = await Restaurant.find({ isActive: true })
      .populate('menuItems')
      .sort('-rating.average');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for restaurant
// @route   PUT /api/restaurants/:id/photo
// @access  Private/Restaurant/Admin
exports.uploadRestaurantPhoto = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    // For demo purposes, just return success
    // In production, you would handle file upload with multer
    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};