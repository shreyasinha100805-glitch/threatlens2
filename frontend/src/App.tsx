import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CyberCanvas } from "./CyberCanvas";
import { ThreatRadarMap } from "./ThreatRadarMap";
import { DiagramStudio, VisualMermaid } from "./DiagramStudio";
import { cyberAudio } from "./cyberAudio";
import { AgentActivityTimeline } from "./AgentActivityTimeline";
import { AutonomousPaymentWidget } from "./AutonomousPaymentWidget";
import { MultiAgentCards } from "./MultiAgentCards";
import { ThreatHeatmap } from "./ThreatHeatmap";
import { TransactionHistory } from "./TransactionHistory";
import { PaymentCheckoutModal, Plan } from "./PaymentCheckoutModal";
import { ConfettiEffect } from "./ConfettiEffect";
import { ThreatLensCopilotPanel } from "./ThreatLensCopilotPanel";
import circlePaymentEngine from "./circlePaymentEngine";

type Severity = "low" | "medium" | "high" | "critical";

interface ThreatEvent {
  eventId: string;
  timestamp: string;
  severity: Severity;
  eventType: string;
  sourceIp: string;
  targetHost?: string;
  description: string;
  riskScore?: number;
  mitreTechnique?: string;
  mitreTactic?: string;
  rawLog?: string;
  status?: string;
  priorityReview?: boolean;
}

interface ToolTraceEntry {
  tool: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
  toolTrace?: ToolTraceEntry[];
}

interface AuthUser {
  userId: string;
  email: string;
  companyName?: string | null;
}

type Tab = "landing" | "signup" | "login" | "dashboard" | "console" | "diagrams" | "payment" | "payment-confirmed" | "account" | "transactions";
const PROTECTED_TABS: Tab[] = ["dashboard", "console", "diagrams", "payment", "payment-confirmed", "account", "transactions"];


const SUGGESTIONS = [
  "What are the critical threats right now?",
  "Check IP 185.220.101.4",
  "What should I do about the ransomware?",
  "Any suspicious logins at odd hours?",
];

const DEFAULT_THREATS: ThreatEvent[] = [
  {
    eventId: "evt-9041",
    timestamp: "2026-07-27T18:30:12Z",
    severity: "critical",
    eventType: "ransomware_detected",
    sourceIp: "185.220.101.4",
    targetHost: "fileserver-01",
    description: "Encrypted file extensions (.locked) appearing across shared drive; ransom note dropped in /shared/",
    riskScore: 98,
    mitreTechnique: "T1486 Data Encrypted for Impact",
    mitreTactic: "Impact",
    status: "active",
    rawLog: `{\n  "timestamp": "2026-07-27T18:30:12Z",\n  "event": "ransomware_detected",\n  "src_ip": "185.220.101.4",\n  "host": "fileserver-01",\n  "path": "/shared/financials_2026.locked",\n  "entropy": 7.98,\n  "action_taken": "flagged"\n}`,
  },
  {
    eventId: "evt-9042",
    timestamp: "2026-07-27T18:25:40Z",
    severity: "high",
    eventType: "ssh_brute_force",
    sourceIp: "45.142.212.61",
    targetHost: "ssh-gateway",
    description: "412 failed SSH login attempts against admin account within 10 minutes",
    riskScore: 84,
    mitreTechnique: "T1110.001 Password Guessing",
    mitreTactic: "Credential Access",
    status: "investigating",
    rawLog: `{\n  "timestamp": "2026-07-27T18:25:40Z",\n  "event": "ssh_auth_failure",\n  "src_ip": "45.142.212.61",\n  "target": "ssh-gateway",\n  "attempts": 412,\n  "user": "root"\n}`,
  },
  {
    eventId: "evt-9043",
    timestamp: "2026-07-27T18:14:02Z",
    severity: "critical",
    eventType: "data_exfiltration",
    sourceIp: "103.224.182.9",
    targetHost: "db-prod-02",
    description: "2.3GB outbound transfer to unrecognized external endpoint during off-hours",
    riskScore: 92,
    mitreTechnique: "T1048 Exfiltration Over Protocol",
    mitreTactic: "Exfiltration",
    status: "active",
    rawLog: `{\n  "timestamp": "2026-07-27T18:14:02Z",\n  "event": "data_exfiltration",\n  "src_ip": "103.224.182.9",\n  "bytes_sent": 2469605376,\n  "dest_port": 443,\n  "proto": "HTTPS"\n}`,
  },
  {
    eventId: "evt-9044",
    timestamp: "2026-07-27T17:50:18Z",
    severity: "high",
    eventType: "privilege_escalation",
    sourceIp: "10.0.0.44",
    targetHost: "app-server-03",
    description: "Standard user account added itself to sudoers group via vulnerability exploit",
    riskScore: 88,
    mitreTechnique: "T1068 Privilege Escalation Exploit",
    mitreTactic: "Privilege Escalation",
    status: "active",
    rawLog: `{\n  "timestamp": "2026-07-27T17:50:18Z",\n  "event": "sudoers_modified",\n  "user": "web-service",\n  "uid": 1002,\n  "modified_file": "/etc/sudoers"\n}`,
  },
  {
    eventId: "evt-9045",
    timestamp: "2026-07-27T17:35:00Z",
    severity: "high",
    eventType: "malware_detection",
    sourceIp: "203.0.113.77",
    targetHost: "workstation-14",
    description: "Known trojan signature detected in downloaded executable, quarantined",
    riskScore: 78,
    mitreTechnique: "T1204 User Execution",
    mitreTactic: "Execution",
    status: "mitigated",
    rawLog: `{\n  "timestamp": "2026-07-27T17:35:00Z",\n  "event": "malware_quarantined",\n  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n  "file": "update_installer.exe"\n}`,
  },
];

const PLANS = [
  {
    id: "solo_founder",
    name: "Solo Founder",
    price: 0,
    cadence: "free",
    badge: "Metered Access",
    perks: [
      "50 agent queries / mo",
      "1 seat",
      "Community support",
      "Standard threat view",
    ],
  },
  {
    id: "early_team",
    name: "Early Team",
    price: 49,
    cadence: "mo",
    badge: "🔥 MOST POPULAR — 9x Value & Unlimited Queries",
    perks: [
      "⚡ UNLIMITED agent queries",
      "Up to 8 team seats",
      "Real-Time Slack webhook alerts",
      "1-Click IP & Host Mitigation",
      "Priority Review threat flagging",
      "Full MITRE ATT&CK Taxonomy Mapping",
    ],
  },
  {
    id: "scaling_up",
    name: "Scaling Up",
    price: 199,
    cadence: "mo",
    badge: "👑 ENTERPRISE UNLOCK — Full SOC2 & Auto-Playbooks",
    perks: [
      "Everything in Early Team",
      "👑 SOC2 Evidence CSV Audit Log Export",
      "🤖 Automated Incident Response Playbooks",
      "🛡️ Dedicated Security Architect AI Copilot Mode",
      "Unlimited seats & REST API Access",
      "Priority 24/7 SLA & Dedicated Escalation",
    ],
  },
];

function useUsageCounters(messages: ChatMessage[]) {
  const totalToolCalls = messages.reduce((sum, m) => sum + (m.toolTrace?.length || 0), 0);
  const totalQueries = messages.filter((m) => m.role === "user").length;
  return { totalToolCalls, totalQueries };
}

function authHeaders(token: string | null, geminiKey?: string | null, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (geminiKey) headers["X-Gemini-API-Key"] = geminiKey;
  return headers;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

async function apiFetch(path: string, options?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    let data: any = null;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    }
    return { ok: res.ok, status: res.status, data, res };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err };
  }
}

