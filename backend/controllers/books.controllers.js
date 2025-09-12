import mongoose from "mongoose";
import Book from "../models/books.models.js";
import Category from "../models/categories.models.js";
import { storeFile, deleteFile } from "../utils/fileStorage.js";

import fs from 'fs/promises';

export async function addBook(req, res) {
    const uploadedFiles = [];
    try {
        const { 
            title, 
            author, 
            description, 
            category, 
            releasedYear, 
            rating, 
            country,
            isbn,
            pageCount,
            language,
            publisher,
            tags
        } = req.body;

        // Validate required fields
        const requiredFields = { title, author, description, category, releasedYear };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value || value.trim() === "")
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false,
                errorCode: "FIELDS_MISSING", 
                message: `Required fields missing: ${missingFields.join(', ')}` 
            });
        }

        // Validate files
        if (!req.files?.bookCover?.[0] || !req.files?.pdf?.[0]) {
            return res.status(400).json({
                success: false,
                errorCode: "FILES_MISSING",
                message: "Both book cover and PDF files are required!"
            });
        }

        const bookCover = req.files.bookCover[0];
        const pdf = req.files.pdf[0];

        // Calculate relative paths for storage
        const coverPath = `/books/covers/${bookCover.filename}`;
        const pdfPath = `/books/pdfs/${pdf.filename}`;
        
        // Add /public prefix for static file serving
        const imageSrc = `/public${coverPath}`;
        const pdfSrc = `/public${pdfPath}`;

        // Parse tags if provided as string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }

        // Find or create the category
        let categoryDoc = await Category.findOne({ 
            name: { $regex: new RegExp(`^${category}$`, 'i') } 
        });

        if (!categoryDoc) {
            categoryDoc = await Category.create({
                name: category,
                slug: category.toLowerCase().replace(/\s+/g, '-')
            });
        }

        const book = await Book.create({
            title,
            author: {
                primary: author,
            },
            description: {
                short: description,
            },
            category: categoryDoc._id,
            genre: category,
            publishingInfo: {
                publisher,
                country: country || 'Unknown',
                year: parseInt(releasedYear)
            },
            physicalInfo: {
                pageCount: pageCount ? parseInt(pageCount) : undefined,
                language: language || 'English',
            },
            files: {
                coverImage: imageSrc,
                pdf: pdfSrc
            },
            rating: {
                average: rating ? parseFloat(rating) : 0,
                count: 0,
                breakdown: {
                    five: 0,
                    four: 0,
                    three: 0,
                    two: 0,
                    one: 0
                }
            },
            metadata: {
                isbn,
                tags: parsedTags,
                addedBy: req.user._id, // Add user ID in metadata
                featured: false,
                newRelease: true
            }
        });

        if (!book) {
            return res.status(400).json({ 
                success: false,
                errorCode: "ADD_BOOK_ERROR", 
                message: "An error occurred while adding book!" 
            });
        }

        // Populate the metadata.addedBy field with user details
        const populatedBook = await Book.findById(book._id).populate('metadata.addedBy', 'fullName email');

        res.status(201).json({ 
            success: true,
            message: "Book added successfully",
            data: populatedBook
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: error.code || "ADD_BOOK_ERROR", 
            message: error.message || "An error occurred while adding book!" 
        });
    }
}

export async function getAllBooks(req, res) {
    try {
        const { page = 1, limit = 12, category, search, sort = 'createdAt' } = req.query;
        
        // Build query object
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sort options
        let sortOption = {};
        switch (sort) {
            case 'rating':
                sortOption = { rating: -1 };
                break;
            case 'year':
                sortOption = { releasedYear: -1 };
                break;
            case 'title':
                sortOption = { title: 1 };
                break;
            case 'popular':
                sortOption = { viewCount: -1, downloadCount: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const books = await Book.find(query)
            .populate('category', 'name')
            .populate('metadata.addedBy', 'fullName email')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean()
            .exec();

        // Map the books to match frontend expectations
        const mappedBooks = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author.primary,
            category: book.category?.name || book.genre,
            imageSrc: book.files?.coverImage ? `/public${book.files.coverImage}` : null,
            description: book.description?.short,
            rating: book.rating?.average || 0
        }));

        const total = await Book.countDocuments(query);

        res.status(200).json({ 
            success: true,
            data: mappedBooks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBooks: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "GET_BOOKS_ERROR", 
            message: "Something went wrong!" 
        });
    }
}

export async function getBookByID(req, res) {
    try {
        const { id: bookId } = req.params;

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({ 
                success: false,
                errorCode: "MONGODB_ID_ERROR", 
                message: "Provided book id is an invalid mongodb id!" 
            });
        }

        const book = await Book.findById(bookId).populate('addedBy', 'fullName email');

        if (!book) {
            return res.status(404).json({ 
                success: false,
                errorCode: "BOOK_NOT_FOUND", 
                message: "Book not found!" 
            });
        }

        // Increment view count
        await book.incrementViewCount();

        return res.status(200).json({ 
            success: true, 
            data: book 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "GET_BOOK_BY_ID_ERROR", 
            message: "Something went wrong!" 
        });
    }
}

export async function getBooksByCategory(req, res) {
    try {
        const { category } = req.params;

        if (category.trim() === "") {
            return res.status(400).json({ errorCode: "CATEGORY_MISSING", message: "Category is missing !" });
        }

        console.log(category)

        const books = await Book.find({
            category
        });

        console.log(books);


        res.status(200).send({ status: "success", data: books });
    } catch (error) {
        return res.status(500).json({ error: error.message || error, errorCode: "GET_BOOKS_BY_CATEGORY", message: "Internal Server Error !" });
    }
}

export async function getBooksBySearch(req, res) {
    try {
        const { q } = req.query;

        if (q.trim() === "") {
            return res.status(400).json({ errorCode: "SEARCH_EMPTY", message: "Search is empty !" });
        }

        const books = await Book.aggregate([
            {
                $search: {
                    index: "books-search",
                    text: {
                        query: q,
                        path: ["title", "author"]
                    }
                }
            },
        ])

        res.status(200).send({ status: "success", data: books });
    } catch (error) {
        return res.status(500).json({ error: error.message || error, errorCode: "GET_BOOKS_BY_CATEGORY", message: "Internal Server Error !" });
    }
}
