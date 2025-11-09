const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Define book routes
router.use('/books', bookController);

module.exports = router;