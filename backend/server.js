import "./config/config.js";
import express from "express";
import mongoose from "mongoose";
import booksRouter from "./routes/books.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from 'url';

// Import database connection and models
import { connectDB, seedDatabase } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = ({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://online-library-system-mmj030703.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Main server function
async function startServer() {
    const server = new express();

    // Set EJS as template engine
    server.set('view engine', 'ejs');
    server.set('views', path.join(__dirname, 'views'));

    // Serve static files
    server.use(express.static(path.join(__dirname, 'public')));

    // Connect to database with retry logic
    await connectDB();

server.use(cors(corsOptions));
server.use(bodyParser.json({ limit: "16kb" }));
server.use(bodyParser.urlencoded({ extended: true, limit: "16kb" }));
server.use(express.json({ limit: "16kb" }));
server.use(express.urlencoded({ extended: true, limit: "16kb" }));
server.use(cookieParser());

// Session configuration with security settings
server.use(session({
    secret: process.env.SESSION_SECRET || 'elibrary-secret-key-2024',
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevent XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // CSRF protection
    },
    name: 'elibrary.session', // Change session name from default
    rolling: true // Reset expiration on activity
}));

// Error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Seed database with initial data
await seedDatabase();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📚 E-Library System is ready!`);
});

// Health check route
server.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running successfully',
        timestamp: new Date().toISOString()
    });
});

    // Import web routes
    const webRouter = await import("./routes/web.routes.js");
    const fileRouter = await import("./routes/files.routes.js");

    // Web routes (EJS pages) - Mount before API routes
    server.use("/", webRouter.default);

    // File serving routes
    server.use("/files", fileRouter.default);

    // API Routes
    server.use("/api/v1/auth", authRouter);
    server.use("/api/v1/books", booksRouter);
    server.use("/api/v1/categories", categoriesRouter);
}

// Start the server
startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});