// entitlements.js
// Ties an anonymous browser-generated clientId to a verified Stripe plan,
// so paid plans actually unlock something instead of payment being purely
// cosmetic. No login system — clientId is a UUID the frontend generates
// once and stores locally, linked to a plan via Stripe's client_reference_id
// at checkout time (see billing.js + index.js /billing/session/:id).

const FREE_PLAN_ID = "solo_founder";
const FREE_MONTHLY_QUERY_LIMIT = 50;

const PLAN_RANK = { solo_founder: 0, early_team: 1, scaling_up: 2 };

class Entitlements {
  constructor(db) {
    this.clients = db.collection("clients");
    this.usage = db.collection("usage");
  }

  /** Records/updates which plan a clientId is on after a verified payment. */
  async setPlan(clientId, { planId, planName, subscriptionId, customerEmail }) {
    if (!clientId) return;
    await this.clients.updateOne(
      { clientId },
      { $set: { planId, planName, subscriptionId, customerEmail, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  /** Returns the plan for a clientId, defaulting to the free plan if unknown. */
  async getPlan(clientId) {
    if (!clientId) return { planId: FREE_PLAN_ID, planName: "Solo Founder" };
    const doc = await this.clients.findOne({ clientId });
    if (!doc) return { planId: FREE_PLAN_ID, planName: "Solo Founder" };
    return { planId: doc.planId, planName: doc.planName };
  }

  isPaid(planId) {
    return (PLAN_RANK[planId] ?? 0) > 0;
  }

  meetsPlan(planId, requiredPlanId) {
    return (PLAN_RANK[planId] ?? 0) >= (PLAN_RANK[requiredPlanId] ?? 0);
  }

  /**
   * Enforces the free tier's monthly query cap. Paid plans are unlimited.
   * Throws a 402-style error (with a clear upgrade message) when the free
   * limit is hit; otherwise increments and returns the current count.
   */
  async recordQueryAndCheckLimit(clientId) {
    const { planId } = await this.getPlan(clientId);
    if (this.isPaid(planId)) {
      return { limited: false, planId };
    }

    const month = new Date().toISOString().slice(0, 7); // "2026-07"
    const key = clientId || "anonymous";
    const result = await this.usage.findOneAndUpdate(
      { clientId: key, month },
      { $inc: { queryCount: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const count = result?.queryCount ?? result?.value?.queryCount ?? 1;

    if (count > FREE_MONTHLY_QUERY_LIMIT) {
      throw Object.assign(
        new Error(
          `You've used all ${FREE_MONTHLY_QUERY_LIMIT} free queries this month. Upgrade to Early Team for unlimited queries.`
        ),
        { status: 402 }
      );
    }

    return { limited: false, planId, count, limit: FREE_MONTHLY_QUERY_LIMIT };
  }

  /** Throws a 403 unless clientId's plan meets requiredPlanId. */
  async requirePlan(clientId, requiredPlanId, featureName) {
    const { planId, planName } = await this.getPlan(clientId);
    if (!this.meetsPlan(planId, requiredPlanId)) {
      throw Object.assign(
        new Error(`${featureName} requires the ${requiredPlanId.replace("_", " ")} plan or higher. You're on ${planName || "the free plan"}.`),
        { status: 403 }
      );
    }
    return { planId, planName };
  }
}

module.exports = { Entitlements, FREE_MONTHLY_QUERY_LIMIT, FREE_PLAN_ID };
