# E-Library System - MERN Stack

A comprehensive digital library management system built with MongoDB, Express.js, React.js, Node.js, and EJS template engine.

## 🌟 Features

### User Features
- **User Registration & Authentication**: Secure user registration and login system
- **Browse Books**: Search and filter books by title, author, category
- **Book Details**: View detailed information about each book
- **Favorites System**: Add books to personal favorites list
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features
- **User Management**: Manage user accounts and verification requests
- **Book Management**: Add, edit, and delete books from the library
- **Category Management**: Organize books by categories
- **Dashboard**: View system statistics and manage content

### Technical Features
- **EJS Template Engine**: Server-side rendering with dynamic content
- **RESTful API**: Clean API endpoints for frontend integration
- **File Upload**: Support for book cover images
- **Session Management**: Secure user sessions
- **Responsive UI**: Modern, mobile-friendly interface
- **Compatible Versions**: Works with Node.js v14+ and NPM v6+

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- NPM (v6.0.0 or higher) 
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SSD_elibrary_system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.sample .env
   
   # Edit .env file with your configuration
   # The default configuration works for local development
   ```

4. **Start the application**
   ```bash
   # Option 1: Use the provided batch file (Windows)
   start-server.bat
   
   # Option 2: Manual start
   cd backend
   npm run dev
   ```

### 🎯 Quick Start (Windows)

Simply double-click `start-server.bat` to automatically:
- Install all dependencies
- Start the backend server with nodemon
- Open the application in your default browser

## 📱 Usage

### Accessing the Application

- **Main Application**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/v1/

### Demo Credentials

#### Admin Account
- **Email**: `admin@library.com`
- **Password**: `admin123`

#### Regular User Account
- **Email**: `user@library.com`
- **Password**: `user123`

### Main Pages

1. **Home Page** (`/`): Welcome page with featured books and statistics
2. **Browse Books** (`/books`): Search and filter through the book collection
3. **Login** (`/auth/login`): User authentication
4. **Register** (`/auth/register`): New user registration
5. **Admin Panel** (`/admin`): Administrative functions (admin only)

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **EJS**: Template engine for server-side rendering
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Nodemon**: Development server with auto-restart

### Frontend (Integrated with EJS)
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icons
- **Vanilla JavaScript**: Client-side interactions

### Authentication & Security
- **Express Session**: Session management
- **bcryptjs**: Password hashing
- **JSON Web Tokens**: API authentication
- **Express Validator**: Input validation

## 📁 Project Structure

```
SSD_elibrary_system/
├── backend/
│   ├── config/
│   │   └── config.js              # Database configuration
│   ├── controllers/
│   │   ├── auth.controllers.js    # Authentication logic
│   │   ├── books.controllers.js   # Book management logic
│   │   └── categories.controllers.js
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Authentication middleware
│   │   ├── multer.middleware.js   # File upload handling
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── user.models.js         # User database schema
│   │   ├── books.models.js        # Books database schema
│   │   └── categories.models.js
│   ├── routes/
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── books.routes.js        # Book API routes
│   │   ├── categories.routes.js
│   │   └── web.routes.js          # EJS page routes
│   ├── views/
│   │   ├── partials/
│   │   │   ├── header.ejs         # Common header
│   │   │   └── footer.ejs         # Common footer
│   │   ├── index.ejs              # Home page
│   │   ├── login.ejs              # Login page
│   │   ├── register.ejs           # Registration page
│   │   ├── books.ejs              # Books listing page
│   │   └── error.ejs              # Error page
│   ├── public/                    # Static files
│   ├── utils/
│   │   └── imagekit.js            # Image upload utility
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Main server file
├── src/                           # React components (optional)
├── start-server.bat               # Windows startup script
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=elibrary_db

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-secure-session-secret

# JWT Configuration (for API)
JWT_SECRET=your-jwt-secret-key

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ImageKit Configuration (for image uploads)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Books
- `GET /api/v1/books` - Get all books
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books` - Add new book (admin)
- `PUT /api/v1/books/:id` - Update book (admin)
- `DELETE /api/v1/books/:id` - Delete book (admin)

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Add new category (admin)

## 🎨 UI Customization

The application uses a completely custom UI design with:
- **Unique Color Scheme**: Custom CSS variables for consistent theming
- **Original Layout**: No templates from online sources
- **Responsive Design**: Mobile-first approach
- **Modern Animations**: Smooth transitions and hover effects
- **Bootstrap 5**: For responsive grid and components
- **Font Awesome**: For consistent iconography

### Key Design Features
- Gradient backgrounds
- Card-based layouts
- Custom button styles
- Animated elements
- Professional color palette
- Accessible design principles

## 🚀 Deployment

### Local Development
```bash
cd backend
npm run dev
```

### Production
```bash
cd backend
npm run prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) section
2. Create a new issue with detailed information
3. Contact support at: support@digitallibrary.com

## 📞 Contact

- **Developer**: Your Name
- **Email**: developer@digitallibrary.com
- **GitHub**: https://github.com/your-username

---

**Happy Reading! 📚**