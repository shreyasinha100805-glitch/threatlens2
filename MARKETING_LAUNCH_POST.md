# 🚀 Marketing Launch Post: ThreatLens — Stop Drowning in Logs: AI-Agentic Threat Intelligence Powered by Google Antigravity ($0/mo Infrastructure)

**Author:** Developer Relations Advocate, Cybersecurity & Cloud Architecture  
**Target Channels:** Show HN / r/netsec / Dev.to / Hashnode  

---

## Show HN: ThreatLens — Open-Source AI Agentic Security Copilot & Log Correlator Powered by Google Antigravity

Hey r/netsec & Hacker News! I’m excited to introduce **ThreatLens** — an open-source, AI-agentic threat intelligence and log analysis system built to eliminate SIEM alert fatigue for startups, indie hackers, and security teams.

By combining **Google Antigravity**, the **Google GenAI SDK**, **MongoDB Atlas Vector Search**, and **Model Context Protocol (MCP)**, ThreatLens allows you to process raw security telemetry, run semantic threat correlation, and trigger 1-click remediation playbooks — **all on a $0/month infrastructure setup**.

---

## 💥 The Problem: Traditional Log Monitoring is Noisy, Expensive, and Broken

If you’ve ever managed a SOC or on-call rotation for cloud infrastructure, you know the drill:

1. **Alert Fatigue:** Traditional SIEMs (Splunk, Datadog, Sumo Logic) flood Slack and PagerDuty with thousands of un-correlated log lines. 95% of them are false positives, but missing the 5% critical exploit means a data breach.
2. **Exorbitant Ingestion Costs:** Standard log ingestion pricing punishes growth. Early-stage startups end up paying thousands per month before hitting product-market fit just to retain audit logs.
3. **Lack of Remediation Context:** A log saying `Failed password for root from 185.220.101.4 port 54212 ssh2` forces an engineer to manually check IP reputation, search past database logs, cross-reference threat feeds, and copy-paste CLI firewall commands.

---

## 🛡️ The Solution: ThreatLens Agentic Workflows

Instead of passive rules or simple keyword filters, ThreatLens introduces **autonomous multi-agent security orchestration**:

```text
                       Raw Telemetry Logs & Alerts
                                   │
                                   ▼
         React 18 Cyber SOC UI (Vite + TypeScript + Cyber Glassmorphic)
                                   │
                                   ▼
            Express.js Agent Core + Google GenAI Client
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
  Threat Triage Agent        IP Reputation Bot     Mitigation Playbook Agent
  (Semantic Log Search)     (Tor/Threat Feeds)     (1-Click Isolation Engine)
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                MongoDB Atlas + Vector Search Indexing
                                   │
                                   ▼
                Automated Remediation & Slack Alerts
```

### How Agentic Correlation Works in ThreatLens:
* **Autonomous Triage:** When abnormal traffic is detected, Gemini 2.5 Flash acts as a security analyst, extracting entities (IPs, user handles, hostnames, attack signatures).
* **Multi-Tool Function Calling:** The agent dynamically calls tool functions (e.g. `query_logs`, `semantic_search`, `get_ip_reputation`, `suggest_remediation`) in a structured execution loop.
* **Plain English Incident Summaries:** ThreatLens turns thousands of raw syslog/JSON entries into a concise breach timeline, complete with recommended shell commands or instant 1-click host isolation.

---

## 🏗️ Architecture Highlights

ThreatLens is engineered to showcase modern AI agent architecture and cloud-native integrations:

```text
threatlens/
├── backend/
│   ├── agent.js              # Gemini multi-turn function-calling agent loop
│   ├── mongoMCP.js           # Lightweight MongoDB Model Context Protocol (MCP) server
│   ├── genaiClient.js        # Google GenAI client wrapper with exponential retries
│   ├── embedLogs.js          # Vector embedding pipeline via gemini-embedding-001
│   ├── tools.js              # Security domain agent tools (Log Query, Vector Search, IP Rep, Containment)
│   └── index.js              # REST API & WebSocket endpoints
└── frontend/
    └── src/
        ├── ThreatLensCopilotPanel.tsx  # Interactive Gemini AI Chat UI
        ├── DiagramStudio.tsx           # Dynamic Threat Topology Canvas
        ├── ThreatHeatmap.tsx           # Attack Density Heatmap
        └── ThreatRadarMap.tsx          # 360° Real-time Attack Radar
```

