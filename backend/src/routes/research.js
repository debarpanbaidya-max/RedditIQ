const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { analyzeResearch, getHistory } = require('../controllers/researchController');

router.post('/analyze', verifyToken, analyzeResearch);
router.get('/history', verifyToken, getHistory);

module.exports = router;
