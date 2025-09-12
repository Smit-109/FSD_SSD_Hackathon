import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store file locally and return the public URL
export const storeFile = async (file, type = 'cover') => {
    const uploadDir = type === 'cover' ? 'covers' : 'pdfs';
    const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const filePath = path.join(__dirname, `../public/books/${uploadDir}/${filename}`);
    
    // Create a read stream from the source and write stream to destination
    await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(file.path);
        const writeStream = fs.createWriteStream(filePath);
        
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        
        readStream.pipe(writeStream);
    });

    // Clean up temp file
    try {
        fs.unlinkSync(file.path);
    } catch (error) {
        console.error('Error cleaning up temp file:', error);
    }
    
    // Return public URL
    return `/books/${uploadDir}/${filename}`;
};

// Delete file from local storage
export const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    
    try {
        const filePath = path.join(__dirname, '../public', fileUrl);
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};