import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { uploadBookFiles } from '../middlewares/multer.middleware.js';
import { validateBook } from '../middlewares/validation.middleware.js';
import { validationResult } from 'express-validator';
import Book from '../models/books.models.js';
import Category from '../models/categories.models.js';
import { storeFile, deleteFile } from '../utils/fileStorage.js';

const router = express.Router();

// Edit book route
router.put('/:bookId', protect, adminOnly, uploadBookFiles, validateBook, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    try {
        const bookId = req.params.bookId;
        const files = req.files;
        const {
            title,
            author,
            description,
            category,
            releasedYear,
            rating,
            country,
            publisher,
            isbn,
            pageCount,
            language,
            tags
        } = req.body;

        // Find existing book first
        const existingBook = await Book.findById(bookId).populate('category');
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Build updates object with proper field mapping
        const updates = {};

        // Basic fields
        if (title) updates.title = title;
        if (author) updates['author.primary'] = author;
        if (description) {
            updates['description.short'] = description;
            updates['description.full'] = description;
        }
        if (rating !== undefined) {
            updates['rating.average'] = parseFloat(rating);
        }

        // Publishing info
        if (releasedYear) {
            updates['publishingInfo.year'] = parseInt(releasedYear);
        }
        if (country) updates['publishingInfo.country'] = country;
        if (publisher) updates['publishingInfo.publisher'] = publisher;

        // Physical info
        if (pageCount) updates['physicalInfo.pageCount'] = parseInt(pageCount);
        if (language) updates['physicalInfo.language'] = language;

        // Metadata
        if (isbn) updates['metadata.isbn'] = isbn;
        if (tags) {
            const tagsArray = typeof tags === 'string' 
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : tags;
            updates['metadata.tags'] = tagsArray;
        }

        // Handle category update
        if (category) {
            const categoryName = category.toLowerCase().trim();
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

        // Handle cover image if provided
        if (files?.bookCover) {
            try {
                // Delete old cover image if it exists
                if (existingBook.files?.coverImage) {
                    const oldPath = existingBook.files.coverImage.startsWith('/public')
                        ? existingBook.files.coverImage.replace('/public', '')
                        : existingBook.files.coverImage;
                    await deleteFile(oldPath);
                }
                const imagePath = await storeFile(files.bookCover[0], 'covers');
                updates['files.coverImage'] = imagePath.startsWith('/') ? `/public${imagePath}` : `/public/${imagePath}`;
            } catch (error) {
                console.error('Error handling cover image:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading cover image'
                });
            }
        }

        // Handle PDF file if provided
        if (files?.pdf) {
            try {
                // Delete old PDF if it exists
                if (existingBook.files?.pdf || existingBook.files?.pdfSrc) {
                    const oldPath = (existingBook.files.pdf || existingBook.files.pdfSrc).startsWith('/public')
                        ? (existingBook.files.pdf || existingBook.files.pdfSrc).replace('/public', '')
                        : (existingBook.files.pdf || existingBook.files.pdfSrc);
                    await deleteFile(oldPath);
                }
                const pdfPath = await storeFile(files.pdf[0], 'pdfs');
                updates['files.pdf'] = pdfPath.startsWith('/') ? `/public${pdfPath}` : `/public/${pdfPath}`;
                updates['files.pdfSrc'] = updates['files.pdf'];
            } catch (error) {
                console.error('Error handling PDF file:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading PDF file'
                });
            }
        }

        // Update book in database
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('category');

        if (!updatedBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating book'
        });
    }
});

export default router;