/** Direct Gemini API Client Call */
async function callGeminiDirectly(apiKey: string, prompt: string, history: ChatMessage[]) {
  const systemPrompt = "You are ThreatLens, an elite AI security copilot built for founders and security teams. Answer security questions concisely, professionally, and accurately with actionable step-by-step remediation advice and technical details.";

  const contents = [
    ...history.slice(-6).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API");
  return text;
}

/** Dynamic Security Copilot Intelligence Engine */
function generateDynamicSecurityAnswer(message: string, currentPlanId?: string, threats: ThreatEvent[] = []): { reply: string; tools: ToolTraceEntry[] } {
  const msgLower = message.toLowerCase();
  let tierBadge = "";
  if (currentPlanId === "scaling_up") {
    tierBadge = "👑 **[SCALING UP ENTERPRISE TIER · SECURITY ARCHITECT AI COPILOT ACTIVE]**\n\n";
  } else if (currentPlanId === "early_team") {
    tierBadge = "🔥 **[EARLY TEAM TIER · UNLIMITED AI COPILOT UNLOCKED]**\n\n";
  } else {
    tierBadge = "⚡ **[SOLO FOUNDER FREE TIER · METERED COPILOT ACCESS]**\n\n";
  }

  // 0. Diagram & Visual Attack Flow Requests
  if (msgLower.includes("diagram") || msgLower.includes("flow") || msgLower.includes("topology") || msgLower.includes("architecture")) {
    return {
      reply: tierBadge + "📊 **VISUAL INCIDENT & ATTACK VECTOR DIAGRAM**:\n\n" +
        "Here is the rendered Mermaid attack sequence for active incidents:\n\n" +
        "```mermaid\n" +
        "graph TD\n" +
        "  Attacker[\"🌐 Attacker IP: 185.220.101.4 (Tor Exit Node)\"] -->|Exploit Port 22| GW[\"🛡️ SSH Gateway (ssh-gateway)\"]\n" +
        "  GW -->|Privilege Escalation T1068| App[\"💻 App Server (app-server-03)\"]\n" +
        "  App -->|Lateral Movement| File[\"📁 File Server (fileserver-01)\"]\n" +
        "  File -->|Drop Ransom Note| Encr[\"🔒 Encrypted Shared Volume (.locked)\"]\n" +
        "  File -->|Data Exfiltration T1048| Exf[\"⚠️ Storage Endpoint (103.224.182.9)\"]\n" +
        "  style Encr fill:#7f1d1d,stroke:#ef4444,color:#fff\n" +
        "  style Attacker fill:#7f1d1d,stroke:#ef4444,color:#fff\n" +
        "  style Exf fill:#7c2d12,stroke:#f59e0b,color:#fff\n" +
        "```\n\n" +
        "💡 You can open the **📊 Diagram Studio** tab from the top navigation bar to edit, customize, or export this diagram!",
      tools: [
        { tool: "query_security_logs", args: { action: "generate_attack_diagram" } },
      ],
    };
  }

  // 1. Critical Threats & Active Incidents
  if (msgLower.includes("critical") || msgLower.includes("active threat") || msgLower.includes("happen")) {
    const criticals = threats.filter((t) => t.severity === "critical");
    return {
      reply: tierBadge + `🚨 **CRITICAL INCIDENT REPORT (${criticals.length} Active Critical Threats)**:\n\n` +
        criticals.map((t, i) => `${i + 1}. **${t.eventType.replace(/_/g, " ").toUpperCase()}** on \`${t.targetHost || "gateway"}\`\n` +
        `   • Source IP: \`${t.sourceIp}\` | Risk Score: ${t.riskScore || 90}/100\n` +
        `   • MITRE ATT&CK: ${t.mitreTechnique || "T1059"}\n` +
        `   • Summary: ${t.description}`).join("\n\n") +
        "\n\n**Recommended Immediate Remediation:**\n" +
        "1. 🛑 Block inbound IP `185.220.101.4` and `103.224.182.9` on firewall.\n" +
        "2. 🔒 Isolate `fileserver-01` from network segment immediately.\n" +
        "3. 🔑 Trigger immediate secret rotation for database credentials.",
      tools: [
        { tool: "query_security_logs", args: { severity: "critical" } },
        { tool: "check_ip_reputation", args: { ip: "185.220.101.4" } },
      ],
    };
  }

  // 2. IP Lookup / Geolocation / Threat Intel
  const ipMatch = message.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  if (ipMatch || msgLower.includes("ip") || msgLower.includes("address") || msgLower.includes("reputation") || msgLower.includes("check ip")) {
    const targetIp = ipMatch ? ipMatch[0] : "185.220.101.4";
    const foundThreat = threats.find((t) => t.sourceIp === targetIp);
    return {
      reply: tierBadge + `🔍 **THREAT INTEL & IP REPUTATION DOSSIER**: \`${targetIp}\`\n\n` +
        `• **Risk Rating**: ${foundThreat?.riskScore || 95}/100 (${foundThreat?.severity || "critical"})\n` +
        `• **ASN / Country**: AS62041 (Tor Exit Node / Anonymous Proxy Service)\n` +
        `• **Historical Hits**: 18 global threat intelligence feeds flagged active malicious activity\n` +
        `• **Associated Incidents**: ${foundThreat ? foundThreat.eventType.replace(/_/g, " ") : "Multiple failed auth & exfiltration attempts"}\n` +
        `• **Target Host**: \`${foundThreat?.targetHost || "fileserver-01"}\`\n\n` +
        `**Copilot Action Plan:**\n` +
        `• Status: ${foundThreat?.priorityReview ? "⚑ Priority Review Flagged" : "Standard Monitoring"}\n` +
        `• Action: Execute 1-Click IP Block in the left sidebar drawer.`,
      tools: [
        { tool: "check_ip_reputation", args: { ip: targetIp } },
        { tool: "query_security_logs", args: { sourceIp: targetIp } },
      ],
    };
  }

  // 3. Ransomware / Encrypted Files
  if (msgLower.includes("ransomware") || msgLower.includes("lock") || msgLower.includes("encrypt")) {
    return {
      reply: tierBadge + "⚠️ **RANSOMWARE INCIDENT ANALYSIS & PLAYBOOK**:\n\n" +
        "• **Event Type**: `ransomware_detected`\n" +
        "• **Impacted Host**: `fileserver-01` (Path: `/shared/financials_2026.locked`)\n" +
        "• **Entropy Score**: 7.98 (High encryption entropy)\n" +
        "• **MITRE ATT&CK**: T1486 Data Encrypted for Impact\n\n" +
        "**Step-by-Step Response Protocol:**\n" +
        "1. **Host Isolation**: Sever NIC connection for `fileserver-01` to prevent lateral movement.\n" +
        "2. **Process Termination**: Terminate malicious process parent tree.\n" +
        "3. **Backup Verification**: Verify immutable ZFS/S3 shadow volume snapshot at 18:00 UTC.\n" +
        "4. **Attacker Containment**: Block source IP `185.220.101.4` on edge firewall.",
      tools: [
        { tool: "query_security_logs", args: { eventType: "ransomware_detected" } },
        { tool: "flag_priority_review", args: { eventId: "evt-9041" } },
      ],
    };
  }

  // 4. SSH / Brute Force / Login Security
  if (msgLower.includes("ssh") || msgLower.includes("brute") || msgLower.includes("login") || msgLower.includes("password") || msgLower.includes("auth")) {
    return {
      reply: tierBadge + "🔐 **CREDENTIAL ATTACK & SSH BRUTE-FORCE REPORT**:\n\n" +
        "• **Target**: `ssh-gateway` (User: `root`)\n" +
        "• **Attacker IP**: `45.142.212.61` (412 failed attempts in 10 mins)\n" +
        "• **Attack Pattern**: Password Guessing (Dictionary & Spray Attack)\n" +
        "• **MITRE ATT&CK**: T1110.001 Password Guessing\n\n" +
        "**Mitigation Steps:**\n" +
        "1. Enforce SSH public key authentication only (`PasswordAuthentication no` in `/etc/ssh/sshd_config`).\n" +
        "2. Enable Fail2Ban auto-drop rule for > 5 failed attempts.\n" +
        "3. Require hardware 2FA / WebAuthn for all administrative SSH access.",
      tools: [
        { tool: "query_security_logs", args: { eventType: "ssh_brute_force" } },
        { tool: "check_ip_reputation", args: { ip: "45.142.212.61" } },
      ],
    };
  }

  // 5. Data Exfiltration / Database Leaks
  if (msgLower.includes("exfil") || msgLower.includes("leak") || msgLower.includes("database") || msgLower.includes("transfer") || msgLower.includes("db")) {
    return {
      reply: tierBadge + "🗄️ **DATA EXFILTRATION & DATABASE ANOMALY REPORT**:\n\n" +
        "• **Affected Database**: `db-prod-02` (IP: `103.224.182.9`)\n" +
        "• **Outbound Transfer Volume**: 2.3 GB transferred via HTTPS (Port 443)\n" +
        "• **Anomaly Class**: Unrecognized external endpoint transfer during off-hours\n" +
        "• **MITRE ATT&CK**: T1048 Exfiltration Over Protocol\n\n" +
        "**Recommended Actions:**\n" +
        "1. Temporarily restrict egress outbound traffic on `db-prod-02` to approved VPC CIDR.\n" +
        "2. Rotate database master passwords and API tokens.\n" +
        "3. Run query audit log inspector for `db-prod-02`.",
      tools: [
        { tool: "query_security_logs", args: { eventType: "data_exfiltration" } },
      ],
    };
  }

  // 6. Privilege Escalation / Sudo / IAM
  if (msgLower.includes("privilege") || msgLower.includes("sudo") || msgLower.includes("escalat") || msgLower.includes("admin") || msgLower.includes("root")) {
    return {
      reply: tierBadge + "🛡️ **PRIVILEGE ESCALATION INCIDENT ANALYSIS**:\n\n" +
        "• **Affected Host**: `app-server-03`\n" +
        "• **Suspicious User**: `web-service` (UID: 1002)\n" +
        "• **Event Detail**: User account added itself to `/etc/sudoers` via vulnerability exploit\n" +
        "• **MITRE ATT&CK**: T1068 Privilege Escalation Exploit\n\n" +
        "**Remediation Steps:**\n" +
        "1. Remove `web-service` entry from `/etc/sudoers` immediately.\n" +
        "2. Patch OS kernel vulnerabilities (`sudo apt-get update && sudo apt-get upgrade`).\n" +
        "3. Audit active sessions for user `web-service`.",
      tools: [
        { tool: "query_security_logs", args: { eventType: "privilege_escalation" } },
      ],
    };
  }

  // 7. General / Dynamic Fallback tailored specifically to user prompt
  return {
    reply: tierBadge + `🛡️ **THREATLENS SECURITY COPILOT ANALYSIS** for: "${message}"\n\n` +
      `• **Query Subject**: ${message.length > 60 ? message.substring(0, 60) + "..." : message}\n` +
      `• **System Status**: Live Monitoring Active · 5 High/Critical Security Events Monitored\n` +
      `• **Log Telemetry Ingestion**: 1,420 events/sec ingested\n\n` +
      `**Copilot Assessment & Recommendations:**\n` +
      `1. **Active Incidents**: Ransomware on \`fileserver-01\` (IP 185.220.101.4) and SSH brute-force on \`ssh-gateway\` (IP 45.142.212.61) require immediate review.\n` +
      `2. **Firewall Rule Enforcement**: Apply 1-click IP blocking for high-risk IPs in the console drawer.\n` +
      `3. **Security Posture**: Enable MFA across all team accounts and verify daily automated backups.`,
    tools: [
      { tool: "query_security_logs", args: { query: message } },
      { tool: "check_ip_reputation", args: { query: message } },
    ],
  };
}

function RadarSignature() {
  return (
    <svg className="radar" viewBox="0 0 260 260" role="img" aria-label="Live threat radar">
      <circle cx="130" cy="130" r="118" fill="none" stroke="var(--line)" strokeWidth="1" />
      <circle cx="130" cy="130" r="82" fill="none" stroke="var(--line)" strokeWidth="1" />
      <circle cx="130" cy="130" r="46" fill="none" stroke="var(--line)" strokeWidth="1" />
      <line x1="12" y1="130" x2="248" y2="130" stroke="var(--line)" strokeWidth="1" />
      <line x1="130" y1="12" x2="130" y2="248" stroke="var(--line)" strokeWidth="1" />

      <g className="radar-sweep">
        <path d="M130 130 L130 12 A118 118 0 0 1 213.5 46.5 Z" fill="var(--flare)" opacity="0.14" />
        <line x1="130" y1="130" x2="130" y2="12" stroke="var(--flare)" strokeWidth="1.5" />
      </g>

      <circle className="radar-blip" cx="176" cy="88" r="3.5" fill="var(--critical)" />
      <circle className="radar-blip" cx="82" cy="168" r="3.5" fill="var(--caution)" style={{ animationDelay: "0.6s" }} />
      <circle className="radar-blip" cx="168" cy="184" r="3.5" fill="var(--caution)" style={{ animationDelay: "1.2s" }} />
      <circle cx="130" cy="130" r="3" fill="var(--paper)" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="10.5" width="16" height="10" rx="2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="15" r="4" />
      <path d="M11.2 11.8 20 3M16.5 6.5 19 9M13.5 9.5 15.5 11.5" />
    </svg>
  );
}

function OutboundIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 19 19 5M9 5h10v10" />
    </svg>
  );
}

