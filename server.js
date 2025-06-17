const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://your-frontend-domain.com',
    // Add any other frontend domains you might deploy to
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.surge\.sh$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/restaurants', require('./routes/restaurants'))
app.use('/api/orders', require('./routes/orders'))

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    res.json({
      success: true,
      message: 'FoodieExpress Backend is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FoodieExpress API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      auth_register: '/api/auth/register',
      auth_login: '/api/auth/login',
      menu: '/api/menu',
      restaurants: '/api/restaurants',
      orders: '/api/orders'
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/auth', '/api/menu', '/api/restaurants', '/api/orders']
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// MongoDB connection with modern options only
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...')
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    
    // Modern connection options - removed all deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    
    // Test the connection
    await mongoose.connection.db.admin().ping()
    console.log('MongoDB ping successful')
    
  } catch (error) {
    console.error('MongoDB connection error:', error)
    
    // Don't exit in production, let Render restart the service
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  }
}

// Connect to database
connectDB()

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})