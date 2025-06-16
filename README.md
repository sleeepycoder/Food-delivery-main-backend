# FoodieExpress Backend API

A comprehensive Node.js/Express backend for the FoodieExpress food delivery application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Customer, restaurant owner, and admin roles
- **Restaurant Management**: CRUD operations for restaurants and menus
- **Order Processing**: Complete order lifecycle management
- **Real-time Updates**: Order status tracking and notifications
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Database**: MongoDB with Mongoose ODM

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant (restaurant/admin only)

### Menu Items
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `GET /api/menu/restaurant/:restaurantId` - Get menu by restaurant
- `POST /api/menu` - Create menu item (restaurant/admin only)

### Orders
- `GET /api/orders/my-orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB locally or use MongoDB Atlas**

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment on Render

### Prerequisites
1. **MongoDB Atlas Account**: Set up a free MongoDB Atlas cluster
2. **Render Account**: Sign up at render.com
3. **GitHub Repository**: Push your code to GitHub

### Step-by-Step Deployment

1. **Set up MongoDB Atlas:**
   - Create a free cluster at mongodb.com/atlas
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for Render
   - Get your connection string

2. **Deploy to Render:**
   - Connect your GitHub repository to Render
   - Choose "Web Service"
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `NODE_ENV`: production
     - `FRONTEND_URL`: Your frontend domain

3. **Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodie-express
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Deploy and Test:**
   - Render will automatically deploy your app
   - Test the health endpoint: `https://your-app.onrender.com/api/health`
   - Seed the database if needed

### Post-Deployment

1. **Seed Production Database:**
   ```bash
   # Run this once after deployment
   node scripts/seedData.js
   ```

2. **Update Frontend API URL:**
   - Update your frontend to point to the Render URL
   - Update CORS settings if needed

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevents abuse
- **CORS**: Cross-origin resource sharing
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express-validator for request validation
- **Password Hashing**: bcryptjs for secure password storage

## 📊 Sample Data

The seed script creates:
- Sample users (customer, restaurant owner, admin)
- Two restaurants (Pizza Palace, Burger Junction)
- Various menu items
- Sample orders

### Test Credentials
- **Customer**: john@example.com / password123
- **Restaurant**: mario@pizzapalace.com / password123
- **Admin**: admin@foodieexpress.com / password123

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check your MONGODB_URI
   - Ensure IP whitelist includes 0.0.0.0/0
   - Verify database user credentials

2. **CORS Issues:**
   - Update FRONTEND_URL in environment variables
   - Check CORS configuration in server.js

3. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token format in requests

## 📝 License

MIT License - see LICENSE file for details