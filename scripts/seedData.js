const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Restaurant = require('../models/Restaurant')
const MenuItem = require('../models/MenuItem')

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Restaurant.deleteMany({})
    await MenuItem.deleteMany({})
    console.log('Cleared existing data')

    // Create sample restaurant
    const restaurant = new Restaurant({
      name: 'FoodieExpress Kitchen',
      description: 'Delicious food made with love and fresh ingredients',
      cuisine: ['American', 'Italian', 'Mexican'],
      address: {
        street: '123 Food Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      },
      contact: {
        phone: '+1-555-123-4567',
        email: 'info@foodieexpress.com',
        website: 'https://foodieexpress.com'
      },
      images: [{
        url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
        alt: 'Restaurant interior'
      }],
      rating: {
        average: 4.5,
        count: 150
      },
      deliveryInfo: {
        fee: 2.99,
        minimumOrder: 15,
        estimatedTime: 30,
        radius: 5
      },
      operatingHours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      }
    })

    await restaurant.save()
    console.log('Created sample restaurant')

    // Create sample menu items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella cheese, and basil on a crispy crust',
        price: 12.99,
        category: 'pizza',
        images: [{
          url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Margherita Pizza'
        }],
        restaurant: restaurant._id,
        isPopular: true,
        preparationTime: 20,
        rating: { average: 4.8, count: 45 }
      },
      {
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
        price: 9.99,
        category: 'burger',
        images: [{
          url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Classic Cheeseburger'
        }],
        restaurant: restaurant._id,
        isPopular: true,
        preparationTime: 15,
        rating: { average: 4.6, count: 32 }
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing',
        price: 8.99,
        category: 'salad',
        images: [{
          url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Caesar Salad'
        }],
        restaurant: restaurant._id,
        preparationTime: 10,
        rating: { average: 4.5, count: 28 }
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella cheese on our signature crust',
        price: 14.99,
        category: 'pizza',
        images: [{
          url: 'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Pepperoni Pizza'
        }],
        restaurant: restaurant._id,
        preparationTime: 20,
        rating: { average: 4.7, count: 38 }
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy chicken wings with your choice of sauce',
        price: 11.99,
        category: 'appetizer',
        images: [{
          url: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Chicken Wings'
        }],
        restaurant: restaurant._id,
        preparationTime: 18,
        rating: { average: 4.4, count: 25 }
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie served warm with vanilla ice cream',
        price: 6.99,
        category: 'dessert',
        images: [{
          url: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Chocolate Brownie'
        }],
        restaurant: restaurant._id,
        preparationTime: 5,
        rating: { average: 4.9, count: 42 }
      },
      {
        name: 'Fresh Lemonade',
        description: 'Freshly squeezed lemonade with a hint of mint',
        price: 3.99,
        category: 'beverage',
        images: [{
          url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'Fresh Lemonade'
        }],
        restaurant: restaurant._id,
        preparationTime: 3,
        rating: { average: 4.3, count: 18 }
      },
      {
        name: 'BBQ Bacon Burger',
        description: 'Beef patty with BBQ sauce, bacon, onion rings, and cheddar cheese',
        price: 12.99,
        category: 'burger',
        images: [{
          url: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt: 'BBQ Bacon Burger'
        }],
        restaurant: restaurant._id,
        preparationTime: 18,
        rating: { average: 4.8, count: 35 }
      }
    ]

    await MenuItem.insertMany(menuItems)
    console.log('Created sample menu items')

    console.log('Seed data created successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Seed data error:', error)
    process.exit(1)
  }
}

seedData()