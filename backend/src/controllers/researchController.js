const { searchPosts } = require('../services/redditApiService');
const { generateHooksAndBlueprint, generateTrendingContext } = require('../services/aiService');
const { pool } = require('../db');

/**
 * POST /api/research/analyze
 * Body: { topic, stance }
 */
async function analyzeResearch(req, res, next) {
  try {
    const { topic, stance } = req.body;

    if (!topic || !stance) {
      return res.status(400).json({ error: 'topic and stance are required' });
    }

    // Step 1: Fetch trending posts — fall back to AI-generated context if Reddit is unavailable
    let trendingContext = '';
    let trendingCount = 0;
    try {
      const trendingPosts = await searchPosts(`${topic}`, 20);
      trendingCount = trendingPosts.length;
      trendingContext = trendingPosts
        .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets))
        .slice(0, 10)
        .map(t => `[${t.likes} upvotes] ${t.text}`)
        .join('\n');
    } catch (redditErr) {
      console.warn('[Research] Reddit fetch failed, using Gemini-generated context:', redditErr.message);
      trendingContext = await generateTrendingContext(topic);
      trendingCount = 0;
    }

    // Step 3: Generate hooks + blueprint via Claude
    const analysis = await generateHooksAndBlueprint(topic, stance, trendingContext);

    // Step 4: Sort hooks by score descending
    analysis.hooks.sort((a, b) => b.score - a.score);

    // Step 5: Save to DB
    for (const hook of analysis.hooks) {
      await pool.query(
        `INSERT INTO hooks (user_id, topic, stance, hook_text, score, curiosity_gap, emotional_trigger, controversy, angle_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.user.id, topic, stance, hook.text, hook.score, hook.curiosity_gap, hook.emotional_trigger, hook.controversy, hook.angle]
      );
    }

    await pool.query(
      `INSERT INTO blueprints (user_id, topic, stance, blueprint) VALUES ($1, $2, $3, $4)`,
      [req.user.id, topic, stance, JSON.stringify(analysis.blueprint)]
    );

    res.json({
      topic,
      stance,
      hooks: analysis.hooks,
      blueprint: analysis.blueprint,
      virality_patterns: analysis.virality_patterns,
      trending_count: trendingCount,
    });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'Whoa there! You hit the Google Gemini Free Tier rate limit. Please wait about 30 seconds and try again!' });
    }
    next(err);
  }
}

/**
 * GET /api/research/history
 * Returns saved hooks for the current user
 */
async function getHistory(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT * FROM hooks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ hooks: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeResearch, getHistory };
