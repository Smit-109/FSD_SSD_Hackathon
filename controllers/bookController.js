import express from 'express';
const router = express.Router();

// In-memory book data (replace with a database in a real application)
let books = [
  { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
  { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen' },
];

// Get all books
router.get('/', (req, res) => {
  res.json(books);
});

// Get a specific book by ID
router.get('/:id', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).send('Book not found');
  }
  res.json(book);
});

// Add a new book
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).send('Title and author are required');
  }
  const newBook = {
    id: books.length + 1,
    title,
    author,
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Update a book by ID
router.put('/:id', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).send('Book not found');
  }
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).send('Title and author are required');
  }
  book.title = title;
  book.author = author;
  res.json(book);
});

// Delete a book by ID
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).send('Book not found');
  }
  const deletedBook = books.splice(bookIndex, 1);
  res.json(deletedBook);
});

export default router;