const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    let query = MenuItem.find({ isAvailable: true });

    // Filtering
    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }

    if (req.query.dietary) {
      query = query.where('dietary').in(req.query.dietary.split(','));
    }

    if (req.query.priceMin || req.query.priceMax) {
      const priceFilter = {};
      if (req.query.priceMin) priceFilter.$gte = req.query.priceMin;
      if (req.query.priceMax) priceFilter.$lte = req.query.priceMax;
      query = query.where('price', priceFilter);
    }

    if (req.query.restaurant) {
      query = query.where('restaurant').equals(req.query.restaurant);
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

    query = query.skip(startIndex).limit(limit);

    const menuItems = await query.populate('restaurant', 'name rating deliveryTime');

    const total = await MenuItem.countDocuments({ isAvailable: true });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Restaurant/Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    // Check if restaurant exists and user owns it
    const restaurant = await Restaurant.findById(req.body.restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add menu items to this restaurant'
      });
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Restaurant/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Make sure user owns the restaurant or is admin
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Restaurant/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Make sure user owns the restaurant or is admin
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get menu items by restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
exports.getMenuItemsByRestaurant = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true
    }).sort('category name');

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search menu items
// @route   GET /api/menu/search
// @access  Public
exports.searchMenuItems = async (req, res, next) => {
  try {
    const { q, category, dietary, priceMin, priceMax } = req.query;

    let query = MenuItem.find({ isAvailable: true });

    // Text search
    if (q) {
      query = query.find({ $text: { $search: q } });
    }

    // Additional filters
    if (category) {
      query = query.where('category').equals(category);
    }

    if (dietary) {
      query = query.where('dietary').in(dietary.split(','));
    }

    if (priceMin || priceMax) {
      const priceFilter = {};
      if (priceMin) priceFilter.$gte = priceMin;
      if (priceMax) priceFilter.$lte = priceMax;
      query = query.where('price', priceFilter);
    }

    const menuItems = await query
      .populate('restaurant', 'name rating deliveryTime')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for menu item
// @route   PUT /api/menu/:id/photo
// @access  Private/Restaurant/Admin
exports.uploadMenuItemPhoto = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Make sure user owns the restaurant or is admin
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item'
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