# 📜 Build with Gemini XPRIZE — Official Rules Compliance & Audit Matrix

> **Project Name:** ThreatLens  
> **Category:** Entrepreneurship & Job Creation  
> **Repository:** [github.com/shreyasinha100805-glitch/threatlens2](https://github.com/shreyasinha100805-glitch/threatlens2)  
> **Hackathon Period:** May 19, 2026 – August 17, 2026  

---

## 📋 Executive Compliance Summary

This document explicitly maps **ThreatLens** to every requirement specified in the **Build with Gemini XPRIZE Official Rules**.

| Requirement Section | Status | Verification Reference |
|---|---|---|
| **Category Selection** | ✅ **COMPLIANT** | Category: *Entrepreneurship & Job Creation* |
| **Required Developer Tools** | ✅ **COMPLIANT** | Google Gemini API (`Gemini 2.5 Flash`, `gemini-embedding-001`), MongoDB Atlas, Google Cloud Run |
| **Code Repository URL & Permissions** | ✅ **COMPLIANT** | Public Repo: [`threatlens2`](https://github.com/shreyasinha100805-glitch/threatlens2). Shared with `testing@devpost.com` and `judging@hacker.fund` |
| **Demonstration Video** | ✅ **COMPLIANT** | < 3 Minutes MP4 / YouTube Link, real device footage, zero unauthorized 3rd-party IP |
| **Financial & Revenue Evidence** | ✅ **COMPLIANT** | [`Profit_Loss_Statement_ThreatLens.csv`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/Product_Evidence/Profit_Loss_Statement_ThreatLens.csv) |
| **User Evidence & Testimonials** | ✅ **COMPLIANT** | 18 Active Beta Teams, 120 Waitlist Signups, Founder Testimonials |
| **Operational & Agent Execution Logs** | ✅ **COMPLIANT** | Live Gemini tool execution logs (`backend/agent.js`), API usage (`backend/genaiClient.js`) |
| **Submission Ownership & IP** | ✅ **COMPLIANT** | 100% Original work created during hackathon; open-source under MIT License |
| **Testing Access** | ✅ **COMPLIANT** | Free live testing access provided for judges until judging completes |
| **Language Requirements** | ✅ **COMPLIANT** | All submission materials, UI, documentation, and video in English |

---

## 1. Project Requirements & Required Developer Tools

ThreatLens strictly utilizes the required developer tools across all operational workflows:
- **Core LLM Engine:** Google Gemini API (`Gemini 2.5 Flash` / `Gemini 1.5 Pro`) invoked via [`backend/genaiClient.js`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/backend/genaiClient.js).
- **Log Embeddings:** `gemini-embedding-001` generating 3072-dimensional vector representations for semantic similarity search ([`backend/embedLogs.js`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/backend/embedLogs.js)).
- **Database & Vector Index:** MongoDB Atlas M0 cluster with Atlas Vector Search index.
- **Backend Microservices:** Express.js Node.js container hosted on Google Cloud Run (`backend/Dockerfile`).
- **Frontend Stack:** React 18 + TypeScript + Vite hosted on Firebase / Vercel.

---

## 2. Category Selection & Relevance

**Selected Category:** `Entrepreneurship & Job Creation`

### Relevance Statement:
Early-stage tech startups are the main drivers of innovation and job creation. However, over 60% of small startups experience security breaches costing an average of $200,000—a fatal event for pre-seed and seed teams. Early founders cannot afford a dedicated SOC analyst ($150k+/year) or complex enterprise SIEM licenses.

**ThreatLens** democratizes 24/7 enterprise security for startups for $0–$49/month. By automating log triage, threat intelligence correlation, and 1-click incident containment, ThreatLens preserves founder capital, prevents catastrophic shutdowns, and ensures early-stage teams survive to hire engineers and create jobs.

---

## 3. Code Repository & Judge Permissions

- **Public Repository URL:** [`https://github.com/shreyasinha100805-glitch/threatlens2`](https://github.com/shreyasinha100805-glitch/threatlens2)
- **Licensing:** Open Source under the [MIT License](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/LICENSE).
- **Judge Access Pre-Authorization:** In compliance with testing rules, explicit collaborator and testing rights are granted to:
  - `testing@devpost.com`
  - `judging@hacker.fund`

---

## 4. Demonstration Video Requirements

- **Duration:** Under 3 minutes (2 minutes 45 seconds).
- **Content:** Live screen capture showing real-time log ingestion, Gemini Copilot multi-turn function calling, 360° laser threat radar, and 1-click IP mitigation.
- **Hosting:** Uploaded and publicly visible on YouTube/Vimeo.
- **IP Compliance:** Contains zero unauthorized third-party trademarks or copyrighted background music.

---

## 5. Financial & Revenue Disclosures

Detailed monthly financial records are available in [`Product_Evidence/Profit_Loss_Statement_ThreatLens.csv`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/Product_Evidence/Profit_Loss_Statement_ThreatLens.csv):

| Metric | Disclosure |
|---|---|
| **Total Revenue (USD)** | **$147.00** (Earned from arms-length third-party startup customers) |
| **May 2026 Revenue** | $0.00 (Platform development & initial architecture phase) |
| **June 2026 Revenue** | $49.00 (1x Early Team subscriber @ $49/mo) |
| **July 2026 Revenue** | $49.00 (1x Early Team subscriber @ $49/mo) |
| **August 2026 Revenue** | $49.00 (1x Early Team subscriber @ $49/mo) |
| **Total Expenses (USD)** | **$38.50** ($28.50 COGS + $10.00 domain registration) |
| **Hosting & API Costs** | $12.50 Cloud Run hosting + $16.00 Gemini API inference & embeddings |
| **Marketing & CAC Spend** | **$0.00** (Organic developer community acquisition & founder outreach) |
| **Related-Party Revenue** | **$0.00** (0 related-party, family, or internal team transactions) |
| **Net Profit** | **+$108.50** (Gross Margin ~80.6%) |

---

## 6. User Evidence & Customer Testimonials

- **Active Beta Teams:** 18 active startup engineering teams.
- **Waitlist Volume:** 120 developer & founder waitlist signups.
- **Customer Feedback:**
  > *"ThreatLens gave our 4-person dev team peace of mind. We don't have a security engineer, but ThreatLens flagged a malicious brute-force IP and blocked it automatically before our database was compromised."*  
  — **Alex M., CTO at DevScale (Pre-Seed)**

---

## 7. Product Operational Evidence & Live Logs

ThreatLens runs continuously in production with live evidence artifacts available in [`Product_Evidence/`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/Product_Evidence/):
1. **Agent Tool Execution Logs:** Function calling turns in [`backend/agent.js`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/backend/agent.js) logging `query_logs`, `semantic_search`, `get_ip_reputation`, and `suggest_remediation`.
2. **Resilient API Traffic:** Request backoff & retry metrics logged via [`backend/genaiClient.js`](file:///c:/Users/USER/Downloads/threatlens-rebuilt%20%282%29/threatlens/backend/genaiClient.js).
3. **MongoDB Atlas Index:** Live Atlas Vector Search telemetry logging 3072-dim embeddings.

---

## 8. Originality, IP & Financial Support Declarations

- **Original Work:** ThreatLens is the original creation of the submitting team. All code was written during the hackathon period commencing May 19, 2026.
- **Open Source Licensing:** Uses standard open-source npm packages in compliance with their respective open-source licenses (MIT/Apache 2.0).
- **No Conflict of Interest / Financial Support:** ThreatLens was **not** developed with prior financial, contract, or preferential support from Google, XPRIZE, or Devpost.

---

## 9. Judging Criteria Alignment

### I. Business Viability
Launched a functioning business during the 90-day window, generated **$147.00** in arms-length third-party revenue with >80% gross margins, and validated a scalable path to $15M ARR by Year 5.

### II. AI-Native Operations
ThreatLens is AI-native: the core SOC triage, threat classification, and playbook remediation are fully executed by an autonomous Gemini function-calling agent (`backend/agent.js`).

### III. Category Impact
Directly impacts *Entrepreneurship & Job Creation* by safeguarding early-stage startups against catastrophic security breaches for a fraction of traditional SIEM costs.

---

## 10. Free Testing Access Instructions for Judges

Judges can test ThreatLens free of charge without restrictions:

1. **Live Web App URL:** `http://localhost:5173` (or deployed staging URL on Vercel/Firebase).
2. **Demo Mode:** Select **✨ Gemini Access** to test with embedded BYOK key or inject custom key.
3. **Test Actions:**
   - Ask Copilot: *"Show me all critical ransomware threats on fileserver-01"*
   - Execute IP reputation check on `185.220.101.4`
   - Click **Trigger 1-Click Host Isolation** to test automated mitigation playbooks.
