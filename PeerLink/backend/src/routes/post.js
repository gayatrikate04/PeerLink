const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../utils/authMiddleware');

// Get all posts
router.get('/', postController.getAllPosts);

// Create a new post (auth required)
router.post('/', authMiddleware, postController.createPost);

// Like a post (auth required)
router.post('/:id/like', authMiddleware, postController.toggleLike);

// Reply to a post (auth required)
router.post('/:id/reply', authMiddleware, postController.addReply);

module.exports = router;
