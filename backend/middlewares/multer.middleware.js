import multer from "multer";
import { join } from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = ['./public/books/covers', './public/books/pdfs'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store different file types in different folders
        const dest = file.fieldname === 'bookCover' 
            ? './public/books/covers'
            : './public/books/pdfs';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
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
    
    if (!fileConfig) {
        cb(new Error(`Unexpected field: ${file.fieldname}`));
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