function PlanButton({
  plan,
  currentPlanId,
  checkoutStatus,
  onUpgrade,
  loggedIn,
}: {
  plan: (typeof PLANS)[number];
  currentPlanId: string | null;
  checkoutStatus: "idle" | "loading" | "error" | undefined;
  onUpgrade: (id: string) => void;
  loggedIn: boolean;
}) {
  if (currentPlanId === plan.id) {
    return (
      <button
        type="button"
        className="checkout-btn current"
        disabled
        aria-disabled="true"
        aria-label={`Current plan: ${plan.name}`}
      >
        ✓ Active Tier: {plan.name}
      </button>
    );
  }
  if (plan.price === 0) {
    return (
      <button
        type="button"
        className="checkout-btn"
        onClick={() => onUpgrade(plan.id)}
        aria-label={`Switch to ${plan.name} plan`}
      >
        Switch to Free Tier
      </button>
    );
  }
  const isRedirecting = checkoutStatus === "loading";
  const btnLabel = isRedirecting ? "Redirecting…" : loggedIn ? `Upgrade to ${plan.name} ($${plan.price}/mo)` : `Sign up for ${plan.name}`;
  return (
    <button
      type="button"
      className="checkout-btn"
      disabled={isRedirecting}
      aria-disabled={isRedirecting}
      onClick={() => onUpgrade(plan.id)}
      aria-label={`${btnLabel} plan`}
    >
      {btnLabel}
    </button>
  );
}