### 1. Google GenAI Client Integration ([backend/genaiClient.js](backend/genaiClient.js))
Our custom wrapper around the official `@google/genai` client standardizes Gemini API communication with built-in resilience:
* **Exponential Backoff & Retries:** Handles 429 rate-limiting and transient 50x server errors smoothly so agents complete complex tool calling pipelines without crashing.
* **Bring Your Own Key (BYOK) Support:** Allows developers to inject their own API key via headers (`X-Gemini-API-Key`) directly from Google AI Studio.

```javascript
// Sample snippet from backend/genaiClient.js
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

async function fetchWithRetry(fn, { label }) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fn();
      if (res.ok) return res;
      if (!RETRYABLE_STATUS.has(res.status)) throw new Error(`API Error ${res.status}`);
      await sleep(BASE_DELAY_MS * 2 ** attempt + Math.random() * 250);
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
    }
  }
}
```

### 2. MongoDB Atlas Vector Search ([backend/embedLogs.js](backend/embedLogs.js) & [backend/tools.js](backend/tools.js))
Logs are ingested, tokenized, and embedded using Google's `gemini-embedding-001` into 3072-dimensional vectors:
* Stores structured log schema (`timestamp`, `severity`, `host`, `ip`, `eventType`, `rawLog`, `embedding`).
* Performs `$vectorSearch` in MongoDB Atlas to find similar attack patterns across historical data, even if log text differs in syntax.

### 3. Model Context Protocol (MCP) Integration ([backend/mongoMCP.js](backend/mongoMCP.js))
ThreatLens implements a lightweight, native **MongoDB MCP Server** that decouples database tools (`find_documents`, `aggregate_documents`, `count_documents`, `get_collections`) from agent prompt logic. This allows standard MCP clients (like Google Antigravity agents, Claude Desktop, or custom microservices) to query security telemetry securely without writing raw database queries.

```javascript
// Exposing MongoDB operations via MCP Tool Definitions in backend/mongoMCP.js
const TOOL_DEFINITIONS = [
  {
    name: "find_documents",
    description: "Find MongoDB documents with filter, projection, sort, and limit.",
    parameters: { collection: "string", filter: "object", limit: "number" }
  },
  {
    name: "aggregate_documents",
    description: "Run a MongoDB aggregation pipeline against a collection.",
    parameters: { collection: "string", pipeline: "array" }
  }
];
```

---

## 💰 Zero Costs: Leverage Google Antigravity & Gemini's Free Tier

You don't need a $10,000/mo SOC budget to run enterprise-grade threat detection:

| Component | Free Provider | Free Tier Limits |
|---|---|---|
| **AI Agent & LLM Engine** | **Google Antigravity & Gemini API** | **$0/mo** — Generous free quota via Google AI Studio (`Gemini 2.5 Flash`) |
| **Log Embeddings** | **Google GenAI Embeddings** | **$0/mo** — Free embedding generation with `gemini-embedding-001` |
| **Log Storage & Vector Index** | **MongoDB Atlas** | **$0/mo M0 Cluster** (512MB storage + free Vector Search index) |
| **API Host / Microservice** | **Google Cloud Run / Local** | **$0/mo** — Cloud Run 2M free requests/month |

---

## ⚡ Quick-Start Guide: Launch ThreatLens in Under 5 Minutes

Ready to analyze your logs for free? Follow this quick-start guide:

### Step 1: Clone the Repository
```bash
git clone https://github.com/shreyasinha100805-glitch/threatlens2.git
cd threatlens
```

### Step 2: Configure Environment Variables
Create `backend/.env` with your free Google AI Studio key and MongoDB Atlas URI:
```env
PORT=5000
GEMINI_API_KEY=your_free_gemini_api_key_from_ai_studio
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/threatlens?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key
```

### Step 3: Install Dependencies & Seed Sample Security Logs
```bash
# Setup Backend
cd backend
npm install
node seed.js  # Seeds simulated ransomware, brute-force, and unauthorized access logs

# Setup Frontend
cd ../frontend
npm install
```

### Step 4: Run ThreatLens Locally
```bash
# Terminal 1: Run Backend
cd backend
npm run dev

# Terminal 2: Run Frontend UI
cd frontend
npm run dev
```

Open `http://localhost:5173` to launch your deep cyber glassmorphic SOC dashboard!

---

## 🤝 Get Involved & Contributing

ThreatLens is fully open source under the MIT License. We welcome contributions for new MCP tools, containment playbooks, and security integrations!

* 🐙 **GitHub Repository:** [shreyasinha100805-glitch/threatlens2](https://github.com/shreyasinha100805-glitch/threatlens2)
* 📖 **Documentation & Code:** Explore [`README.md`](README.md) and [`backend/agent.js`](backend/agent.js)
* ⭐️ **Star the Repo** if you find ThreatLens useful for your security stack!
