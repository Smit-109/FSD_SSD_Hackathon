import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxlength: [300, 'Title cannot exceed 300 characters']
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, 'Subtitle cannot exceed 200 characters']
    },
    author: {
        primary: {
            type: String,
            required: [true, 'Primary author name is required'],
            trim: true
        },
        secondary: [{ type: String, trim: true }], // Co-authors
        bio: { type: String, maxlength: [1000, 'Author bio cannot exceed 1000 characters'] }
    },
    description: {
        short: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: [500, 'Short description cannot exceed 500 characters']
        },
        full: {
            type: String,
            maxlength: [5000, 'Full description cannot exceed 5000 characters']
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Book category is required']
    },
    subCategories: [{
        type: String,
        trim: true
    }],
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        trim: true
    },
    publishingInfo: {
        publisher: { type: String, trim: true },
        publishedDate: { type: Date },
        edition: { type: String, trim: true },
        isbn10: { type: String, unique: true, sparse: true },
        isbn13: { type: String, unique: true, sparse: true },
        country: { type: String, default: 'Unknown' }
    },
    physicalInfo: {
        pageCount: { type: Number, min: [1, 'Page count must be at least 1'] },
        language: { type: String, default: 'English' },
        format: { 
            type: String, 
            enum: ['PDF', 'EPUB', 'MOBI', 'TXT', 'DOC'], 
            default: 'PDF' 
        },
        fileSize: { type: String }, // e.g., "2.5 MB"
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            unit: { type: String, default: 'inches' }
        }
    },
    files: {
        pdfSrc: { type: String },
        pdfPath: { type: String }, // Local file path
        epubPath: { type: String }, // If available
        audioPath: { type: String }, // If audiobook available
        coverImage: { type: String }, // Cover image path/URL
        thumbnail: { type: String } // Thumbnail image
    },
    rating: {
        average: { type: Number, min: 0, max: 5, default: 0 },
        count: { type: Number, default: 0 },
        breakdown: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 }
        }
    },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: [1000, 'Review cannot exceed 1000 characters'] },
        isVerified: { type: Boolean, default: false },
        helpfulVotes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    }],
    availability: {
        status: { 
            type: String, 
            enum: ['available', 'checked-out', 'reserved', 'maintenance', 'removed'], 
            default: 'available' 
        },
        totalCopies: { type: Number, default: 1 },
        availableCopies: { type: Number, default: 1 },
        reservedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        checkedOutBy: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            checkoutDate: { type: Date, default: Date.now },
            dueDate: { type: Date },
            returned: { type: Boolean, default: false }
        }]
    },
    metadata: {
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        featured: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        newRelease: { type: Boolean, default: false },
        tags: [{ type: String, trim: true }],
        keywords: [{ type: String, trim: true }],
        ageRating: { 
            type: String, 
            enum: ['All Ages', 'Teen', 'Young Adult', 'Adult', 'Mature'], 
            default: 'All Ages' 
        },
        contentWarnings: [{ type: String }]
    },
    statistics: {
        viewCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        favoriteCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        averageReadingTime: { type: Number, default: 0 }, // in minutes
        completionRate: { type: Number, default: 0 } // percentage
    },
    accessibility: {
        audioAvailable: { type: Boolean, default: false },
        largeTextAvailable: { type: Boolean, default: false },
        brailleAvailable: { type: Boolean, default: false },
        signLanguage: { type: Boolean, default: false }
    },
    series: {
        name: { type: String, trim: true },
        number: { type: Number },
        totalBooks: { type: Number }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create text index for search functionality
bookSchema.index({
    title: "text",
    author: "text",
    description: "text",
    category: "text",
    tags: "text"
});

// Virtual for formatted rating
bookSchema.virtual('formattedRating').get(function() {
    return this.rating ? this.rating.toFixed(1) : '0.0';
});

// Virtual for age of book
bookSchema.virtual('bookAge').get(function() {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(this.releasedYear);
});

// Middleware to increment view count
bookSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    return this.save();
};

// Middleware to increment download count
bookSchema.methods.incrementDownloadCount = function() {
    this.downloadCount += 1;
    return this.save();
};

const Book = mongoose.model("Book", bookSchema);

export default Book;
