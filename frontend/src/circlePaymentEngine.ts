// circlePaymentEngine.ts
// Client-side Circle USDC Autonomous Micropayment Engine state & pub/sub system

export interface CircleTransaction {
  txHash: string;
  agent: string;
  amount: string;
  amountNum: number;
  status: "Success" | "Pending" | "Failed";
  timestamp: string;
  type: string;
  network?: string;
}

export interface WalletState {
  balanceUsdc: number;
  dailyLimitUsdc: number;
  spentTodayUsdc: number;
  transactionsTodayCount: number;
  lastPaymentUsdc: number;
  walletAddress: string;
}

type Listener = () => void;

let walletState: WalletState = {
  balanceUsdc: 50.0,
  dailyLimitUsdc: 10.0,
  spentTodayUsdc: 3.5,
  transactionsTodayCount: 3,
  lastPaymentUsdc: 1.0,
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
};

let transactionsList: CircleTransaction[] = [
  {
    txHash: "0x123",
    agent: "Payment Agent",
    amount: "1 USDC",
    amountNum: 1.0,
    status: "Success",
    timestamp: "10:03 AM",
    type: "Micro-charge for PDF Generation",
    network: "Solana USDC Testnet",
  },
  {
    txHash: "0x456",
    agent: "Malware Agent",
    amount: "0.5 USDC",
    amountNum: 0.5,
    status: "Success",
    timestamp: "10:02 AM",
    type: "Autonomous Ransomware Sandbox",
    network: "Polygon Amoy USDC",
  },
  {
    txHash: "0x789a1b2c3d4e5f6g7h8i9j0k",
    agent: "Threat Agent",
    amount: "2.0 USDC",
    amountNum: 2.0,
    status: "Success",
    timestamp: "09:45 AM",
    type: "API Intelligence Query",
    network: "Ethereum Sepolia USDC",
  },
];

const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export const circlePaymentEngine = {
  getWalletState(): WalletState {
    return { ...walletState };
  },

  getTransactions(): CircleTransaction[] {
    return [...transactionsList];
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  executeAutonomousPayment(
    agentName: string,
    amountUsdc: number,
    description: string,
    isPlanSubscription: boolean = false
  ): CircleTransaction {
    if (!isPlanSubscription && walletState.spentTodayUsdc + amountUsdc > walletState.dailyLimitUsdc) {
      throw new Error(
        `Safety Rail Triggered: Daily limit of ${walletState.dailyLimitUsdc} USDC exceeded.`
      );
    }

    if (!isPlanSubscription && walletState.balanceUsdc < amountUsdc) {
      throw new Error(`Insufficient wallet balance (${walletState.balanceUsdc} USDC available).`);
    }

    // Update wallet state
    if (!isPlanSubscription) {
      walletState.balanceUsdc = parseFloat(Math.max(0, walletState.balanceUsdc - amountUsdc).toFixed(2));
      walletState.spentTodayUsdc = parseFloat((walletState.spentTodayUsdc + amountUsdc).toFixed(2));
    }
    walletState.transactionsTodayCount += 1;
    walletState.lastPaymentUsdc = amountUsdc;

    // Generate hash & timestamp
    const randomHex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const txHash = `0x${randomHex}89f${walletState.transactionsTodayCount}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newTx: CircleTransaction = {
      txHash,
      agent: agentName,
      amount: `${amountUsdc} ${isPlanSubscription ? "USD" : "USDC"}`,
      amountNum: amountUsdc,
      status: "Success",
      timestamp: timeStr,
      type: description,
      network: isPlanSubscription ? "Stripe / Card Payment Gateway" : "Circle USDC Developer Testnet",
    };

    transactionsList = [newTx, ...transactionsList];
    notify();
    return newTx;
  },
};

export default circlePaymentEngine;
