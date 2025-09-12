import "./config/config.js";
import express from "express";
import mongoose from "mongoose";
import booksRouter from "./routes/books.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

// Import database connection and models
import { connectDB } from './models/index.js';

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

    // Serve static files
    server.use('/public', express.static(path.join(__dirname, 'public')));
    server.use('/static', express.static(path.join(__dirname, 'public')));
    server.use('/uploads', express.static(path.join(__dirname, 'public/books')));

    // Connect to database with retry logic
    await connectDB();

    server.use(cors(corsOptions));
    server.use(bodyParser.json({ limit: "16kb" }));
    server.use(bodyParser.urlencoded({ extended: true, limit: "16kb" }));
    server.use(express.json({ limit: "16kb" }));
    server.use(cookieParser());

    // Error handling middleware
    server.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    });

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
        console.log(`E-Library API is running on port ${PORT}`);
    });

    // Mount API routes
    server.use("/api/v1/books", booksRouter);
    server.use("/api/v1/categories", categoriesRouter);
    server.use("/api/v1/auth", authRouter);

    // Not found handler
    server.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    });
}

// Start the server
startServer().catch(error => {
    console.error(' Failed to start server:', error);
    process.exit(1);
});