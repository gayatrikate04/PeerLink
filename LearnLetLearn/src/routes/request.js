const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/send', authMiddleware, requestController.sendRequest);
router.get('/received', authMiddleware, requestController.getRequests);
router.post('/respond', authMiddleware, requestController.respondRequest);

module.exports = router;
