// PaymentCheckoutModal.tsx
import React, { useState } from "react";
import { cyberAudio } from "./cyberAudio";
import circlePaymentEngine from "./circlePaymentEngine";
import ConfettiEffect from "./ConfettiEffect";

export interface Plan {
  id: string;
  name: string;
  price: number;
  cadence: string;
  perks: string[];
  badge?: string;
}

interface PaymentCheckoutModalProps {
  plan: Plan;
  onClose: () => void;
  onPaymentSuccess: (details: { planName: string; subscriptionId: string; paymentMethod: string; amountPaid: number }) => void;
  onStripeCheckout?: (planId: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  plan,
  onClose,
  onPaymentSuccess,
  onStripeCheckout,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "usdc">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStepMsg, setProcessStepMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Card Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // Auto-detect Card Type from Number
  const getCardBrand = (num: string) => {
    const raw = num.replace(/\s/g, "");
    if (raw.startsWith("4")) return { name: "VISA", color: "linear-gradient(135deg, #1A1F71 0%, #0057B8 100%)" };
    if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) return { name: "MASTERCARD", color: "linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)" };
    if (/^3[47]/.test(raw)) return { name: "AMEX", color: "linear-gradient(135deg, #0077A2 0%, #00A3E0 100%)" };
    if (/^6(?:011|5)/.test(raw)) return { name: "DISCOVER", color: "linear-gradient(135deg, #FF6000 0%, #FF9900 100%)" };
    if (raw.length > 0) return { name: "CARD", color: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" };
    return { name: "VISA / MC", color: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" };
  };

  const cardBrandInfo = getCardBrand(cardNumber);

  // Format inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (paymentMethod === "card") {
      if (!cardName.trim()) {
        setErrorMsg("Please enter the name on the card.");
        return;
      }
      const rawCard = cardNumber.replace(/\s/g, "");
      if (rawCard.length < 15) {
        setErrorMsg("Please enter a valid 15 or 16-digit card number.");
        return;
      }
      if (expiry.length < 5) {
        setErrorMsg("Please enter a valid expiration date (MM/YY).");
        return;
      }
      if (cvc.length < 3) {
        setErrorMsg("Please enter a valid CVC / CVV code.");
        return;
      }
    }

    setStep(2);
    setIsProcessing(true);
    cyberAudio.playClick();

    try {
      setProcessStepMsg("🔒 Establishing 256-Bit SSL Handshake with Payment Vault...");
      await new Promise((res) => setTimeout(res, 800));

      setProcessStepMsg("⚡ Authorizing Card Credentials & PCI-DSS Token...");
      await new Promise((res) => setTimeout(res, 850));

      setProcessStepMsg(`✨ Finalizing $${plan.price}.00 Payment for ${plan.name} Tier...`);
      await new Promise((res) => setTimeout(res, 750));

      const subId = `sub_${paymentMethod === "usdc" ? "usdc" : "card"}_${Math.random().toString(36).substring(2, 10)}`;

      if (paymentMethod === "usdc") {
        circlePaymentEngine.executeAutonomousPayment("Payment Agent", plan.price, `Subscription upgrade to ${plan.name}`, true);
      } else {
        circlePaymentEngine.executeAutonomousPayment("Stripe Card Gateway", plan.price, `Card Payment (${cardBrandInfo.name}) - ${plan.name}`, true);
      }

      cyberAudio.playSuccess();
      setShowConfetti(true);

      // Brief delay so user sees confetti explosion before modal closes
      await new Promise((res) => setTimeout(res, 1200));

      onPaymentSuccess({
        planName: plan.name,
        subscriptionId: subId,
        paymentMethod: paymentMethod === "usdc" ? "Circle USDC (x402)" : `Credit Card (${cardBrandInfo.name})`,
        amountPaid: plan.price,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Payment processing failed. Please try again.");
      setIsProcessing(false);
      setStep(1);
    }
  };

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal-card glassmorphism-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660 }}>
          {/* Header & Step Indicator */}
          <header className="modal-header">
            <div className="modal-title-row">
              <span style={{ fontSize: 26 }}>💳</span>
              <div>
                <h2>Upgrade to {plan.name}</h2>
                <div className="modal-subtitle">
                  {step === 1 ? "Step 1 of 2: Enter Payment Details" : "Step 2 of 2: Security Verification & Settlement"}
                </div>
              </div>
            </div>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
          </header>

