import mongoose from "mongoose";
import PopularBook from "../models/popularBooks.models.js";
import Book from "../models/books.models.js";

export async function addPopularBook(req, res) {
    try {
        const { bookId, reason, description, endDate, displayOrder } = req.body;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const existingPopularBook = await PopularBook.findOne({ book: bookId });
        if (existingPopularBook) {
            return res.status(400).json({
                success: false,
                message: "This book is already added to popular books"
            });
        }

        const popularBook = await PopularBook.create({
            book: bookId,
            reason: reason || 'featured',
            description: description || '',
            endDate: endDate || null,
            displayOrder: displayOrder || 0,
            addedBy: req.user._id
        });

        const populatedPopularBook = await PopularBook.findById(popularBook._id)
            .populate('book', 'title author description files.coverImage rating')
            .populate('addedBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: "Book added to popular books successfully",
            data: populatedPopularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error adding book to popular books",
            error: error.message
        });
    }
}

export async function getAllPopularBooks(req, res) {
    try {
        const { page = 1, limit = 10, active = true, sort = 'displayOrder' } = req.query;

        const query = {};
        if (active === 'true' || active === true) {
            query.isActive = true;
            const now = new Date();
            query.$or = [
                { endDate: null },
                { endDate: { $gte: now } }
            ];
        }

        let sortOption = {};
        switch (sort) {
            case 'displayOrder':
                sortOption = { displayOrder: 1 };
                break;
            case 'recent':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            default:
                sortOption = { displayOrder: 1 };
        }

        const popularBooks = await PopularBook.find(query)
            .populate('book', 'title author description files.coverImage rating statistics')
            .populate('addedBy', 'fullName email')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await PopularBook.countDocuments(query);

        res.status(200).json({
            success: true,
            data: popularBooks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching popular books",
            error: error.message
        });
    }
}

export async function getPopularBookById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid popular book ID"
            });
        }

        const popularBook = await PopularBook.findById(id)
            .populate('book', 'title author description files.coverImage rating statistics')
            .populate('addedBy', 'fullName email');

        if (!popularBook) {
            return res.status(404).json({
                success: false,
                message: "Popular book entry not found"
            });
        }

        res.status(200).json({
            success: true,
            data: popularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching popular book",
            error: error.message
        });
    }
}

export async function updatePopularBook(req, res) {
    try {
        const { id } = req.params;
        const { reason, description, endDate, displayOrder, isActive } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid popular book ID"
            });
        }

        const popularBook = await PopularBook.findById(id);
        if (!popularBook) {
            return res.status(404).json({
                success: false,
                message: "Popular book entry not found"
            });
        }

        const updates = {};
        if (reason) updates.reason = reason;
        if (description !== undefined) updates.description = description;
        if (endDate !== undefined) updates.endDate = endDate;
        if (displayOrder !== undefined) updates.displayOrder = displayOrder;
        if (isActive !== undefined) updates.isActive = isActive;

        const updatedPopularBook = await PopularBook.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('book', 'title author description files.coverImage rating')
            .populate('addedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: "Popular book updated successfully",
            data: updatedPopularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error updating popular book",
            error: error.message
        });
    }
}

export async function removePopularBook(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid popular book ID"
            });
        }

        const popularBook = await PopularBook.findByIdAndDelete(id);

        if (!popularBook) {
            return res.status(404).json({
                success: false,
                message: "Popular book entry not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Popular book removed successfully",
            data: popularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error removing popular book",
            error: error.message
        });
    }
}

export async function removeBookFromPopular(req, res) {
    try {
        const { bookId } = req.params;

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const popularBook = await PopularBook.findOneAndDelete({ book: bookId });

        if (!popularBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found in popular books"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book removed from popular books",
            data: popularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error removing book from popular",
            error: error.message
        });
    }
}

export async function reorderPopularBooks(req, res) {
    try {
        const { books } = req.body;

        if (!Array.isArray(books)) {
            return res.status(400).json({
                success: false,
                message: "Books array is required"
            });
        }

        const updates = await Promise.all(
            books.map((item, index) => 
                PopularBook.findByIdAndUpdate(
                    item.id,
                    { displayOrder: index },
                    { new: true }
                )
            )
        );

        res.status(200).json({
            success: true,
            message: "Popular books reordered successfully",
            data: updates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error reordering popular books",
            error: error.message
        });
    }
}

export async function checkIsPopular(req, res) {
    try {
        const { bookId } = req.params;

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const popularBook = await PopularBook.findOne({ book: bookId });

        res.status(200).json({
            success: true,
            isPopular: !!popularBook,
            data: popularBook || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error checking if book is popular",
            error: error.message
        });
    }
}

export async function togglePopularBook(req, res) {
    try {
        const { bookId } = req.params;
        const { reason, description, endDate } = req.body;

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const existingPopularBook = await PopularBook.findOne({ book: bookId });

        if (existingPopularBook) {
            await PopularBook.findByIdAndDelete(existingPopularBook._id);
            return res.status(200).json({
                success: true,
                message: "Book removed from popular",
                isPopular: false,
                data: null
            });
        }

        const newPopularBook = await PopularBook.create({
            book: bookId,
            reason: reason || 'featured',
            description: description || '',
            endDate: endDate || null,
            addedBy: req.user._id
        });

        const populatedPopularBook = await PopularBook.findById(newPopularBook._id)
            .populate('book', 'title author description files.coverImage rating')
            .populate('addedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: "Book added to popular",
            isPopular: true,
            data: populatedPopularBook
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error toggling popular book",
            error: error.message
        });
    }
}
