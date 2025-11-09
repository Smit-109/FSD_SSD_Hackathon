import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfRouter = express.Router();

pdfRouter.get("/view/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required"
      });
    }

    const backendDir = path.dirname(__dirname);
    const publicDir = path.join(backendDir, "public", "books", "pdfs");

    await fs.access(publicDir);
    
    const files = await fs.readdir(publicDir);
    
    res.status(200).json({
      success: true,
      availableFiles: files,
      message: "PDF files available"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accessing PDF files",
      error: error.message
    });
  }
});

export default pdfRouter;
