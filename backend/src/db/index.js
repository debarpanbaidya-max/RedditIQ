const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
});

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS threads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    thread_url VARCHAR(500),
    author_handle VARCHAR(255),
    author_name VARCHAR(255),
    tweet_count INTEGER DEFAULT 0,
    fetched_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tweets (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
    tweet_id VARCHAR(255) UNIQUE,
    position INTEGER,
    content TEXT,
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
    tweet_id INTEGER REFERENCES tweets(id) ON DELETE CASCADE,
    engagement_score DECIMAL(10,4) DEFAULT 0,
    drop_off_rate DECIMAL(10,4) DEFAULT 0,
    impressions_proxy INTEGER DEFAULT 0,
    sentiment_label VARCHAR(50),
    is_problem_tweet BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS hooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(500),
    stance VARCHAR(255),
    hook_text TEXT,
    score DECIMAL(5,2) DEFAULT 0,
    curiosity_gap DECIMAL(5,2) DEFAULT 0,
    emotional_trigger DECIMAL(5,2) DEFAULT 0,
    controversy DECIMAL(5,2) DEFAULT 0,
    angle_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS blueprints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(500),
    stance VARCHAR(255),
    blueprint JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
    tweet_id VARCHAR(255),
    comment_id VARCHAR(255) UNIQUE,
    author_handle VARCHAR(255),
    content TEXT,
    toxicity_score DECIMAL(5,4) DEFAULT 0,
    category VARCHAR(50),
    strategy VARCHAR(50),
    engagement_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log('✅ Database initialized successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
