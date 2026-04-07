const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ── Start Google OAuth ────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// ── Google OAuth Callback ─────────────────────────────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard/research`);
  }
);

// ── Get current user ──────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { pool } = require('../db');

    pool.query('SELECT id, email, name, avatar, created_at FROM users WHERE id = $1', [decoded.userId])
      .then(result => {
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({ user: result.rows[0] });
      });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  req.logout?.(() => {});
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
