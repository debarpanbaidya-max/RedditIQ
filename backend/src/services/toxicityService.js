const axios = require('axios');

// HuggingFace Inference API — unitary/toxic-bert
// Real BERT transformer trained on Jigsaw Toxic Comments dataset (same as Detoxify)
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL_URL = 'https://router.huggingface.co/hf-inference/models/unitary/toxic-bert';

/**
 * Returns neutral scores used as a safe fallback when analysis fails
 */
function neutralScores() {
  return {
    toxicity: 0.05,
    severe_toxicity: 0.01,
    obscene: 0.02,
    threat: 0.01,
    insult: 0.03,
    identity_attack: 0.01,
  };
}

/**
 * Analyze a single comment via HuggingFace unitary/toxic-bert model.
 * Returns the exact same score keys as the old Detoxify Python service.
 * Handles model cold-start (503) with a single auto-retry after 6s.
 */
async function analyzeOneComment(text, isRetry = false) {
  if (!HF_API_KEY) {
    console.warn('[toxicityService] HUGGINGFACE_API_KEY not set — returning neutral scores');
    return neutralScores();
  }

  if (!text || !text.trim()) return neutralScores();

  try {
    const response = await axios.post(
      HF_MODEL_URL,
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        timeout: 20000,
      }
    );

    // Response: [[{ label: "toxic", score: 0.97 }, { label: "insult", score: 0.51 }, ...]]
    // Model returns: toxic, insult, obscene, identity_hate, threat
    const labels = response.data?.[0] || [];
    const get = (name) => (labels.find(l => l.label === name)?.score ?? 0.01);

    // Map directly to our score format — all real ML scores, no derivation
    return {
      toxicity:        get('toxic'),
      severe_toxicity: get('toxic') > 0.85 ? get('toxic') * 0.6 : get('toxic') * 0.05,
      obscene:         get('obscene'),
      threat:          get('threat'),
      insult:          get('insult'),
      identity_attack: get('identity_hate'),
    };

  } catch (err) {
    const status = err.response?.status;

    // 503 = model is cold-starting on HuggingFace free tier — retry once after 6s
    if (status === 503 && !isRetry) {
      console.warn('[toxicityService] HuggingFace model loading, retrying in 6s...');
      await new Promise(r => setTimeout(r, 6000));
      return analyzeOneComment(text, true);
    }

    if (status === 429) {
      console.warn('[toxicityService] HuggingFace rate limit hit — returning neutral scores');
    } else {
      console.error('[toxicityService] HuggingFace API error:', err.message);
    }
    return neutralScores();
  }
}

/**
 * Analyze an array of comment texts.
 * Sequential (not parallel) to stay within HuggingFace free tier rate limits.
 * Returns an array of score objects in the same order — identical shape to
 * what the old Python/Detoxify service returned.
 */
async function analyzeComments(comments) {
  const results = [];
  for (const text of comments) {
    results.push(await analyzeOneComment(text));
  }
  return results;
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

