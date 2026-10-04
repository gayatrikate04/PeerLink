const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/', authMiddleware, skillsController.getSkills);
router.put('/', authMiddleware, skillsController.updateSkills);

module.exports = router;
