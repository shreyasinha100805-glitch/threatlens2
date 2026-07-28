# 🔐 ThreatLens
> AI-Powered Security Copilot for Early-Stage Founders

Rebuilt for **Build with Gemini XPRIZE** — Category: **Entrepreneurship & Job Creation**

ThreatLens is a conversational security intelligence agent that lets a founder or
small engineering team ask plain-English questions about their security logs —
"what's critical right now," "check this IP," "what do I do about the
ransomware" — and get back real answers, computed live against MongoDB Atlas by
a Google Gemini agent that decides which tool to call.

---

## Why this fits "Entrepreneurship & Job Creation"

Security tooling is usually priced and staffed for enterprises: a SOC analyst,
a SIEM license, a security engineer hire. Early-stage founders and small teams
building the next generation of startups typically have none of that, and a
single unhandled breach can end a company before it creates a single job.

ThreatLens's business is to be the security hire a pre-seed/seed-stage founder
can't yet afford: an AI operator that watches logs, triages threats, and tells
a non-security founder exactly what to do next, so they can keep hiring
engineers instead of firebreaks. The product itself is a small business —
it needs real paying customers (other founders and small dev teams) to prove
the model, which is the "operate a business with AI" requirement of the
Hackathon.

**This repository is the product.** It is not, by itself, evidence of a
business — the Hackathon separately requires you to show real revenue, real
users, and real usage logs (see `SUBMISSION_CHECKLIST.md`). Those have to come
from you actually running ThreatLens as a business during the Submission
Period; no one can generate that evidence on your behalf, and fabricating it
would violate the Official Rules' "Related-Party Revenue" and "user evidence"
requirements.

## Google Cloud Platform usage (Platform requirement)

| Product | Role |
|---|---|
| **Gemini API** | Required LLM call — every chat turn and every tool-routing decision runs through `gemini-2.0-flash-001` via `backend/genaiClient.js` |
| **Vertex AI text-embedding-004** | Powers `semantic_search` (vector embeddings for fuzzy log queries) |
| **Cloud Run** | Hosts the Express backend (`backend/Dockerfile`) |
| **Firebase Hosting** | Hosts the React frontend |

## AI-Native Operations (Judging Criterion #2)

The Gemini agent in `backend/agent.js` is given 4 function-calling tools and
decides, per user message, which to invoke — this is a real function-calling
loop against a real database, not a scripted demo:

| Tool | Description | Example trigger |
|---|---|---|
| `query_logs` | Filter logs by severity/type | "Show me critical events" |
| `semantic_search` | Vector similarity search over log embeddings | "Any brute force attacks?" |
| `get_ip_reputation` | Risk score + history for an IP | "Check IP 10.0.0.5" |
| `suggest_remediation` | Step-by-step response playbook | "What should I do about ransomware?" |

A separate, generic MongoDB "MCP" tool layer (`backend/mongoMCP.js`) exposes
`find_documents`, `aggregate_documents`, `count_documents`, and
`get_collections` for direct database inspection/testing independent of the
agent.

---

## Architecture

```
Founder's question
     |
React Chat UI (Vite + TS, Firebase Hosting)
     |
Node.js/Express backend (Google Cloud Run)
     |
Gemini 2.0 Flash agent  <-- REQUIRED Gemini API LLM call
     | picks one of 4 tools (function calling)
+---------------------------------------------+
| query_logs | semantic_search                |
| get_ip_reputation | suggest_remediation     |
+---------------------------------------------+
     |
MongoDB Atlas (+ Vector Search on Gemini embeddings)
     |
Plain-English answer
```

## Project structure

```
threatlens/
├── backend/
│   ├── agent.js          # Gemini agent + function-calling loop
│   ├── tools.js           # 4 agent tools implementation
│   ├── mongoMCP.js        # Generic MongoDB MCP-style tool server
│   ├── logSchema.js        # Log event shape + validation
│   ├── genaiClient.js      # Gemini API wrapper (chat + embeddings)
│   ├── seed.js             # 15 sample security log events
│   ├── embedLogs.js        # Generate Gemini embeddings for vector search
│   ├── index.js            # Express server + all endpoints
│   ├── Dockerfile          # Cloud Run deployment
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx          # React chat UI + live threat sidebar
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── vite.config.ts
    └── Dockerfile           # optional containerized static hosting
```

