const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide item price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide item category'],
    enum: ['pizza', 'burger', 'salad', 'dessert', 'beverage', 'appetizer', 'main-course']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  allergens: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for better performance
menuItemSchema.index({ category: 1 })
menuItemSchema.index({ restaurant: 1 })
menuItemSchema.index({ isAvailable: 1 })
menuItemSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('MenuItem', menuItemSchema)