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
  const [activeTab, setActiveTab] = useState<"copilot" | "feed" | "intel" | "simulation" | "reports">("copilot");
  const [simScenario, setSimScenario] = useState<string>("Ransomware Outbreak");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
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

  const handle15SecondSimulation = async () => {
    setIsSimulating(true);
    cyberAudio.playAlert();
    cyberAudio.speak("Initiating 15-second Ransomware Simulation flow. Multi-agent swarm executing.");

    setSimStep(1); // Attacker detected
    await new Promise((res) => setTimeout(res, 2200));

    setSimStep(2); // Threat Agent analyzes
    cyberAudio.playRadarPing();
    await new Promise((res) => setTimeout(res, 2200));

    setSimStep(3); // Diagram generated
    const demoMermaid = `sequenceDiagram
  autonumber
  actor Attacker as TOR Exit (185.220.101.4)
  participant Edge as Edge Firewall
  participant Agent as ThreatLens Agent Swarm
  participant Target as fileserver-01 (10.0.4.12)
  Attacker->>Target: Ingress Ransomware Payload (T1486)
  Target-->>Agent: High Entropy Alert Event
  Agent->>Edge: 1-Click Isolation Rule Dispatched
  Agent->>Agent: Circle USDC 1.0 Micropayment Settled`;
    onGenerateDiagram(demoMermaid);
    await new Promise((res) => setTimeout(res, 2200));

    setSimStep(4); // Malware Agent responds
    cyberAudio.playClick();
    await new Promise((res) => setTimeout(res, 2200));

    setSimStep(5); // Payment Agent settles 1 USDC
    try {
      circlePaymentEngine.executeAutonomousPayment("Payment Agent", 1.0, "15-Second Ransomware Simulation Fee", true);
    } catch {}
    await new Promise((res) => setTimeout(res, 2200));

    setSimStep(6); // Report Agent exports PDF
    cyberAudio.playSuccess();
    generateIncidentPDF({ reportType: "Incident Report" });
    cyberAudio.speak("Ransomware simulation flow complete. Report exported successfully.");

    setIsSimulating(false);
    setSimStep(0);
    onRunLiveDemo();
  };

  const handleVoiceCommand = (cmd: string) => {
    setVoiceSpeaking(true);
    cyberAudio.playClick();
    if (cmd.includes("critical")) {
      cyberAudio.speak("ThreatLens Voice Copilot: Showing 3 active critical ransomware and exfiltration incidents.");
      onSendCopilotPrompt("Summarize all active critical severity security incidents.");
    } else if (cmd.includes("summary")) {
      cyberAudio.speak("ThreatLens Voice Copilot: Generating executive CISO summary report.");
      generateIncidentPDF({ reportType: "Executive Summary" });
    } else {
      cyberAudio.speak("ThreatLens Voice Copilot online. Ready to analyze threats.");
    }
    setTimeout(() => setVoiceSpeaking(false), 4500);
  };

  const promptChips = [
    { label: "Summarize threats", prompt: "Summarize today's active security threats and risk scores." },
    { label: "Generate report", prompt: "Generate a detailed CISO executive security audit report." },
    { label: "Run mitigation", prompt: "Execute 1-click automated containment and network isolation." },
    { label: "Explain MITRE mapping", prompt: "Explain the MITRE ATT&CK techniques (T1486, T1068, T1041) mapped to our hosts." },
    { label: "Export SOC2 evidence", prompt: "Export SOC2 Type II compliance audit telemetry." },
  ];

  return (
    <aside className="copilot-panel-wrapper glass-panel" style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}>
      {/* Top Header & Quick Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--paper)", fontFamily: "var(--display)", fontWeight: 800 }}>
              ThreatLens Copilot &amp; SOC Sidebar
            </h3>
            <span style={{ fontSize: 11, color: "var(--dim)" }}>Persistent AI Security Intelligence</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            disabled={isSimulating}
            onClick={handle15SecondSimulation}
            style={{ fontSize: 12, padding: "7px 14px", fontWeight: 800, borderRadius: 8 }}
          >
            {isSimulating ? `⚡ Executing Step ${simStep}/6...` : "🚀 RUN RANSOMWARE SIMULATION"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleVoiceCommand("critical")}
            style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8 }}
          >
            {voiceSpeaking ? "🔊 Speaking..." : "🎙️ Voice Command"}
          </button>
        </div>
      </div>

      {/* 15-SECOND SIMULATION FLOW PROGRESS TRACKER */}
      {isSimulating && (
        <div className="sim-flow-tracker" style={{ background: "rgba(255,107,0,0.12)", border: "1px solid var(--brand-orange, #ff6a3d)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--paper)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>⚡ 15-Second Demo Flow Execution</span>
            <span style={{ color: "var(--brand-orange, #ff6a3d)" }}>Step {simStep} of 6</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, textAlign: "center", fontSize: 10 }}>
            <div style={{ padding: 6, background: simStep >= 1 ? "#ff6a3d" : "var(--panel-dark)", color: simStep >= 1 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>1. Detect</div>
            <div style={{ padding: 6, background: simStep >= 2 ? "#ff6a3d" : "var(--panel-dark)", color: simStep >= 2 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>2. Analyze</div>
            <div style={{ padding: 6, background: simStep >= 3 ? "#ff6a3d" : "var(--panel-dark)", color: simStep >= 3 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>3. Diagram</div>
            <div style={{ padding: 6, background: simStep >= 4 ? "#ff6a3d" : "var(--panel-dark)", color: simStep >= 4 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>4. Respond</div>
            <div style={{ padding: 6, background: simStep >= 5 ? "#ff6a3d" : "var(--panel-dark)", color: simStep >= 5 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>5. Settle</div>
            <div style={{ padding: 6, background: simStep >= 6 ? "#10b981" : "var(--panel-dark)", color: simStep >= 6 ? "#fff" : "var(--dim)", borderRadius: 6, fontWeight: 700 }}>6. Report</div>
          </div>
        </div>
      )}

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

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 10, overflowX: "auto" }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === "copilot" ? "active" : ""}`}
          onClick={() => setActiveTab("copilot")}
          style={{ background: "none", border: "none", color: activeTab === "copilot" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          🤖 Copilot
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "intel" ? "active" : ""}`}
          onClick={() => setActiveTab("intel")}
          style={{ background: "none", border: "none", color: activeTab === "intel" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          🌐 Threat Intel
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => setActiveTab("feed")}
          style={{ background: "none", border: "none", color: activeTab === "feed" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📡 Live Feed
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => setActiveTab("simulation")}
          style={{ background: "none", border: "none", color: activeTab === "simulation" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          🎯 Simulation
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
          style={{ background: "none", border: "none", color: activeTab === "reports" ? "var(--brand-orange, #ff6a3d)" : "var(--dim)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          📄 Exports
        </button>
      </div>

      {/* Tab 1: ThreatLens Copilot Quick Action Chips */}
      {activeTab === "copilot" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 11, padding: "4px 8px" }}
              onClick={() => handleVoiceCommand("critical")}
            >
              "Show critical incidents"
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 11, padding: "4px 8px" }}
              onClick={() => handleVoiceCommand("summary")}
            >
              "Generate executive summary"
            </button>
          </div>

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
                <span>• {chip.label}</span>
                <span style={{ fontSize: 11, color: "var(--brand-orange, #ff6a3d)" }}>RUN ➔</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: REAL THREAT INTELLIGENCE INTEGRATIONS CARD */}
      {activeTab === "intel" && (
        <div style={{ background: "var(--panel-dark)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--paper)" }}>Live Threat Intel Feed</span>
            <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", borderRadius: 4, fontWeight: 700 }}>
              MALICIOUS (97%)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 10, fontFamily: "var(--mono)" }}>
            <div>
              <span style={{ color: "var(--dim)", fontSize: 10, display: "block" }}>TARGET IP</span>
              <strong style={{ color: "var(--cyan)" }}>185.220.101.4</strong>
            </div>
            <div>
              <span style={{ color: "var(--dim)", fontSize: 10, display: "block" }}>LOCATION</span>
              <strong style={{ color: "var(--paper)" }}>Germany 🇩🇪</strong>
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8, fontWeight: 600 }}>Active Security Feeds:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--panel-solid)", borderRadius: 6 }}>
              <span>VirusTotal</span>
              <strong style={{ color: "#ef4444" }}>48/72 Engines Flagged</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--panel-solid)", borderRadius: 6 }}>
              <span>AbuseIPDB</span>
              <strong style={{ color: "#ef4444" }}>97% Confidence Score</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--panel-solid)", borderRadius: 6 }}>
              <span>Shodan</span>
              <strong style={{ color: "var(--paper)" }}>Ports 22, 80, 443, 8080 Open</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--panel-solid)", borderRadius: 6 }}>
              <span>Google Threat Intel</span>
              <strong style={{ color: "#ef4444" }}>Active C2 Ransomware Hub</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Real-Time Live Feed */}
      {activeTab === "feed" && (
        <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {feedEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
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

      {/* Tab 4: Simulation Center */}
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
            onClick={handle15SecondSimulation}
            style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 800 }}
          >
            {isSimulating ? "⚡ Simulating Attack..." : `⚡ START ${simScenario.toUpperCase()} SIMULATION`}
          </button>
        </div>
      )}

      {/* Tab 5: PDF Enterprise Exports */}
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
