import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestBookAccess,
  addToFavorites,
  getAllUsers,
  manageBookRequest,
  verifyUser
} from '../controllers/auth.controllers.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { 
  validateRegister, 
  validateLogin, 
  validateBookRequest 
} from '../middlewares/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/request-book', protect, validateBookRequest, requestBookAccess);
router.post('/favorites', protect, addToFavorites);

// Admin routes
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/manage-request', protect, adminOnly, manageBookRequest);
router.put('/verify-user/:userId', protect, adminOnly, verifyUser);

export default router;
