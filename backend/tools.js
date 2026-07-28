// tools.js
// Implementation of the 4 tools the Gemini agent can call. These are the
// "AI-native operations" the hackathon judges are evaluating: real tool
// calls against a real database, not a canned demo.

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

class AgentTools {
  constructor(db, genai) {
    this.db = db;
    this.genai = genai;
    this.collection = db.collection("security_logs");
  }

  /** Gemini functionDeclarations for the 4 tools. */
  static definitions() {
    return [
      {
        name: "query_logs",
        description: "Filter security log events by severity and/or event type. Use for questions like 'show me critical events' or 'any ransomware today'.",
        parameters: {
          type: "OBJECT",
          properties: {
            severity: { type: "STRING", description: "low | medium | high | critical" },
            eventType: { type: "STRING", description: "e.g. brute_force, ransomware, malware_detection" },
            limit: { type: "NUMBER", description: "max results, default 20" },
          },
        },
      },
      {
        name: "semantic_search",
        description: "Vector similarity search across all logs using natural language, for fuzzy questions that don't map to an exact field filter (e.g. 'suspicious logins at odd hours').",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "natural language description of what to look for" },
            limit: { type: "NUMBER", description: "max results, default 5" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_ip_reputation",
        description: "Return a risk score and event history for a specific IP address.",
        parameters: {
          type: "OBJECT",
          properties: {
            ip: { type: "STRING", description: "IPv4 or IPv6 address" },
          },
          required: ["ip"],
        },
      },
      {
        name: "suggest_remediation",
        description: "Return a step-by-step remediation plan for a given event type or threat description.",
        parameters: {
          type: "OBJECT",
          properties: {
            eventType: { type: "STRING", description: "e.g. ransomware, brute_force, data_exfiltration" },
            context: { type: "STRING", description: "optional extra detail about the incident" },
          },
          required: ["eventType"],
        },
      },
    ];
  }

  async query_logs({ severity, eventType, limit = 20 } = {}) {
    const filter = {};
    if (severity) filter.severity = severity;
    if (eventType) filter.eventType = eventType;
    const docs = await this.collection
      .find(filter, { projection: { embedding: 0 } })
      .sort({ timestamp: -1 })
      .limit(Math.min(limit, 100))
      .toArray();
    return { count: docs.length, events: docs };
  }

  async semantic_search({ query, limit = 5 } = {}) {
    const queryVector = await this.genai.embed(query);

    // Prefer a real Atlas Vector Search index if one exists; fall back to an
    // in-process cosine-similarity ranking so the demo works even before an
    // index has been created.
    try {
      const results = await this.collection
        .aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector,
              numCandidates: 100,
              limit,
            },
          },
          { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } },
        ])
        .toArray();
      if (results.length) return { count: results.length, events: results, method: "atlas_vector_search" };
    } catch (_err) {
      // Index likely doesn't exist yet — fall through to manual ranking.
    }

    const docs = await this.collection.find({ embedding: { $exists: true } }).toArray();
    const ranked = docs
      .map((d) => ({ ...d, score: cosineSimilarity(queryVector, d.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ embedding, ...rest }) => rest);

    return { count: ranked.length, events: ranked, method: "in_process_cosine" };
  }

  async get_ip_reputation({ ip } = {}) {
    if (!ip) throw new Error("ip is required");
    const events = await this.collection
      .find({ sourceIp: ip }, { projection: { embedding: 0 } })
      .sort({ timestamp: -1 })
      .toArray();

    if (events.length === 0) {
      return { ip, riskScore: 0, riskLevel: "unknown", eventCount: 0, events: [] };
    }

    const maxRisk = Math.max(...events.map((e) => e.riskScore || 0));
    const riskLevel = maxRisk >= 85 ? "critical" : maxRisk >= 65 ? "high" : maxRisk >= 40 ? "medium" : "low";

    return { ip, riskScore: maxRisk, riskLevel, eventCount: events.length, events };
  }

  async suggest_remediation({ eventType, context = "" } = {}) {
    const playbooks = {
      ransomware: [
        "Isolate affected hosts from the network immediately (disable NICs / pull from switch).",
        "Preserve volatile memory and disk images for forensic analysis before any remediation.",
        "Identify patient zero and the initial infection vector (phishing, RDP, exposed service).",
        "Restore from the most recent clean, verified backup — do not restore over live infected systems.",
        "Rotate all credentials on the affected network segment before reconnecting.",
      ],
      brute_force: [
        "Temporarily lock or rate-limit the targeted account/service.",
        "Block or throttle the source IP(s) at the firewall/WAF.",
        "Force a password reset and enable MFA on the targeted account if not already enabled.",
        "Review authentication logs for any successful login from the same source range.",
      ],
      privilege_escalation: [
        "Revoke the elevated privileges immediately and audit how they were granted.",
        "Review the affected host for persistence mechanisms (new users, cron jobs, services).",
        "Check for lateral movement to other hosts using the same credentials or trust relationship.",
        "Patch the underlying vulnerability if one was exploited (e.g. sudoers misconfig, kernel exploit).",
      ],
      data_exfiltration: [
        "Block the destination endpoint/IP at the egress firewall.",
        "Identify and disable the credential or API key used for the transfer.",
        "Determine what data left the network and whether it falls under breach-notification requirements.",
        "Review DLP and egress logging coverage for the affected system going forward.",
      ],
      malware_detection: [
        "Isolate the infected host from the network.",
        "Run a full scan and capture the malware sample for analysis.",
        "Check for related indicators of compromise (IOCs) across other endpoints.",
        "Re-image the host if the malware achieved persistence or admin-level access.",
      ],
      sql_injection: [
        "Block the offending request pattern at the WAF.",
        "Review the vulnerable endpoint's query construction and switch to parameterized queries.",
        "Audit the database for signs of unauthorized reads/writes around the event time.",
      ],
      phishing: [
        "Quarantine the message across all mailboxes it was delivered to.",
        "Block the sender domain and any embedded links at the mail gateway.",
        "Check whether any recipient clicked the link or submitted credentials; force reset if so.",
      ],
      anomalous_access: [
        "Verify the access with the account owner or their manager.",
        "Review whether the access pattern matches a known automation/service account.",
        "If unverified, suspend the account and review recent activity for other anomalies.",
      ],
    };

    const steps = playbooks[eventType] || [
      "Contain: isolate the affected system or account to stop further impact.",
      "Investigate: gather logs and evidence to understand scope and root cause.",
      "Eradicate: remove the malicious artifact, credential, or access path.",
      "Recover: restore normal operation from a known-good state.",
      "Review: document the incident and close the gap that allowed it.",
    ];

    return { eventType, context, steps };
  }
}

module.exports = { AgentTools, cosineSimilarity };
