require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

require('./config/passport');

const authRoutes = require('./routes/auth');
const researchRoutes = require('./routes/research');
const analyticsRoutes = require('./routes/analytics');
const defenseRoutes = require('./routes/defense');

const { initializeDatabase } = require('./db');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/defense', defenseRoutes);

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ThreadIQ Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 ThreadIQ Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
