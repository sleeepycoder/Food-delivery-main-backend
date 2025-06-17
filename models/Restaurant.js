const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide restaurant description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  cuisine: {
    type: [String],
    required: [true, 'Please provide cuisine types']
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: String,
    website: String
  },
  images: [{
    url: String,
    alt: String
  }],
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
  },
  deliveryInfo: {
    fee: {
      type: Number,
      default: 2.99
    },
    minimumOrder: {
      type: Number,
      default: 15
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30
    },
    radius: {
      type: Number, // in miles
      default: 5
    }
  },
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Indexes
restaurantSchema.index({ 'address.zipCode': 1 })
restaurantSchema.index({ cuisine: 1 })
restaurantSchema.index({ isActive: 1 })
restaurantSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Restaurant', restaurantSchema)