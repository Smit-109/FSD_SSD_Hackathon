import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileRouter = express.Router();

// Serve PDF files (with authentication check)
fileRouter.get('/books/pdf/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/books/pdfs', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'PDF file not found'
        });
    }
    
    // Optional: Add authentication check
    // if (!req.session?.user) {
    //     return res.status(401).json({
    //         success: false,
    //         message: 'Please login to access books'
    //     });
    // }
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

// Serve book cover images (with fallback to default)
fileRouter.get('/books/cover/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/books/covers', filename);
    
    // Check if file exists, if not, return a default placeholder
    if (!fs.existsSync(filePath)) {
        // Return a default book cover placeholder response
        res.setHeader('Content-Type', 'image/svg+xml');
        const defaultCover = `
        <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="400" fill="#667eea"/>
            <rect x="20" y="20" width="260" height="360" fill="#764ba2" opacity="0.8"/>
            <text x="150" y="180" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif">
                📚
            </text>
            <text x="150" y="220" text-anchor="middle" fill="white" font-size="16" font-family="Arial, sans-serif">
                Book Cover
            </text>
            <text x="150" y="250" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif">
                Not Available
            </text>
        </svg>`;
        return res.send(defaultCover);
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch(ext) {
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.webp':
            contentType = 'image/webp';
            break;
    }
    
    res.setHeader('Content-Type', contentType);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

// List available PDF files (for admin)
fileRouter.get('/books/list-pdfs', (req, res) => {
    // Optional: Add admin authentication check
    // if (!req.session?.user || req.session.user.role !== 'admin') {
    //     return res.status(403).json({
    //         success: false,
    //         message: 'Admin access required'
    //     });
    // }
    
    const pdfsDir = path.join(__dirname, '../public/books/pdfs');
    
    try {
        const files = fs.readdirSync(pdfsDir)
            .filter(file => file.toLowerCase().endsWith('.pdf'))
            .map(file => ({
                filename: file,
                name: file.replace('.pdf', '').replace(/-/g, ' '),
                url: `/files/books/pdf/${file}`
            }));
        
        res.json({
            success: true,
            files: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reading PDF directory',
            error: error.message
        });
    }
});

export default fileRouter;