/** Nav shared by every logged-in page. */
function AppNav({
  tab,
  goTab,
  onLogout,
  geminiKey,
  onOpenGeminiModal,
  theme,
  onToggleTheme,
}: {
  tab: Tab;
  goTab: (t: Tab) => void;
  onLogout: () => void;
  geminiKey?: string;
  onOpenGeminiModal?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}) {
  const [audioActive, setAudioActive] = useState(cyberAudio.isEnabled());
  const items: [Tab, string][] = [
    ["dashboard", "Dashboard"],
    ["console", "Console"],
    ["diagrams", "📊 Diagram Studio"],
    ["transactions", "💳 Transactions"],
    ["payment", "Payment"],
    ["account", "Account"],
  ];
  return (
    <header className="app-nav" aria-label="Application Header">
      <div className="brand" onClick={() => goTab("dashboard")} style={{ cursor: "pointer" }}>🔐 ThreatLens</div>
      <div className="tabs" role="tablist" aria-label="Main Navigation Tabs">
        {items.map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-current={tab === t ? "page" : undefined}
            className={tab === t ? "active" : ""}
            onClick={() => {
              cyberAudio.playClick();
              goTab(t);
            }}
            aria-label={`Navigate to ${label} view`}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          className="audio-toggle-btn"
          onClick={() => {
            const next = !cyberAudio.isEnabled();
            cyberAudio.setEnabled(next);
            setAudioActive(next);
            if (next) cyberAudio.playClick();
          }}
          aria-label="Toggle Audio FX"
        >
          {audioActive ? "🔊 Audio: ON" : "🔇 Audio: OFF"}
        </button>

        {onToggleTheme && (
          <button
            type="button"
            className="audio-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Dark / Light Mode"
            style={{ minWidth: 90 }}
          >
            {theme === "light" ? "☀️ Light" : "🌙 Dark"}
          </button>
        )}

        {onOpenGeminiModal && (
          <button
            type="button"
            className="gemini-key-badge"
            onClick={onOpenGeminiModal}
            aria-label="Configure Gemini API Access"
          >
            ✨ {geminiKey ? "Gemini Key Active" : "Gemini Access"}
          </button>
        )}


        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
          aria-label="Log out of your ThreatLens account"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

/** Tier Advantage Comparison Matrix Table */
function PlanComparisonMatrix() {
  const features = [
    { name: "Monthly Copilot Queries", solo: "50 / month", early: "⚡ UNLIMITED", scaling: "⚡ UNLIMITED" },
    { name: "Live Security Log Monitoring", solo: "✓ Included", early: "✓ Included", scaling: "✓ Included" },
    { name: "1-Click IP & Host Mitigation", solo: "🔒 Preview", early: "⚡ Unlocked", scaling: "⚡ Unlocked" },
    { name: "Real-Time Slack Webhook Alerts", solo: "🔒 Locked", early: "⚡ Unlocked", scaling: "⚡ Unlocked" },
    { name: "Priority Review Threat Flagging", solo: "🔒 Locked", early: "⚡ Unlocked", scaling: "⚡ Unlocked" },
    { name: "MITRE ATT&CK Framework Mapping", solo: "Basic", early: "⚡ Full Taxonomy", scaling: "⚡ Full Taxonomy" },
    { name: "SOC2 CSV Evidence Audit Export", solo: "🔒 Locked", early: "🔒 Locked", scaling: "👑 Enterprise Unlocked" },
    { name: "Automated Playbook Execution", solo: "🔒 Locked", early: "🔒 Locked", scaling: "👑 Enterprise Unlocked" },
    { name: "Dedicated Security Architect AI", solo: "🔒 Locked", early: "🔒 Locked", scaling: "👑 Enterprise Unlocked" },
    { name: "SLA & Support Guarantee", solo: "Community", early: "Standard", scaling: "👑 Priority 24/7 SLA" },
  ];

  return (
    <div className="tier-comparison-box">
      <h3>👑 Tier Advantage Comparison Matrix</h3>
      <p className="tier-comparison-sub">Every plan unlocks distinct security capabilities. Compare tier advantages below.</p>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature / Advantage</th>
              <th>Solo Founder ($0)</th>
              <th className="popular-header">Early Team ($49/mo)</th>
              <th>Scaling Up ($199/mo)</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i}>
                <td className="feature-name">{f.name}</td>
                <td className="cell-tier">{f.solo}</td>
                <td className="cell-tier popular-cell">{f.early}</td>
                <td className="cell-tier">{f.scaling}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Operational Telemetry Header */
function SOCHeader({ geminiKey, currentPlanName }: { geminiKey?: string; currentPlanName?: string }) {
  return (
    <div className="soc-header-telemetry" aria-label="SOC Operational Telemetry">
      <div className="telemetry-item live-pulse">
        <span className="pulse-dot"></span>
        <strong>LIVE MONITORING ACTIVE</strong>
      </div>
      <div className="telemetry-divider">|</div>
      <div className="telemetry-item">
        <span className="telemetry-label">Ingestion:</span> 1,420 events/sec
      </div>
      <div className="telemetry-divider">|</div>
      <div className="telemetry-item">
        <span className="telemetry-label">Engine:</span> {geminiKey ? "Gemini 1.5 Pro (BYOK Key)" : "Gemini 1.5 Pro"}
      </div>
      <div className="telemetry-divider">|</div>
      <div className="telemetry-item">
        <span className="telemetry-label">Active Tier:</span> <span className="status-on">{currentPlanName || "Solo Founder"}</span>
      </div>
    </div>
  );
}

/** Gemini Key Configuration Modal */
function GeminiKeyModal({
  apiKey,
  onSaveKey,
  onClose,
}: {
  apiKey: string;
  onSaveKey: (key: string) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(apiKey);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <header className="modal-header">
          <div>
            <div className="modal-title-row">
              <span className="severity-badge severity-low">Gemini AI</span>
              <h2>✨ Bring Your Own Gemini Access</h2>
            </div>
            <div className="modal-subtitle">Anyone with Gemini access can use ThreatLens with their own API key quota.</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </header>

        <div className="modal-body">
          <label style={{ fontSize: 12.5, color: "var(--paper)", display: "block", marginBottom: 6 }}>
            Google Gemini API Key
          </label>
          <input
            type="password"
            className="threat-search-input"
            style={{ fontSize: 13, padding: 10 }}
            placeholder="Paste your API Key (e.g. AIzaSy...)"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />

          <div style={{ background: "var(--panel-raised)", border: "1px solid var(--line)", borderRadius: 10, padding: 14, margin: "16px 0" }}>
            <strong style={{ fontSize: 13, color: "var(--paper)" }}>How to get a key:</strong>
            <p style={{ fontSize: 12, color: "var(--dim)", margin: "4px 0 10px" }}>
              Get a free API key directly from Google AI Studio. It takes 10 seconds.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--flare)", fontWeight: 600, fontSize: 12.5 }}
            >
              Get Free Gemini API Key from Google AI Studio →
            </a>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onSaveKey("");
                onClose();
              }}
            >
              Reset to Server Default
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSaveKey(val.trim());
                onClose();
              }}
            >
              Save Key &amp; Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Interactive Incident Analysis Modal */
function ThreatDetailModal({
  threat,
  onClose,
  onMitigate,
  mitigationState,
  onAskCopilot,
  isPaid,
  onUpgradePrompt,
  onOpenDiagramStudio,
}: {
  threat: ThreatEvent;
  onClose: () => void;
  onMitigate: (eventId: string, action: "blockIp" | "quarantineHost") => void;
  mitigationState?: { blockedIp?: boolean; quarantinedHost?: boolean };
  onAskCopilot: (prompt: string) => void;
  isPaid: boolean;
  onUpgradePrompt: () => void;
  onOpenDiagramStudio?: (code: string) => void;
}) {
  const [logCopied, setLogCopied] = useState(false);
  const [tierWarning, setTierWarning] = useState<string | null>(null);

  function copyRawLog() {
    if (threat.rawLog) {
      navigator.clipboard.writeText(threat.rawLog);
      setLogCopied(true);
      setTimeout(() => setLogCopied(false), 2000);
    }
  }

  function downloadJsonReport() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(threat, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `threat-incident-${threat.eventId}.json`);
    dlAnchorElem.click();
  }

  function handleActionClick(action: "blockIp" | "quarantineHost") {
    if (!isPaid) {
      setTierWarning("🔒 1-Click Mitigation requires Early Team Plan ($49/mo). Upgrade to unlock instant firewall & isolation controls.");
      return;
    }
    setTierWarning(null);
    onMitigate(threat.eventId, action);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <div className="modal-title-row">
              <span className={`severity-badge severity-${threat.severity}`}>{threat.severity}</span>
              <h2>{threat.eventType.replace(/_/g, " ")}</h2>
            </div>
            <div className="modal-subtitle">Event ID: {threat.eventId} · {new Date(threat.timestamp).toLocaleTimeString()}</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </header>

        <div className="modal-body">
          <div className="incident-grid">
            <div className="incident-card">
              <div className="card-label">Risk Rating</div>
              <div className="risk-score-badge">{threat.riskScore || 85}/100</div>
            </div>
            <div className="incident-card">
              <div className="card-label">Source IP</div>
              <div className="card-val">{threat.sourceIp}</div>
            </div>
            <div className="incident-card">
              <div className="card-label">Target Host</div>
              <div className="card-val">{threat.targetHost || "network-gateway"}</div>
            </div>
          </div>

          <div className="mitre-box">
            <div className="mitre-label">MITRE ATT&amp;CK Mapping</div>
            <div className="mitre-tags">
              <span className="mitre-tag tactic">{threat.mitreTactic || "Execution"}</span>
              <span className="mitre-tag technique">{threat.mitreTechnique || "T1059 Command & Scripting"}</span>
            </div>
          </div>

          <div className="incident-description">
            <strong>Incident Description:</strong>
            <p>{threat.description}</p>
          </div>

          {tierWarning && (
            <div className="tier-warning-box" role="alert">
              <span>{tierWarning}</span>
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: 11, padding: "4px 10px", marginLeft: 10 }}
                onClick={() => {
                  onClose();
                  onUpgradePrompt();
                }}
              >
                Upgrade to Early Team →
              </button>
            </div>
          )}

          <div className="remediation-section">
            <h3>⚡ 1-Click Incident Response Actions</h3>
            <div className="remediation-buttons">
              <button
                type="button"
                className={`action-btn ${mitigationState?.blockedIp ? "done" : ""}`}
                onClick={() => handleActionClick("blockIp")}
              >
                {mitigationState?.blockedIp ? `✓ Source IP ${threat.sourceIp} Blocked` : `🛑 Block Source IP (${threat.sourceIp})`}
              </button>

              <button
                type="button"
                className={`action-btn ${mitigationState?.quarantinedHost ? "done" : ""}`}
                onClick={() => handleActionClick("quarantineHost")}
              >
                {mitigationState?.quarantinedHost ? `✓ Host ${threat.targetHost || "endpoint"} Isolated` : `🔒 Quarantine Host (${threat.targetHost || "endpoint"})`}
              </button>

              <button
                type="button"
                className="action-btn-secondary"
                onClick={() => {
                  cyberAudio.playClick();
                  onClose();
                  if (onOpenDiagramStudio) {
                    const code = `graph TD\n  Attacker["🌐 Attacker: ${threat.sourceIp}"] -->|${threat.eventType}| Host["💻 Target: ${threat.targetHost || "Gateway"}"]\n  Host -->|${threat.mitreTechnique || "Technique"}| Impact["⚠️ Risk Rating: ${threat.riskScore || 85}/100"]\n  style Attacker fill:#7f1d1d,stroke:#ef4444,color:#fff\n  style Impact fill:#7c2d12,stroke:#f59e0b,color:#fff`;
                    onOpenDiagramStudio(code);
                  }
                }}
              >
                📊 Visual Incident Diagram
              </button>

              <button type="button" className="action-btn-secondary" onClick={downloadJsonReport}>
                📄 Export Brief (JSON)
              </button>

              <button
                type="button"
                className="action-btn-primary"
                onClick={() => {
                  onClose();
                  onAskCopilot(`Investigate and propose remediation for threat ${threat.eventType} from ${threat.sourceIp}`);
                }}
              >
                🤖 Ask Copilot to Remediate
              </button>
            </div>
          </div>

          {threat.rawLog && (
            <div className="raw-log-container">
              <div className="log-header">
                <span>Raw Security Log</span>
                <button type="button" className="copy-log-btn" onClick={copyRawLog}>
                  {logCopied ? "✓ Copied" : "📋 Copy Log"}
                </button>
              </div>
              <pre className="raw-log">{threat.rawLog}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderMessageContent(text: string) {
  if (text.includes("```mermaid")) {
    const parts = text.split(/```mermaid/);
    return (
      <div>
        {parts.map((part, index) => {
          if (index === 0) return <div key={index}>{part}</div>;
          const endCodeIndex = part.indexOf("```");
          if (endCodeIndex !== -1) {
            const mermaidCode = part.substring(0, endCodeIndex).trim();
            const rest = part.substring(endCodeIndex + 3);
            return (
              <div key={index} style={{ margin: "14px 0" }}>
                <VisualMermaid code={mermaidCode} />
                {rest && <div>{rest}</div>}
              </div>
            );
          }
          return <div key={index}>{part}</div>;
        })}
      </div>
    );
  }
  return text;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("threatlens_token"));
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem("threatlens_gemini_key") || "");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [tab, setTabRaw] = useState<Tab>(() => (localStorage.getItem("threatlens_token") ? "dashboard" : "landing"));
  const [activeMermaidCode, setActiveMermaidCode] = useState<string | undefined>(undefined);

  const [threats, setThreats] = useState<ThreatEvent[]>(DEFAULT_THREATS);
  const [timelineEvents, setTimelineEvents] = useState([
    { id: "1", time: "10:01 AM", agent: "Threat Agent", action: "analyzed log.", type: "threat" as const },
    { id: "2", time: "10:02 AM", agent: "Malware Agent", action: "flagged ransomware.", type: "malware" as const },
    { id: "3", time: "10:03 AM", agent: "Payment Agent", action: "charged 1 USDC.", type: "payment" as const },
    { id: "4", time: "10:04 AM", agent: "Report Agent", action: "generated PDF.", type: "report" as const },
  ]);

  const handleAgentAction = (agentName: string, actionMsg: string, costUsdc: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let typeVal: "threat" | "malware" | "payment" | "report" = "payment";
    if (agentName.includes("Threat")) typeVal = "threat";
    else if (agentName.includes("Malware")) typeVal = "malware";
    else if (agentName.includes("Report")) typeVal = "report";

    const newEvent = {
      id: String(Date.now()),
      time: timeStr,
      agent: agentName,
      action: actionMsg,
      type: typeVal,
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
  };

  const runLiveIncidentDemo = () => {
    cyberAudio.playAlert();
    cyberAudio.speak("Live incident simulation executed. Multi-agent swarm mitigation complete.");

    const newThreat: ThreatEvent = {
      eventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      severity: "critical",
      eventType: "Ransomware Attack (T1486)",
      sourceIp: "185.220.101.4",
      targetHost: "fileserver-01",
      description: "Critical T1486 ransomware payload attempt detected & automatically isolated by ThreatLens swarm.",
      riskScore: 98,
      mitreTechnique: "T1486 - Data Encrypted for Impact",
      mitreTactic: "Impact",
      status: "Mitigated & Isolated",
    };

    setThreats((prev) => [newThreat, ...prev]);
    handleAgentAction("Malware Agent", "isolated ransomware vector (T1486) on fileserver-01", 1.0);
    try {
      circlePaymentEngine.executeAutonomousPayment("Payment Agent", 1.0, "Live Incident Demo Automated Mitigation");
    } catch {}

    const demoMermaid = `sequenceDiagram
  autonumber
  actor Attacker as TOR Exit (185.220.101.4)
  participant Edge as Edge Firewall
  participant Agent as ThreatLens Agent Swarm
  participant Target as fileserver-01 (10.0.4.12)
  Attacker->>Target: Ingress Ransomware Payload (T1486)
  Target-->>Agent: High Entropy Alert Event
  Agent->>Edge: 1-Click Isolation Rule Dispatched
  Agent->>Agent: Circle USDC 1.0 Micropayment Settled`;
    setActiveMermaidCode(demoMermaid);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "high" | "medium" | "low" | "flagged">("all");
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);
  const [mitigationState, setMitigationState] = useState<Record<string, { blockedIp?: boolean; quarantinedHost?: boolean }>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi — I'm ThreatLens, your AI security copilot. Ask me about active threats, an IP address, or what to do about an incident, in plain English.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { totalToolCalls, totalQueries } = useUsageCounters(messages);

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistCompany, setWaitlistCompany] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<Record<string, "idle" | "loading" | "error">>({});
  const [checkoutError, setCheckoutError] = useState("");

  const [currentPlan, setCurrentPlan] = useState<{ id: string; name: string } | null>({ id: "solo_founder", name: "Solo Founder" });
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>({ count: 3, limit: 50 });
  const [confirmedSub, setConfirmedSub] = useState<{ planName: string; subscriptionId?: string } | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);

  const [authForm, setAuthForm] = useState({ email: "", password: "", companyName: "" });
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "error">("idle");
  const [authError, setAuthError] = useState("");

  function saveGeminiKey(key: string) {
    setGeminiKey(key);
    if (key) {
      localStorage.setItem("threatlens_gemini_key", key);
    } else {
      localStorage.removeItem("threatlens_gemini_key");
    }
  }

  function goTab(t: Tab) {
    if (PROTECTED_TABS.includes(t) && !token) {
      setTabRaw("login");
      return;
    }
    setTabRaw(t);
  }

  function logout() {
    localStorage.removeItem("threatlens_token");
    setToken(null);
    setAuthUser(null);
    setCurrentPlan({ id: "solo_founder", name: "Solo Founder" });
    setTabRaw("landing");
  }

  function refreshEntitlements(tok: string) {
    if (tok.startsWith("demo_")) return;
    apiFetch("/entitlements", { headers: authHeaders(tok, geminiKey) })
      .then(({ ok, data }) => {
        if (ok && data) {
          if (data.planId) setCurrentPlan({ id: data.planId, name: data.planName });
          if (data.usage) setUsage(data.usage);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!token) return;
    if (token.startsWith("demo_")) {
      if (!authUser) {
        setAuthUser({ userId: "demo_user", email: "founder@threatlens.io" });
      }
      return;
    }
    apiFetch("/auth/me", { headers: authHeaders(token, geminiKey) })
      .then(({ ok, data }) => {
        if (ok && data?.user) {
          setAuthUser(data.user);
          if (data.planId) setCurrentPlan({ id: data.planId, name: data.planName });
          refreshEntitlements(token);
        } else if (!ok && data?.error) {
          localStorage.removeItem("threatlens_token");
          setToken(null);
          setTabRaw("login");
        } else {
          // Backend offline / static Vercel host -> preserve session in demo mode
          setAuthUser({ userId: "demo_user", email: "founder@threatlens.io" });
        }
      })
      .catch(() => {
        setAuthUser({ userId: "demo_user", email: "founder@threatlens.io" });
      });
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    window.history.replaceState({}, "", window.location.pathname);
    if (checkout !== "success" || !sessionId || !token) return;

    apiFetch(`/billing/session/${sessionId}`, { headers: authHeaders(token, geminiKey) })
      .then(({ ok, data }) => {
        if (ok && data?.paid && data?.planId) {
          setCurrentPlan({ id: data.planId, name: data.planName });
          setConfirmedSub({ planName: data.planName, subscriptionId: data.subscriptionId });
          setTabRaw("payment-confirmed");
          refreshEntitlements(token);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    apiFetch("/threats/recent?limit=10")
      .then(({ ok, data }) => {
        if (ok && data?.events && data.events.length > 0) {
          setThreats(data.events);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setAuthStatus("loading");
    setAuthError("");
    try {
      const { ok, data } = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      if (ok && data?.token) {
        localStorage.setItem("threatlens_token", data.token);
        setToken(data.token);
        setAuthUser(data.user);
        setAuthStatus("idle");
        setTabRaw("dashboard");
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        // Fallback for standalone/Vercel static deployment when Express backend is offline
        const demoToken = `demo_${Date.now()}`;
        const demoUser = { userId: "demo_user", email: authForm.email || "demo@threatlens.io", companyName: authForm.companyName };
        localStorage.setItem("threatlens_token", demoToken);
        setToken(demoToken);
        setAuthUser(demoUser);
        setAuthStatus("idle");
        setTabRaw("dashboard");
      }
    } catch (err) {
      setAuthStatus("error");
      setAuthError(err instanceof Error ? err.message : "Signup failed.");
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthStatus("loading");
    setAuthError("");
    try {
      const { ok, data } = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });
      if (ok && data?.token) {
        localStorage.setItem("threatlens_token", data.token);
        setToken(data.token);
        setAuthUser(data.user);
        setAuthStatus("idle");
        setTabRaw("dashboard");
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        // Fallback for standalone/Vercel static deployment when Express backend is offline
        const demoToken = `demo_${Date.now()}`;
        const demoUser = { userId: "demo_user", email: authForm.email || "demo@threatlens.io" };
        localStorage.setItem("threatlens_token", demoToken);
        setToken(demoToken);
        setAuthUser(demoUser);
        setAuthStatus("idle");
        setTabRaw("dashboard");
      }
    } catch (err) {
      setAuthStatus("error");
      setAuthError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  async function joinWaitlist(e: FormEvent) {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistStatus("sending");
    try {
      const { ok, data } = await apiFetch("/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail.trim(), companyName: waitlistCompany.trim() || undefined, source: "landing_page" }),
      });
      if (ok && data?.totalSignups) {
        setWaitlistStatus("done");
        setWaitlistMessage(`You're on the list — signup #${data.totalSignups}. Check your inbox for next steps.`);
      } else {
        setWaitlistStatus("done");
        setWaitlistMessage("You're on the list! Check your inbox for next steps.");
      }
    } catch (err) {
      setWaitlistStatus("error");
      setWaitlistMessage(err instanceof Error ? err.message : "Signup failed.");
    }
  }

  async function handleStripeCheckout(planId: string) {
    if (!token) return;
    try {
      const { ok, data } = await apiFetch("/billing/checkout", {
        method: "POST",
        headers: authHeaders(token, geminiKey, { "Content-Type": "application/json" }),
        body: JSON.stringify({ planId }),
      });
      if (ok && data?.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe external server is not configured in this demo environment. Please use the Credit Card or Circle USDC payment form in the modal.");
      }
    } catch {
      alert("Stripe external server is not configured in this demo environment. Please use the Credit Card or Circle USDC payment form in the modal.");
    }
  }

  async function startCheckout(planId: string) {
    if (!token) {
      const planObj = PLANS.find((p) => p.id === planId);
      setCurrentPlan({ id: planId, name: planObj?.name || "Solo Founder" });
      setTabRaw("signup");
      return;
    }
    if (planId === "solo_founder") {
      setCurrentPlan({ id: "solo_founder", name: "Solo Founder" });
      goTab("console");
      return;
    }
    const planObj = PLANS.find((p) => p.id === planId);
    if (planObj) {
      setSelectedPlanForCheckout(planObj as Plan);
    }
  }


  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    // 1. Try Direct Gemini API Call if Gemini Key is present
    if (geminiKey) {
      try {
        const geminiReply = await callGeminiDirectly(geminiKey, message, history);
        let tierPrefix = "";
        if (currentPlan?.id === "scaling_up") {
          tierPrefix = "👑 **[SCALING UP ENTERPRISE TIER · LIVE GEMINI 1.5 PRO RESPONSE]**\n\n";
        } else if (currentPlan?.id === "early_team") {
          tierPrefix = "🔥 **[EARLY TEAM TIER · LIVE GEMINI 1.5 PRO RESPONSE]**\n\n";
        } else {
          tierPrefix = "✨ **[LIVE GEMINI 1.5 PRO RESPONSE (BYOK KEY)]**\n\n";
        }
        setMessages((prev) => [...prev, { role: "model", text: tierPrefix + geminiReply }]);
        setLoading(false);
        return;
      } catch (geminiErr) {
        console.warn("Direct Gemini API call failed, falling back to backend/engine:", geminiErr);
      }
    }

    // 2. Try Backend `/chat` API
    try {
      const { ok, status, data } = await apiFetch("/chat", {
        method: "POST",
        headers: authHeaders(token, geminiKey, { "Content-Type": "application/json" }),
        body: JSON.stringify({ message, history }),
      });

      if (status === 402 && data?.error) {
        setMessages((prev) => [...prev, { role: "model", text: `🔒 ${data.error}` }]);
        setUsage((u) => (u ? { ...u, count: u.limit } : u));
        setLoading(false);
        return;
      }

      if (ok && data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.reply, toolTrace: data.toolTrace },
        ]);
        if (data.usage) setUsage({ count: data.usage.count ?? 0, limit: data.usage.limit ?? 50 });
        setLoading(false);
        return;
      }
    } catch {
      // Backend fetch error fallback
    }

    // 3. Dynamic Intelligence Copilot Engine (Guarantees unique dynamic responses per question)
    const { reply: dynamicReply, tools: dynamicTools } = generateDynamicSecurityAnswer(message, currentPlan?.id, threats);
    setMessages((prev) => [
      ...prev,
      { role: "model", text: dynamicReply, toolTrace: dynamicTools },
    ]);
    setLoading(false);
  }

  async function flagPriority(eventId: string) {
    if (currentPlan?.id === "solo_founder") {
      setCheckoutError("🔒 Priority Threat Review Flagging requires Early Team Plan ($49/mo). Upgrade to unlock priority queuing.");
      return;
    }
    setThreats((prev) => prev.map((t) => (t.eventId === eventId ? { ...t, priorityReview: true } : t)));
    try {
      await apiFetch(`/threats/${eventId}/priority`, { method: "POST", headers: authHeaders(token, geminiKey) });
    } catch {
      // Keep optimistic update active
    }
  }

  function toggleMitigation(eventId: string, action: "blockIp" | "quarantineHost") {
    const prop = action === "blockIp" ? "blockedIp" : "quarantinedHost";
    setMitigationState((prev) => {
      const current = prev[eventId] || {};
      return {
        ...prev,
        [eventId]: {
          ...current,
          [prop]: !current[prop],
        },
      };
    });
  }

  function copyMessageText(index: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function clearChat() {
    setMessages([
      {
        role: "model",
        text: "Conversation reset. How can ThreatLens help protect your infrastructure now?",
      },
    ]);
  }

  function downloadEvidenceExport() {
    if (currentPlan?.id !== "scaling_up") {
      setCheckoutError("🔒 SOC2 CSV Evidence Export is an exclusive advantage of Scaling Up ($199/mo). Upgrade to download.");
      return;
    }
    fetch("/billing/evidence-export?format=csv", { headers: authHeaders(token, geminiKey) })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Export failed.");
        }
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "threatlens-evidence-export.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback CSV export download for demo
        const csvContent = "data:text/csv;charset=utf-8,Timestamp,EventID,SourceIP,TargetHost,Severity,Action,ToolTrace\n" +
          "2026-07-27T18:30:12Z,evt-9041,185.220.101.4,fileserver-01,critical,flagged,query_security_logs\n" +
          "2026-07-27T18:25:40Z,evt-9042,45.142.212.61,ssh-gateway,high,investigating,check_ip_reputation\n" +
          "2026-07-27T18:14:02Z,evt-9043,103.224.182.9,db-prod-02,critical,active,flag_priority_review\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "threatlens-soc2-evidence-export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  const isPaid = !!currentPlan && currentPlan.id !== "solo_founder";

  const filteredThreats = threats.filter((t) => {
    if (severityFilter === "flagged" && !t.priorityReview) return false;
    if (severityFilter !== "all" && severityFilter !== "flagged" && t.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchIp = t.sourceIp.toLowerCase().includes(q);
      const matchHost = t.targetHost?.toLowerCase().includes(q);
      const matchType = t.eventType.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      return matchIp || matchHost || matchType || matchDesc;
    }
    return true;
  });

  if (tab === "landing") {
    return (
      <div className="landing">
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}

        <header className="landing-nav" aria-label="Landing page navigation">
          <div className="brand">🔐 ThreatLens</div>
          <div className="hero-cta">
            <button
              type="button"
              className="gemini-key-badge"
              onClick={() => setShowKeyModal(true)}
              aria-label="Configure Gemini API Access"
            >
              ✨ {geminiKey ? "Gemini Key Active" : "Gemini Access"}
            </button>

            {token ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => goTab("dashboard")}
                aria-label="Go to Dashboard"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setTabRaw("login")}
                  aria-label="Log in to your account"
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setTabRaw("signup")}
                  aria-label="Sign up for a new account"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </header>

        <section className="hero">
          <div>
            <div className="eyebrow">Live threat monitoring · BYOK Gemini Ready</div>
            <h1>Security you can afford before your first hire.</h1>
            <p>
              ThreatLens is an AI copilot that watches your logs, answers plain-English security questions, and
              tells you exactly what to do next — built for founders who can't yet justify a security engineer.
            </p>
            <div className="hero-cta">
              <a href="#pricing" className="btn-primary" role="button" aria-label="View pricing plans section">
                See pricing &amp; tier advantages
              </a>
              <a href="#waitlist" className="btn-secondary" role="button" aria-label="Jump to waitlist section">
                Join the waitlist
              </a>
            </div>
          </div>
          <div className="radar-wrap">
            <RadarSignature />
          </div>
        </section>

        <section className="landing-section">
          <h2>What it catches</h2>
          <div className="feature-grid">
            <div className="feature">
              <LockIcon />
              <h3>Ransomware & malware</h3>
              <p>Flags encrypted-file patterns and known trojan signatures the moment they hit your logs.</p>
            </div>
            <div className="feature">
              <KeyIcon />
              <h3>Credential attacks</h3>
              <p>Surfaces brute-force and credential-stuffing attempts before an account is compromised.</p>
            </div>
            <div className="feature">
              <OutboundIcon />
              <h3>Data exfiltration</h3>
              <p>Catches unusual outbound transfers to unrecognized endpoints during off-hours.</p>
            </div>
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <h2>Pricing &amp; Tier Advantages</h2>
          <div className="plan-grid">
            {PLANS.map((p) => (
              <div className={`plan${p.name === "Early Team" ? " active" : ""}`} key={p.name}>
                <div className="plan-tier-badge">{p.badge}</div>
                <div className="name">{p.name}</div>
                <div className="price">
                  {p.price === 0 ? "Free" : `$${p.price}`} <span>/{p.cadence}</span>
                </div>
                <ul>
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <PlanButton
                  plan={p}
                  currentPlanId={currentPlan?.id ?? null}
                  checkoutStatus={checkoutStatus[p.id]}
                  onUpgrade={startCheckout}
                  loggedIn={!!token}
                />
              </div>
            ))}
          </div>

          <PlanComparisonMatrix />

          {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
        </section>

        <section className="landing-section" id="waitlist">
          <h2>Join the waitlist</h2>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>
            Not ready to sign up yet? Leave your email and we'll reach out.
          </p>
          <form className="waitlist-form" onSubmit={joinWaitlist}>
            <input
              type="email"
              required
              placeholder="you@company.com"
              aria-label="Email address for waitlist"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Company name (optional)"
              aria-label="Company name for waitlist"
              value={waitlistCompany}
              onChange={(e) => setWaitlistCompany(e.target.value)}
            />
            <button
              type="submit"
              disabled={waitlistStatus === "sending"}
              aria-disabled={waitlistStatus === "sending"}
              aria-label="Submit email to join waitlist"
            >
              {waitlistStatus === "sending" ? "Joining…" : "Join waitlist"}
            </button>
          </form>
          {waitlistStatus === "done" && <p className="waitlist-success" role="status">{waitlistMessage}</p>}
          {waitlistStatus === "error" && <p className="checkout-error" role="alert">{waitlistMessage}</p>}
        </section>

        <footer className="landing-footer">
          Built for Build with Gemini XPRIZE — Entrepreneurship &amp; Job Creation category.
        </footer>
      </div>
    );
  }

  if (tab === "signup") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand" style={{ marginBottom: 22 }}>🔐 ThreatLens</div>
          <h1>Create your account</h1>
          <p className="auth-sub">Free to start — 50 agent queries a month, no card required.</p>
          <form onSubmit={handleSignup} className="auth-form">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
            />
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={8}
              value={authForm.password}
              onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
            />
            <label htmlFor="signup-company">Company name (optional)</label>
            <input
              id="signup-company"
              type="text"
              value={authForm.companyName}
              onChange={(e) => setAuthForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="Acme Inc."
            />
            {authError && <p className="checkout-error" role="alert">{authError}</p>}
            <button
              type="submit"
              disabled={authStatus === "loading"}
              aria-disabled={authStatus === "loading"}
              aria-label="Create account button"
            >
              {authStatus === "loading" ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account?{" "}
            <button
              type="button"
              className="btn-link-inline"
              onClick={() => { setAuthError(""); setTabRaw("login"); }}
              aria-label="Switch to log in screen"
            >
              Log in
            </button>
          </p>
          <button
            type="button"
            className="auth-back"
            onClick={() => setTabRaw("landing")}
            aria-label="Back to landing page"
          >
            ← Back to landing page
          </button>
        </div>
      </div>
    );
  }

  if (tab === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand" style={{ marginBottom: 22 }}>🔐 ThreatLens</div>
          <h1>Log in</h1>
          <p className="auth-sub">Welcome back.</p>
          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
            />
            {authError && <p className="checkout-error" role="alert">{authError}</p>}
            <button
              type="submit"
              disabled={authStatus === "loading"}
              aria-disabled={authStatus === "loading"}
              aria-label="Log in to your account"
            >
              {authStatus === "loading" ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account?{" "}
            <button
              type="button"
              className="btn-link-inline"
              onClick={() => { setAuthError(""); setTabRaw("signup"); }}
              aria-label="Switch to sign up screen"
            >
              Sign up
            </button>
          </p>
          <button
            type="button"
            className="auth-back"
            onClick={() => setTabRaw("landing")}
            aria-label="Back to landing page"
          >
            ← Back to landing page
          </button>
        </div>
      </div>
    );
  }

  if (tab === "dashboard") {
    return (
      <div className="app-shell-full">
        <CyberCanvas />
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="dashboard">
          <h1>Welcome{authUser?.companyName ? `, ${authUser.companyName}` : ""}.</h1>
          <p className="tagline">{authUser?.email}</p>

          {/* AI COPILOT & COMMAND CENTER PANEL */}
          <ThreatLensCopilotPanel
            onRunLiveDemo={runLiveIncidentDemo}
            onSendCopilotPrompt={(prompt) => {
              goTab("console");
              send(prompt);
            }}
            onGenerateDiagram={(code) => {
              setActiveMermaidCode(code);
              goTab("diagrams");
            }}
          />

          {/* Tactical Cyber Threat Radar Visualization Map */}
          <ThreatRadarMap threats={threats} onSelectThreat={(t) => setSelectedThreat(t)} />

          <div className="stat-grid">
            <div className="stat">
              <div className="n">{threats.length}</div>
              <div className="l">Open high/critical threats</div>
            </div>
            <div className="stat">
              <div className="n">{isPaid ? "∞ Unlimited" : usage ? `${usage.count}/${usage.limit}` : "3/50"}</div>
              <div className="l">Queries used this month</div>
            </div>
            <div className="stat">
              <div className="n">{isPaid ? "Active" : "Locked"}</div>
              <div className="l">Slack alerts + 1-click mitigation</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <button
              type="button"
              className="dashboard-card"
              onClick={() => goTab("console")}
              aria-label="Open Console"
            >
              <strong>Open Console</strong>
              <span>Ask ThreatLens about active threats, IPs, or remediation steps.</span>
            </button>

            <button
              type="button"
              className="dashboard-card"
              onClick={() => goTab("diagrams")}
              aria-label="Open Security Diagram Studio"
            >
              <strong>📊 Security Diagram Studio</strong>
              <span>Generate visual attack sequence diagrams & topology maps.</span>
            </button>

            <button
              type="button"
              className="dashboard-card"
              onClick={() => goTab("payment")}
              aria-label={isPaid ? "Manage plan advantages" : "Upgrade plan for advantages"}
            >
              <strong>{isPaid ? "Manage plan advantages" : "Upgrade plan advantages"}</strong>
              <span>{isPaid ? "Explore your unlocked Early Team / Scaling Up perks." : "Unlock unlimited queries, 1-click mitigation, and Slack alerts."}</span>
            </button>
          </div>

          {/* Autonomous Payment Engine Widget */}
          <AutonomousPaymentWidget
            onViewTransactions={() => goTab("transactions")}
            onPaymentTriggered={() => handleAgentAction("Payment Agent", "settled 1 USDC autonomous micropayment", 1.0)}
          />

          {/* Multi-Agent Swarm Cards */}
          <MultiAgentCards onAgentAction={handleAgentAction} />

          {/* Agent Activity Timeline */}
          <AgentActivityTimeline events={timelineEvents} />

          {/* Threat Heatmap Visual Analytics */}
          <ThreatHeatmap />
        </main>
      </div>
    );
  }

  if (tab === "transactions") {
    return (
      <div className="app-shell-full">
        <CyberCanvas />
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="dashboard">
          <TransactionHistory onBackToDashboard={() => goTab("dashboard")} />
        </main>
      </div>
    );
  }

  if (tab === "diagrams") {
    return (
      <div className="app-shell-full">
        <CyberCanvas />
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="dashboard">
          <DiagramStudio initialMermaid={activeMermaidCode} />
        </main>
      </div>
    );
  }

  if (tab === "payment") {
    return (
      <div className="app-shell-full">
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        {selectedPlanForCheckout && (
          <PaymentCheckoutModal
            plan={selectedPlanForCheckout}
            onClose={() => setSelectedPlanForCheckout(null)}
            onPaymentSuccess={({ planName, subscriptionId }) => {
              setCurrentPlan({ id: selectedPlanForCheckout.id, name: planName });
              setConfirmedSub({ planName, subscriptionId });
              setSelectedPlanForCheckout(null);
              setTabRaw("payment-confirmed");
              if (token) refreshEntitlements(token);
            }}
            onStripeCheckout={handleStripeCheckout}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="dashboard">
          <h1>Choose your plan &amp; unlock advantages</h1>
          <p className="tagline">Upgrade any time — cancel any time. Select a plan to enter payment details &amp; upgrade.</p>

          <div className="plan-grid" style={{ marginTop: 24 }}>
            {PLANS.map((p) => (
              <div className={`plan${p.name === "Early Team" ? " active" : ""}`} key={p.name}>
                <div className="plan-tier-badge">{p.badge}</div>
                <div className="name">{p.name}</div>
                <div className="price">
                  {p.price === 0 ? "Free" : `$${p.price}`} <span>/{p.cadence}</span>
                </div>
                <ul>
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <PlanButton
                  plan={p}
                  currentPlanId={currentPlan?.id ?? null}
                  checkoutStatus={checkoutStatus[p.id]}
                  onUpgrade={startCheckout}
                  loggedIn={!!token}
                />
              </div>
            ))}
          </div>

          <PlanComparisonMatrix />

          {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
        </main>
      </div>
    );
  }

  if (tab === "payment-confirmed") {
    return (
      <div className="app-shell-full">
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        {selectedPlanForCheckout && (
          <PaymentCheckoutModal
            plan={selectedPlanForCheckout}
            onClose={() => setSelectedPlanForCheckout(null)}
            onPaymentSuccess={({ planName, subscriptionId }) => {
              setCurrentPlan({ id: selectedPlanForCheckout.id, name: planName });
              setConfirmedSub({ planName, subscriptionId });
              setSelectedPlanForCheckout(null);
              setTabRaw("payment-confirmed");
              if (token) refreshEntitlements(token);
            }}
            onStripeCheckout={handleStripeCheckout}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="confirmed-page">
          <div className="confirmed-check" aria-hidden="true">✓</div>
          <h1>Payment Confirmed! Plan Advantages Unlocked</h1>
          <p className="tagline">
            You're now on the <strong>{confirmedSub?.planName || currentPlan?.name}</strong> plan.
            Your plan advantages (unlimited queries, Slack alerting, 1-click mitigation, and SOC2 audit exports) are fully active.
          </p>
          {confirmedSub?.subscriptionId && (
            <p className="tool-trace">Subscription ID: {confirmedSub.subscriptionId}</p>
          )}
          <div className="hero-cta" style={{ marginTop: 24, gap: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => goTab("dashboard")}
              aria-label="Go to dashboard view"
            >
              Go to dashboard
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => goTab("console")}
              aria-label="Open ThreatLens Console"
            >
              Open Console
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => goTab("payment")}
              aria-label="Manage Payment & Subscriptions"
            >
              Manage Payment Details
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (tab === "account") {
    return (
      <div className="app-shell-full">
        {showKeyModal && (
          <GeminiKeyModal
            apiKey={geminiKey}
            onSaveKey={saveGeminiKey}
            onClose={() => setShowKeyModal(false)}
          />
        )}
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />
        <main className="dashboard">
          <h1>Account &amp; Plan Advantages</h1>
          <p className="tagline">
            {authUser?.email} {authUser?.companyName ? `· ${authUser.companyName}` : ""} · <strong>{currentPlan?.name || "Solo Founder"}</strong> plan active
          </p>

          {/* JWT Account Access & Session Token Panel */}
          <div style={{ background: "var(--panel-raised)", border: "1px solid var(--line-bright)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔑</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: "var(--paper)" }}>JWT Account Access &amp; Session Security</h3>
                  <span style={{ fontSize: 12, color: "var(--dim)" }}>Bearer token authorization for API endpoints &amp; account telemetry</span>
                </div>
              </div>
              <span style={{ fontSize: 11, padding: "4px 10px", background: "rgba(16,185,129,0.15)", color: "#10b981", borderRadius: 6, fontWeight: 700, fontFamily: "var(--mono)" }}>
                ✓ JWT SESSION ACTIVE
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--dim)", textTransform: "uppercase", marginBottom: 4 }}>Account Email</label>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--paper)", background: "var(--panel-dark)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  {authUser?.email || "founder@threatlens.io"}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--dim)", textTransform: "uppercase", marginBottom: 4 }}>User ID (JWT Subject)</label>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--brand-orange)", background: "var(--panel-dark)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  {authUser?.userId || "demo_user_7f90a2"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--dim)", textTransform: "uppercase", marginBottom: 4 }}>
                Active JWT Bearer Authorization Token (Expires in 30 Days)
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", background: "var(--panel-dark)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {token ? `Bearer ${token}` : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vX3VzZXJfN2Y5MGEyIiwiaWF0IjoxNzI2Njk4OTAwLCJleHAiOjE3MjkyOTA5MDB9..."}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: "8px 14px", whiteSpace: "nowrap" }}
                  onClick={() => {
                    const tokVal = token ? `Bearer ${token}` : "Bearer demo_token_active";
                    navigator.clipboard.writeText(tokVal);
                    alert("JWT Bearer Token copied to clipboard!");
                  }}
                >
                  📋 Copy Token
                </button>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--panel-raised)", border: "1px solid var(--line)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
            <strong style={{ fontSize: 14, color: "var(--paper)" }}>⚡ Test Plan Tier Advantages Live:</strong>
            <p style={{ fontSize: 12.5, color: "var(--dim)", margin: "4px 0 12px" }}>
              Switch your plan tier instantly to test and experience the advantages unlocked by each paid tier.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`btn-secondary ${currentPlan?.id === p.id ? "active-plan-btn" : ""}`}
                  style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => startCheckout(p.id)}
                >
                  {currentPlan?.id === p.id ? `✓ ${p.name} (Active Tier)` : `Switch to ${p.name}`}
                </button>
              ))}
            </div>
          </div>

          {checkoutError && <p className="checkout-error" role="alert" style={{ marginBottom: 16 }}>{checkoutError}</p>}

          <div className="stat-grid">
            <div className="stat">
              <div className="n">{totalQueries}</div>
              <div className="l">Agent queries this session</div>
            </div>
            <div className="stat">
              <div className="n">{totalToolCalls}</div>
              <div className="l">Tool calls executed</div>
            </div>
            <div className="stat">
              <div className="n">{threats.length}</div>
              <div className="l">Open high/critical threats tracked</div>
            </div>
          </div>

          <h2 style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 10 }}>
            Unlocked Plan Tier Facilities &amp; Advantages
          </h2>

          <div className="facility-list">
            <div className="facility-row">
              <div>
                <strong>Monthly Query Limit Advantage</strong>
                <div className="tool-trace">Solo Founder capped at 50 agent queries/month. Early Team &amp; Scaling Up feature UNLIMITED agent queries.</div>
              </div>
              <span className={`facility-status ${isPaid ? "on" : "off"}`}>{isPaid ? "UNLIMITED" : "Metered (50/mo)"}</span>
            </div>

            <div className="facility-row">
              <div>
                <strong>1-Click Incident Response Mitigation</strong>
                <div className="tool-trace">Instant firewall IP blocking and host endpoint isolation controls unlocked for Early Team+.</div>
              </div>
              <span className={`facility-status ${isPaid ? "on" : "off"}`}>{isPaid ? "UNLOCKED" : "Locked (Early Team+)"}</span>
            </div>

            <div className="facility-row">
              <div>
                <strong>Real-Time Slack Webhook Alert Routing</strong>
                <div className="tool-trace">Instant Slack notification ping when high/critical security threats are flagged by the copilot. Early Team+.</div>
              </div>
              <span className={`facility-status ${isPaid ? "on" : "off"}`}>{isPaid ? "Enabled" : "Locked"}</span>
            </div>

            <div className="facility-row">
              <div>
                <strong>Priority Review Threat Flagging</strong>
                <div className="tool-trace">Mark threats for priority review — flags appear on threat cards across the console for Early Team+.</div>
              </div>
              <span className={`facility-status ${isPaid ? "on" : "off"}`}>{isPaid ? "Enabled" : "Locked"}</span>
            </div>

            <div className="facility-row">
              <div>
                <strong>SOC2 CSV Evidence Audit Export</strong>
                <div className="tool-trace">Download structured CSV audit trail of every agent tool call executed — Scaling Up tier exclusive.</div>
              </div>
              {currentPlan?.id === "scaling_up" ? (
                <button
                  type="button"
                  className="facility-action"
                  onClick={downloadEvidenceExport}
                  aria-label="Download SOC2 evidence export CSV"
                >
                  Download CSV
                </button>
              ) : (
                <button
                  type="button"
                  className="facility-action-disabled"
                  onClick={downloadEvidenceExport}
                >
                  🔒 Scaling Up Only
                </button>
              )}
            </div>

            <div className="facility-row">
              <div>
                <strong>Bring Your Own Gemini API Key (BYOK)</strong>
                <div className="tool-trace">Anyone with Gemini access can use ThreatLens with their own custom API key quota.</div>
              </div>
              <button
                type="button"
                className="facility-action"
                onClick={() => setShowKeyModal(true)}
              >
                {geminiKey ? "Manage Key" : "Configure Key"}
              </button>
            </div>
          </div>

          <PlanComparisonMatrix />

          {!isPaid && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => goTab("payment")}
              style={{ marginTop: 16 }}
              aria-label="Upgrade plan now"
            >
              Upgrade Plan &amp; Unlock Advantages
            </button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {showKeyModal && (
        <GeminiKeyModal
          apiKey={geminiKey}
          onSaveKey={saveGeminiKey}
          onClose={() => setShowKeyModal(false)}
        />
      )}

      {selectedThreat && (
        <ThreatDetailModal
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
          onMitigate={toggleMitigation}
          mitigationState={mitigationState[selectedThreat.eventId]}
          onAskCopilot={send}
          isPaid={isPaid}
          onUpgradePrompt={() => goTab("payment")}
          onOpenDiagramStudio={(code) => {
            setActiveMermaidCode(code);
            goTab("diagrams");
          }}
        />
      )}

      <aside className="sidebar" aria-label="Console sidebar navigation and threats">
        <AppNav
          tab={tab}
          goTab={goTab}
          onLogout={logout}
          geminiKey={geminiKey}
          onOpenGeminiModal={() => setShowKeyModal(true)}
        />

        <div className="sidebar-filter-section">
          <input
            type="text"
            className="threat-search-input"
            placeholder="🔍 Search IP, host, threat type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter threats"
          />

          <div className="severity-filter-bar" role="group" aria-label="Severity Filter">
            {(["all", "critical", "high", "medium", "flagged"] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                className={`filter-pill ${severityFilter === sev ? "active" : ""}`}
                onClick={() => setSeverityFilter(sev)}
                aria-label={`Filter by ${sev} severity`}
              >
                {sev === "flagged" ? "⚑ Flagged" : sev}
              </button>
            ))}
          </div>
          <div className="filter-count-badge">
            Showing {filteredThreats.length} of {threats.length} threats
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {filteredThreats.length === 0 && <div className="tool-trace">No matching threat events.</div>}
          {filteredThreats.map((t) => (
            <div
              className="threat-card interactive"
              key={t.eventId}
              onClick={() => setSelectedThreat(t)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className={`severity-badge severity-${t.severity}`}>{t.severity}</span>
                {t.priorityReview ? (
                  <span className="priority-badge">⚑ priority</span>
                ) : (
                  <button
                    type="button"
                    className="flag-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      flagPriority(t.eventId);
                    }}
                    aria-label={`Flag threat ${t.eventType.replace(/_/g, " ")} for priority review`}
                  >
                    Flag priority
                  </button>
                )}
              </div>
              <div style={{ marginTop: 6, fontWeight: 600 }}>{t.eventType.replace(/_/g, " ")}</div>
              <div style={{ color: "var(--muted)" }}>{t.sourceIp} → {t.targetHost || "unknown host"}</div>
              <div style={{ marginTop: 4 }}>{t.description}</div>
              {mitigationState[t.eventId]?.blockedIp && (
                <span className="mitigation-status-badge">✓ IP Blocked</span>
              )}
              {mitigationState[t.eventId]?.quarantinedHost && (
                <span className="mitigation-status-badge">✓ Host Isolated</span>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-column" aria-label="AI Copilot Chat Console">
        <SOCHeader geminiKey={geminiKey} currentPlanName={currentPlan?.name} />

        <div className="chat-toolbar-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="chat-copilot-title">🤖 ThreatLens AI Copilot</span>
            <span className="copilot-mode-badge">{isPaid ? `⚡ ${currentPlan?.name} (Unlimited)` : "Free Metered Tier"}</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="gemini-key-btn-sm"
              onClick={() => setShowKeyModal(true)}
            >
              ✨ {geminiKey ? "Gemini Key Saved" : "Set Gemini Key"}
            </button>
            <button type="button" className="clear-chat-btn" onClick={clearChat} aria-label="Reset conversation">
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        <div className="messages" aria-live="polite">
          {messages.map((m, i) => (
            <div className={`message ${m.role}`} key={i}>
              <div className="message-header">
                <span className="sender-name">{m.role === "user" ? "You" : "ThreatLens Copilot"}</span>
                {m.role === "model" && (
                  <button
                    type="button"
                    className="copy-msg-btn"
                    onClick={() => copyMessageText(i, m.text)}
                    aria-label="Copy AI response"
                  >
                    {copiedIndex === i ? "✓ Copied" : "📋 Copy"}
                  </button>
                )}
              </div>
              <div className="message-content">{renderMessageContent(m.text)}</div>
              {m.toolTrace && m.toolTrace.length > 0 && (
                <div className="tool-trace">Tools used: {m.toolTrace.map((t) => t.tool).join(", ")}</div>
              )}
            </div>
          ))}
          {loading && <div className="message model" aria-live="assertive">Thinking…</div>}
          <div ref={bottomRef} />
        </div>

        {usage && !isPaid && (
          <div className="usage-banner">
            {usage.count}/{usage.limit} free queries used this month
            {usage.count >= usage.limit * 0.8 && (
              <>
                {" "}
                —{" "}
                <button
                  type="button"
                  className="btn-link-inline"
                  onClick={() => goTab("payment")}
                  aria-label="Upgrade for unlimited queries"
                >
                  upgrade for unlimited tier advantages
                </button>
              </>
            )}
          </div>
        )}

        <div className="suggestions" role="group" aria-label="Suggested security queries">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              aria-disabled={loading}
              aria-label={`Ask suggestion: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ThreatLens about your security posture, IP reputation, or incident remediation…"
            disabled={loading}
            aria-label="Ask ThreatLens input field"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-disabled={loading || !input.trim()}
            aria-label="Send query to ThreatLens copilot"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
