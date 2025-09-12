import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // System notifications have no sender
    },
    type: {
        type: String,
        enum: [
            'book_due_soon',
            'book_overdue',
            'reservation_available',
            'reservation_expired',
            'fine_notice',
            'account_verification',
            'password_reset',
            'new_book_added',
            'book_recommendation',
            'system_maintenance',
            'membership_expiry',
            'reading_streak',
            'book_review_reply',
            'general'
        ],
        required: [true, 'Notification type is required']
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    data: {
        // Additional data related to the notification
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        borrowingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrowing' },
        reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
        fineAmount: { type: Number },
        dueDate: { type: Date },
        url: { type: String }, // Action URL
        metadata: { type: mongoose.Schema.Types.Mixed } // Flexible data
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'archived', 'deleted'],
        default: 'unread'
    },
    deliveryMethod: {
        type: String,
        enum: ['in_app', 'email', 'sms', 'push'],
        default: 'in_app'
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    readAt: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionCompleted: {
        type: Boolean,
        default: false
    },
    actionCompletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ priority: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
    if (this.status === 'unread') {
        this.status = 'read';
        this.readAt = new Date();
        return this.save();
    }
};

// Auto-expire notifications
notificationSchema.pre('save', function(next) {
    if (this.expiresAt && new Date() > this.expiresAt && this.status !== 'expired') {
        this.status = 'archived';
    }
    next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;