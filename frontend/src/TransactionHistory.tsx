import React, { useState } from "react";

export interface TransactionRecord {
  txHash: string;
  agent: string;
  amount: string;
  status: "Success" | "Pending" | "Failed";
  timestamp: string;
  type: string;
}

const defaultTransactions: TransactionRecord[] = [
  {
    txHash: "0x123",
    agent: "Payment Agent",
    amount: "1 USDC",
    status: "Success",
    timestamp: "2026-07-29 10:03 AM",
    type: "Micro-charge for PDF Generation",
  },
  {
    txHash: "0x456",
    agent: "Malware Agent",
    amount: "0.5 USDC",
    status: "Success",
    timestamp: "2026-07-29 10:02 AM",
    type: "Autonomous Ransomware Sandbox",
  },
  {
    txHash: "0x789a1b2c3d4e5f6g7h8i9j0k",
    agent: "Threat Agent",
    amount: "2.0 USDC",
    status: "Success",
    timestamp: "2026-07-29 09:45 AM",
    type: "API Intelligence Query",
  },
  {
    txHash: "0x890b2c3d4e5f6g7h8i9j0k1l",
    agent: "Report Agent",
    amount: "1.0 USDC",
    status: "Success",
    timestamp: "2026-07-29 09:15 AM",
    type: "Executive Summary Compilation",
  },
  {
    txHash: "0x901c3d4e5f6g7h8i9j0k1l2m",
    agent: "Payment Agent",
    amount: "1.5 USDC",
    status: "Success",
    timestamp: "2026-07-29 08:30 AM",
    type: "Automated Credit Top-up",
  },
];

export const TransactionHistory: React.FC<{
  transactions?: TransactionRecord[];
  onBackToDashboard?: () => void;
}> = ({ transactions = defaultTransactions, onBackToDashboard }) => {
  const [filterAgent, setFilterAgent] = useState<string>("All");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const agents = ["All", "Payment Agent", "Malware Agent", "Threat Agent", "Report Agent"];

  const filtered = transactions.filter((t) => {
    if (filterAgent !== "All" && t.agent !== filterAgent) return false;
    return true;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="transaction-history-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">💳 Autonomous Transaction History</h2>
          <p className="page-subtitle">Circle x402 Micropayment Ledger & Audit Records</p>
        </div>
        {onBackToDashboard && (
          <button type="button" className="btn-secondary" onClick={onBackToDashboard}>
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar card">
        <span className="filter-label">Filter by Agent:</span>
        <div className="filter-chips">
          {agents.map((agent) => (
            <button
              key={agent}
              type="button"
              className={`chip ${filterAgent === agent ? "active" : ""}`}
              onClick={() => setFilterAgent(agent)}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container card">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Tx Hash</th>
              <th>Agent</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.txHash}>
                <td className="tx-hash-cell">
                  <span className="mono-hash">{tx.txHash}</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopy(tx.txHash)}
                    title="Copy Tx Hash"
                  >
                    {copiedHash === tx.txHash ? "✓ Copied" : "📋"}
                  </button>
                </td>
                <td>
                  <span className="agent-tag">{tx.agent}</span>
                </td>
                <td className="amount-cell">
                  <strong>{tx.amount}</strong>
                </td>
                <td>
                  <span className={`status-badge ${tx.status.toLowerCase()}`}>
                    <span className="dot"></span> {tx.status}
                  </span>
                </td>
                <td className="time-cell">{tx.timestamp}</td>
                <td className="type-cell">{tx.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
