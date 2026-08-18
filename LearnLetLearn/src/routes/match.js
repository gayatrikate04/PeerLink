const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/', authMiddleware, matchController.findMatches);

module.exports = router;
