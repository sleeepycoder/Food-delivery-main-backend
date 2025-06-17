const express = require('express')
const Restaurant = require('../models/Restaurant')

const router = express.Router()

// @route   GET /api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { cuisine, zipcode, page = 1, limit = 20 } = req.query
    
    let query = { isActive: true }
    
    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [cuisine] }
    }
    
    // Filter by zipcode
    if (zipcode) {
      query['address.zipCode'] = zipcode
    }
    
    const skip = (page - 1) * limit
    
    const restaurants = await Restaurant.find(query)
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Restaurant.countDocuments(query)
    
    res.json({
      success: true,
      data: restaurants,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get restaurants error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/restaurants/:id
// @desc    Get single restaurant
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      })
    }
    
    res.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    console.error('Get restaurant error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router