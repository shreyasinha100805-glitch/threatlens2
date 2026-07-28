# 🔐 ThreatLens — AI Security Copilot for Founders

> **Build with Gemini XPRIZE Submission** — Category: **Entrepreneurship & Job Creation**

ThreatLens is an AI-powered conversational security copilot built for founders and engineering teams. It continuously monitors security logs, translates complex telemetry into plain English, and provides 1-click incident mitigation — powered by **Google Gemini API** and **MongoDB Atlas Vector Search**.

---

## 🌟 Key Features & Capabilities

- **✨ Bring Your Own Gemini API Key (BYOK)**: Connect your own Google Gemini API key directly from Google AI Studio (`✨ Gemini Access`) to get un-throttled, live Gemini 1.5 Pro responses.
- **🛡️ 1-Click Incident Mitigation**: Instantly block malicious IPs and isolate infected host endpoints directly from the threat drawer.
- **⚡ Tier Advantage Matrix**: Tier-gated feature advantages comparing **Solo Founder ($0)**, **Early Team ($49/mo)**, and **Scaling Up ($199/mo)**.
- **🎨 Glassmorphic Cyber SOC UI**: Deep Obsidian aesthetic with ambient mesh glows, typography powered by `Outfit` and `JetBrains Mono`, and an animated 360° laser threat radar.
- **🏷️ MITRE ATT&CK Framework Mapping**: Automatic tactic & technique categorization (e.g., *T1486 Data Encrypted for Impact*, *T1110.001 Password Guessing*).
- **👑 SOC2 Evidence CSV Audit Export**: Download complete structured CSV audit trails of every agent tool call executed for compliance evidence.
- **💬 Real-Time Slack Alerting**: Automated webhook alerts fired to Slack when high or critical threats are detected.

---

## 🚀 Why This Fits "Entrepreneurship & Job Creation"

Early-stage startups cannot afford a dedicated SOC analyst ($150k+/year) or enterprise SIEM licenses. A single unmitigated breach can shut down a startup before it creates its first job. 

ThreatLens serves as an AI security partner for pre-seed and seed-stage founders — allowing small teams to focus on hiring engineers and scaling their core product while ThreatLens monitors infrastructure 24/7.

---

## ☁️ Google Cloud Platform & Gemini API Integration

| Component | Technology | Description |
|---|---|---|
| **Primary LLM** | `Gemini 1.5 Flash` / `Gemini 2.0 Flash` | Powers conversational copilot analysis and 4-tool function-calling agent loop |
| **Embeddings** | `gemini-embedding-001` | Generates 3072-dimensional log vector embeddings for semantic similarity search |
| **Backend Service** | Node.js / Express | Hosted on **Google Cloud Run** (`backend/Dockerfile`) |
| **Frontend Web App** | React 18 + TypeScript + Vite | Hosted on **Firebase Hosting** |

---

## 🤖 AI-Native Agent & Tool Architecture

The Gemini agent (`backend/agent.js`) dynamically executes function-calling tools against MongoDB Atlas:

| Tool | Purpose | Example Query Trigger |
|---|---|---|
| `query_logs` | Structured MongoDB filtering by severity/type | *"Show me all critical ransomware threats"* |
| `semantic_search` | Vector similarity search via Gemini embeddings | *"Are there any suspicious off-hour logins?"* |
| `get_ip_reputation` | Risk rating, ASN, Tor exit node & threat feed history | *"Check reputation for IP 185.220.101.4"* |
| `suggest_remediation` | Step-by-step incident response playbooks | *"How do I contain host fileserver-01?"* |

---

## 🏗️ Architecture Diagram

```text
                  Founder / Security Team Question
                                 │
            React Chat UI (Vite + TS + Cyber Glassmorphic CSS)
                                 │
            Node.js / Express API Backend (Cloud Run)
                                 │
           Google Gemini API (Gemini 1.5 Pro / BYOK Key)
                                 │ Function Calling Loop
      ┌──────────────────────────┴──────────────────────────┐
      │ query_logs │ semantic_search                        │
      │ get_ip_reputation │ suggest_remediation             │
      └──────────────────────────┬──────────────────────────┘
                                 │
             MongoDB Atlas (+ Vector Search Index)
                                 │
            Actionable Response & 1-Click Mitigation
```

---

## 📁 Repository Structure

```text
threatlens/
├── backend/
│   ├── agent.js          # Gemini agent + function-calling loop
│   ├── tools.js          # 4 agent security tools implementation
│   ├── mongoMCP.js       # Generic MongoDB MCP-style tool server
│   ├── logSchema.js       # Log event schema & validation
│   ├── genaiClient.js     # Gemini API wrapper with retry & BYOK support
│   ├── seed.js            # Seed script for mock security logs
│   ├── embedLogs.js       # Vector embedding generator for Atlas Search
│   ├── index.js           # Express server & API endpoints
│   ├── Dockerfile         # Cloud Run container deployment
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx        # Single-Page App (Dashboard, Console, Payment, Account)
    │   ├── main.tsx       # Entry point
    │   └── index.css      # Cyber Glassmorphic design tokens & animations
    ├── index.html         # Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)
    └── vite.config.ts
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health status |
| `POST` | `/chat` | Agent chat endpoint (supports `X-Gemini-API-Key` BYOK header) |
| `GET` | `/threats/recent` | Fetch recent high/critical threat events |
| `POST` | `/threats/:eventId/priority` | Flag threat for priority review queue (Early Team+) |
| `POST` | `/billing/checkout` | Create Stripe Checkout subscription session |
| `GET` | `/billing/session/:id` | Verify completed Stripe checkout session |
| `GET` | `/billing/evidence-export` | Download CSV audit log of tool calls (Scaling Up) |
| `GET` | `/entitlements` | Retrieve active plan tier entitlement status |
| `POST` | `/auth/signup` | Register new user account |
| `POST` | `/auth/login` | Authenticate user & issue JWT session token |
| `GET` | `/auth/me` | Fetch authenticated user profile & current plan |
| `POST` | `/waitlist` | Capture waitlist signups |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+
- **MongoDB Atlas**: Free cluster instance
- **Google Gemini API Key**: Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `MONGODB_URI` and `GEMINI_API_KEY` in `backend/.env`.

Seed sample log data and generate vector embeddings:
```bash
npm run seed
npm run embed
npm start
```
The backend server runs on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`. Vite proxies API requests to the backend server at `:8080`.

---

## 💎 Plan Tier Advantages

| Advantage / Capability | Solo Founder ($0) | Early Team ($49/mo) | Scaling Up ($199/mo) |
|---|---|---|---|
| **Agent Copilot Queries** | 50 queries / mo | ⚡ **UNLIMITED** | ⚡ **UNLIMITED** |
| **1-Click IP & Host Mitigation** | 🔒 Preview Mode | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **Real-Time Slack Alerts** | 🔒 Locked | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **Priority Threat Flagging** | 🔒 Locked | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **SOC2 CSV Evidence Export** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (CSV Audit Trail)** |
| **Automated Playbook Execution** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (Auto-Playbooks)** |
| **Dedicated Security Architect AI** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (Architect Mode)** |
| **Support SLA** | Community | Standard | 👑 **Priority 24/7 SLA** |

---

## 📄 License
MIT License — see `LICENSE` for details.

## License
MIT — see `LICENSE`.
