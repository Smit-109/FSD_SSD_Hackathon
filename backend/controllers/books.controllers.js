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
                pdfPath: pdfSrc,
                pdfSrc: pdfSrc
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
            author: book.author?.primary,
            category: book.category?.name || book.genre,
            imageSrc: book.files?.coverImage || null,
            description: book.description?.short,
            rating: book.rating?.average || 0,
            files: {
                coverImage: book.files?.coverImage || null,
                pdf: book.files?.pdfPath || book.files?.pdfSrc || null
            }
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

    const book = await Book.findById(bookId)
      .populate('category', 'name')
      .populate('metadata.addedBy', 'fullName email');

    if (!book) {
      return res.status(404).json({ 
        success: false,
        errorCode: "BOOK_NOT_FOUND", 
        message: "Book not found!" 
      });
    }

    // Increment view count
    await book.incrementViewCount();

    // Format book data for frontend
    const formattedBook = {
      _id: book._id,
      title: book.title,
      author: book.author?.primary,
      description: book.description?.full || book.description?.short,
      category: book.category?.name || book.genre,
      imageSrc: book.files?.coverImage || null,
      files: {
        coverImage: book.files?.coverImage || null,
        pdf: book.files?.pdfPath || book.files?.pdfSrc || null
      },
      rating: book.rating?.average || 0,
      releasedYear: book.publishingInfo?.year,
      publisher: book.publishingInfo?.publisher,
      pageCount: book.physicalInfo?.pageCount,
      language: book.physicalInfo?.language,
      addedBy: book.metadata?.addedBy,
      tags: book.metadata?.tags,
      viewCount: book.statistics?.viewCount,
      downloadCount: book.statistics?.downloadCount,
      isbn: book.metadata?.isbn,
      country: book.publishingInfo?.country
    };

    return res.status(200).json({ 
      success: true, 
      data: formattedBook 
    });
  } catch (error) {
    console.error("Get book by ID error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message || error, 
      errorCode: "GET_BOOK_BY_ID_ERROR", 
      message: "Something went wrong!" 
    });
  }
}

