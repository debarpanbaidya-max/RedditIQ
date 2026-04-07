const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // High speed, good reasoning, generous free tier

async function generateHooksAndBlueprint(topic, stance, trendingContext) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `You are a viral content strategist for Reddit. Analyze the following topic and trending posts to generate the best post hooks and a thread blueprint.

TOPIC: "${topic}"
STANCE: "${stance}"

TRENDING CONTEXT (top posts on this topic):
${trendingContext}

Your task:
1. Generate 5 distinct hooks for this thread, each targeting a different angle:
   - Fear-based
   - Informational
   - Controversial
   - Opinionated
   - Pattern Interrupt

2. For each hook, score it (1-10) on:
   - curiosity_gap: Does it make the reader desperate to read more?
   - emotional_trigger: Does it provoke emotion?
   - controversy: Does it challenge conventional wisdom?
   - overall_score: Weighted average (curiosity_gap × 0.4 + emotional_trigger × 0.3 + controversy × 0.3)

3. Generate a 7-comment Reddit-style breakdown blueprint that fits the stance.

Respond ONLY with valid JSON in this exact format, with no markdown formatting or extra text outside the JSON:
{
  "hooks": [
    {
      "text": "hook text here",
      "angle": "Fear-based|Informational|Controversial|Opinionated|Pattern Interrupt",
      "curiosity_gap": 8.5,
      "emotional_trigger": 7.2,
      "controversy": 6.8,
      "score": 8.1
    }
  ],
  "blueprint": [
    { "position": 1, "role": "Hook", "guidance": "Open with the strongest hook — create a curiosity gap" },
    { "position": 2, "role": "Problem", "guidance": "Establish the problem or tension" },
    { "position": 3, "role": "Insight", "guidance": "Deliver the first insight that surprises" },
    { "position": 4, "role": "Contrarian", "guidance": "Challenge the mainstream view" },
    { "position": 5, "role": "Evidence", "guidance": "Back up with data, story, or example" },
    { "position": 6, "role": "Implication", "guidance": "What does this mean for the reader?" },
    { "position": 7, "role": "CTA", "guidance": "Call to action — retweet / follow for more" }
  ],
  "virality_patterns": ["pattern1", "pattern2", "pattern3"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateReplyOptions(comment, strategy, tone) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `You are a professional social media strategist. Generate reply options for this comment.

COMMENT: "${comment}"
RECOMMENDED STRATEGY: ${strategy}
TONES REQUESTED: Professional, Witty, Aggressive

Generate exactly 3 replies, one per tone. Each reply must be:
- Under 280 characters
- True to the tone
- Contextually relevant

Respond ONLY with valid JSON with no markdown formatting or extra text outside the JSON:
{
  "replies": [
    { "tone": "Professional", "text": "reply here" },
    { "tone": "Witty", "text": "reply here" },
    { "tone": "Aggressive", "text": "reply here" }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateHooksAndBlueprint, generateReplyOptions };
