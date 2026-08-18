const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/history/:peerId', authMiddleware, chatController.getHistory);
router.get('/recent', authMiddleware, chatController.getRecentChats);

module.exports = router;
