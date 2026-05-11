# ThreadIQ

> AI-Powered Thread Analytics, Hook Optimization & Toxic Reply Defense System for X Creators

**🔥 Live Demo:** [https://reddit-iq-vfca.vercel.app](https://reddit-iq-vfca.vercel.app)

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

### 3. Start everything

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🌐 Service URLs
| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Production** | `https://reddit-iq-vfca.vercel.app` | `https://threadiq-backend.onrender.com` |
| **Local** | `http://localhost:5173` | `http://localhost:4000` |

---

## 🔑 Required API Keys (in `backend/.env`)

| Key | Where to get it |
|-----|----------------|
| `GOOGLE_CLIENT_ID` / `SECRET` | [Google Cloud Console](https://console.cloud.google.com) → APIs → OAuth 2.0 |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API Key |
| `HUGGINGFACE_API_KEY` | [HuggingFace](https://huggingface.co/settings/tokens) → New token → Inference Providers |
| `X_BEARER_TOKEN` | [X Developer Portal](https://developer.x.com) |
| `DATABASE_URL` | [Neon](https://neon.tech) → Create project → Connection string |

### Google OAuth Setup
1. Go to Google Cloud Console → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add `https://threadiq-backend.onrender.com/auth/google/callback` (and `http://localhost:4000/...` for local testing) as authorized redirect URIs
4. Add `https://reddit-iq-vfca.vercel.app` (and `http://localhost:5173` for local testing) as authorized JavaScript origins

---

## 🏗️ Project Structure
```
threadiq/
├── backend/           Node.js + Express + Passport.js
│   └── src/
│       ├── routes/    auth, research, analytics, defense
│       ├── services/  xApiService, aiService, toxicityService, analyticsService
│       ├── controllers/
│       ├── middleware/ JWT auth
│       └── db/        Neon PostgreSQL
├── frontend/          React + Vite + Tailwind + D3 + Zustand
│   └── src/
│       ├── pages/     Landing, Research, Analytics, Defense
│       ├── components/ Layout, HookCard, BlueprintView, CommentCard, D3 charts
│       └── store/     Zustand state
└── python-service/    (legacy — no longer active)
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
- `POST /api/defense/analyze` — `{ comments: [...] }` → toxicity scores + strategy
- `POST /api/defense/reply` — `{ comment, strategy }` → Gemini AI reply options

---

## 🧠 Key Engineering Decisions

1. **Google OAuth + JWT in httpOnly cookies** — prevents XSS token theft
2. **X API v2 hybrid pipeline** — fetches thread by conversation_id + author filter
3. **HuggingFace `unitary/toxic-bert`** — real BERT transformer (trained on Jigsaw Toxic Comments dataset) called via cloud API, no server needed
4. **Strategy engine** — maps (category × engagement) → (IGNORE / DEFEND / RESPOND)
5. **Gemini AI reply generation** — scores hook angles and generates contextual reply options
6. **Drop-off formula** — `drop_off[i] = (eng[i] - eng[i+1]) / eng[i]`
7. **Impressions proxy** — `impressions = total_engagement / 0.03` when X API doesn't return raw impressions
