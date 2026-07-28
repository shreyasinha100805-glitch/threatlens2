import React, { useEffect, useState } from "react";
import circlePaymentEngine, { WalletState } from "./circlePaymentEngine";

interface AutonomousPaymentWidgetProps {
  onViewTransactions?: () => void;
  onPaymentTriggered?: () => void;
}

export const AutonomousPaymentWidget: React.FC<AutonomousPaymentWidgetProps> = ({
  onViewTransactions,
  onPaymentTriggered,
}) => {
  const [wallet, setWallet] = useState<WalletState>(circlePaymentEngine.getWalletState());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = circlePaymentEngine.subscribe(() => {
      setWallet(circlePaymentEngine.getWalletState());
    });
    return () => unsubscribe();
  }, []);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        circlePaymentEngine.executeAutonomousPayment(
          "Payment Agent",
          1.0,
          "Autonomous x402 Micropayment Settlement"
        );
        if (onPaymentTriggered) onPaymentTriggered();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  return (
    <div className="autonomous-payment-widget card">
      <div className="panel-header">
        <div className="header-left">
          <span className="icon-badge">💳</span>
          <div>
            <h3 className="panel-title">Autonomous Payment Engine (Circle USDC)</h3>
            <p className="panel-subtitle">Agent-to-agent micro-settlements & safety limit rails</p>
          </div>
        </div>
        <span className="status-chip success">
          <span className="dot"></span> Circle x402 Active
        </span>
      </div>

      <div className="payment-grid">
        <div className="payment-stat-box primary">
          <span className="stat-label">Available Balance</span>
          <div className="stat-value">{wallet.balanceUsdc.toFixed(1)} USDC</div>
          <span className="stat-sub">Circle x402 Vault</span>
        </div>

        <div className="payment-stat-box">
          <span className="stat-label">Daily Limit</span>
          <div className="stat-value">{wallet.dailyLimitUsdc.toFixed(1)} USDC</div>
          <span className="stat-sub">Spent Today: {wallet.spentTodayUsdc.toFixed(1)} USDC</span>
        </div>

        <div className="payment-stat-box">
          <span className="stat-label">Transactions Today</span>
          <div className="stat-value">{wallet.transactionsTodayCount}</div>
          <span className="stat-sub">Autonomous Runs</span>
        </div>

        <div className="payment-stat-box accent">
          <span className="stat-label">Last Payment</span>
          <div className="stat-value">{wallet.lastPaymentUsdc.toFixed(1)} USDC</div>
          <span className="stat-sub">Micro-settlement</span>
        </div>
      </div>

      <div className="widget-actions-bar">
        <button
          type="button"
          className="btn-simulate-payment"
          onClick={handleSimulatePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing x402 Payment..." : "⚡ Trigger Autonomous 1 USDC Payment"}
        </button>

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
