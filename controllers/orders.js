const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Restaurant/Admin
exports.getOrders = async (req, res, next) => {
  try {
    let query = Order.find();

    // If user is restaurant owner, only show their orders
    if (req.user.role === 'restaurant') {
      const restaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = restaurants.map(r => r._id);
      query = query.where('restaurant').in(restaurantIds);
    }

    // Filtering
    if (req.query.status) {
      query = query.where('status').equals(req.query.status);
    }

    if (req.query.restaurant) {
      query = query.where('restaurant').equals(req.query.restaurant);
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    query = query.skip(startIndex).limit(limit);

    const orders = await query
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name');

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name phone address')
      .populate('items.menuItem', 'name images')
      .populate('deliveryDriver', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user can access this order
    if (
      order.customer._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      !(req.user.role === 'restaurant' && order.restaurant.owner.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Validate restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Validate and calculate order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions || '',
        subtotal: itemSubtotal
      });
    }

    // Calculate pricing
    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = subtotal > 25 ? 0 : 3.99;
    const total = subtotal + tax + deliveryFee;

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      restaurant,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        deliveryFee,
        total
      },
      deliveryAddress,
      contactInfo: {
        phone: req.user.phone,
        email: req.user.email
      },
      paymentMethod,
      specialInstructions
    });

    // Calculate estimated delivery time
    order.calculateEstimatedDeliveryTime();
    await order.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalOrders: 1, totalSpent: total }
    });

    // Update restaurant stats
    await Restaurant.findByIdAndUpdate(restaurant, {
      $inc: { totalOrders: 1, totalRevenue: total }
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Restaurant/Admin
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const restaurant = await Restaurant.findById(order.restaurant);
    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name logo')
      .populate('items.menuItem', 'name images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Restaurant/Delivery/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const restaurant = await Restaurant.findById(order.restaurant);
    if (
      req.user.role !== 'admin' &&
      restaurant.owner.toString() !== req.user.id &&
      !(req.user.role === 'delivery' && order.deliveryDriver?.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    order.status = status;

    // Set actual delivery time if delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate order
// @route   PUT /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res, next) => {
  try {
    const { food, delivery, overall, comment } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    // Make sure order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = {
      food,
      delivery,
      overall,
      comment,
      ratedAt: new Date()
    };

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: 'customer',
      cancelledAt: new Date()
    };

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Restaurant/Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    let matchStage = {};

    // If user is restaurant owner, only show their stats
    if (req.user.role === 'restaurant') {
      const restaurants = await Restaurant.find({ owner: req.user.id });
      const restaurantIds = restaurants.map(r => r._id);
      matchStage.restaurant = { $in: restaurantIds };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};