          {/* Progress Bar Indicator */}
          <div className="progress-bar-container" style={{ background: "rgba(255,255,255,0.06)", height: 6, borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: step === 1 ? "50%" : "100%",
                background: "linear-gradient(90deg, var(--brand-orange, #ff6a3d) 0%, #00f2fe 100%)",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <div className="modal-body">
            {/* Order Summary Pill */}
            <div className="order-summary-box glass-panel" style={{ padding: "16px 20px", marginBottom: 20, borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="plan-badge" style={{ fontSize: 11, padding: "3px 9px", background: "rgba(255,107,0,0.18)", color: "var(--brand-orange, #ff6a3d)", borderRadius: 6, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                    {plan.badge || "UNLIMITED ACCESS"}
                  </span>
                  <h3 style={{ margin: "6px 0 2px", fontSize: 18, color: "var(--paper)" }}>{plan.name} Plan Subscription</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--dim)" }}>Billed monthly · Cancel or switch anytime</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "var(--brand-orange, #ff6a3d)", fontFamily: "var(--display)" }}>
                    ${plan.price}
                    <span style={{ fontSize: 13, color: "var(--dim)" }}>/mo</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>✓ Instant Advantage Activation</span>
                </div>
              </div>
            </div>

            {/* REAL-TIME CREDIT CARD PREVIEW */}
            {paymentMethod === "card" && step === 1 && (
              <div className="live-card-container" style={{ marginBottom: 22 }}>
                <div
                  className="live-credit-card"
                  style={{
                    background: cardBrandInfo.color,
                    borderRadius: 16,
                    padding: "20px 24px",
                    color: "#ffffff",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Holographic Sheen Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(125deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Top Row: EMV Chip & Brand Emblem */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 28, background: "linear-gradient(135deg, #ffd700 0%, #cca000 100%)", borderRadius: 6, border: "1px solid #ffe680", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} />
                      <span style={{ fontSize: 11, opacity: 0.7, fontFamily: "var(--mono)", letterSpacing: "1px" }}>CONTACTLESS</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "var(--display)", letterSpacing: "1.5px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 6, backdropFilter: "blur(4px)" }}>
                      {cardBrandInfo.name}
                    </span>
                  </div>

                  {/* Card Number Display */}
                  <div style={{ fontFamily: "var(--mono)", fontSize: 19, letterSpacing: "3px", fontWeight: 700, marginBottom: 20, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  {/* Bottom Row: Cardholder Name & Expiry */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 12, fontFamily: "var(--mono)" }}>
                    <div>
                      <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>CARDHOLDER NAME</div>
                      <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#f8fafc" }}>
                        {cardName.trim() || "ALEX MORGAN"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>EXPIRES</div>
                      <div style={{ fontWeight: 700, letterSpacing: "1px" }}>
                        {expiry || "MM/YY"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            {step === 1 && (
              <div className="payment-method-selector" style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase" }}>
                  Select Payment Option
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    type="button"
                    className={`pm-tab-btn ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: paymentMethod === "card" ? "2px solid var(--brand-orange, #ff6a3d)" : "1px solid var(--line)",
                      background: paymentMethod === "card" ? "rgba(255,107,0,0.12)" : "var(--panel-raised)",
                      color: "var(--paper)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>💳</span> Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    className={`pm-tab-btn ${paymentMethod === "usdc" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("usdc")}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: paymentMethod === "usdc" ? "2px solid var(--brand-orange, #ff6a3d)" : "1px solid var(--line)",
                      background: paymentMethod === "usdc" ? "rgba(255,107,0,0.12)" : "var(--panel-raised)",
                      color: "var(--paper)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🪙</span> Circle USDC (x402)
                  </button>
                </div>
              </div>
            )}

            {/* Payment Details Form */}
            <form onSubmit={handlePay}>
              {step === 1 && (
                <>
                  {paymentMethod === "card" ? (
                    <div className="card-fields-group" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, color: "var(--paper)", marginBottom: 6, fontWeight: 500 }}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Morgan"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "var(--panel-dark)",
                            border: "1px solid var(--line)",
                            borderRadius: 10,
                            color: "var(--paper)",
                            fontSize: 14,
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontSize: 12, color: "var(--paper)", fontWeight: 500 }}>Card Number</label>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "var(--line)", color: "var(--brand-orange, #ff6a3d)", borderRadius: 4 }}>
                            AUTO-DETECT: {cardBrandInfo.name}
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="4532 •••• •••• 8912"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "var(--panel-dark)",
                            border: "1px solid var(--line)",
                            borderRadius: 10,
                            color: "var(--paper)",
                            fontSize: 14,
                            fontFamily: "var(--mono)",
                            letterSpacing: "1px",
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: "var(--paper)", marginBottom: 6, fontWeight: 500 }}>
                            Expiration
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiryChange}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              background: "var(--panel-dark)",
                              border: "1px solid var(--line)",
                              borderRadius: 10,
                              color: "var(--paper)",
                              fontSize: 14,
                              fontFamily: "var(--mono)",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, color: "var(--paper)", marginBottom: 6, fontWeight: 500 }}>
                            CVC / CVV
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              background: "var(--panel-dark)",
                              border: "1px solid var(--line)",
                              borderRadius: 10,
                              color: "var(--paper)",
                              fontSize: 14,
                              fontFamily: "var(--mono)",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, color: "var(--paper)", marginBottom: 6, fontWeight: 500 }}>
                            ZIP / Postal
                          </label>
                          <input
                            type="text"
                            placeholder="10001"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              background: "var(--panel-dark)",
                              border: "1px solid var(--line)",
                              borderRadius: 10,
                              color: "var(--paper)",
                              fontSize: 14,
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <input
                          type="checkbox"
                          id="save-card-check"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                        />
                        <label htmlFor="save-card-check" style={{ fontSize: 12, color: "var(--dim)", cursor: "pointer" }}>
                          Save payment details securely for auto-renewal
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="usdc-payment-details" style={{ background: "var(--panel-dark)", padding: 18, borderRadius: 14, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--paper)" }}>Connected Circle USDC Wallet</span>
                        <span style={{ fontSize: 11, padding: "3px 9px", background: "rgba(16,185,129,0.15)", color: "#10b981", borderRadius: 6, fontWeight: 700 }}>
                          ACTIVE WALLET
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--brand-orange, #ff6a3d)", background: "var(--panel-solid)", padding: "10px 14px", borderRadius: 10, marginBottom: 12, wordBreak: "break-all" }}>
                        0x71C7656EC7ab88b098defB751B7401B5f6d89A23
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dim)" }}>
                        <span>Available Balance:</span>
                        <strong style={{ color: "var(--paper)" }}>1,250.00 USDC</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dim)", marginTop: 6 }}>
                        <span>Autonomous x402 Protocol:</span>
                        <strong style={{ color: "#10b981" }}>Instant Settlement</strong>
                      </div>
                    </div>
                  )}
                </>
              )}

