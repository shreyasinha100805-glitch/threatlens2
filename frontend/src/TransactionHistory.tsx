import React, { useEffect, useState } from "react";
import circlePaymentEngine, { CircleTransaction } from "./circlePaymentEngine";

export const TransactionHistory: React.FC<{
  onBackToDashboard?: () => void;
}> = ({ onBackToDashboard }) => {
  const [transactions, setTransactions] = useState<CircleTransaction[]>(
    circlePaymentEngine.getTransactions()
  );
  const [filterAgent, setFilterAgent] = useState<string>("All");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = circlePaymentEngine.subscribe(() => {
      setTransactions(circlePaymentEngine.getTransactions());
    });
    return () => unsubscribe();
  }, []);

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

  const handleExportCSV = () => {
    const header = "TxHash,Agent,Amount,Status,Timestamp,Type,Network\n";
    const rows = filtered
      .map(
        (t) =>
          `"${t.txHash}","${t.agent}","${t.amount}","${t.status}","${t.timestamp}","${t.type}","${t.network || 'Circle USDC'}"`
      )
      .join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `ThreatLens_Circle_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transaction-history-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">💳 Autonomous Transaction History</h2>
          <p className="page-subtitle">Circle x402 Micropayment Settlement Ledger & Audit Trail</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="btn-secondary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          {onBackToDashboard && (
            <button type="button" className="btn-secondary" onClick={onBackToDashboard}>
              ← Back to Dashboard
            </button>
          )}
        </div>
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
              <th>Network</th>
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
                <td className="network-cell">{tx.network || "Circle USDC Testnet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
