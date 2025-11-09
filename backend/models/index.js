import mongoose from 'mongoose';

// Import all models to ensure they're registered
import User from './user.models.js';
import Book from './books.models.js';
import Category from './categories.models.js';
import Borrowing from './borrowing.models.js';
import Reservation from './reservation.models.js';
import ReadingSession from './readingSession.models.js';
import Notification from './notification.models.js';
import AuditLog from './auditLog.models.js';
import PopularBook from './popularBooks.models.js';

// Database connection with retry logic
const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Use MONGODB_URI directly as it already includes the database name
            const mongoURI = process.env.MONGODB_URI;
            
            const conn = await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                heartbeatFrequencyMS: 2000, // Check connection every 2s
            });

            console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
            
            // Log database statistics
            const stats = await mongoose.connection.db.stats();
            console.log(`Database Stats: ${stats.collections} collections, ${stats.objects} documents`);
            
            return conn;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
            
            if (i === retries - 1) {
                console.error('All MongoDB connection attempts failed. Exiting...');
                process.exit(1);
            }
            
            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, i) * 1000;
            console.log(`Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Graceful shutdown
const gracefulShutdown = () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon restarts

// Database seeding function
const seedDatabase = async () => {
    try {
        // Check if admin user exists
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            console.log('Seeding admin user...');
            
            const adminUser = new User({
                fullName: 'System Administrator',
                email: 'admin@library.com',
                password: 'admin123',
                role: 'admin',
                isVerified: true,
                isActive: true,
                membershipType: 'lifetime'
            });
            
            await adminUser.save();
            console.log('Admin user created successfully');
        }
        
        // Check if demo user exists
        const demoUserExists = await User.findOne({ email: 'user@library.com' });
        
        if (!demoUserExists) {
            console.log('Seeding demo user...');
            
            const demoUser = new User({
                fullName: 'Demo User',
                email: 'user@library.com',
                password: 'user123',
                role: 'user',
                isVerified: true,
                isActive: true,
                membershipType: 'basic'
            });
            
            await demoUser.save();
            console.log('Demo user created successfully');
        }
        
        // Check if default categories exist
        const categoryCount = await Category.countDocuments();
        
        if (categoryCount === 0) {
            console.log('Seeding default categories...');
            
            const defaultCategories = [
                { name: 'Fiction', description: 'Fictional books and novels', icon: 'fas fa-book-open', color: '#e74c3c', createdBy: null },
                { name: 'Non-Fiction', description: 'Educational and factual books', icon: 'fas fa-graduation-cap', color: '#3498db', createdBy: null },
                { name: 'Science', description: 'Scientific and research books', icon: 'fas fa-microscope', color: '#2ecc71', createdBy: null },
                { name: 'Technology', description: 'Technology and programming books', icon: 'fas fa-laptop-code', color: '#9b59b6', createdBy: null },
                { name: 'History', description: 'Historical books and biographies', icon: 'fas fa-landmark', color: '#f39c12', createdBy: null },
                { name: 'Romance', description: 'Romance and love stories', icon: 'fas fa-heart', color: '#e91e63', createdBy: null },
                { name: 'Mystery', description: 'Mystery and thriller books', icon: 'fas fa-user-secret', color: '#34495e', createdBy: null },
                { name: 'Fantasy', description: 'Fantasy and magical books', icon: 'fas fa-magic', color: '#8e44ad', createdBy: null }
            ];
            
            // Find admin user to set as creator
            const admin = await User.findOne({ role: 'admin' });
            
            for (let categoryData of defaultCategories) {
                categoryData.createdBy = admin._id;
                const category = new Category(categoryData);
                await category.save();
            }
            
            console.log('Default categories created successfully');
        }
        
        console.log('Database seeding completed!');
        
    } catch (error) {
        console.error('Database seeding failed:', error);
    }
};

// Export models and functions
export {
    connectDB,
    seedDatabase,
    User,
    Book,
    Category,
    Borrowing,
    Reservation,
    ReadingSession,
    Notification,
    AuditLog,
    PopularBook
};

export default {
    connectDB,
    seedDatabase,
    models: {
        User,
        Book,
        Category,
        Borrowing,
        Reservation,
        ReadingSession,
        Notification,
        AuditLog,
        PopularBook
    }
};