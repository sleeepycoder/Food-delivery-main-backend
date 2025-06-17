const express = require('express')
const Order = require('../models/Order')
const MenuItem = require('../models/MenuItem')
const Restaurant = require('../models/Restaurant')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { restaurant, items, deliveryAddress, paymentMethod, specialInstructions } = req.body

    // Validate required fields
    if (!restaurant || !items || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      })
    }

    // Validate restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant)
    if (!restaurantDoc) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      })
    }

    // Calculate pricing
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem)
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        })
      }

      const itemSubtotal = menuItem.price * item.quantity
      subtotal += itemSubtotal

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions || '',
        subtotal: itemSubtotal
      })
    }

    const tax = subtotal * 0.08 // 8% tax
    const deliveryFee = subtotal > 25 ? 0 : 3.99
    const total = subtotal + tax + deliveryFee

    // Create order
    const order = new Order({
      customer: req.user._id,
      restaurant,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        deliveryFee,
        total
      },
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
    })

    await order.save()

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address contact')
      .populate('items.menuItem', 'name images')

    res.status(201).json({
      success: true,
      data: populatedOrder
    })

  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    })
  }
})

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    
    let query = { customer: req.user._id }
    
    if (status) {
      query.status = status
    }
    
    const skip = (page - 1) * limit
    
    const orders = await Order.find(query)
      .populate('restaurant', 'name images')
      .populate('items.menuItem', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Order.countDocuments(query)
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get my orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address contact')
      .populate('items.menuItem', 'name images')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    
    // Check if user owns this order or is admin
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      })
    }
    
    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on-the-way', 'delivered', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }
    
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    
    order.status = status
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date()
    }
    
    await order.save()
    
    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address contact')
      .populate('items.menuItem', 'name images')
    
    res.json({
      success: true,
      data: updatedOrder
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router