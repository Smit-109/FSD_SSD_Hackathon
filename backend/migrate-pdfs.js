import mongoose from "mongoose";
import "./config/config.js";
import Book from "./models/books.models.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migratePDFs() {
  try {
    console.log("Starting PDF migration...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    // Get all PDF files from the pdfs directory
    const pdfDir = path.join(__dirname, "public", "books", "pdfs");
    const files = await fs.readdir(pdfDir);
    const pdfFiles = files.filter(f => f.endsWith(".pdf"));
    
    console.log(`Found ${pdfFiles.length} PDF files`);
    
    // Get all books from database
    const books = await Book.find({});
    console.log(`Found ${books.length} books in database`);
    
    let updatedCount = 0;
    let bookIndex = 0;
    
    // For each book without a PDF path, assign a PDF
    for (const book of books) {
      if (!book.files?.pdfPath && !book.files?.pdfSrc && bookIndex < pdfFiles.length) {
        const pdfFilename = pdfFiles[bookIndex];
        const pdfPath = `/public/books/pdfs/${pdfFilename}`;
        
        book.files = book.files || {};
        book.files.pdfPath = pdfPath;
        book.files.pdfSrc = pdfPath;
        
        await book.save();
        console.log(`Updated book "${book.title}" with PDF: ${pdfFilename}`);
        updatedCount++;
        bookIndex++;
      }
    }
    
    console.log(`\nMigration complete! Updated ${updatedCount} books with PDF paths`);
    
    // Verify the changes
    const verifyBooks = await Book.find({ "files.pdfPath": { $exists: true, $ne: null } });
    console.log(`Verification: ${verifyBooks.length} books now have PDF paths`);
    
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migratePDFs();
