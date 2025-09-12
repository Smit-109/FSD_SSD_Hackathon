# 📚 Books Storage Directory

This directory contains the PDF files and cover images for your e-library system.

## 📁 Directory Structure

```
books/
├── pdfs/          # Store your PDF book files here
└── covers/        # Store book cover images here
```

## 📖 How to Add Books

### 1. PDF Files (Required)
- Place your PDF files in the `pdfs/` folder
- Use descriptive filenames (e.g., `the-great-gatsby.pdf`)
- Supported format: PDF only

### 2. Cover Images (Optional)
- **You don't need cover images!** The system will show beautiful default covers
- If you want custom covers, place them in the `covers/` folder
- Use the same filename as your PDF but with image extension
- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Example: `the-great-gatsby.jpg` for `the-great-gatsby.pdf`

### 🎨 Default Covers
- If no cover image is provided, the system automatically shows attractive gradient covers
- Each book gets a unique default cover with the book title
- No extra work needed from you!

## 🔗 File Access URLs

### For PDFs:
```
http://localhost:5000/files/books/pdf/filename.pdf
```

### For Cover Images:
```
http://localhost:5000/files/books/cover/filename.jpg
```

## 📝 Example

If you have a book called "The Great Gatsby":

1. **PDF File**: `pdfs/the-great-gatsby.pdf`
2. **Cover Image**: `covers/the-great-gatsby.jpg`
3. **PDF URL**: `http://localhost:5000/files/books/pdf/the-great-gatsby.pdf`
4. **Cover URL**: `http://localhost:5000/files/books/cover/the-great-gatsby.jpg`

## 🔧 Admin Features

- List all available PDFs: `GET /files/books/list-pdfs`
- This endpoint returns all PDF files in the directory

## 🔒 Security Notes

- PDF access can be restricted to logged-in users (currently disabled)
- Admin authentication can be enabled for file listing
- Files are served directly from the filesystem

## 📋 File Naming Guidelines

- Use lowercase letters
- Replace spaces with hyphens (-)
- Avoid special characters
- Keep filenames descriptive but concise

**Good Examples:**
- `to-kill-a-mockingbird.pdf`
- `1984-george-orwell.pdf`
- `pride-and-prejudice.pdf`

**Bad Examples:**
- `Book 1.pdf`
- `My@Book#File.pdf`
- `untitled.pdf`