// circleCheckout.js
// Real (testnet-ready) USDC checkout via Circle's Developer-Controlled
// Wallets API — an alternative to Stripe for people who'd rather pay in
// USDC. Mirrors billing.js: if Circle isn't configured, requests return a
// clear 501 instead of crashing, so the app still boots fine either way.
//
// How it works:
//   1. Checkout: we create a brand-new Circle wallet (one per attempt) on
//      a testnet chain and hand the customer its deposit address.
//   2. The customer sends USDC to that address from any wallet/exchange.
//   3. Status check: we ask Circle for that wallet's inbound transactions.
//      Once a CONFIRMED USDC transfer for >= the plan price shows up, the
//      payment is "paid" and index.js upgrades the plan — same as the
//      Stripe flow's /billing/session/:sessionId step.

const { PLANS } = require("./billing");

function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) return null;
  const { initiateDeveloperControlledWalletsClient } = require("@circle-fin/developer-controlled-wallets");
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

function configError() {
  return Object.assign(
    new Error(
      "Circle isn't configured yet. Set CIRCLE_API_KEY (console.circle.com -> Keys), " +
        "CIRCLE_ENTITY_SECRET and CIRCLE_WALLET_SET_ID (run `npm run circle:setup` once to generate " +
        "and register both), then set CIRCLE_BLOCKCHAIN (defaults to MATIC-AMOY testnet)."
    ),
    { status: 501 }
  );
}

async function createUsdcCheckout(planId, clientId) {
  const plan = PLANS[planId];
  if (!plan) throw Object.assign(new Error(`Unknown plan: ${planId}`), { status: 400 });
  if (plan.priceUsd === 0) {
    throw Object.assign(new Error("The free plan doesn't require checkout."), { status: 400 });
  }

  const client = getCircleClient();
  if (!client) throw configError();

  const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
  if (!walletSetId) throw configError();

  const blockchain = process.env.CIRCLE_BLOCKCHAIN || "MATIC-AMOY";

  const { data } = await client.createWallets({
    walletSetId,
    accountType: "SCA",
    blockchains: [blockchain],
    count: 1,
    metadata: [{ name: `${plan.name} checkout`, refId: clientId || "anonymous" }],
  });

  const wallet = data?.wallets?.[0];
  if (!wallet) throw new Error("Circle didn't return a wallet.");

  return {
    paymentId: wallet.id,
    address: wallet.address,
    blockchain,
    amountUsdc: plan.priceUsd,
    planId,
  };
}

async function checkUsdcPayment(walletId, expectedAmount) {
  const client = getCircleClient();
  if (!client) throw configError();

  const { data } = await client.listTransactions({
    walletIds: [walletId],
    operation: "INBOUND",
  });

  const confirmed = (data?.transactions || []).filter(
    (tx) => tx.state === "CONFIRMED" || tx.state === "COMPLETE"
  );

  const usdcTx = confirmed.find(
    (tx) => Number(tx.amounts?.[0]) >= expectedAmount || Number(tx.amount) >= expectedAmount
  );

  if (!usdcTx) {
    return { paid: false };
  }

  return {
    paid: true,
    amount: Number(usdcTx.amounts?.[0] ?? usdcTx.amount),
    txHash: usdcTx.txHash || usdcTx.id,
  };
}

module.exports = { createUsdcCheckout, checkUsdcPayment };