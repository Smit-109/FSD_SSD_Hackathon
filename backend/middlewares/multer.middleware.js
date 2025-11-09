import multer from "multer";
import path from "path";
import fs from "fs";

// Define base upload directory
const baseUploadDir = path.join(process.cwd(), 'backend', 'public', 'books');

// Ensure upload directories exist
const uploadDirs = {
    bookCover: path.join(baseUploadDir, 'covers'),
    pdf: path.join(baseUploadDir, 'pdfs')
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = uploadDirs[file.fieldname];
        if (!uploadPath) {
            cb(new Error(`Invalid field name: ${file.fieldname}`));
            return;
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFiles = {
        bookCover: {
            mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
            maxSize: 5 * 1024 * 1024 // 5MB
        },
        pdf: {
            mimeTypes: ["application/pdf"],
            maxSize: 50 * 1024 * 1024 // 50MB
        }
    };

    const fileConfig = allowedFiles[file.fieldname];
    
    // If fieldname is not a recognized file field, reject it (shouldn't happen with our setup)
    if (!fileConfig) {
        cb(new Error(`Invalid field name: ${file.fieldname}. Only 'bookCover' and 'pdf' are allowed`));
        return;
    }

    if (!fileConfig.mimeTypes.includes(file.mimetype)) {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fileConfig.mimeTypes.join(', ')}`));
        return;
    }

    cb(null, true);
};

export const uploadBookFiles = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Set to largest allowed (PDF size)
    }
}).fields([
    { name: 'bookCover', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]);