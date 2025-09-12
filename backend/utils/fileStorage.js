import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = async () => {
    const dirs = [
        path.join(__dirname, '../public/books/covers'),
        path.join(__dirname, '../public/books/pdfs')
    ];
    
    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
};

// Store file locally and return the public URL
export const storeFile = async (file, type = 'cover') => {
    await createUploadDirs();
    
    const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const uploadDir = type === 'cover' ? 'covers' : 'pdfs';
    const filePath = path.join(__dirname, `../public/books/${uploadDir}/${filename}`);
    
    // Move file from temp upload to permanent location
    await fs.copyFile(file.path, filePath);
    await fs.unlink(file.path); // Clean up temp file
    
    // Return public URL
    return `/books/${uploadDir}/${filename}`;
};

// Delete file from local storage
export const deleteFile = async (fileUrl) => {
    if (!fileUrl) return;
    
    try {
        const filePath = path.join(__dirname, '../public', fileUrl);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};