const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { analyzeThread, getCommentSentiment, getHistory } = require('../controllers/analyticsController');

router.post('/thread', verifyToken, analyzeThread);
router.post('/replies', verifyToken, getCommentSentiment);
router.get('/history', verifyToken, getHistory);

module.exports = router;
