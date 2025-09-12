import mongoose from "mongoose";
import Book from "../models/books.models.js";
import { uploadImage } from "../utils/imagekit.js";

export async function addBook(req, res) {
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

        // Check required fields
        if ([title, author, description, category, releasedYear].some(item => !item || item.trim() === "")) {
            return res.status(400).json({ 
                success: false,
                errorCode: "FIELDS_MISSING", 
                message: "Required fields are missing!" 
            });
        }

        const image = req.file;

        if (!image) {
            return res.status(400).json({ 
                success: false,
                errorCode: "IMAGE_MISSING", 
                message: "Book Cover Image is missing!" 
            });
        }

        let imageSrc;

        try {
            // Upload to ImageKit
            imageSrc = await uploadImage(image.path);
        } catch (error) {
            return res.status(400).json({ 
                success: false,
                error: error.message || error, 
                errorCode: "IMAGEKIT_UPLOAD_ERROR", 
                message: "An error occurred while uploading image to imagekit!" 
            });
        }

        // Parse tags if provided as string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        }

        const book = await Book.create({
            title,
            author,
            description,
            category,
            releasedYear,
            imageSrc,
            rating: rating ? parseFloat(rating) : 0,
            country: country || 'Unknown',
            isbn,
            pageCount: pageCount ? parseInt(pageCount) : undefined,
            language: language || 'English',
            publisher,
            tags: parsedTags,
            addedBy: req.user.id
        });

        if (!book) {
            return res.status(400).json({ 
                success: false,
                errorCode: "ADD_BOOK_ERROR", 
                message: "An error occurred while adding book!" 
            });
        }

        // Populate addedBy field
        await book.populate('addedBy', 'fullName email');

        res.status(201).json({ 
            success: true,
            message: "Book added successfully",
            data: book 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "ADD_BOOK_ERROR", 
            message: "An error occurred while adding book!" 
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
            .populate('addedBy', 'fullName email')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Book.countDocuments(query);

        res.status(200).json({ 
            success: true,
            data: books,
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