// ThreatLensCopilotPanel.tsx
import React, { useState, useEffect } from "react";
import { cyberAudio } from "./cyberAudio";
import circlePaymentEngine from "./circlePaymentEngine";
import { generateIncidentPDF } from "./pdfReportGenerator";

interface ThreatLensCopilotPanelProps {
  onRunLiveDemo: () => void;
  onSendCopilotPrompt: (prompt: string) => void;
  onGenerateDiagram: (code: string) => void;
}

export const ThreatLensCopilotPanel: React.FC<ThreatLensCopilotPanelProps> = ({
  onRunLiveDemo,
  onSendCopilotPrompt,
  onGenerateDiagram,
}) => {
  const [activeTab, setActiveTab] = useState<"copilot" | "feed" | "simulation" | "reports">("copilot");
  const [simScenario, setSimScenario] = useState<string>("Ransomware Outbreak");
  const [isSimulating, setIsSimulating] = useState(false);
  const [voiceSpeaking, setVoiceSpeaking] = useState(false);

  // Real-time live feed events state
  const [feedEvents, setFeedEvents] = useState([
    { id: "f1", time: "23:41", event: "Ransomware vector detected on fileserver-01 (T1486)", type: "critical" },
    { id: "f2", time: "23:42", event: "Payment Agent charged 1 USDC for automated sandbox", type: "payment" },
    { id: "f3", time: "23:43", event: "SOC2 Audit & Incident PDF Report generated", type: "report" },
    { id: "f4", time: "23:44", event: "Host isolated at edge firewall (10.0.4.12)", type: "mitigation" },
  ]);

  // Continuously push dynamic telemetry updates into the live feed
  useEffect(() => {
    const timer = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const sampleEvents = [
        { event: "Port scan origin 185.220.101.4 blocked (T1046)", type: "info" },
        { event: "Payment Agent settled 1 USDC micropayment via Circle", type: "payment" },
        { event: "Malware Agent sandbox analyzed ransomware hash", type: "malware" },
        { event: "Slack SOC channel alert dispatched (142ms response)", type: "mitigation" },
        { event: "Database query rate anomaly resolved on db-prod-02", type: "info" },
      ];
      const nextEv = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      setFeedEvents((prev) => [{ id: String(Date.now()), time: timeStr, ...nextEv }, ...prev.slice(0, 14)]);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    cyberAudio.playAlert();
    cyberAudio.speak(`Initializing ThreatLens Simulation Center for ${simScenario}. Swarm agents engaged.`);

    await new Promise((res) => setTimeout(res, 800));
    onRunLiveDemo();
    setIsSimulating(false);
  };

  const handleVoiceSummary = () => {
    setVoiceSpeaking(true);
    cyberAudio.playClick();
    cyberAudio.speak("ThreatLens Security Copilot online. 8 active threats detected across global vectors. 3 critical ransomware and exfiltration issues require immediate 1-click mitigation.");
    setTimeout(() => setVoiceSpeaking(false), 5000);
  };

  const promptChips = [
    { label: "> Summarize today's threats", prompt: "Summarize today's active security threats and risk scores." },
    { label: "> Generate MITRE report", prompt: "Generate a detailed MITRE ATT&CK breakdown of active vectors." },
    { label: "> Create attack diagram", prompt: "Create a Mermaid sequence diagram for the ransomware incident." },
    { label: "> Execute mitigation", prompt: "Execute 1-click automated containment and network isolation." },
    { label: "> Export SOC2 evidence", prompt: "Export SOC2 Type II compliance audit telemetry." },
  ];

  return (
    <aside className="copilot-panel-wrapper glass-panel" style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}>
      {/* Top Header & Navigation Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--paper)", fontFamily: "var(--display)", fontWeight: 800 }}>
              ThreatLens AI Copilot &amp; Command Center
            </h3>
            <span style={{ fontSize: 11, color: "var(--dim)" }}>Autonomous Multi-Agent SOC Automation</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              cyberAudio.playClick();
              onRunLiveDemo();
            }}
            style={{ fontSize: 12, padding: "6px 14px", fontWeight: 700, borderRadius: 8 }}
          >
            🚀 RUN LIVE INCIDENT DEMO
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleVoiceSummary}
            style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8 }}
          >
            {voiceSpeaking ? "🔊 Speaking..." : "🎙️ Voice Copilot"}
          </button>
        </div>
      </div>

      {/* LIVE SOC TELEMETRY METRICS BAR */}
      <div className="soc-metrics-bar" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, background: "var(--panel-raised)", padding: 12, borderRadius: 12, marginBottom: 16, border: "1px solid var(--line)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase" }}>Response Time</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--cyan)", fontFamily: "var(--mono)" }}>142 ms</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase" }}>Active Agents</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#10b981", fontFamily: "var(--mono)" }}>4 Swarm</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase" }}>API Telemetry</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--paper)", fontFamily: "var(--mono)" }}>3,245</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase" }}>Payments Today</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-orange, #ff6a3d)", fontFamily: "var(--mono)" }}>17 USDC</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase" }}>Threats Resolved</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#10b981", fontFamily: "var(--mono)" }}>92%</div>
        </div>
      </div>

      {/* AGENT-TO-AGENT SWARM COMMUNICATION FLOW */}
      <div className="swarm-flow-card" style={{ background: "var(--panel-dark)", padding: "12px 16px", borderRadius: 12, marginBottom: 16, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", marginBottom: 8 }}>
          ⚡ Agent-to-Agent Swarm Orchestration Flow
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
          <span style={{ padding: "4px 10px", background: "rgba(0, 242, 254, 0.15)", color: "var(--cyan)", borderRadius: 6 }}>
            Threat Agent
          </span>
          <span style={{ color: "var(--brand-orange, #ff6a3d)", fontSize: 14 }}>➔</span>
          <span style={{ padding: "4px 10px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: 6 }}>
            Malware Agent
          </span>
          <span style={{ color: "var(--brand-orange, #ff6a3d)", fontSize: 14 }}>➔</span>
          <span style={{ padding: "4px 10px", background: "rgba(255, 107, 0, 0.15)", color: "var(--brand-orange, #ff6a3d)", borderRadius: 6 }}>
            Payment Agent
          </span>
          <span style={{ color: "var(--brand-orange, #ff6a3d)", fontSize: 14 }}>➔</span>
          <span style={{ padding: "4px 10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: 6 }}>
            Report Agent
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === "copilot" ? "active" : ""}`}
          onClick={() => setActiveTab("copilot")}
          style={{ background: "none", border: "none", color: activeTab === "copilot" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          🤖 Copilot Prompts
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => setActiveTab("feed")}
          style={{ background: "none", border: "none", color: activeTab === "feed" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          📡 Real-Time Live Feed
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => setActiveTab("simulation")}
          style={{ background: "none", border: "none", color: activeTab === "simulation" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          🎯 Simulation Center
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
          style={{ background: "none", border: "none", color: activeTab === "reports" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          📄 PDF Enterprise Exports
        </button>
      </div>

      {/* Tab 1: AI Copilot Prompt Chips */}
      {activeTab === "copilot" && (
        <div>
          <p style={{ fontSize: 12, color: "var(--dim)", marginBottom: 10 }}>
            Click any instant action chip to direct the ThreatLens AI Copilot:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {promptChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="copilot-chip-btn"
                onClick={() => {
                  cyberAudio.playClick();
                  onSendCopilotPrompt(chip.prompt);
                }}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  background: "var(--panel-raised)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  color: "var(--paper)",
                  fontFamily: "var(--mono)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{chip.label}</span>
                <span style={{ fontSize: 11, color: "var(--brand-orange, #ff6a3d)" }}>RUN ➔</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Real-Time Live Feed */}
      {activeTab === "feed" && (
        <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {feedEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
                background: "var(--panel-dark)",
                borderRadius: 8,
                borderLeft: ev.type === "critical" ? "3px solid #ef4444" : ev.type === "payment" ? "3px solid #ff6a3d" : "3px solid #10b981",
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--cyan)", fontWeight: 700 }}>
                {ev.time}
              </span>
              <span style={{ fontSize: 12, color: "var(--paper)" }}>{ev.event}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: ThreatLens Simulation Center */}
      {activeTab === "simulation" && (
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--paper)", marginBottom: 8 }}>
            Choose Attack Simulation Scenario:
          </label>
          <select
            value={simScenario}
            onChange={(e) => setSimScenario(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--panel-dark)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              color: "var(--paper)",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            <option value="Ransomware Outbreak">🔴 Ransomware Outbreak (T1486)</option>
            <option value="Supply Chain Attack">🟡 Supply Chain Compromise (T1195)</option>
            <option value="DDoS Assault">🔵 Massive DDoS Assault (T1498)</option>
            <option value="Insider Exfiltration">🟣 Insider Data Exfiltration (T1041)</option>
            <option value="Zero-Day Exploit">🟢 Zero-Day Vulnerability Exploit (T1068)</option>
          </select>

          <button
            type="button"
            className="btn-primary"
            disabled={isSimulating}
            onClick={handleRunSimulation}
            style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 800 }}
          >
            {isSimulating ? "⚡ Simulating Attack..." : `⚡ START ${simScenario.toUpperCase()} SIMULATION`}
          </button>
        </div>
      )}

      {/* Tab 4: PDF Enterprise Exports */}
      {activeTab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Incident Audit Report", type: "Incident Report" as const, icon: "🚨" },
            { label: "SOC2 Compliance Audit", type: "SOC2 Audit Export" as const, icon: "📋" },
            { label: "Executive CISO Summary", type: "Executive Summary" as const, icon: "📊" },
            { label: "Threat Timeline Report", type: "Threat Timeline" as const, icon: "⏱️" },
          ].map((r) => (
            <button
              key={r.type}
              type="button"
              className="btn-secondary"
              onClick={() => {
                cyberAudio.playSuccess();
                generateIncidentPDF({ reportType: r.type });
              }}
              style={{
                padding: "12px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};

export default ThreatLensCopilotPanel;
