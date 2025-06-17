const express = require('express')
const MenuItem = require('../models/MenuItem')
const Restaurant = require('../models/Restaurant')

const router = express.Router()

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, restaurant, search, page = 1, limit = 20 } = req.query
    
    let query = { isAvailable: true }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category
    }
    
    // Filter by restaurant
    if (restaurant) {
      query.restaurant = restaurant
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search }
    }
    
    const skip = (page - 1) * limit
    
    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name cuisine rating deliveryInfo')
      .sort({ isPopular: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await MenuItem.countDocuments(query)
    
    res.json({
      success: true,
      data: menuItems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get menu items error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'name cuisine rating deliveryInfo address contact')
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      })
    }
    
    res.json({
      success: true,
      data: menuItem
    })
  } catch (error) {
    console.error('Get menu item error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/menu/search
// @desc    Search menu items
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }
    
    const menuItems = await MenuItem.find({
      $text: { $search: q },
      isAvailable: true
    })
    .populate('restaurant', 'name cuisine rating')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    
    res.json({
      success: true,
      data: menuItems
    })
  } catch (error) {
    console.error('Search menu items error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router