const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/', authMiddleware, matchController.findMatches);
router.get('/clusters', authMiddleware, matchController.getSkillClusters);

module.exports = router;
