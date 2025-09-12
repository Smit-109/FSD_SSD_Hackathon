import { addBook, getAllBooks, getBookByID, getBooksByCategory, getBooksBySearch } from "../controllers/books.controllers.js";
import express from "express";
import { dynamicUpload } from "../middlewares/multer.middleware.js";
import { protect, adminOnly, requireVerification } from "../middlewares/auth.middleware.js";

const booksRouter = new express.Router();

// Public routes
booksRouter.get("/all", getAllBooks);
booksRouter.get("/category/:category", getBooksByCategory);
booksRouter.get("/search", getBooksBySearch);
booksRouter.get("/book/:id", getBookByID);
booksRouter.get("/:id", getBookByID); // Alternative route for book details

// Protected routes - require authentication and verification (or admin)
booksRouter.post("/add", protect, requireVerification, dynamicUpload.fields([{ name: 'bookCover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), addBook);

export default booksRouter;
