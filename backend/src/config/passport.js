const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('../db');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    const existing = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE users SET name = $1, avatar = $2, updated_at = NOW() WHERE google_id = $3',
        [profile.displayName, avatar, profile.id]
      );
      return done(null, existing.rows[0]);
    }

    const result = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
      [profile.id, email, profile.displayName, avatar]
    );

    return done(null, result.rows[0]);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});
