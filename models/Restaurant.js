const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cuisine: [{
    type: String,
    required: true,
    enum: ['italian', 'chinese', 'indian', 'mexican', 'american', 'thai', 'japanese', 'mediterranean', 'french', 'other']
  }],
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: String,
  images: [{
    url: String,
    alt: String
  }],
  logo: {
    type: String,
    default: 'default-restaurant.jpg'
  },
  rating: {
    average: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    required: true
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Please add delivery fee'],
    min: 0
  },
  minimumOrder: {
    type: Number,
    required: [true, 'Please add minimum order amount'],
    min: 0
  },
  deliveryTime: {
    min: {
      type: Number,
      required: true,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    }
  },
  deliveryRadius: {
    type: Number,
    required: [true, 'Please add delivery radius in miles'],
    min: 1,
    max: 50
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  features: [{
    type: String,
    enum: ['delivery', 'pickup', 'dine-in', 'outdoor-seating', 'wifi', 'parking', 'wheelchair-accessible']
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'digital-wallet', 'online']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create restaurant slug from name
RestaurantSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  next();
});

// Reverse populate with virtuals
RestaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);