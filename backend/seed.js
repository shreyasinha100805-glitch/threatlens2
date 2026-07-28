// seed.js
// Populates MongoDB Atlas with 15 realistic sample security log events so a
// new team can demo ThreatLens immediately after cloning.
require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "threatlens";

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

const SAMPLE_EVENTS = [
  { eventId: "evt-001", timestamp: hoursAgo(1), severity: "critical", eventType: "ransomware", sourceIp: "185.220.101.4", targetHost: "fileserver-01", description: "Encrypted file extensions (.locked) appearing across shared drive; ransom note dropped in /shared/", riskScore: 96, status: "open" },
  { eventId: "evt-002", timestamp: hoursAgo(2), severity: "high", eventType: "brute_force", sourceIp: "45.142.212.61", targetHost: "ssh-gateway", description: "412 failed SSH login attempts against admin account within 10 minutes", riskScore: 78, status: "investigating" },
  { eventId: "evt-003", timestamp: hoursAgo(3), severity: "critical", eventType: "data_exfiltration", sourceIp: "103.224.182.9", targetHost: "db-prod-02", description: "2.3GB outbound transfer to unrecognized external endpoint during off-hours", riskScore: 91, status: "open" },
  { eventId: "evt-004", timestamp: hoursAgo(4), severity: "medium", eventType: "anomalous_access", sourceIp: "192.168.1.105", targetHost: "hr-portal", description: "Employee account accessed payroll records at 3:47 AM local time, outside normal pattern", riskScore: 55, status: "investigating" },
  { eventId: "evt-005", timestamp: hoursAgo(5), severity: "high", eventType: "privilege_escalation", sourceIp: "10.0.0.44", targetHost: "app-server-03", description: "Standard user account added itself to sudoers group", riskScore: 82, status: "open" },
  { eventId: "evt-006", timestamp: hoursAgo(6), severity: "low", eventType: "phishing", sourceIp: "198.51.100.23", targetHost: "mail-gateway", description: "Inbound email with spoofed sender domain flagged by DKIM failure", riskScore: 28, status: "resolved" },
  { eventId: "evt-007", timestamp: hoursAgo(7), severity: "high", eventType: "malware_detection", sourceIp: "203.0.113.77", targetHost: "workstation-14", description: "Known trojan signature detected in downloaded executable, quarantined", riskScore: 74, status: "resolved" },
  { eventId: "evt-008", timestamp: hoursAgo(8), severity: "medium", eventType: "sql_injection", sourceIp: "91.219.237.12", targetHost: "api-gateway", description: "Malformed query string containing UNION SELECT pattern on /api/users endpoint", riskScore: 60, status: "investigating" },
  { eventId: "evt-009", timestamp: hoursAgo(9), severity: "critical", eventType: "brute_force", sourceIp: "185.220.101.4", targetHost: "vpn-concentrator", description: "Credential stuffing attempt using leaked password list, 1,200 attempts", riskScore: 89, status: "open" },
  { eventId: "evt-010", timestamp: hoursAgo(12), severity: "low", eventType: "anomalous_access", sourceIp: "172.16.0.9", targetHost: "wiki-internal", description: "Contractor account accessed engineering wiki page outside assigned project", riskScore: 22, status: "resolved" },
  { eventId: "evt-011", timestamp: hoursAgo(14), severity: "medium", eventType: "malware_detection", sourceIp: "51.75.64.18", targetHost: "workstation-07", description: "Suspicious PowerShell script attempted to disable Windows Defender", riskScore: 58, status: "investigating" },
  { eventId: "evt-012", timestamp: hoursAgo(18), severity: "high", eventType: "data_exfiltration", sourceIp: "77.83.36.19", targetHost: "crm-prod", description: "Bulk export of customer records via API key not associated with any active integration", riskScore: 80, status: "open" },
  { eventId: "evt-013", timestamp: hoursAgo(24), severity: "critical", eventType: "privilege_escalation", sourceIp: "10.0.2.15", targetHost: "k8s-cluster-01", description: "Pod escaped container boundary and accessed host filesystem", riskScore: 94, status: "open" },
  { eventId: "evt-014", timestamp: hoursAgo(30), severity: "low", eventType: "phishing", sourceIp: "198.51.100.201", targetHost: "mail-gateway", description: "Bulk phishing campaign impersonating payroll provider, auto-quarantined", riskScore: 25, status: "resolved" },
  { eventId: "evt-015", timestamp: hoursAgo(36), severity: "medium", eventType: "anomalous_access", sourceIp: "192.168.1.201", targetHost: "code-repo", description: "Former employee's still-active token used to clone private repository", riskScore: 65, status: "investigating" },
];

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection("security_logs");

    await collection.deleteMany({});
    const result = await collection.insertMany(SAMPLE_EVENTS);
    console.log(`Seeded ${result.insertedCount} security log events into ${DB_NAME}.security_logs`);
    console.log("Next: run `npm run embed` to generate vector embeddings for semantic search.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