              {errorMsg && (
                <p style={{ color: "#ef4444", fontSize: 13, marginTop: 14, background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)" }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              {isProcessing && (
                <div className="processing-status-bar" style={{ marginTop: 18, padding: 18, background: "rgba(255,107,0,0.12)", border: "1px solid var(--brand-orange, #ff6a3d)", borderRadius: 12, textAlign: "center" }}>
                  <div className="spinner" style={{ display: "inline-block", width: 22, height: 22, border: "3px solid var(--brand-orange, #ff6a3d)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 10, verticalAlign: "middle" }} />
                  <span style={{ fontSize: 14, color: "var(--paper)", fontWeight: 600 }}>{processStepMsg}</span>
                </div>
              )}

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                {step === 1 && (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "15px",
                      fontSize: 16,
                      fontWeight: 800,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: 12,
                    }}
                  >
                    🔒 Pay ${plan.price}.00 &amp; Activate {plan.name}
                  </button>
                )}

                {onStripeCheckout && step === 1 && (
                  <button
                    type="button"
                    onClick={() => onStripeCheckout(plan.id)}
                    style={{
                      background: "linear-gradient(135deg, #635bff 0%, #4b45e4 100%)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(99, 91, 255, 0.3)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    💳 Pay via Hosted Stripe Checkout Page →
                  </button>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 18, fontSize: 11, color: "var(--dim)" }}>
                <span>🔒 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>PCI-DSS Level 1</span>
                <span>•</span>
                <span>Powered by Stripe &amp; Circle</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentCheckoutModal;
