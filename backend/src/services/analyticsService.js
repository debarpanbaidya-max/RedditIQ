/**
 * Analytics Engine
 * Computes drop-off rates, engagement scores, and proxy impressions per tweet
 */

/**
 * Compute engagement score for a single tweet
 * Engagement = likes + retweets*2 + replies*1.5 + bookmarks
 */
function computeEngagement(tweet) {
  return (tweet.likes || 0) +
    (tweet.retweets || 0) * 2 +
    (tweet.replies || 0) * 1.5 +
    (tweet.bookmarks || 0);
}

/**
 * Compute impressions proxy when real impressions not available
 * impressions_proxy = likes * engagement_ratio
 * engagement_ratio derived from typical X analytics benchmarks (~3% engagement rate)
 */
function computeImpressionsProxy(tweet) {
  if (tweet.impressions && tweet.impressions > 0) return tweet.impressions;
  const totalEngagement = computeEngagement(tweet);
  // Assume ~3% organic engagement rate
  return Math.round(totalEngagement / 0.03);
}

/**
 * Compute drop-off rate between consecutive tweets
 * drop_off[i] = (engagement[i] - engagement[i+1]) / engagement[i]
 */
function computeDropOffRates(tweets) {
  const engagements = tweets.map(computeEngagement);

  return tweets.map((tweet, i) => {
    const current = engagements[i];
    const next = engagements[i + 1];
    let dropOff = 0;

    if (i < tweets.length - 1 && current > 0) {
      dropOff = (current - next) / current;
    }

    return {
      ...tweet,
      engagement_score: current,
      drop_off_rate: dropOff,
      impressions_proxy: computeImpressionsProxy(tweet),
      is_problem: dropOff > 0.3, // >30% drop = problem tweet
    };
  });
}

/**
 * Compute overall thread health score (0-100)
 */
function computeThreadHealth(analyzedTweets) {
  const avgDropOff = analyzedTweets.slice(0, -1).reduce((sum, t) => sum + t.drop_off_rate, 0) /
    Math.max(analyzedTweets.length - 1, 1);

  const problemCount = analyzedTweets.filter(t => t.is_problem).length;
  const totalEngagement = analyzedTweets.reduce((sum, t) => sum + t.engagement_score, 0);

  const retentionScore = Math.max(0, 100 - (avgDropOff * 100));
  const penalty = problemCount * 5;

  return Math.round(Math.max(0, retentionScore - penalty));
}

module.exports = { computeDropOffRates, computeEngagement, computeImpressionsProxy, computeThreadHealth };
