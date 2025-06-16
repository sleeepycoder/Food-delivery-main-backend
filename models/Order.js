const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customizations: [{
      name: String,
      selectedOptions: [String],
      additionalPrice: {
        type: Number,
        default: 0
      }
    }],
    specialInstructions: String,
    subtotal: {
      type: Number,
      required: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tip: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  deliveryAddress: {
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
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    instructions: String
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'on-the-way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital-wallet'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String,
    last4: String
  },
  orderType: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  scheduledFor: Date,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  preparationTime: {
    estimated: Number,
    actual: Number
  },
  deliveryDriver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  tracking: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: [Number] // [longitude, latitude]
    },
    note: String
  }],
  rating: {
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  specialInstructions: String,
  promoCode: String,
  loyaltyPointsUsed: {
    type: Number,
    default: 0
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'restaurant', 'admin']
    },
    cancelledAt: Date,
    refundIssued: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `FE${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add tracking entry when status changes
OrderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.tracking.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Calculate estimated delivery time
OrderSchema.methods.calculateEstimatedDeliveryTime = function() {
  const now = new Date();
  const preparationTime = this.preparationTime.estimated || 30; // default 30 minutes
  const deliveryTime = 15; // default 15 minutes for delivery
  
  this.estimatedDeliveryTime = new Date(now.getTime() + (preparationTime + deliveryTime) * 60000);
  return this.estimatedDeliveryTime;
};

module.exports = mongoose.model('Order', OrderSchema);