const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Restaurant.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'customer',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        password: 'password123',
        role: 'customer',
        address: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002'
        }
      },
      {
        name: 'Mario Rossi',
        email: 'mario@pizzapalace.com',
        phone: '+1234567892',
        password: 'password123',
        role: 'restaurant',
        address: {
          street: '789 Pizza St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        }
      },
      {
        name: 'Admin User',
        email: 'admin@foodieexpress.com',
        phone: '+1234567893',
        password: 'password123',
        role: 'admin'
      }
    ]);

    console.log('👥 Created users');

    // Create restaurants
    const restaurants = await Restaurant.create([
      {
        name: 'Pizza Palace',
        description: 'Authentic Italian pizza made with fresh ingredients',
        owner: users[2]._id,
        cuisine: ['italian'],
        address: {
          street: '789 Pizza St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        },
        phone: '+1234567892',
        email: 'mario@pizzapalace.com',
        rating: { average: 4.5, count: 150 },
        priceRange: '$$',
        deliveryFee: 2.99,
        minimumOrder: 15,
        deliveryTime: { min: 25, max: 35 },
        deliveryRadius: 5,
        operatingHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '24:00' },
          saturday: { open: '11:00', close: '24:00' },
          sunday: { open: '12:00', close: '22:00' }
        },
        features: ['delivery', 'pickup'],
        paymentMethods: ['cash', 'card', 'digital-wallet']
      },
      {
        name: 'Burger Junction',
        description: 'Gourmet burgers and crispy fries',
        owner: users[2]._id,
        cuisine: ['american'],
        address: {
          street: '456 Burger Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10004'
        },
        phone: '+1234567894',
        email: 'info@burgerjunction.com',
        rating: { average: 4.2, count: 89 },
        priceRange: '$$',
        deliveryFee: 3.99,
        minimumOrder: 12,
        deliveryTime: { min: 20, max: 30 },
        deliveryRadius: 3,
        operatingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        features: ['delivery', 'pickup'],
        paymentMethods: ['cash', 'card', 'digital-wallet']
      }
    ]);

    console.log('🏪 Created restaurants');

    // Create menu items
    const menuItems = await MenuItem.create([
      // Pizza Palace items
      {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, and basil on crispy crust',
        restaurant: restaurants[0]._id,
        category: 'pizza',
        price: 12.99,
        images: [{ url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', alt: 'Margherita Pizza' }],
        ingredients: [
          { name: 'Tomato sauce', allergen: false },
          { name: 'Mozzarella cheese', allergen: true },
          { name: 'Fresh basil', allergen: false },
          { name: 'Pizza dough', allergen: true }
        ],
        dietary: ['vegetarian'],
        preparationTime: 15,
        rating: { average: 4.8, count: 45 },
        isPopular: true
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella cheese',
        restaurant: restaurants[0]._id,
        category: 'pizza',
        price: 14.99,
        images: [{ url: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg', alt: 'Pepperoni Pizza' }],
        ingredients: [
          { name: 'Tomato sauce', allergen: false },
          { name: 'Mozzarella cheese', allergen: true },
          { name: 'Pepperoni', allergen: false },
          { name: 'Pizza dough', allergen: true }
        ],
        preparationTime: 15,
        rating: { average: 4.7, count: 38 }
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan and croutons',
        restaurant: restaurants[0]._id,
        category: 'salad',
        price: 8.99,
        images: [{ url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', alt: 'Caesar Salad' }],
        ingredients: [
          { name: 'Romaine lettuce', allergen: false },
          { name: 'Parmesan cheese', allergen: true },
          { name: 'Croutons', allergen: true },
          { name: 'Caesar dressing', allergen: true }
        ],
        dietary: ['vegetarian'],
        preparationTime: 10,
        rating: { average: 4.5, count: 22 }
      },
      // Burger Junction items
      {
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
        restaurant: restaurants[1]._id,
        category: 'burger',
        price: 11.99,
        images: [{ url: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg', alt: 'Classic Cheeseburger' }],
        ingredients: [
          { name: 'Beef patty', allergen: false },
          { name: 'Cheese', allergen: true },
          { name: 'Lettuce', allergen: false },
          { name: 'Tomato', allergen: false },
          { name: 'Burger bun', allergen: true }
        ],
        preparationTime: 12,
        rating: { average: 4.6, count: 31 },
        isPopular: true
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with fresh vegetables',
        restaurant: restaurants[1]._id,
        category: 'burger',
        price: 9.99,
        images: [{ url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', alt: 'Chicken Burger' }],
        ingredients: [
          { name: 'Chicken breast', allergen: false },
          { name: 'Lettuce', allergen: false },
          { name: 'Tomato', allergen: false },
          { name: 'Burger bun', allergen: true }
        ],
        preparationTime: 12,
        rating: { average: 4.4, count: 28 }
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        restaurant: restaurants[1]._id,
        category: 'side',
        price: 4.99,
        images: [{ url: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg', alt: 'French Fries' }],
        ingredients: [
          { name: 'Potatoes', allergen: false },
          { name: 'Sea salt', allergen: false },
          { name: 'Vegetable oil', allergen: false }
        ],
        dietary: ['vegetarian', 'vegan'],
        preparationTime: 8,
        rating: { average: 4.3, count: 19 }
      }
    ]);

    console.log('🍕 Created menu items');

    // Create sample orders
    const orders = await Order.create([
      {
        customer: users[0]._id,
        restaurant: restaurants[0]._id,
        items: [
          {
            menuItem: menuItems[0]._id,
            name: 'Margherita Pizza',
            price: 12.99,
            quantity: 1,
            subtotal: 12.99
          },
          {
            menuItem: menuItems[2]._id,
            name: 'Caesar Salad',
            price: 8.99,
            quantity: 1,
            subtotal: 8.99
          }
        ],
        pricing: {
          subtotal: 21.98,
          tax: 1.76,
          deliveryFee: 0,
          total: 23.74
        },
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        contactInfo: {
          phone: '+1234567890',
          email: 'john@example.com'
        },
        status: 'delivered',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        actualDeliveryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        rating: {
          food: 5,
          delivery: 4,
          overall: 5,
          comment: 'Excellent food and fast delivery!',
          ratedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      }
    ]);

    console.log('📦 Created sample orders');

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample login credentials:');
    console.log('Customer: john@example.com / password123');
    console.log('Restaurant: mario@pizzapalace.com / password123');
    console.log('Admin: admin@foodieexpress.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();