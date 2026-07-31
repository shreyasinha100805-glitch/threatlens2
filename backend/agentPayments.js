// agentPayments.js
// Circle Developer Wallet & x402 Autonomous Micropayments Engine
// Supports testnet USDC transfers (Solana/Polygon/Ethereum testnet)

const crypto = require("crypto");

// In-memory state for autonomous agent wallet
let walletState = {
  balanceUsdc: 50.0,
  dailyLimitUsdc: 10.0,
  spentTodayUsdc: 3.0,
  transactionsTodayCount: 3,
  lastPaymentUsdc: 1.0,
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  network: "Circle USDC Testnet (Sepolia/Solana)",
};

const transactions = [
  {
    txHash: "0x123",
    agent: "Payment Agent",
    amount: "1 USDC",
    amountNum: 1.0,
    status: "Success",
    timestamp: "2026-07-29 10:03 AM",
    type: "Micro-charge for PDF Generation",
    network: "Solana USDC Testnet",
  },
  {
    txHash: "0x456",
    agent: "Malware Agent",
    amount: "0.5 USDC",
    amountNum: 0.5,
    status: "Success",
    timestamp: "2026-07-29 10:02 AM",
    type: "Autonomous Ransomware Sandbox",
    network: "Polygon Amoy USDC",
  },
  {
    txHash: "0x789a1b2c3d4e5f6g7h8i9j0k",
    agent: "Threat Agent",
    amount: "2.0 USDC",
    amountNum: 2.0,
    status: "Success",
    timestamp: "2026-07-29 09:45 AM",
    type: "API Intelligence Query",
    network: "Ethereum Sepolia USDC",
  },
];

function getWalletState() {
  return walletState;
}

function getTransactions() {
  return transactions;
}

function processPayment(agent, amountUsdc, description) {
  if (walletState.spentTodayUsdc + amountUsdc > walletState.dailyLimitUsdc) {
    throw new Error(`Daily limit of ${walletState.dailyLimitUsdc} USDC exceeded.`);
  }

  if (walletState.balanceUsdc < amountUsdc) {
    throw new Error(`Insufficient wallet balance. Requested: ${amountUsdc} USDC, Available: ${walletState.balanceUsdc} USDC.`);
  }

  walletState.balanceUsdc = parseFloat((walletState.balanceUsdc - amountUsdc).toFixed(2));
  walletState.spentTodayUsdc = parseFloat((walletState.spentTodayUsdc + amountUsdc).toFixed(2));
  walletState.transactionsTodayCount += 1;
  walletState.lastPaymentUsdc = amountUsdc;

  const randomHash = "0x" + crypto.randomBytes(16).toString("hex");
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toISOString().split("T")[0];

  const txRecord = {
    txHash: randomHash,
    agent: agent,
    amount: `${amountUsdc} USDC`,
    amountNum: amountUsdc,
    status: "Success",
    timestamp: `${dateStr} ${timeStr}`,
    type: description || `Autonomous x402 Micropayment by ${agent}`,
    network: "Circle USDC Testnet",
  };

  transactions.unshift(txRecord);
  return { success: true, transaction: txRecord, wallet: walletState };
}

module.exports = {
  getWalletState,
  getTransactions,
  processPayment,
};