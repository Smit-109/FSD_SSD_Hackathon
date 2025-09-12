# Modern E-Library System Setup Guide

This is a comprehensive MERN stack e-library system with user authentication, admin management, and modern UI design.

## 🚀 Features

### Core Features
- **User Authentication**: Registration, login, and JWT-based authentication
- **Admin Panel**: User management, verification, and book request handling
- **Book Management**: Add, browse, search, and categorize books
- **User Features**: Favorites, reading history, book access requests
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Mobile Responsive**: Works perfectly on all devices

### User Roles
- **Regular Users**: Can browse books, request access, manage favorites
- **Verified Users**: Can add new books and access all features
- **Admins**: Full system access, user verification, request management

## 📋 Prerequisites

Make sure you have the following installed:
- **Node.js** (v18.0.0 or higher) ✅ You have v24.3.0
- **npm** (v9.0.0 or higher) ✅ You have v11.4.2
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** (for version control)

## 🛠️ Installation Steps

### 1. Clone and Navigate to Project
```bash
cd d:\Online-Library-System-main\Online-Library-System-main
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Environment Configuration

#### Backend Environment (.env in backend folder):
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=modern_e_library

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex-12345

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ImageKit Configuration (Optional)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imageio.com/your-imagekit-id

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env in root folder):
```env
# Frontend Configuration
VITE_BASE_URL=http://localhost:5000
VITE_APP_NAME=Modern E-Library System
```

### 5. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   ```

### 6. Create Admin User (Important!)

After starting the application, you'll need to create an admin user:

1. Register a new user through the UI
2. Go to MongoDB and find your user in the `users` collection
3. Update the user document to set:
   ```json
   {
     "role": "admin",
     "isVerified": true
   }
   ```

Or use MongoDB Compass/Shell:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { 
      role: "admin", 
      isVerified: true 
    } 
  }
)
```

## 🚀 Running the Application

### Development Mode

#### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
```
Server will start on: http://localhost:5000

#### Terminal 2 - Frontend Development Server:
```bash
npm run dev
```
Frontend will start on: http://localhost:5173

### Production Mode

#### Build Frontend:
```bash
npm run build
```

#### Start Backend:
```bash
cd backend
npm run prod
```

## 📱 Application Access

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/api/health

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Admin Routes
- `GET /api/v1/auth/users` - Get all users (Admin only)
- `PUT /api/v1/auth/verify-user/:userId` - Verify user (Admin only)
- `PUT /api/v1/auth/manage-request` - Approve/reject book requests (Admin only)

### Books
- `GET /api/v1/books/all` - Get all books
- `POST /api/v1/books` - Add new book
- `GET /api/v1/books/:id` - Get book by ID

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Add new category

## 👥 User Roles & Permissions

### Guest Users
- Browse books
- View book details
- Register/Login

### Registered Users
- All guest permissions
- Add to favorites
- Request book access
- View profile

### Verified Users
- All registered user permissions
- Add new books
- Full library access

### Admin Users
- All permissions
- User management
- Verify users
- Manage book requests
- System administration

## 🎨 UI Features

### Modern Design Elements
- **Gradient backgrounds** and glass morphism effects
- **Smooth animations** with Framer Motion
- **Responsive grid layouts** for all screen sizes
- **Interactive components** with hover effects
- **Toast notifications** for user feedback
- **Loading states** and skeletons
- **Modern typography** with Inter and Playfair Display fonts

### Color Scheme
- **Primary**: Blue shades for main actions
- **Secondary**: Yellow/Orange for accents
- **Dark**: Slate colors for text
- **Success**: Green for positive actions
- **Error**: Red for warnings/errors

## 🛡️ Security Features

- **JWT Authentication** with secure tokens
- **Password hashing** with bcryptjs
- **Input validation** on both frontend and backend
- **Protected routes** with role-based access
- **CORS configuration** for API security
- **Environment variables** for sensitive data

## 📱 Mobile Responsiveness

The application is fully responsive with:
- **Mobile-first design** approach
- **Hamburger menu** for mobile navigation
- **Touch-friendly** buttons and interactions
- **Optimized layouts** for tablets and phones
- **Responsive images** and cards

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify connection string in .env
   - Check database name

2. **Frontend/Backend Connection Issues**:
   - Verify VITE_BASE_URL in frontend .env
   - Check CORS settings in backend
   - Ensure both servers are running

3. **Authentication Issues**:
   - Check JWT_SECRET in backend .env
   - Clear browser localStorage
   - Verify token expiration

4. **Dependencies Issues**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Port Conflicts
If ports 5000 or 5173 are in use:

**Backend (change in backend/.env)**:
```env
PORT=5001
```

**Frontend (change in .env)**:
```env
VITE_BASE_URL=http://localhost:5001
```

## 📚 Project Structure

```
modern-e-library-system/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── pages/              # Page components
│   ├── utils/              # Utilities and store
│   └── assets/             # Static assets
├── backend/
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   └── utils/             # Backend utilities
├── public/                # Static files
└── ...config files
```

## 🤝 Support

If you encounter any issues:

1. Check this README for solutions
2. Verify all environment variables
3. Ensure all dependencies are installed
4. Check console for error messages
5. Verify MongoDB connection

## 🎉 Success!

Once everything is set up, you should have:
- ✅ A modern, responsive e-library system
- ✅ User authentication and admin panel
- ✅ Book management and favorites
- ✅ Beautiful UI with smooth animations
- ✅ Mobile-friendly design
- ✅ Secure API with proper validation

Happy coding! 🚀📚
