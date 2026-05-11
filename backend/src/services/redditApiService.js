const axios = require('axios');

// Basic User-Agent is highly recommended by Reddit API to avoid 429 Too Many Requests
const headers = {
  'User-Agent': 'NodeJS:RedditIQ:v1.0 (by /u/debarpan)',
};

/**
 * Search recent posts for a given query
 */
async function searchPosts(query, maxResults = 25) {
  try {
    const response = await axios.get('https://www.reddit.com/search.json', {
      headers,
      params: {
        q: query,
        sort: 'top',
        limit: maxResults,
        t: 'month',
      },
    });

    const posts = response.data?.data?.children || [];

    return posts.map(child => {
      const post = child.data;
      return {
        id: post.id,
        text: `${post.title}\n\n${post.selftext}`.trim().substring(0, 500) + '...',
        author: { name: post.author, username: post.author },
        likes: post.ups,
        retweets: 0, // Reddit doesn't have retweets, keeping for schema compat
        replies: post.num_comments,
        impressions: post.view_count || 0,
        created_at: new Date(post.created_utc * 1000).toISOString(),
      };
    });
  } catch (err) {
    console.error('Reddit Search Error:', err.response?.data || err.message);
    throw new Error('Failed to fetch Reddit search data.');
  }
}

/**
 * Fetch a Reddit post and its top-level comments (simulating a thread)
 */
async function fetchThread(postUrlOrId) {
  try {
    let url = postUrlOrId;
    if (!url.startsWith('http')) {
      // If it's just an ID, assume it's a post ID
      url = `https://www.reddit.com/comments/${postUrlOrId}`;
    }

    // Validate: must be a post URL, not a subreddit/user/search page
    if (!url.includes('/comments/')) {
      throw Object.assign(
        new Error('Please paste a specific Reddit post URL (it must contain /comments/ in the link), not a subreddit or profile page.'),
        { status: 400 }
      );
    }

    // Strip trailing slashes and query params, then add .json
    url = url.split('?')[0].replace(/\/$/, '') + '.json';

    const response = await axios.get(url, { headers, timeout: 15000 });

    // Reddit returns an array of two items: [post_data, comments_data]
    const postData = response.data[0].data.children[0].data;
    const commentsData = response.data[1].data.children;

    const author = { name: postData.author, username: postData.author };

    // Format root post
    const rootPost = {
      id: postData.id,
      position: 1,
      text: `${postData.title}\n${postData.selftext}`,
      likes: postData.ups,
      retweets: 0,
      replies: postData.num_comments,
      bookmarks: postData.saved ? 1 : 0,
      impressions: postData.view_count || 0,
      created_at: new Date(postData.created_utc * 1000).toISOString(),
    };

    // Format top-level comments as "thread replies"
    const parsedReplies = commentsData
      .filter(child => child.kind === 't1') // t1 = comment type
      .map((child, index) => {
        const comment = child.data;
        return {
          id: comment.id,
          position: index + 2,
          text: comment.body,
          likes: comment.ups,
          retweets: 0,
          replies: comment.replies ? comment.replies.data?.children?.length || 0 : 0,
          bookmarks: 0,
          impressions: 0,
          created_at: new Date(comment.created_utc * 1000).toISOString(),
        };
      });

    return {
      author,
      conversationId: postData.id,
      tweets: [rootPost, ...parsedReplies],
    };
  } catch (err) {
    // Re-throw our own validation errors with their original message
    if (err.status === 400) throw err;
    console.error('Reddit Thread Fetch Error:', err.response?.data || err.message);
    const status = err.response?.status;
    if (status === 404) throw new Error('Reddit post not found. Make sure the URL is correct and the post is still live.');
    if (status === 403) throw new Error('Reddit blocked this request. Try again in a moment.');
    if (status === 429) throw new Error('Reddit rate limit hit. Please wait a few seconds and try again.');
    throw new Error('Failed to fetch Reddit thread/post. Check the URL and try again.');
  }
}

/**
 * Fetch replies to a specific post (Reddit doesn't separate thread vs replies heavily, 
 * so we can reuse the comments fetch if we pass the whole URL)
 */
async function fetchReplies(tweetId, postUrlFull) {
  try {
    // If they click on a comment in analytics, we can fetch sub-comments. 
    // For simplicity of Reddit pivot, we'll just fetch the main thread again and get all comments.
    const url = `https://www.reddit.com/comments/${postUrlFull}.json`;
    const response = await axios.get(url, { headers });
    
    // Flatten comment tree slightly to find replies
    const commentsData = response.data[1].data.children;
    let allComments = [];
    
    const extractComments = (children) => {
      for (const child of children) {
        if (child.kind === 't1') {
          allComments.push({
            id: child.data.id,
            text: child.data.body,
            author: { name: child.data.author, username: child.data.author },
            likes: child.data.ups,
            retweets: 0,
            replies: child.data.replies ? child.data.replies.data?.children?.length || 0 : 0,
            created_at: new Date(child.data.created_utc * 1000).toISOString(),
          });
          
          if (child.data.replies && child.data.replies.data) {
             extractComments(child.data.replies.data.children);
          }
        }
      }
    };
    
    extractComments(commentsData);

    // Return the total bag of comments for this thread, excluding the one clicked
    return allComments.filter(c => c.id !== tweetId);
  } catch (err) {
    return [];
  }
}

function extractTweetId(urlOrId) {
  if (!urlOrId.includes('reddit.com')) return urlOrId;
  const match = urlOrId.match(/comments\/([a-z0-9]+)/);
  if (match) return match[1];
  return urlOrId;
}

module.exports = { searchPosts, fetchThread, fetchReplies, extractTweetId };
