// alerts.js
// Real Slack incoming-webhook integration. Set SLACK_WEBHOOK_URL in
// backend/.env (Slack -> your workspace -> Apps -> Incoming Webhooks) to
// enable it. Without it configured, this silently no-ops — free-plan users
// never see Slack behavior, and paid plans without a webhook set just don't
// get pinged (no crash either way).

async function sendSlackAlert(events) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || !events || events.length === 0) return { sent: false };

  const lines = events.map(
    (e) =>
      `*${(e.severity || "").toUpperCase()}* — ${e.eventType?.replace(/_/g, " ")} — \`${e.sourceIp}\` → \`${
        e.targetHost || "unknown host"
      }\`\n${e.description}`
  );

  const body = {
    text: `🚨 ThreatLens flagged ${events.length} threat${events.length > 1 ? "s" : ""} during an agent query`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `🚨 *ThreatLens flagged ${events.length} threat${events.length > 1 ? "s" : ""}*` },
      },
      { type: "section", text: { type: "mrkdwn", text: lines.join("\n\n").slice(0, 2900) } },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { sent: res.ok };
  } catch (err) {
    console.error("Slack alert failed:", err.message);
    return { sent: false, error: err.message };
  }
}

/** Pulls high/critical events out of a tool-call trace so callers don't need to know tool internals. */
function extractHighSeverityEvents(toolTrace) {
  const events = [];
  for (const call of toolTrace || []) {
    const result = call.result;
    const candidates = Array.isArray(result?.events) ? result.events : Array.isArray(result) ? result : [];
    for (const e of candidates) {
      if (e && (e.severity === "high" || e.severity === "critical")) events.push(e);
    }
  }
  return events;
}

module.exports = { sendSlackAlert, extractHighSeverityEvents };
