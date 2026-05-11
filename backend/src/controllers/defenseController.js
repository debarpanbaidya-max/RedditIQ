const { analyzeComments, categorizeComment, decideStrategy, classifyEngagement } = require('../services/toxicityService');
const { generateReplyOptions } = require('../services/aiService');
const { pool } = require('../db');

/**
 * POST /api/defense/analyze
 * Body: { comments: [{ id, text, author, likes, retweets }] }
 */
async function analyzeDefense(req, res, next) {
  try {
    const { comments } = req.body;

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: 'comments array is required' });
    }

    // Step 1: Score comments via HuggingFace unitary/toxic-bert (cloud API)
    const toxicityResults = await analyzeComments(comments.map(c => c.text));

    // Step 2: Apply category mapping + strategy engine
    const analyzed = comments.map((comment, index) => {
      const scores = toxicityResults[index];
      const category = categorizeComment(scores);
      const engagementLevel = classifyEngagement(comment);
      const strategy = decideStrategy(category, engagementLevel);

      return {
        ...comment,
        scores,
        category,
        engagementLevel,
        strategy,
      };
    });

    res.json({ analyzed });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/defense/reply
 * Body: { comment, strategy, category }
 */
async function generateReply(req, res, next) {
  try {
    const { comment, strategy, category } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    // Step 1: Generate reply options via Claude
    const result = await generateReplyOptions(comment, strategy, category);

    res.json({ replies: result.replies });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeDefense, generateReply };
