import mongoose from 'mongoose';

const borrowingSchema = new mongoose.Schema({
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
    borrowDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    returnDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue', 'lost', 'damaged'],
        default: 'borrowed'
    },
    borrowType: {
        type: String,
        enum: ['physical', 'digital'],
        default: 'digital'
    },
    renewalCount: {
        type: Number,
        default: 0,
        max: [3, 'Maximum 3 renewals allowed']
    },
    renewalHistory: [{
        renewedDate: { type: Date, default: Date.now },
        newDueDate: { type: Date },
        reason: { type: String }
    }],
    fineAmount: {
        type: Number,
        default: 0,
        min: [0, 'Fine amount cannot be negative']
    },
    fineStatus: {
        type: String,
        enum: ['none', 'pending', 'paid', 'waived'],
        default: 'none'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Librarian who processed the borrowing
    }
}, {
    timestamps: true
});

// Indexes for better performance
borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ book: 1, status: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });
borrowingSchema.index({ borrowDate: -1 });

// Virtual for days overdue
borrowingSchema.virtual('daysOverdue').get(function() {
    if (this.status === 'overdue' || (this.status === 'borrowed' && new Date() > this.dueDate)) {
        const now = new Date();
        const diffTime = now - this.dueDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
});

// Method to calculate fine
borrowingSchema.methods.calculateFine = function() {
    const daysOverdue = this.daysOverdue;
    if (daysOverdue > 0) {
        const finePerDay = 1.00; // $1 per day
        return Math.min(daysOverdue * finePerDay, 50.00); // Max fine $50
    }
    return 0;
};

// Auto-update status to overdue
borrowingSchema.pre('save', function(next) {
    if (this.status === 'borrowed' && new Date() > this.dueDate) {
        this.status = 'overdue';
        this.fineAmount = this.calculateFine();
        this.fineStatus = this.fineAmount > 0 ? 'pending' : 'none';
    }
    next();
});

const Borrowing = mongoose.model('Borrowing', borrowingSchema);

export default Borrowing;