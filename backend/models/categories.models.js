import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    subCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    icon: {
        type: String,
        default: 'fas fa-book' // FontAwesome icon class
    },
    color: {
        type: String,
        default: '#667eea' // Hex color code
    },
    image: {
        type: String, // URL or path to category image
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    bookCount: {
        type: Number,
        default: 0
    },
    popularityScore: {
        type: Number,
        default: 0
    },
    metadata: {
        seoTitle: { type: String, maxlength: 60 },
        seoDescription: { type: String, maxlength: 160 },
        keywords: [{ type: String }]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual for full hierarchy path
categorySchema.virtual('hierarchyPath').get(function() {
    // This would need to be populated to work properly
    return this.parentCategory ? `${this.parentCategory.name} > ${this.name}` : this.name;
});

// Index for search functionality
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;