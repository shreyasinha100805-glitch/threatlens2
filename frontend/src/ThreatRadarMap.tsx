import { useState } from "react";
import { cyberAudio } from "./cyberAudio";

interface ThreatEvent {
  eventId: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  eventType: string;
  sourceIp: string;
  targetHost?: string;
  description: string;
  riskScore?: number;
  mitreTechnique?: string;
  mitreTactic?: string;
  status?: string;
}

interface ThreatRadarMapProps {
  threats: ThreatEvent[];
  onSelectThreat: (threat: ThreatEvent) => void;
}

export function ThreatRadarMap({ threats, onSelectThreat }: ThreatRadarMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Country threat distribution data
  const countryData = [
    { code: "US", flag: "🇺🇸", name: "USA", count: 3, ips: ["185.220.101.4", "103.224.182.9"] },
    { code: "RU", flag: "🇷🇺", name: "Russia", count: 5, ips: ["45.142.214.165", "194.26.29.112"] },
    { code: "CN", flag: "🇨🇳", name: "China", count: 2, ips: ["103.152.220.8", "218.92.0.104"] },
    { code: "DE", flag: "🇩🇪", name: "Germany", count: 1, ips: ["162.55.90.12"] },
  ];

  // Core Target Host Positions (Center Cluster)
  const targetNodes = [
    { id: "fileserver-01", name: "fileserver-01", x: 48, y: 44, type: "target", critical: true },
    { id: "ssh-gateway", name: "ssh-gateway", x: 38, y: 58, type: "target", critical: false },
    { id: "db-prod-02", name: "db-prod-02", x: 62, y: 52, type: "target", critical: true },
    { id: "app-server-03", name: "app-server-03", x: 50, y: 66, type: "target", critical: false },
  ];

  // Map threats to attacker origin nodes around radar periphery
  const attackerNodes = threats.map((t, idx) => {
    const angles = [35, 140, 220, 305, 15, 180, 270];
    const angleRad = (angles[idx % angles.length] * Math.PI) / 180;
    const radius = 34;
    const x = Math.round(50 + Math.cos(angleRad) * radius);
    const y = Math.round(50 + Math.sin(angleRad) * radius);

    return {
      threat: t,
      id: t.eventId,
      ip: t.sourceIp,
      target: t.targetHost || "fileserver-01",
      severity: t.severity,
      riskScore: t.riskScore || 85,
      eventType: t.eventType,
      x,
      y,
    };
  });

  return (
    <div className="radar-map-wrapper glass-panel" style={{ borderRadius: 20, padding: 20 }}>
      {/* Radar Header Telemetry */}
      <div className="radar-header">
        <div className="radar-title-group">
          <span className="radar-pulse-live" />
          <span className="radar-title">TACTICAL THREAT RADAR &amp; ATTACK VECTOR MAP</span>
          <span className="radar-tag">LIVE TELEMETRY</span>
        </div>
        <div className="radar-metrics">
          <div className="metric-pill">
            <span className="metric-label">NODES</span>
            <span className="metric-val cyan">{threats.length} Active</span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">CRITICAL VECTORS</span>
            <span className="metric-val critical">
              {threats.filter((t) => t.severity === "critical").length} Flagged
            </span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">SWEEP FREQ</span>
            <span className="metric-val">100 Hz</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WORLD MAP COUNTRY THREAT BAR */}
      <div className="country-threat-bar" style={{ display: "flex", gap: 10, margin: "14px 0", flexWrap: "wrap" }}>
        {countryData.map((c) => {
          const isActive = selectedCountry === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                cyberAudio.playClick();
                setSelectedCountry(isActive ? null : c.code);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: isActive ? "rgba(255, 107, 0, 0.2)" : "var(--panel-raised)",
                border: isActive ? "1px solid var(--brand-orange, #ff6a3d)" : "1px solid var(--line)",
                borderRadius: 10,
                color: "var(--paper)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span
                style={{
                  background: c.count > 3 ? "#ef4444" : "#f59e0b",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "1px 7px",
                  borderRadius: 8,
                }}
              >
                {c.count} threats
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Radar Visual Area */}
      <div className="radar-viewport">
        <div className="radar-ring ring-outer" />
        <div className="radar-ring ring-mid" />
        <div className="radar-ring ring-inner" />
        <div className="radar-crosshair crosshair-h" />
        <div className="radar-crosshair crosshair-v" />
        <div className="radar-sweep-beam" />

        {/* Attack Vector Connection Lines */}
        <svg className="radar-svg-overlay">
          {attackerNodes.map((att) => {
            const target = targetNodes.find((n) => n.id === att.target) || targetNodes[0];
            const isHovered = hoveredNode === att.id || hoveredNode === target.id;
            const strokeColor =
              att.severity === "critical"
                ? "rgba(239, 68, 68, 0.7)"
                : att.severity === "high"
                ? "rgba(245, 158, 11, 0.7)"
                : "rgba(0, 242, 254, 0.5)";

            return (
              <g key={`vector-${att.id}`}>
                <line
                  x1={`${att.x}%`}
                  y1={`${att.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  strokeDasharray="4 4"
                  className="attack-vector-line"
                />
              </g>
            );
          })}
        </svg>

        {/* Target Host Internal Nodes */}
        {targetNodes.map((tn) => (
          <div
            key={tn.id}
            className={`radar-node target-node ${hoveredNode === tn.id ? "node-hovered" : ""}`}
            style={{ left: `${tn.x}%`, top: `${tn.y}%` }}
            onMouseEnter={() => setHoveredNode(tn.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div className="node-icon">🛡️</div>
            <div className="node-label">{tn.name}</div>
          </div>
        ))}

        {/* Attacker Origin Nodes */}
        {attackerNodes.map((an) => (
          <div
            key={an.id}
            className={`radar-node attacker-node severity-${an.severity} ${
              hoveredNode === an.id ? "node-hovered" : ""
            }`}
            style={{ left: `${an.x}%`, top: `${an.y}%` }}
            onMouseEnter={() => setHoveredNode(an.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => {
              cyberAudio.playRadarPing();
              onSelectThreat(an.threat);
            }}
            title={`Click to inspect ${an.ip}`}
          >
            <span className="node-ping-ring" />
            <div className="node-core">
              <span className="node-ip">{an.ip}</span>
              <span className="node-risk">RISK {an.riskScore}</span>
            </div>

            {/* Hover Tooltip Card */}
            {hoveredNode === an.id && (
              <div className="node-tooltip-card">
                <div className="tooltip-header">
                  <span className={`severity-badge severity-${an.severity}`}>{an.severity}</span>
                  <span className="tooltip-event">{an.eventType}</span>
                </div>
                <div className="tooltip-desc">{an.threat.description}</div>
                <div className="tooltip-action-prompt">⚡ Click Node to Open Incident Console</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