export async function updateBook(req, res) {
    const { id: bookId } = req.params;
    const uploadedFiles = [];

    try {
        // Validate book existence
        const existingBook = await Book.findById(bookId).populate('category');
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Extract form data
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
            publisher
        } = req.body;

        // Log received data for debugging
        console.log('Update book request body:', req.body);
        console.log('Update book files:', req.files);

        // Validate required fields - handle both string and non-string values
        const requiredFields = { title, author, description, category, releasedYear };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => {
                if (value === null || value === undefined) return true;
                if (typeof value === 'string' && value.trim() === "") return true;
                return false;
            })
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                errorCode: "FIELDS_MISSING",
                message: `Required fields missing: ${missingFields.join(', ')}`
            });
        }

        // Handle file updates - only update fields that are provided
        let updates = {};
        
        if (title) updates.title = title;
        if (author) updates['author.primary'] = author;
        if (description) {
            updates['description.short'] = description;
            updates['description.full'] = description;
        }
        if (releasedYear) {
            const year = parseInt(releasedYear);
            if (!isNaN(year)) {
                updates['publishingInfo.year'] = year;
            }
        }
        if (country) updates['publishingInfo.country'] = country;
        if (publisher) updates['publishingInfo.publisher'] = publisher;
        if (isbn) updates['metadata.isbn'] = isbn;
        if (pageCount) {
            const pages = parseInt(pageCount);
            if (!isNaN(pages) && pages > 0) {
                updates['physicalInfo.pageCount'] = pages;
            }
        }
        if (language) updates['physicalInfo.language'] = language;
        if (rating !== undefined && rating !== null && rating !== '') {
            const ratingValue = parseFloat(rating);
            if (!isNaN(ratingValue)) {
                updates['rating.average'] = ratingValue;
            }
        }

        // Handle category update - normalize category name for comparison
        if (category) {
            const categoryName = typeof category === 'string' ? category.trim().toLowerCase() : category;
            const existingCategoryName = existingBook.category?.name?.toLowerCase() || existingBook.genre?.toLowerCase();
            
            // Always update category if provided (even if same, to ensure consistency)
            let categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
            });

            if (!categoryDoc) {
                categoryDoc = await Category.create({
                    name: categoryName,
                    slug: categoryName.replace(/\s+/g, '-')
                });
            }

            updates.category = categoryDoc._id;
            updates.genre = categoryName;
        }

        // Handle file uploads
        if (req.files?.bookCover?.[0]) {
            const bookCover = req.files.bookCover[0];
            const coverPath = `/books/covers/${bookCover.filename}`;
            const imageSrc = `/public${coverPath}`;
            updates['files.coverImage'] = imageSrc;
            uploadedFiles.push(bookCover.path);

            // Delete old cover if exists
            if (existingBook.files?.coverImage) {
                try {
                    const oldPath = existingBook.files.coverImage.replace('/public', '');
                    await deleteFile(oldPath);
                } catch (error) {
                    console.error("Error deleting old cover:", error);
                }
            }
        }

        if (req.files?.pdf?.[0]) {
            const pdf = req.files.pdf[0];
            const pdfPath = `/books/pdfs/${pdf.filename}`;
            const pdfSrc = `/public${pdfPath}`;
            updates['files.pdfPath'] = pdfSrc;
            updates['files.pdfSrc'] = pdfSrc;
            uploadedFiles.push(pdf.path);

            // Delete old PDF if exists
            if (existingBook.files?.pdfPath || existingBook.files?.pdfSrc) {
                try {
                    const oldPath = (existingBook.files?.pdfPath || existingBook.files?.pdfSrc).replace('/public', '');
                    await deleteFile(oldPath);
                } catch (error) {
                    console.error("Error deleting old PDF:", error);
                }
            }
        }

        // Check if there are any updates to apply
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        console.log('Applying updates:', updates);

        // Update book
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $set: updates },
            { 
                new: true,
                runValidators: true
            }
        ).populate('category');

        if (!updatedBook) {
            // Clean up uploaded files if update fails
            for (const filePath of uploadedFiles) {
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    console.error("Error cleaning up file:", error);
                }
            }

            throw new Error("Failed to update book");
        }

        console.log('Book updated successfully:', updatedBook._id);

        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: updatedBook
        });

    } catch (error) {
        // Clean up any uploaded files
        for (const filePath of uploadedFiles) {
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error("Error cleaning up file:", err);
            }
        }

        console.error("Error updating book:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update book"
        });
    }
}export async function deleteBook(req, res) {
    try {
        const { id: bookId } = req.params;

        // Validate book ID
        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({ 
                success: false,
                errorCode: "MONGODB_ID_ERROR", 
                message: "Provided book id is an invalid mongodb id!" 
            });
        }

        // Find and delete the book
        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            return res.status(404).json({ 
                success: false,
                errorCode: "BOOK_NOT_FOUND", 
                message: "Book not found!" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Book deleted successfully",
            data: deletedBook
        });
    } catch (error) {
        console.error("Delete book error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "DELETE_BOOK_ERROR", 
            message: "An error occurred while deleting book!" 
        });
    }
}

export async function getBooksByCategory(req, res) {
    try {
        const { category } = req.params;

        if (!category || category.trim() === "") {
            return res.status(400).json({ 
                success: false,
                errorCode: "CATEGORY_MISSING", 
                message: "Category is missing !" 
            });
        }

        const books = await Book.find({
            genre: { $regex: new RegExp(`^${category}$`, 'i') }
        }).populate('category', 'name');

        // Map the books to match frontend expectations
        const mappedBooks = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author?.primary,
            category: book.category?.name || book.genre,
            imageSrc: book.files?.coverImage || null,
            description: book.description?.short,
            rating: book.rating?.average || 0
        }));

        res.status(200).json({ 
            success: true, 
            data: mappedBooks 
        });
    } catch (error) {
        console.error("Get books by category error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "GET_BOOKS_BY_CATEGORY_ERROR", 
            message: "Internal Server Error !" 
        });
    }
}

export async function getBooksBySearch(req, res) {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({ 
                success: false,
                errorCode: "SEARCH_EMPTY", 
                message: "Search query is empty !" 
            });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { 'author.primary': { $regex: q, $options: 'i' } },
                { 'description.short': { $regex: q, $options: 'i' } },
                { 'metadata.tags': { $in: [new RegExp(q, 'i')] } }
            ]
        }).populate('category', 'name');

        // Map the books to match frontend expectations
        const mappedBooks = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author?.primary,
            category: book.category?.name || book.genre,
            imageSrc: book.files?.coverImage || null,
            description: book.description?.short,
            rating: book.rating?.average || 0
        }));

        res.status(200).json({ 
            success: true, 
            data: mappedBooks 
        });
    } catch (error) {
        console.error("Search books error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message || error, 
            errorCode: "SEARCH_BOOKS_ERROR", 
            message: "Internal Server Error !" 
        });
    }
}
