const { fetchThread, fetchReplies } = require('../services/redditApiService');
const { computeDropOffRates, computeThreadHealth } = require('../services/analyticsService');
const { pool } = require('../db');

/**
 * POST /api/analytics/thread
 * Body: { threadUrl }
 */
async function analyzeThread(req, res, next) {
  try {
    const { threadUrl } = req.body;

    if (!threadUrl) {
      return res.status(400).json({ error: 'threadUrl is required' });
    }

    // Step 1: Fetch thread from X API
    const { author, conversationId, tweets } = await fetchThread(threadUrl);

    if (!tweets || tweets.length === 0) {
      return res.status(404).json({ error: 'No posts found for this thread' });
    }

    // Step 2: Compute analytics
    const analyzedTweets = computeDropOffRates(tweets);
    const healthScore = computeThreadHealth(analyzedTweets);

    // Step 3: Save thread to DB
    const threadInsert = await pool.query(
      `INSERT INTO threads (user_id, thread_url, author_handle, author_name, tweet_count)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [req.user.id, threadUrl, author?.username, author?.name, tweets.length]
    );

    let threadId = threadInsert.rows[0]?.id;

    if (threadId) {
      for (const tweet of analyzedTweets) {
        const tweetInsert = await pool.query(
          `INSERT INTO tweets (thread_id, tweet_id, position, content, likes, retweets, replies, bookmarks, impressions)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (tweet_id) DO NOTHING
           RETURNING id`,
          [threadId, tweet.id, tweet.position, tweet.text, tweet.likes, tweet.retweets, tweet.replies, tweet.bookmarks, tweet.impressions_proxy]
        );

        if (tweetInsert.rows[0]) {
          await pool.query(
            `INSERT INTO analytics (thread_id, tweet_id, engagement_score, drop_off_rate, impressions_proxy, is_problem_tweet)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [threadId, tweetInsert.rows[0].id, tweet.engagement_score, tweet.drop_off_rate, tweet.impressions_proxy, tweet.is_problem]
          );
        }
      }
    }

    res.json({
      author,
      conversationId,
      healthScore,
      tweetCount: tweets.length,
      tweets: analyzedTweets,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/analytics/replies
 * Body: { tweetId, conversationId }
 */
async function getCommentSentiment(req, res, next) {
  try {
    const { tweetId, conversationId } = req.body;

    if (!tweetId || !conversationId) {
      return res.status(400).json({ error: 'tweetId and conversationId are required' });
    }

    const replies = await fetchReplies(tweetId, conversationId, 50);

    res.json({ replies, count: replies.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/history
 */
async function getHistory(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        COUNT(tw.id) as tweet_count,
        AVG(a.drop_off_rate) as avg_drop_off
       FROM threads t
       LEFT JOIN tweets tw ON tw.thread_id = t.id
       LEFT JOIN analytics a ON a.thread_id = t.id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json({ threads: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeThread, getCommentSentiment, getHistory };
