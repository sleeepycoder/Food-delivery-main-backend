const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'side', 'salad', 'soup', 'pizza', 'burger', 'pasta', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    allergen: {
      type: Boolean,
      default: false
    }
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'keto', 'low-carb']
  }],
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'none'
  },
  preparationTime: {
    type: Number,
    required: [true, 'Please add preparation time in minutes'],
    min: 1
  },
  customizations: [{
    name: {
      type: String,
      required: true
    },
    options: [{
      name: String,
      price: {
        type: Number,
        default: 0
      }
    }],
    required: {
      type: Boolean,
      default: false
    },
    multiSelect: {
      type: Boolean,
      default: false
    }
  }],
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
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  orderCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

// Create index for text search
MenuItemSchema.index({
  name: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text'
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);