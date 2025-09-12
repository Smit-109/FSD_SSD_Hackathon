import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: [
            'login',
            'logout',
            'register',
            'password_change',
            'profile_update',
            'book_view',
            'book_download',
            'book_borrow',
            'book_return',
            'book_reserve',
            'book_add',
            'book_edit',
            'book_delete',
            'category_add',
            'category_edit',
            'category_delete',
            'user_create',
            'user_edit',
            'user_delete',
            'user_suspend',
            'user_activate',
            'fine_payment',
            'system_backup',
            'data_export',
            'settings_change'
        ]
    },
    resource: {
        type: String,
        enum: ['user', 'book', 'category', 'borrowing', 'reservation', 'system'],
        required: [true, 'Resource type is required']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null // ID of the affected resource
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    details: {
        // Store additional details about the action
        oldValues: { type: mongoose.Schema.Types.Mixed },
        newValues: { type: mongoose.Schema.Types.Mixed },
        metadata: { type: mongoose.Schema.Types.Mixed }
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    location: {
        country: { type: String },
        city: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info'
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success'
    },
    duration: {
        type: Number, // in milliseconds
        default: null
    },
    errorMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });

// Static method to log actions
auditLogSchema.statics.logAction = async function(params) {
    try {
        const log = new this(params);
        await log.save();
        return log;
    } catch (error) {
        console.error('Error logging audit action:', error);
        throw error;
    }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;