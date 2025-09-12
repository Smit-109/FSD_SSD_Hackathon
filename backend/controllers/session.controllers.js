// Session-based authentication controller for EJS views
import { User, AuditLog } from '../models/index.js';
import bcryptjs from 'bcryptjs';

// Helper function to log user actions
const logUserAction = async (userId, action, details = {}) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details,
            ipAddress: details.ipAddress,
            userAgent: details.userAgent
        });
    } catch (error) {
        console.error('Failed to log user action:', error);
    }
};

// Login page (GET)
export const showLogin = (req, res) => {
    // Redirect if already logged in
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    res.render('login', { 
        title: 'Login - E-Library System',
        error: req.session.error || null,
        success: req.session.success || null
    });
    
    // Clear flash messages
    delete req.session.error;
    delete req.session.success;
};

// Register page (GET)
export const showRegister = (req, res) => {
    // Redirect if already logged in
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    res.render('register', { 
        title: 'Register - E-Library System',
        error: req.session.error || null,
        success: req.session.success || null
    });
    
    // Clear flash messages
    delete req.session.error;
    delete req.session.success;
};

// Handle login (POST)
export const handleLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        // Validate input
        if (!email || !password) {
            req.session.error = 'Email and password are required';
            return res.redirect('/login');
        }
        
        // Find user in database
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!user) {
            req.session.error = 'Invalid credentials';
            return res.redirect('/login');
        }
        
        // Check if user is active
        if (!user.isActive) {
            req.session.error = 'Your account has been deactivated. Please contact support.';
            return res.redirect('/login');
        }
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Log failed login attempt
            await logUserAction(user._id, 'FAILED_LOGIN', {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                reason: 'Invalid password'
            });
            
            req.session.error = 'Invalid credentials';
            return res.redirect('/login');
        }
        
        // Update last login
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();
        
        // Create session
        req.session.user = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            membershipType: user.membershipType,
            isVerified: user.isVerified
        };
        
        // Set session expiry based on remember me
        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        }
        
        // Log successful login
        await logUserAction(user._id, 'LOGIN', {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            rememberMe: !!rememberMe
        });
        
        req.session.success = `Welcome back, ${user.fullName}!`;
        
        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/dashboard');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        req.session.error = 'An error occurred during login. Please try again.';
        res.redirect('/login');
    }
};

// Handle registration (POST)
export const handleRegister = async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            password, 
            confirmPassword, 
            phone, 
            address, 
            dateOfBirth,
            acceptTerms 
        } = req.body;
        
        // Validate input
        if (!fullName || !email || !password || !confirmPassword) {
            req.session.error = 'All required fields must be filled';
            return res.redirect('/register');
        }
        
        if (password !== confirmPassword) {
            req.session.error = 'Passwords do not match';
            return res.redirect('/register');
        }
        
        if (password.length < 6) {
            req.session.error = 'Password must be at least 6 characters long';
            return res.redirect('/register');
        }
        
        if (!acceptTerms) {
            req.session.error = 'You must accept the terms and conditions';
            return res.redirect('/register');
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            req.session.error = 'An account with this email already exists';
            return res.redirect('/register');
        }
        
        // Create new user
        const newUser = new User({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password, // Will be hashed by the model pre-save hook
            phone: phone?.trim(),
            address: address?.trim(),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            role: 'user',
            membershipType: 'basic',
            isVerified: false, // Email verification required
            isActive: true,
            preferences: {
                theme: 'light',
                language: 'en',
                notifications: {
                    email: true,
                    sms: false,
                    push: true
                }
            }
        });
        
        await newUser.save();
        
        // Log registration
        await logUserAction(newUser._id, 'REGISTER', {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            membershipType: 'basic'
        });
        
        // Auto-login after registration
        req.session.user = {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            profilePicture: newUser.profilePicture,
            membershipType: newUser.membershipType,
            isVerified: newUser.isVerified
        };
        
        req.session.success = `Welcome to E-Library, ${newUser.fullName}! Your account has been created successfully.`;
        
        // TODO: Send verification email
        
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            // Duplicate key error
            req.session.error = 'An account with this email already exists';
        } else if (error.name === 'ValidationError') {
            // Mongoose validation error
            const firstError = Object.values(error.errors)[0];
            req.session.error = firstError.message;
        } else {
            req.session.error = 'An error occurred during registration. Please try again.';
        }
        
        res.redirect('/register');
    }
};

// Handle logout (POST)
export const handleLogout = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        
        if (userId) {
            // Log logout action
            await logUserAction(userId, 'LOGOUT', {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
        }
        
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error logging out' 
                });
            }
            
            // Clear session cookie
            res.clearCookie('connect.sid');
            
            // Set cache control headers to prevent back button access
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            
            res.redirect('/');
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging out' 
        });
    }
};

// Dashboard page (GET)
export const showDashboard = async (req, res) => {
    try {
        // Get user with additional data
        const user = await User.findById(req.session.user.id)
            .populate('favoriteBooks')
            .populate('readBooks');
        
        if (!user) {
            req.session.error = 'User not found';
            return res.redirect('/login');
        }
        
        // Get user's reading statistics
        const stats = {
            booksRead: user.readBooks?.length || 0,
            favoriteBooks: user.favoriteBooks?.length || 0,
            currentlyReading: user.currentlyReading?.length || 0,
            totalReadingTime: user.readingStats?.totalMinutes || 0
        };
        
        res.render('dashboard', {
            title: 'Dashboard - E-Library System',
            user: req.session.user,
            stats,
            recentBooks: user.readBooks?.slice(-5) || [],
            success: req.session.success || null,
            error: req.session.error || null
        });
        
        // Clear flash messages
        delete req.session.success;
        delete req.session.error;
        
    } catch (error) {
        console.error('Dashboard error:', error);
        req.session.error = 'Error loading dashboard';
        res.redirect('/');
    }
};

// Profile page (GET)
export const showProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        
        if (!user) {
            req.session.error = 'User not found';
            return res.redirect('/login');
        }
        
        res.render('profile', {
            title: 'Profile - E-Library System',
            user,
            success: req.session.success || null,
            error: req.session.error || null
        });
        
        // Clear flash messages
        delete req.session.success;
        delete req.session.error;
        
    } catch (error) {
        console.error('Profile error:', error);
        req.session.error = 'Error loading profile';
        res.redirect('/dashboard');
    }
};

// Update profile (POST)
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address, dateOfBirth, bio } = req.body;
        
        const user = await User.findById(req.session.user.id);
        
        if (!user) {
            req.session.error = 'User not found';
            return res.redirect('/login');
        }
        
        // Update user fields
        if (fullName) user.fullName = fullName.trim();
        if (phone) user.phone = phone.trim();
        if (address) user.address = address.trim();
        if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
        if (bio) user.bio = bio.trim();
        
        user.updatedAt = new Date();
        
        await user.save();
        
        // Update session
        req.session.user.fullName = user.fullName;
        
        // Log profile update
        await logUserAction(user._id, 'PROFILE_UPDATE', {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            updatedFields: Object.keys(req.body)
        });
        
        req.session.success = 'Profile updated successfully!';
        res.redirect('/profile');
        
    } catch (error) {
        console.error('Profile update error:', error);
        req.session.error = 'Error updating profile';
        res.redirect('/profile');
    }
};

export default {
    showLogin,
    showRegister,
    handleLogin,
    handleRegister,
    handleLogout,
    showDashboard,
    showProfile,
    updateProfile
};