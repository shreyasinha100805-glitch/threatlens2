// logSchema.js
// Plain-object "schema" for security log documents stored in MongoDB Atlas.
// Kept dependency-free (native `mongodb` driver) rather than Mongoose so the
// same shape can be reused by seed.js, embedLogs.js, and tools.js.

/**
 * @typedef {Object} SecurityLogEvent
 * @property {string} eventId
 * @property {string} timestamp        ISO-8601
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} eventType        e.g. "brute_force", "privilege_escalation"
 * @property {string} sourceIp
 * @property {string} [targetHost]
 * @property {string} description
 * @property {number} [riskScore]      0-100
 * @property {string} [status]         "open" | "investigating" | "resolved"
 * @property {number[]} [embedding]    vector for Atlas Vector Search
 */

const SEVERITIES = ["low", "medium", "high", "critical"];

const EVENT_TYPES = [
  "brute_force",
  "privilege_escalation",
  "malware_detection",
  "data_exfiltration",
  "anomalous_access",
  "ransomware",
  "phishing",
  "sql_injection",
];

function validateEvent(evt) {
  const errors = [];
  if (!evt.eventId) errors.push("eventId is required");
  if (!evt.timestamp) errors.push("timestamp is required");
  if (!SEVERITIES.includes(evt.severity)) errors.push(`severity must be one of ${SEVERITIES.join(", ")}`);
  if (!evt.sourceIp) errors.push("sourceIp is required");
  if (!evt.description) errors.push("description is required");
  return { valid: errors.length === 0, errors };
}

module.exports = { SEVERITIES, EVENT_TYPES, validateEvent };
