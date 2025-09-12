import express from 'express';
import { requireAuth, preventAuthAccess, requireAdmin } from '../middlewares/auth.middleware.js';
import sessionController from '../controllers/session.controllers.js';

const webRouter = express.Router();

// Middleware to pass user session to views and handle session security
const passUser = (req, res, next) => {
    // Set cache control headers to prevent back button access after logout
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.locals.user = req.session?.user || null;
    next();
};

// Apply user middleware to all routes
webRouter.use(passUser);

// Home page
webRouter.get('/', async (req, res) => {
    try {
        // You can fetch recent books and stats here from your database
        const recentBooks = []; // Fetch from your books model
        const stats = {
            totalBooks: '1000+',
            totalUsers: '500+',
            totalCategories: '25+',
            totalDownloads: '10000+'
        };
        
        res.render('index', { 
            recentBooks, 
            stats, 
            user: req.session?.user 
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).render('error', { 
            error: 'Unable to load home page',
            user: req.session?.user 
        });
    }
});

// Authentication pages (prevent access if already logged in)
webRouter.get('/auth/login', preventAuthAccess, sessionController.showLogin);
webRouter.get('/login', preventAuthAccess, sessionController.showLogin);

webRouter.get('/auth/register', preventAuthAccess, sessionController.showRegister);
webRouter.get('/register', preventAuthAccess, sessionController.showRegister);

// Authentication form handlers
webRouter.post('/auth/login', sessionController.handleLogin);
webRouter.post('/login', sessionController.handleLogin);

webRouter.post('/auth/register', sessionController.handleRegister);
webRouter.post('/register', sessionController.handleRegister);

webRouter.post('/auth/logout', sessionController.handleLogout);
webRouter.post('/logout', sessionController.handleLogout);

// Protected pages
webRouter.get('/dashboard', requireAuth, sessionController.showDashboard);
webRouter.get('/profile', requireAuth, sessionController.showProfile);
webRouter.post('/profile', requireAuth, sessionController.updateProfile);

// Legacy login route (keep for backward compatibility)
webRouter.get('/auth/login-old', preventAuthAccess, (req, res) => {
    res.render('login', { 
        error: req.query.error || null,
        success: req.query.success || null 
    });
});

webRouter.get('/auth/register', preventAuthAccess, (req, res) => {
    res.render('register', { 
        error: req.query.error || null,
        success: req.query.success || null 
    });
});

// Login POST handler
webRouter.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Here you would validate credentials against your database
        // For demo purposes, using hardcoded credentials
        const demoUsers = [
            { email: 'admin@library.com', password: 'admin123', name: 'Admin User', role: 'admin' },
            { email: 'user@library.com', password: 'user123', name: 'Demo User', role: 'user' }
        ];
        
        const user = demoUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            req.session.user = {
                id: Math.random().toString(36).substr(2, 9),
                name: user.name,
                email: user.email,
                role: user.role
            };
            res.redirect('/?success=Login successful');
        } else {
            res.render('login', { 
                error: 'Invalid email or password',
                success: null 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
            error: 'Login failed. Please try again.',
            success: null 
        });
    }
});

// Register POST handler
webRouter.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, terms } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !terms) {
            return res.render('register', { 
                error: 'All required fields must be filled',
                success: null 
            });
        }
        
        if (password !== confirmPassword) {
            return res.render('register', { 
                error: 'Passwords do not match',
                success: null 
            });
        }
        
        if (password.length < 6) {
            return res.render('register', { 
                error: 'Password must be at least 6 characters long',
                success: null 
            });
        }
        
        // Here you would save user to database
        // For demo, just show success message
        res.render('login', { 
            success: 'Registration successful! Please login with your credentials.',
            error: null 
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { 
            error: 'Registration failed. Please try again.',
            success: null 
        });
    }
});

// Logout with proper session cleanup
webRouter.get('/auth/logout', (req, res) => {
    if (req.session) {
        // Clear the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/?error=Logout failed');
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid');
            
            // Set additional headers to prevent caching
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            // Redirect to home page
            res.redirect('/?success=Logged out successfully');
        });
    } else {
        res.redirect('/?success=Already logged out');
    }
});

// Books page
webRouter.get('/books', (req, res) => {
    res.render('books', { 
        books: [], // Fetch from database
        categories: [], // Fetch categories
        user: req.session?.user 
    });
});

// Categories page
webRouter.get('/categories', (req, res) => {
    res.render('categories', { 
        categories: [], // Fetch from database
        user: req.session?.user 
    });
});

// Profile page (protected)
webRouter.get('/profile', requireAuth, (req, res) => {
    res.render('profile', { 
        user: req.session.user 
    });
});

// Favorites page (protected)
webRouter.get('/favorites', requireAuth, (req, res) => {
    res.render('favorites', { 
        user: req.session.user,
        favorites: [] // Fetch user's favorite books from database
    });
});

// Admin panel (protected - admin only)
webRouter.get('/admin', requireAdmin, (req, res) => {
    res.render('admin', { 
        user: req.session.user,
        stats: {
            totalBooks: 150,
            totalUsers: 75,
            totalCategories: 12,
            pendingRequests: 5
        }
    });
});

// Error page
webRouter.get('/error', (req, res) => {
    res.render('error', { 
        error: req.query.message || 'An error occurred',
        user: req.session?.user 
    });
});

// 404 handler
webRouter.get('*', (req, res) => {
    res.status(404).render('error', { 
        error: 'Page not found',
        user: req.session?.user 
    });
});

export default webRouter;