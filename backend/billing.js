// billing.js
// Real (test-mode-ready) Stripe billing for the three ThreatLens plans.
// If STRIPE_SECRET_KEY isn't set, checkout requests return a clear 501
// instead of crashing — so the app still runs fine before you've wired up
// a Stripe account, but produces genuine revenue events once you have.

const PLANS = {
  solo_founder: {
    name: "Solo Founder",
    priceUsd: 0,
    cadence: "free",
    perks: ["50 agent queries / mo", "1 seat", "Community support"],
  },
  early_team: {
    name: "Early Team",
    priceUsd: 49,
    cadence: "month",
    perks: ["Unlimited queries", "Up to 8 seats", "Slack alert routing"],
    // Set STRIPE_PRICE_EARLY_TEAM to a real Stripe Price ID once created
    // in the Stripe Dashboard (Products -> Early Team -> $49/mo).
    stripePriceEnvVar: "STRIPE_PRICE_EARLY_TEAM",
  },
  scaling_up: {
    name: "Scaling Up",
    priceUsd: 199,
    cadence: "month",
    perks: ["Everything in Early Team", "SOC2 evidence export", "Priority remediation review"],
    stripePriceEnvVar: "STRIPE_PRICE_SCALING_UP",
  },
};

function getPlans() {
  return Object.entries(PLANS).map(([id, plan]) => ({ id, ...plan }));
}

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Lazy require so the app can boot without the `stripe` package's
  // network calls ever firing when billing isn't configured.
  const Stripe = require("stripe");
  return new Stripe(key);
}

/**
 * Creates a real Stripe Checkout Session for a paid plan.
 * @param {string} planId - one of the keys in PLANS
 * @param {string} successUrl
 * @param {string} cancelUrl
 * @param {string} [customerEmail]
 */
async function createCheckoutSession(planId, { successUrl, cancelUrl, customerEmail, clientId }) {
  const plan = PLANS[planId];
  if (!plan) throw Object.assign(new Error(`Unknown plan: ${planId}`), { status: 400 });
  if (plan.priceUsd === 0) {
    throw Object.assign(new Error("The free plan doesn't require checkout."), { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw Object.assign(
      new Error(
        "Stripe isn't configured yet. Set STRIPE_SECRET_KEY in backend/.env (see https://dashboard.stripe.com/test/apikeys), " +
          "then create a Product + recurring Price for this plan and set " +
          plan.stripePriceEnvVar +
          " to that Price ID."
      ),
      { status: 501 }
    );
  }

  const priceId = process.env[plan.stripePriceEnvVar];
  if (!priceId) {
    throw Object.assign(
      new Error(
        `${plan.stripePriceEnvVar} is not set. Create a recurring Price for "${plan.name}" in the Stripe Dashboard and set it in .env.`
      ),
      { status: 501 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail || undefined,
    client_reference_id: clientId || undefined,
  });

  return { url: session.url, id: session.id };
}

/**
 * Verifies a completed Checkout Session and tells you which plan it was for.
 * Call this after Stripe redirects back with ?session_id=... — never trust
 * the redirect alone, since a URL can be typed/shared without paying.
 * @param {string} sessionId
 */
async function verifyCheckoutSession(sessionId) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw Object.assign(new Error("Stripe isn't configured."), { status: 501 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });

  const paid = session.payment_status === "paid" || session.status === "complete";
  const priceId = session.line_items?.data?.[0]?.price?.id;
  const planEntry = Object.entries(PLANS).find(([, plan]) => process.env[plan.stripePriceEnvVar] === priceId);

  return {
    paid,
    status: session.status,
    planId: planEntry ? planEntry[0] : null,
    planName: planEntry ? planEntry[1].name : null,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    subscriptionId: session.subscription || null,
    clientId: session.client_reference_id || null,
  };
}

module.exports = { PLANS, getPlans, createCheckoutSession, verifyCheckoutSession };
