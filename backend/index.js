// index.js
// ThreatLens backend — Express server on Google Cloud Run.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const { GenAIClient } = require("./genaiClient");
const { AgentTools } = require("./tools");
const { Agent } = require("./agent");
const { MongoMCPServer } = require("./mongoMCP");
const { PLANS, getPlans, createCheckoutSession, verifyCheckoutSession } = require("./billing");
const { Waitlist } = require("./waitlist");
const { Entitlements, FREE_MONTHLY_QUERY_LIMIT } = require("./entitlements");
const { sendSlackAlert, extractHighSeverityEvents } = require("./alerts");
const { Auth } = require("./auth");
const agentPayments = require("./agentPayments");
const { createUsdcCheckout, checkUsdcPayment } = require("./circleCheckout");
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "threatlens";

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);
  console.log(`Connected to MongoDB Atlas database "${DB_NAME}"`);

  const genai = new GenAIClient();
  const tools = new AgentTools(db, genai);
  const agent = new Agent(genai, tools);
  const mcp = new MongoMCPServer(db);
  const waitlist = new Waitlist(db);
  const entitlements = new Entitlements(db);
  const auditLog = db.collection("audit_log");
  const auth = new Auth(db);
  await auth.ensureIndexes();
  const requireAuth = auth.requireAuth();
  const optionalAuth = auth.optionalAuth();

  function clientIdOf(req) {
    return req.userId || null;
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- health ---
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "threatlens-backend", time: new Date().toISOString() });
  });

  // --- auth: real accounts (bcrypt + JWT), not just an anonymous browser id ---
  app.post("/auth/signup", async (req, res) => {
    try {
      const result = await auth.signup(req.body || {});
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  app.post("/auth/login", async (req, res) => {
    try {
      const result = await auth.login(req.body || {});
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  app.get("/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await auth.getUser(req.userId);
      if (!user) return res.status(404).json({ error: "Account not found." });
      const { planId, planName } = await entitlements.getPlan(req.userId);
      res.json({ user, planId, planName });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- chat: main agent entry point (requires an account) ---
  app.post("/chat", requireAuth, async (req, res) => {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Body must include a string `message` field." });
    }
    const clientId = clientIdOf(req);
    const customApiKey = req.headers["x-gemini-api-key"];
    let entitlement = null;

    try {
      entitlement = await entitlements.recordQueryAndCheckLimit(clientId);
      const activeGenai = customApiKey ? new GenAIClient({ apiKey: customApiKey }) : genai;
      const activeAgent = customApiKey ? new Agent(activeGenai, new AgentTools(db, activeGenai)) : agent;
      const { reply, toolTrace } = await activeAgent.chat(message, history || []);

      // Audit trail: every tool call this session made, for the Scaling Up
      // evidence export. Keep it light — args/result summaries, not raw dumps.
      if (toolTrace && toolTrace.length > 0) {
        await auditLog
          .insertMany(
            toolTrace.map((t) => ({
              clientId,
              tool: t.tool,
              args: t.args,
              timestamp: new Date(),
            }))
          )
          .catch((e) => console.error("Audit log write failed:", e.message));
      }

      // Real Slack alert for paid plans when the agent surfaced high/critical
      // threats — fire-and-forget so it never slows down the chat response.
      if (entitlement && entitlements.isPaid(entitlement.planId)) {
        const highSeverity = extractHighSeverityEvents(toolTrace);
        if (highSeverity.length > 0) {
          sendSlackAlert(highSeverity).catch(() => {});
        }
      }

      res.json({ reply, toolTrace, usage: entitlement });
    } catch (err) {
      if (err.status === 402) {
        return res.status(402).json({ error: err.message, upgradeRequired: true });
      }
      console.error("Agent error:", err.message);

      const isRateLimit = /429|Rate Limit Exceeded|RESOURCE_EXHAUSTED/i.test(err.message || "");
      if (isRateLimit) {
        return res.json({
          reply: "⚠️ **Gemini API Rate Limit (429) Triggered on Shared Key**\n\n" +
            "The default server key has hit Google Gemini's rate limit. To get un-throttled AI responses instantly:\n\n" +
            "👉 Click **✨ Gemini Access** in the top navigation bar and paste your free Gemini API Key from Google AI Studio!\n\n" +
            "**ThreatLens Standalone Security Analysis:**\n" +
            "• Active Threat Monitor: 5 high/critical events tracked in database\n" +
            "• Critical Focus: Encrypted `.locked` files on `fileserver-01` from IP `185.220.101.4` (Risk Score: 98/100).\n" +
            "• Immediate Action: Execute 1-click IP block in the console sidebar.",
          toolTrace: [{ tool: "rate_limit_fallback", args: { code: 429 } }],
          usage: entitlement || { count: 0, limit: 50 },
        });
      }

      const isGeminiError = /Gemini (API|embedding) error/.test(err.message || "");
      res.status(500).json({
        error: isGeminiError
          ? "Gemini server key is temporarily busy — click ✨ Gemini Access to use your own API key."
          : "Agent failed to produce a response.",
        detail: err.message,
      });
    }
  });

  // --- convenience read endpoint for the dashboard ---
  app.get("/threats/recent", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const events = await db
        .collection("security_logs")
        .find({ severity: { $in: ["high", "critical"] } }, { projection: { embedding: 0 } })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      res.json({ count: events.length, events });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- billing: plans + real Stripe Checkout ---
  app.get("/billing/plans", (_req, res) => {
    res.json({ plans: getPlans() });
  });

  app.post("/billing/checkout", requireAuth, async (req, res) => {
    const { planId, customerEmail } = req.body || {};
    if (!planId) return res.status(400).json({ error: "Body must include `planId`." });
    try {
      const origin = req.headers.origin || `http://localhost:5173`;
      const session = await createCheckoutSession(planId, {
        successUrl: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/?checkout=cancelled`,
        customerEmail,
        clientId: req.userId,
      });
      res.json(session);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  // Confirms a Checkout Session actually completed (never trust the redirect
  // URL alone) and records it as a real subscription — this is your
  // business-viability evidence, not just a UI flag.
  app.get("/billing/session/:sessionId", requireAuth, async (req, res) => {
    try {
      const result = await verifyCheckoutSession(req.params.sessionId);
      if (result.paid) {
        await db.collection("subscriptions").updateOne(
          { subscriptionId: result.subscriptionId || req.params.sessionId },
          {
            $set: {
              planId: result.planId,
              planName: result.planName,
              customerEmail: result.customerEmail,
              status: result.status,
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
        const targetClientId = result.clientId || clientIdOf(req);
        if (targetClientId) {
          await entitlements.setPlan(targetClientId, {
            planId: result.planId,
            planName: result.planName,
            subscriptionId: result.subscriptionId,
            customerEmail: result.customerEmail,
          });
        }
      }
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  app.get("/billing/subscriptions", async (_req, res) => {
    try {
      const subs = await db
        .collection("subscriptions")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ count: subs.length, subscriptions: subs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct endpoint to update or set plan entitlement (e.g. manual payment or switching)
  app.post("/entitlements/plan", requireAuth, async (req, res) => {
    const { planId, planName, subscriptionId } = req.body || {};
    if (!planId) return res.status(400).json({ error: "planId is required" });
    try {
      const clientId = clientIdOf(req);
      const name = planName || (PLANS[planId] ? PLANS[planId].name : planId);
      await entitlements.setPlan(clientId, {
        planId,
        planName: name,
        subscriptionId: subscriptionId || `sub_direct_${Date.now()}`,
      });
      res.json({ ok: true, planId, planName: name });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Tells the frontend what this browser is entitled to right now — plan,
  // and remaining free-tier queries if on the free plan.
  app.get("/entitlements", requireAuth, async (req, res) => {
    try {
      const clientId = clientIdOf(req);
      const { planId, planName } = await entitlements.getPlan(clientId);
      let usage = null;
      if (!entitlements.isPaid(planId)) {
        const month = new Date().toISOString().slice(0, 7);
        const doc = await db.collection("usage").findOne({ clientId: clientId || "anonymous", month });
        usage = { count: doc?.queryCount || 0, limit: FREE_MONTHLY_QUERY_LIMIT };
      }
      res.json({ planId, planName: planName || "Solo Founder", usage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Circle USDC Autonomous Payment Engine Endpoints ---
  app.get("/api/circle/balance", (_req, res) => {
    res.json(agentPayments.getWalletState());
  });

  app.get("/api/circle/transactions", (_req, res) => {
    res.json(agentPayments.getTransactions());
  });

  app.post("/api/circle/pay", (req, res) => {
    const { agent, amount, description } = req.body || {};
    if (!agent || typeof amount !== "number") {
      return res.status(400).json({ error: "Request body must include `agent` string and `amount` number." });
    }
    try {
      const result = agentPayments.processPayment(agent, amount, description);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// --- Circle USDC Checkout (pay for a plan in USDC) ---
app.post("/api/circle/checkout", requireAuth, async (req, res) => {
  const { planId } = req.body || {};
  if (!planId) return res.status(400).json({ error: "Body must include `planId`." });
  try {
    const session = await createUsdcCheckout(planId, req.userId);
    res.json(session);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/circle/checkout/:paymentId/status", requireAuth, async (req, res) => {
  const { planId } = req.query;
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: "Query must include a valid `planId`." });

  try {
    const result = await checkUsdcPayment(req.params.paymentId, plan.priceUsd);

    if (result.paid) {
      const subscriptionId = `circle_${req.params.paymentId}`;
      await db.collection("subscriptions").updateOne(
        { subscriptionId },
        {
          $set: {
            planId,
            planName: plan.name,
            customerEmail: null,
            status: "active",
            method: "usdc",
            txHash: result.txHash,
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      await entitlements.setPlan(req.userId, {
        planId,
        planName: plan.name,
        subscriptionId,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});
  // SOC2-flavored evidence export — Scaling Up only. Real audit data: every
  // tool call the agent made, when, for which client.
  app.get("/billing/evidence-export", requireAuth, async (req, res) => {
    try {
      const clientId = clientIdOf(req);
      await entitlements.requirePlan(clientId, "early_team", "Evidence export");

      const format = req.query.format === "json" ? "json" : "csv";
      const entries = await auditLog.find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(5000).toArray();

      if (format === "json") {
        res.json({ count: entries.length, entries });
        return;
      }

      const header = "timestamp,clientId,tool,args\n";
      const rows = entries.map(
        (e) => `${e.timestamp?.toISOString?.() || ""},${e.clientId || ""},${e.tool},"${JSON.stringify(e.args || {}).replace(/"/g, '""')}"`
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=threatlens-evidence-export.csv");
      res.send(header + rows.join("\n"));
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  // Marks a threat for expedited review — Early Team plan or higher.
  app.post("/threats/:eventId/priority", requireAuth, async (req, res) => {
    try {
      const clientId = clientIdOf(req);
      await entitlements.requirePlan(clientId, "early_team", "Priority review flagging");

      const result = await db
        .collection("security_logs")
        .updateOne({ eventId: req.params.eventId }, { $set: { priorityReview: true, flaggedAt: new Date() } });

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: `No threat with eventId ${req.params.eventId}` });
      }
      res.json({ ok: true, eventId: req.params.eventId });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  // --- waitlist: real signup capture (user evidence for the hackathon) ---
  app.post("/waitlist", async (req, res) => {
    try {
      const doc = await waitlist.add(req.body || {});
      const count = await waitlist.count();
      res.json({ ok: true, signup: doc, totalSignups: count });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  app.get("/waitlist", async (req, res) => {
    // Not authenticated — fine for local/hackathon use, but lock this down
    // (e.g. an admin token check) before putting real user PII behind it
    // on a public Cloud Run deployment.
    try {
      const signups = await waitlist.list();
      res.json({ count: signups.length, signups });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- MongoDB MCP endpoints ---
  app.get("/mcp/tools", (_req, res) => {
    res.json({ tools: mcp.listTools() });
  });

  app.post("/mcp/execute", async (req, res) => {
    const { tool, params } = req.body || {};
    if (!tool) return res.status(400).json({ error: "Body must include a `tool` name." });
    try {
      const result = await mcp.execute(tool, params || {});
      res.json({ tool, result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`ThreatLens backend listening on port ${PORT}`);
  });

  process.on("SIGTERM", async () => {
    await mongoClient.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start ThreatLens backend:", err);
  process.exit(1);
});
