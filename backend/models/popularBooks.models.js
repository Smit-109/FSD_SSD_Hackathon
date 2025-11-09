import mongoose from "mongoose";

const popularBooksSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required'],
        unique: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        enum: ['trending', 'bestseller', 'mostRead', 'highlyRated', 'newRelease', 'featured'],
        default: 'featured'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    bannerImage: {
        type: String
    }
}, { 
    timestamps: true 
});

const PopularBook = mongoose.model("PopularBook", popularBooksSchema);

export default PopularBook;
