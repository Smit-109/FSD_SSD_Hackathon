import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
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
    reservationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'expired', 'cancelled'],
        default: 'active'
    },
    priority: {
        type: Number,
        default: 1
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    fulfilledDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        maxlength: [300, 'Notes cannot exceed 300 characters']
    }
}, {
    timestamps: true
});

// Indexes
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1, priority: 1 });
reservationSchema.index({ expiryDate: 1, status: 1 });

// Auto-expire reservations
reservationSchema.pre('save', function(next) {
    if (this.status === 'active' && new Date() > this.expiryDate) {
        this.status = 'expired';
    }
    next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;