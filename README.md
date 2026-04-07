# ThreadIQ

> AI-Powered Thread Analytics, Hook Optimization & Toxic Reply Defense System for X Creators

---

## 🚀 Quick Start

### 1. Configure environment
```bash
cp .env.example backend/.env
# Fill in all values in backend/.env
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Python microservice:**
```bash
cd python-service
pip install -r requirements.txt
```

### 3. Start everything
```bash
# From project root — launches all 3 services
start.bat
```

Or manually:
```bash
# Terminal 1
cd python-service && python app.py

# Terminal 2
cd backend && npm run dev

# Terminal 3
cd frontend && npm run dev
```

---

## 🌐 Service Ports
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000 |
| Python Microservice | http://localhost:5001 |

---

## 🔑 Required API Keys (in `backend/.env`)

| Key | Where to get it |
|-----|----------------|
| `GOOGLE_CLIENT_ID` / `SECRET` | [Google Cloud Console](https://console.cloud.google.com) → APIs → OAuth 2.0 |
| `CLAUDE_API_KEY` | [Anthropic Console](https://console.anthropic.com) |
| `X_BEARER_TOKEN` | [X Developer Portal](https://developer.x.com) |
| `DATABASE_URL` | [Neon](https://neon.tech) → Create project → Connection string |

### Google OAuth Setup
1. Go to Google Cloud Console → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:4000/auth/google/callback` as authorized redirect URI
4. Add `http://localhost:5173` as authorized JavaScript origin

---

## 🏗️ Project Structure
```
threadiq/
├── backend/           Node.js + Express + Passport.js
│   └── src/
│       ├── routes/    auth, research, analytics, defense
│       ├── services/  xApiService, claudeService, toxicityService, analyticsService
│       ├── controllers/
│       ├── middleware/ JWT auth
│       └── db/        Neon PostgreSQL
├── frontend/          React + Vite + Tailwind + D3 + Zustand
│   └── src/
│       ├── pages/     Landing, Research, Analytics, Defense
│       ├── components/ Layout, HookCard, BlueprintView, CommentCard, D3 charts
│       └── store/     Zustand state
└── python-service/    Flask + Detoxify NLP
    └── app.py
```

---

## 🔌 API Endpoints

### Auth
- `GET /auth/google` — Start OAuth
- `GET /auth/google/callback` — Callback
- `GET /auth/me` — Current user
- `POST /auth/logout` — Logout

### Research (Page 1)
- `POST /api/research/analyze` — `{ topic, stance }` → hooks + blueprint
- `GET /api/research/history` — Saved hooks

### Analytics (Page 2)
- `POST /api/analytics/thread` — `{ threadUrl }` → drop-off analysis
- `POST /api/analytics/replies` — `{ tweetId, conversationId }` → replies
- `GET /api/analytics/history` — Thread history

### Defense (Page 3)
- `POST /api/defense/analyze` — `{ comments: [...] }` → toxicity + strategy
- `POST /api/defense/reply` — `{ comment, strategy }` → Claude reply options

### Python Service
- `POST /analyze` — `{ comments: ["text1", "text2"] }` → Detoxify scores

---

## 🧠 Key Engineering Decisions

1. **Google OAuth + JWT in httpOnly cookies** — prevents XSS token theft
2. **X API v2 hybrid pipeline** — fetches thread by conversation_id + author filter
3. **Detoxify isolated in Python Flask microservice** — keeps ML inference separate from Node.js
4. **Strategy engine** — maps (category × engagement) → (IGNORE / DEFEND / RESPOND)
5. **Hook scoring** — Claude scores 5 angles; sorted by overall weighted score
6. **Drop-off formula** — `drop_off[i] = (eng[i] - eng[i+1]) / eng[i]`
7. **Impressions proxy** — `impressions = total_engagement / 0.03` when X API doesn't return raw impressions
