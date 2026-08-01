# 🔐 ThreatLens v2.0 — AI Security Copilot & Autonomous Agent Payments for Startups

> **Build with Gemini XPRIZE Submission** — Category: **Entrepreneurship & Job Creation**

[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas_Vector_Search-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/products/platform/atlas-vector-search)
[![Circle USDC](https://img.shields.io/badge/Web3-Circle_Developer--Controlled_Wallets-2775CA?style=for-the-badge&logo=usdc&logoColor=white)](https://www.circle.com/)
[![TypeScript](https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript_%2B_Vite-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://vitejs.dev/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-shreyasinha100805--glitch%2Fthreatlens2-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shreyasinha100805-glitch/threatlens2)
[![ThreatLens CI](https://github.com/shreyasinha100805-glitch/threatlens2/actions/workflows/ci.yml/badge.svg)](https://github.com/shreyasinha100805-glitch/threatlens2/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**ThreatLens** is an AI-powered conversational security copilot built specifically for pre-seed and seed-stage founders and engineering teams. It continuously monitors security telemetry, translates complex log data into plain English, provides 1-click incident mitigation, and supports autonomous USDC micropayments — powered by **Google Gemini API**, **MongoDB Atlas Vector Search**, and **Circle Developer-Controlled Wallets**.

---

## 🌟 Key Features & Capabilities

- **✨ Bring Your Own Gemini API Key (BYOK)**: Direct API key injection (`X-Gemini-API-Key`) from Google AI Studio (`✨ Gemini Access`) for un-throttled, ultra-fast Gemini 2.5/1.5 Flash responses.
- **🪙 Circle USDC Autonomous Agent Payments**: Integrated Circle Web3 Developer-Controlled Wallets for autonomous agent micropayments and USDC subscription checkouts.
- **🤖 Multi-Agent Security Orchestration**: Specialized visual cards and live activity timeline tracking collaborative AI agents (*Threat Triage Agent*, *IP Reputation Bot*, *Mitigation Playbook Agent*).
- **📐 Interactive Cyber Architecture Diagram Studio**: Dynamic visual node-edge threat topology canvas to map infrastructure components and attack vectors.
- **🛡️ 1-Click Incident Mitigation & Playbooks**: Instantly isolate compromised hosts (e.g. `fileserver-01`) or block malicious IPs (e.g. `185.220.101.4`) with automated containment playbooks.
- **🗺️ Spatial Threat Heatmap & 360° Laser Radar Map**: Real-time attack spatial density heatmap and animated radar monitoring interface.
- **📊 SOC2 Evidence CSV Audit Export & PDF Reports**: Instant export of structured CSV audit evidence for compliance and auto-generated executive PDF threat reports.
- **💬 Real-Time Slack Alerting**: Fired via webhooks to team Slack channels when high or critical security threats are flagged.
- **🎨 Deep Obsidian Cyber SOC UI & Audio Engine**: Glassmorphic dark aesthetic, particle canvas background (`CyberCanvas`), celebratory confetti bursts, and sci-fi audio sound effects (`cyberAudio`).

---

## 🚀 Why This Fits "Entrepreneurship & Job Creation"

Early-stage startups cannot afford a dedicated SOC analyst ($150k+/year) or expensive enterprise SIEM licenses. A single unmitigated ransomware breach or credential leak can force a startup to shut down before it hires its first employee.

ThreatLens acts as a 24/7 AI security partner for founders — allowing small teams to focus on hiring engineers, building product, and creating jobs while ThreatLens autonomously monitors infrastructure, analyzes threats, and executes mitigations.

---

## ☁️ Technology Stack & Integrations

| Component | Technology | Description |
|---|---|---|
| **Primary LLM** | `Gemini 2.5 Flash` / `Gemini 1.5 Pro` | Powers conversational copilot analysis and 4-tool function-calling agent loop |
| **Embeddings** | `gemini-embedding-001` | Generates 3072-dimensional log vector embeddings for semantic similarity search |
| **Database & Vector Search** | MongoDB Atlas | Stores structured security logs, audit trails, and performs Atlas Vector Search |
| **Web3 Agent Payments** | Circle Developer-Controlled Wallets | Enables USDC autonomous wallet creation, transfer, and subscription payments |
| **Backend API** | Node.js / Express | Hosted on **Google Cloud Run** (`backend/Dockerfile`) |
| **Frontend Web App** | React 18 + TypeScript + Vite | Deep Obsidian Cyber Glassmorphic UI hosted on **Firebase / Vercel** |
| **CI / CD** | GitHub Actions | Automated build, syntax verification, and TypeScript checking pipeline |
| **Payments** | Stripe & Circle USDC | Dual fiat and crypto Web3 checkout engines |

---

## 🤖 AI-Native Agent & Tool Architecture

The Gemini agent ([backend/agent.js](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/backend/agent.js)) dynamically executes function-calling tools against MongoDB Atlas:

| Tool | Purpose | Example Query Trigger |
|---|---|---|
| `query_logs` | Structured MongoDB filtering by severity/type/host | *"Show me all critical ransomware threats"* |
| `semantic_search` | Vector similarity search via Gemini embeddings | *"Are there any suspicious off-hour logins?"* |
| `get_ip_reputation` | Risk rating (0-100), ASN, Tor exit node & feed history | *"Check reputation for IP 185.220.101.4"* |
| `suggest_remediation` | Step-by-step incident response playbooks | *"How do I contain host fileserver-01?"* |

---

## 🏗️ System Architecture Diagram

```text
                     Founder / Security Engineer
                                  │
         React 18 Chat UI (Vite + TypeScript + Cyber Glassmorphic CSS)
       ┌──────────────────────────┼──────────────────────────┐
       ▼                          ▼                          ▼
 Multi-Agent Cards         Diagram Studio            Threat Heatmap & Radar
       │                          │                          │
       └──────────────────────────┼──────────────────────────┘
                                  │
               Express.js REST API Backend (Cloud Run)
       ┌──────────────────────────┼──────────────────────────┐
       ▼                          ▼                          ▼
 Google Gemini API        Circle Web3 Wallets       MongoDB Atlas Database
 (Gemini 2.5 Flash)       (USDC Agent Payments)      (+ Vector Search Index)
       │                          │                          │
 Function-Calling Loop      Autonomous Transfer        Structured Logs & Audit
       └──────────────────────────┼──────────────────────────┘
                                  │
               Actionable Mitigations & Alerting
             ┌────────────────────┴────────────────────┐
             ▼                                         ▼
      Slack Alerts                              SOC2 CSV / PDF Export
```

---

## 📁 Repository Structure

```text
threatlens/
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI workflow (Backend & Frontend checks)
├── backend/
│   ├── agent.js              # Gemini function-calling agent loop
│   ├── agentPayments.js      # Circle USDC autonomous payment engine
│   ├── alerts.js             # Real-time Slack webhook alert dispatcher
│   ├── auth.js               # User authentication (Bcrypt + JWT)
│   ├── billing.js            # Stripe checkout & subscription management
│   ├── circleCheckout.js     # Circle USDC payment checkout handler
│   ├── circleSetup.js        # Circle Developer-Controlled Wallet initializer
│   ├── embedLogs.js          # Gemini vector embedding generator
│   ├── entitlements.js       # Feature entitlements & query rate limiting
│   ├── genaiClient.js        # Gemini API wrapper with retry & BYOK header support
│   ├── index.js              # Main Express server & API endpoints
│   ├── logSchema.js          # Security event schema & validation
│   ├── mongoMCP.js           # MongoDB Model Context Protocol (MCP) server
│   ├── seed.js               # Mock security log data generator
│   ├── tools.js              # Agent function tools (logs, vector search, IP rep, playbooks)
│   ├── waitlist.js           # Waitlist signup engine
│   ├── Dockerfile            # Google Cloud Run deployment container
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── AgentActivityTimeline.tsx   # Multi-agent activity timeline
    │   ├── App.tsx                     # Main dashboard & single-page navigation
    │   ├── AutonomousPaymentWidget.tsx # Circle USDC wallet & payment panel
    │   ├── ConfettiEffect.tsx          # Incident mitigation celebration effect
    │   ├── CyberCanvas.tsx             # Particle matrix background canvas
    │   ├── DiagramStudio.tsx           # Interactive threat topology diagrammer
    │   ├── MultiAgentCards.tsx         # Specialized AI agent cards
    │   ├── PaymentCheckoutModal.tsx    # Stripe & Circle USDC modal
    │   ├── ThreatHeatmap.tsx           # Spatial attack density heatmap
    │   ├── ThreatLensCopilotPanel.tsx  # Main Gemini AI copilot chat interface
    │   ├── ThreatRadarMap.tsx          # 360° animated radar monitor
    │   ├── TransactionHistory.tsx      # USDC transaction ledger viewer
    │   ├── circlePaymentEngine.ts      # Circle Web3 SDK helper
    │   ├── cyberAudio.ts               # Cyber sound effects engine
    │   ├── index.css                   # Cyber glassmorphic styling & design tokens
    │   ├── main.tsx                    # React entry point
    │   └── pdfReportGenerator.ts       # Executive PDF audit report generator
    ├── index.html                      # Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)
    └── vite.config.ts
```

---

## 🌐 API Endpoints

### 🔐 Authentication & Profile
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user account |
| `POST` | `/auth/login` | Authenticate user & receive JWT session token |
| `GET` | `/auth/me` | Fetch authenticated profile & subscription plan |

### 🤖 Gemini Copilot & Threats
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Chat with Gemini agent (supports `X-Gemini-API-Key` BYOK header) |
| `GET` | `/threats/recent` | Retrieve high/critical security threat logs |
| `POST` | `/threats/:eventId/priority` | Flag threat for priority review (Early Team+) |

### 🪙 Circle USDC Autonomous Payments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/circle/balance` | Fetch current USDC agent wallet balance & status |
| `GET` | `/api/circle/transactions` | Retrieve USDC agent transaction history |
| `POST` | `/api/circle/pay` | Process an autonomous USDC agent micropayment |
| `POST` | `/api/circle/checkout` | Create a USDC subscription checkout session |
| `GET` | `/api/circle/checkout/:id/status` | Verify USDC payment completion |

### 💳 Billing, Entitlements & Compliance Exports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/billing/plans` | Fetch available subscription tiers |
| `POST` | `/billing/checkout` | Create Stripe subscription checkout session |
| `GET` | `/billing/session/:id` | Verify completed Stripe checkout session |
| `GET` | `/entitlements` | Retrieve active plan tier entitlements & query usage |
| `GET` | `/billing/evidence-export` | Export structured CSV audit trail log (Scaling Up) |

### 🔌 System & Protocol
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend server health status check |
| `POST` | `/waitlist` | Capture waitlist subscriber registration |
| `GET` | `/mcp/tools` | List available MongoDB MCP tools |
| `POST` | `/mcp/execute` | Execute MongoDB MCP tool call |

---

## 🛠️ Local Development Setup

### 1. Prerequisites & Repository Clone
- **Node.js**: v18+
- **MongoDB Atlas**: Free cluster instance with Vector Search index
- **Google Gemini API Key**: Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)

Clone the repository from GitHub:
```bash
git clone https://github.com/shreyasinha100805-glitch/threatlens2.git
cd threatlens2
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure environment variables in `backend/.env`:
```env
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/threatlens
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=your-secret-key
```

Seed sample threat logs and generate vector embeddings:
```bash
npm run seed
npm run embed
npm start
```
The Express backend runs on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`. Vite automatically proxies `/api` and backend requests to `http://localhost:8080`.

---

## 🐙 GitHub Integration & Contributing

- **Repository**: [https://github.com/shreyasinha100805-glitch/threatlens2](https://github.com/shreyasinha100805-glitch/threatlens2)
- **Issue Tracker**: Report bugs or request enhancements via [GitHub Issues](https://github.com/shreyasinha100805-glitch/threatlens2/issues)
- **Pull Requests**: Pull requests are welcome! Ensure tests pass via `npm run build` and follow existing TypeScript and CommonJS standards.
- **CI Workflow**: Automated via GitHub Actions ([.github/workflows/ci.yml](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/.github/workflows/ci.yml)).

---

## 💎 Plan Tier Advantages

| Capability / Feature | Solo Founder ($0) | Early Team ($49/mo) | Scaling Up ($199/mo) |
|---|---|---|---|
| **Agent Copilot Queries** | 50 queries / mo | ⚡ **UNLIMITED** | ⚡ **UNLIMITED** |
| **1-Click IP & Host Mitigation** | 🔒 Preview Mode | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **Circle USDC Agent Payments** | ⚡ Included | ⚡ Included | ⚡ Unlimited Engine |
| **Real-Time Slack Alerts** | 🔒 Locked | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **Priority Threat Flagging** | 🔒 Locked | ⚡ **UNLOCKED** | ⚡ **UNLOCKED** |
| **SOC2 CSV Evidence Export** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (CSV Audit Trail)** |
| **Automated Playbook Execution** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (Auto-Playbooks)** |
| **Dedicated Security Architect AI** | 🔒 Locked | 🔒 Locked | 👑 **UNLOCKED (Architect Mode)** |
| **Support SLA** | Community | Standard | 👑 **Priority 24/7 SLA** |

---

## 📄 License

MIT License — see [LICENSE](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/LICENSE) for details.
