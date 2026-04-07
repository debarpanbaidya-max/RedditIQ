const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { analyzeDefense, generateReply } = require('../controllers/defenseController');

router.post('/analyze', verifyToken, analyzeDefense);
router.post('/reply', verifyToken, generateReply);

module.exports = router;
