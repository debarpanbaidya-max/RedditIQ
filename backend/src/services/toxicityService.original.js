const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

/**
 * Send comments to Python Detoxify microservice for toxicity analysis
 */
async function analyzeComments(comments) {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, { comments }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data.results;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      throw new Error('The Python AI Microservice is currently offline or booting up. Please wait a few seconds and try again!');
    }
    throw new Error('AI Analysis took too long. The model is probably still downloading in the background. Try again in 2 mins!');
  }
}

/**
 * Map toxicity scores to categories
 */
function categorizeComment(scores) {
  const { toxicity, severe_toxicity, identity_attack, threat, obscene } = scores;

  if (toxicity > 0.8 || severe_toxicity > 0.5 || threat > 0.5) {
    return 'Hostile';
  }
  if (toxicity > 0.5 && obscene > 0.4) {
    return 'Hostile';
  }
  if (identity_attack > 0.4) {
    return 'Hostile';
  }
  if (toxicity > 0.3) {
    return 'Sarcastic';
  }
  return 'Constructive';
}

/**
 * Strategy engine: decide what action to take based on category + engagement
 */
function decideStrategy(category, engagementLevel) {
  if (category === 'Hostile' && engagementLevel === 'low') return 'IGNORE';
  if (category === 'Hostile' && engagementLevel === 'high') return 'DEFEND';
  if (category === 'Sarcastic' && engagementLevel === 'high') return 'DEFEND';
  if (category === 'Constructive') return 'RESPOND';
  if (category === 'Spam') return 'IGNORE';
  return 'IGNORE';
}

/**
 * Classify engagement level of a comment
 */
function classifyEngagement(comment) {
  const totalEngagement = (comment.likes || 0) + (comment.retweets || 0) * 2;
  if (totalEngagement >= 10) return 'high';
  if (totalEngagement >= 3) return 'medium';
  return 'low';
}

module.exports = { analyzeComments, categorizeComment, decideStrategy, classifyEngagement };
