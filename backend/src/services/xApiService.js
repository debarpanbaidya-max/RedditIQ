const axios = require('axios');

const BASE_URL = 'https://api.twitter.com/2';

const headers = {
  Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
};

/**
 * Search recent tweets for a given query
 */
async function searchTweets(query, maxResults = 20) {
  const response = await axios.get(`${BASE_URL}/tweets/search/recent`, {
    headers,
    params: {
      query: `${query} -is:retweet lang:en`,
      max_results: Math.min(maxResults, 100),
      'tweet.fields': 'public_metrics,created_at,author_id,text',
      'user.fields': 'name,username,public_metrics',
      expansions: 'author_id',
    },
  });

  const tweets = response.data.data || [];
  const users = response.data.includes?.users || [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return tweets.map(tweet => ({
    id: tweet.id,
    text: tweet.text,
    author: userMap[tweet.author_id] || null,
    likes: tweet.public_metrics?.like_count || 0,
    retweets: tweet.public_metrics?.retweet_count || 0,
    replies: tweet.public_metrics?.reply_count || 0,
    impressions: tweet.public_metrics?.impression_count || 0,
    created_at: tweet.created_at,
  }));
}

/**
 * Fetch a thread from a tweet URL or tweet ID
 * Returns: array of tweets in order
 */
async function fetchThread(tweetUrlOrId) {
  const tweetId = extractTweetId(tweetUrlOrId);

  // Get the root tweet
  const rootRes = await axios.get(`${BASE_URL}/tweets/${tweetId}`, {
    headers,
    params: {
      'tweet.fields': 'public_metrics,created_at,author_id,conversation_id',
      expansions: 'author_id',
    },
  });

  const rootTweet = rootRes.data.data;
  const authorId = rootTweet.author_id;
  const conversationId = rootTweet.conversation_id;
  const users = rootRes.data.includes?.users || [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  // Search for all tweets in the conversation by the same author
  const threadRes = await axios.get(`${BASE_URL}/tweets/search/recent`, {
    headers,
    params: {
      query: `conversation_id:${conversationId} from:${authorId}`,
      max_results: 100,
      'tweet.fields': 'public_metrics,created_at,author_id,in_reply_to_user_id',
      expansions: 'author_id',
    },
  });

  const threadTweets = threadRes.data.data || [];

  // Include root tweet
  const allTweets = [rootTweet, ...threadTweets.filter(t => t.id !== tweetId)];

  // Sort by created_at ascending
  allTweets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const author = userMap[authorId];

  return {
    author,
    conversationId,
    tweets: allTweets.map((tweet, index) => ({
      id: tweet.id,
      position: index + 1,
      text: tweet.text,
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      bookmarks: tweet.public_metrics?.bookmark_count || 0,
      impressions: tweet.public_metrics?.impression_count || 0,
      created_at: tweet.created_at,
    })),
  };
}

/**
 * Fetch replies to a specific tweet
 */
async function fetchReplies(tweetId, conversationId, maxResults = 50) {
  const response = await axios.get(`${BASE_URL}/tweets/search/recent`, {
    headers,
    params: {
      query: `conversation_id:${conversationId} -is:retweet`,
      max_results: Math.min(maxResults, 100),
      'tweet.fields': 'public_metrics,created_at,author_id,in_reply_to_user_id',
      'user.fields': 'name,username',
      expansions: 'author_id',
    },
  });

  const replies = (response.data.data || []).filter(t => t.id !== tweetId);
  const users = response.data.includes?.users || [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return replies.map(reply => ({
    id: reply.id,
    text: reply.text,
    author: userMap[reply.author_id] || null,
    likes: reply.public_metrics?.like_count || 0,
    retweets: reply.public_metrics?.retweet_count || 0,
    replies: reply.public_metrics?.reply_count || 0,
    created_at: reply.created_at,
  }));
}

function extractTweetId(urlOrId) {
  if (/^\d+$/.test(urlOrId)) return urlOrId;
  const match = urlOrId.match(/status\/(\d+)/);
  if (match) return match[1];
  throw new Error('Invalid tweet URL or ID');
}

module.exports = { searchTweets, fetchThread, fetchReplies, extractTweetId };
