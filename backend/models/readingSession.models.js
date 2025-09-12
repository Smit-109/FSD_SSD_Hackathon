import mongoose from 'mongoose';

const readingSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book is required']
    },
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    currentPage: {
        type: Number,
        default: 1,
        min: [1, 'Page number must be at least 1']
    },
    totalPages: {
        type: Number,
        required: true
    },
    progressPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be negative'],
        max: [100, 'Progress cannot exceed 100%']
    },
    bookmarks: [{
        page: { type: Number, required: true },
        note: { type: String, maxlength: [500, 'Bookmark note cannot exceed 500 characters'] },
        createdAt: { type: Date, default: Date.now }
    }],
    highlights: [{
        page: { type: Number, required: true },
        text: { type: String, required: true, maxlength: [1000, 'Highlighted text cannot exceed 1000 characters'] },
        color: { type: String, default: '#ffff00' }, // Default yellow
        note: { type: String, maxlength: [500, 'Highlight note cannot exceed 500 characters'] },
        createdAt: { type: Date, default: Date.now }
    }],
    notes: [{
        page: { type: Number, required: true },
        content: { type: String, required: true, maxlength: [1000, 'Note cannot exceed 1000 characters'] },
        isPrivate: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: null
    },
    review: {
        type: String,
        maxlength: [2000, 'Review cannot exceed 2000 characters'],
        default: null
    },
    status: {
        type: String,
        enum: ['reading', 'completed', 'paused', 'abandoned'],
        default: 'reading'
    },
    completedAt: {
        type: Date,
        default: null
    },
    device: {
        type: String,
        enum: ['web', 'mobile', 'tablet', 'desktop'],
        default: 'web'
    },
    sessionQuality: {
        focused: { type: Boolean, default: true },
        distractions: { type: Number, default: 0 },
        mood: { 
            type: String, 
            enum: ['excellent', 'good', 'average', 'poor'], 
            default: 'good' 
        }
    }
}, {
    timestamps: true
});

// Indexes
readingSessionSchema.index({ user: 1, book: 1 });
readingSessionSchema.index({ user: 1, status: 1 });
readingSessionSchema.index({ book: 1, status: 1 });
readingSessionSchema.index({ startTime: -1 });

// Virtual for reading speed (pages per minute)
readingSessionSchema.virtual('readingSpeed').get(function() {
    if (this.duration > 0 && this.currentPage > 1) {
        return (this.currentPage - 1) / this.duration;
    }
    return 0;
});

// Method to update progress
readingSessionSchema.methods.updateProgress = function() {
    if (this.totalPages > 0) {
        this.progressPercentage = Math.round((this.currentPage / this.totalPages) * 100);
        if (this.progressPercentage >= 100) {
            this.status = 'completed';
            this.completedAt = new Date();
        }
    }
};

// Pre-save middleware
readingSessionSchema.pre('save', function(next) {
    // Calculate duration if endTime is set
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
    }
    
    // Update progress percentage
    this.updateProgress();
    
    next();
});

const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema);

export default ReadingSession;