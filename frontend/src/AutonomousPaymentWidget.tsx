import React from "react";

interface AutonomousPaymentWidgetProps {
  balance?: string;
  dailyLimit?: string;
  txsToday?: number;
  lastPayment?: string;
  onViewTransactions?: () => void;
}

export const AutonomousPaymentWidget: React.FC<AutonomousPaymentWidgetProps> = ({
  balance = "50 USDC",
  dailyLimit = "10 USDC",
  txsToday = 3,
  lastPayment = "1 USDC",
  onViewTransactions,
}) => {
  return (
    <div className="autonomous-payment-widget card">
      <div className="panel-header">
        <div className="header-left">
          <span className="icon-badge">💳</span>
          <div>
            <h3 className="panel-title">Autonomous Payment Engine</h3>
            <p className="panel-subtitle">Agent-to-agent micro-settlements & budget safety rails</p>
          </div>
        </div>
        <span className="status-chip success">
          <span className="dot"></span> x402 Active
        </span>
      </div>

      <div className="payment-grid">
        <div className="payment-stat-box primary">
          <span className="stat-label">Available Balance</span>
          <div className="stat-value">{balance}</div>
          <span className="stat-sub">Circle x402 Vault</span>
        </div>

        <div className="payment-stat-box">
          <span className="stat-label">Daily Limit</span>
          <div className="stat-value">{dailyLimit}</div>
          <span className="stat-sub">Safety Cap</span>
        </div>

        <div className="payment-stat-box">
          <span className="stat-label">Transactions Today</span>
          <div className="stat-value">{txsToday}</div>
          <span className="stat-sub">Autonomous Runs</span>
        </div>

        <div className="payment-stat-box accent">
          <span className="stat-label">Last Payment</span>
          <div className="stat-value">{lastPayment}</div>
          <span className="stat-sub">Report Agent PDF</span>
        </div>
      </div>

      <div className="widget-actions">
        <button
          type="button"
          className="btn-link"
          onClick={onViewTransactions}
          aria-label="View Transaction History"
        >
          View Full Transaction History →
        </button>
      </div>
    </div>
  );
};

export default AutonomousPaymentWidget;
