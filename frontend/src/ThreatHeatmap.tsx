import React, { useState } from "react";

export interface HeatmapData {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const defaultData: HeatmapData = {
  critical: 3,
  high: 7,
  medium: 12,
  low: 25,
};

const severityDetails: Record<string, { title: string; incidents: { id: string; ip: string; desc: string; cve?: string }[] }> = {
  critical: {
    title: "Critical Severity Incidents (3)",
    incidents: [
      { id: "evt-9041", ip: "185.220.101.4", desc: "Ransomware encryption payload active on fileserver-01", cve: "CVE-2024-30078" },
      { id: "evt-9045", ip: "45.154.255.12", desc: "Command & Control heartbeat beaconing detected", cve: "CVE-2023-48795" },
      { id: "evt-9049", ip: "193.142.146.35", desc: "Zero-day authentication bypass attempt on edge router", cve: "CVE-2024-21887" },
    ],
  },
  high: {
    title: "High Severity Incidents (7)",
    incidents: [
      { id: "evt-8812", ip: "103.224.182.9", desc: "Database exfiltration rate spike on db-prod-02" },
      { id: "evt-8815", ip: "185.220.101.5", desc: "SSH brute force attempt with 4,200 failures" },
      { id: "evt-8819", ip: "91.240.118.17", desc: "Suspicious API token privilege escalation" },
    ],
  },
  medium: {
    title: "Medium Severity Incidents (12)",
    incidents: [
      { id: "evt-7701", ip: "192.168.1.104", desc: "Unusual outbound UDP traffic on non-standard port 8443" },
      { id: "evt-7705", ip: "10.0.4.12", desc: "Expired TLS certificate used in microservice handshake" },
    ],
  },
  low: {
    title: "Low Severity Incidents (25)",
    incidents: [
      { id: "evt-6102", ip: "10.0.1.55", desc: "Port scan attempt blocked by perimeter firewall" },
      { id: "evt-6108", ip: "10.0.2.89", desc: "DNS query lookup to unmapped external domain" },
    ],
  },
};

export const ThreatHeatmap: React.FC<{ data?: HeatmapData }> = ({ data = defaultData }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [activeModalSev, setActiveModalSev] = useState<string | null>(null);

  const totalThreats = data.critical + data.high + data.medium + data.low;
  const criticalPct = Math.round((data.critical / totalThreats) * 100);
  const highPct = Math.round((data.high / totalThreats) * 100);
  const medPct = Math.round((data.medium / totalThreats) * 100);
  const lowPct = Math.round((data.low / totalThreats) * 100);

  const matrixNodes = Array.from({ length: 47 }, (_, i) => {
    if (i < data.critical) return "critical";
    if (i < data.critical + data.high) return "high";
    if (i < data.critical + data.high + data.medium) return "medium";
    return "low";
  });

  return (
    <div className="threat-heatmap-card card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">🔥 Threat Severity Heatmap & Visual Analytics</h3>
          <p className="panel-subtitle">Click any severity box to inspect active incident telemetry</p>
        </div>
        <div className="total-threat-pill">
          <strong>{totalThreats}</strong> Total Active Incidents
        </div>
      </div>

      {/* Severity Stat Badges */}
      <div className="severity-grid">
        <div
          className={`severity-box critical ${selectedSeverity === "critical" ? "active" : ""}`}
          onClick={() => setActiveModalSev("critical")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Critical</span>
          </div>
          <div className="sev-count">{data.critical}</div>
          <div className="sev-sub">{criticalPct}% of total (Click for details)</div>
        </div>

        <div
          className={`severity-box high ${selectedSeverity === "high" ? "active" : ""}`}
          onClick={() => setActiveModalSev("high")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">High</span>
          </div>
          <div className="sev-count">{data.high}</div>
          <div className="sev-sub">{highPct}% of total (Click for details)</div>
        </div>

        <div
          className={`severity-box medium ${selectedSeverity === "medium" ? "active" : ""}`}
          onClick={() => setActiveModalSev("medium")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Medium</span>
          </div>
          <div className="sev-count">{data.medium}</div>
          <div className="sev-sub">{medPct}% of total (Click for details)</div>
        </div>

        <div
          className={`severity-box low ${selectedSeverity === "low" ? "active" : ""}`}
          onClick={() => setActiveModalSev("low")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Low</span>
          </div>
          <div className="sev-count">{data.low}</div>
          <div className="sev-sub">{lowPct}% of total (Click for details)</div>
        </div>
      </div>

      {/* Visual Analytics Progress Bar */}
      <div className="analytics-bar-container">
        <div className="analytics-bar-title">Risk Proportion Distribution</div>
        <div className="stacked-bar">
          <div className="bar-seg critical" style={{ width: `${criticalPct}%` }} title={`Critical: ${data.critical}`}></div>
          <div className="bar-seg high" style={{ width: `${highPct}%` }} title={`High: ${data.high}`}></div>
          <div className="bar-seg medium" style={{ width: `${medPct}%` }} title={`Medium: ${data.medium}`}></div>
          <div className="bar-seg low" style={{ width: `${lowPct}%` }} title={`Low: ${data.low}`}></div>
        </div>
      </div>

      {/* Visual Matrix Grid */}
      <div className="heatmap-matrix-wrapper">
        <div className="matrix-title">System Node Vulnerability Matrix (47 Perimeter Nodes)</div>
        <div className="matrix-grid">
          {matrixNodes.map((nodeSev, idx) => {
            const isDimmed = selectedSeverity && selectedSeverity !== nodeSev;
            return (
              <div
                key={idx}
                className={`matrix-cell ${nodeSev} ${isDimmed ? "dimmed" : ""}`}
                onClick={() => setActiveModalSev(nodeSev)}
                title={`Node #${100 + idx} - Severity: ${nodeSev.toUpperCase()}`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Incident Drill-down Modal */}
      {activeModalSev && severityDetails[activeModalSev] && (
        <div className="modal-backdrop" onClick={() => setActiveModalSev(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{severityDetails[activeModalSev].title}</h4>
              <button type="button" className="close-btn" onClick={() => setActiveModalSev(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-sub">Incident telemetry and threat indicators for {activeModalSev} priority issues:</p>
              <div className="incident-list">
                {severityDetails[activeModalSev].incidents.map((inc) => (
                  <div key={inc.id} className="incident-item">
                    <div className="incident-id-bar">
                      <span className="inc-id">{inc.id}</span>
                      <span className="inc-ip">Source IP: {inc.ip}</span>
                      {inc.cve && <span className="cve-tag">{inc.cve}</span>}
                    </div>
                    <div className="inc-desc">{inc.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatHeatmap;
