import { body } from 'express-validator';

export const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateBookRequest = [
  body('bookId')
    .isMongoId()
    .withMessage('Invalid book ID')
];

export const validateBook = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Title must be between 1 and 300 characters'),
  
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Author name is required'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category is required'),
  
  body('releasedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 10 })
    .withMessage('Released year must be a valid year'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('pageCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page count must be a positive integer')
];