## API Endpoints

```
GET  /health          — health check
POST /chat            — send a message to the Gemini agent
GET  /threats/recent  — recent high/critical severity events
GET  /mcp/tools       — list MongoDB MCP tools
POST /mcp/execute     — execute a MongoDB MCP tool directly
```

---

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine to start)
- A Gemini API key — get one via [Google AI Studio](https://aistudio.google.com/) or your Google Cloud project (the Hackathon's Google Cloud Free Trial: https://cloud.google.com/free)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI and GEMINI_API_KEY
npm run seed            # load 15 sample events
npm run embed            # generate embeddings for semantic_search
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173 — it proxies API calls to the backend on :8080.

### Deploy

**Backend → Cloud Run**
```bash
cd backend
gcloud run deploy threatlens-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=...,GEMINI_API_KEY=...
```

**Frontend → Firebase Hosting**
```bash
cd frontend
npm run build
npx firebase-tools deploy --only hosting
```

### MongoDB Atlas Vector Search index
After running `npm run embed`, create an Atlas Vector Search index named
`vector_index` on the `security_logs` collection, indexing the `embedding`
field (3072 dimensions, cosine similarity — matches `gemini-embedding-001`'s
output). Until you do, `semantic_search` automatically falls back to an
in-process cosine-similarity ranking so the demo still works.

---

## Business & revenue features

- **Landing page** (`Landing` tab) — public marketing page with the pitch, feature
  highlights, pricing, and a waitlist signup form.
- **Real Stripe Checkout** (`backend/billing.js`) — the paid plan buttons on the
  Landing and Business tabs create a genuine Stripe Checkout Session in
  subscription mode. Configure it by setting `STRIPE_SECRET_KEY` and the two
  `STRIPE_PRICE_*` Price IDs in `backend/.env` (see `.env.example` for where
  to get these from your Stripe Dashboard). Without Stripe configured, checkout
  returns a clear explanatory error instead of crashing.
- **Waitlist / signup capture** (`backend/waitlist.js`) — every landing-page
  signup is stored in the `waitlist_signups` MongoDB collection. `GET /waitlist`
  returns the full list — this is your real-user evidence for the hackathon
  submission (export it when filling out the user-evidence section).

### Accounts & pages
Real accounts now, not just an anonymous browser id: bcrypt-hashed passwords
+ JWT sessions (`backend/auth.js`). Set `JWT_SECRET` in `.env` to a long
random string before deploying anywhere real users can reach it (generate one
with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

The frontend is a single-page app with these views (`frontend/src/App.tsx`):
- **Landing** — public marketing page
- **Sign up / Log in** — creates/verifies a real account, issues a JWT
- **Dashboard** — post-login home: plan status, usage, quick links
- **Console** — the chat interface (requires login)
- **Payment** — plan selection → real Stripe Checkout (requires login)
- **Payment confirmed** — dedicated success page after a verified payment
- **Account** — plan facilities, usage stats, evidence export (requires login)

### What paying actually unlocks
Payment isn't cosmetic — plans are tied to an anonymous per-browser client ID
(`backend/entitlements.js`) and gate real behavior:
- **Query limits** — free plan capped at 50 agent queries/month (`recordQueryAndCheckLimit`), enforced in `POST /chat`. Paid plans are unlimited.
- **Slack alerts** (`backend/alerts.js`) — Early Team+ gets a real Slack webhook ping whenever the agent surfaces a high/critical threat. Set `SLACK_WEBHOOK_URL` in `.env`.
- **Priority review flagging** — `POST /threats/:eventId/priority`, gated to Early Team+, marks a threat for expedited review (flag button appears on threat cards in the Console).
- **SOC2 evidence export** — `GET /billing/evidence-export`, gated to Scaling Up, downloads a CSV audit log of every tool call the agent made.

---

## Resources
See `RESOURCES.md` for the hackathon's official links (Google Cloud free trial, Antigravity, orientation videos, FAQ/Discord, and the P&L submission template).

---

## License
MIT — see `LICENSE`.
