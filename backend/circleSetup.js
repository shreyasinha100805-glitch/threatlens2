// circleSetup.js
// One-time setup: generates a Circle Entity Secret, registers it with your
// Circle account, then creates a Wallet Set. Run this once, then copy the
// two printed values into your .env as CIRCLE_ENTITY_SECRET and
// CIRCLE_WALLET_SET_ID.
//
// Usage:
//   node circleSetup.js
//
// Requires CIRCLE_API_KEY to already be set in .env.

require("dotenv").config();
const { randomBytes } = require("crypto");
const fs = require("fs");
const {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient,
} = require("@circle-fin/developer-controlled-wallets");

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    console.error("CIRCLE_API_KEY is not set. Add it to .env first, then re-run this script.");
    process.exit(1);
  }

  const envPath = ".env";
  const existingEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  if (/^CIRCLE_ENTITY_SECRET=.+$/m.test(existingEnv)) {
    console.error("CIRCLE_ENTITY_SECRET already set in .env. Refusing to overwrite it — delete that line first if you really want a new one.");
    process.exit(1);
  }

  // 1. Generate a new 32-byte entity secret.
  const entitySecret = randomBytes(32).toString("hex");
  console.log("\nGenerated entity secret (also saving to .env automatically):");
  console.log(entitySecret);

  // 2. Register it with Circle. This writes a recovery file you MUST keep
  //    safe — if you ever lose your entity secret, this file is the only
  //    way to recover wallet access.
  fs.mkdirSync("./recovery", { recursive: true });
  const regResponse = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
  });
  fs.writeFileSync("./recovery/circle-recovery-file.txt", regResponse.data?.recoveryFile || "");
  console.log("\nRegistered entity secret with Circle.");
  console.log("Recovery file saved to ./recovery/circle-recovery-file.txt — back this up somewhere safe and do NOT commit it to git.");

  // 3. Create a wallet set (a logical grouping of wallets for this app).
  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  const walletSetResponse = await client.createWalletSet({ name: "ThreatLens Checkout" });
  const walletSetId = walletSetResponse.data?.walletSet?.id;
  console.log("\nCreated wallet set:", walletSetId);

  // 4. Append both values to .env for convenience.
  const lines = [
    "",
    `CIRCLE_ENTITY_SECRET=${entitySecret}`,
    `CIRCLE_WALLET_SET_ID=${walletSetId}`,
    "",
  ].join("\n");
  fs.appendFileSync(envPath, lines);

  console.log("\nDone. .env updated with CIRCLE_ENTITY_SECRET and CIRCLE_WALLET_SET_ID.");
  console.log("Restart your backend now.");
}

main().catch((err) => {
  console.error("Circle setup failed:", err.response?.data || err.message);
  process.exit(1);
});