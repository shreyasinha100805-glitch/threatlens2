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

export const ThreatHeatmap: React.FC<{ data?: HeatmapData }> = ({ data = defaultData }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const totalThreats = data.critical + data.high + data.medium + data.low;
  const criticalPct = Math.round((data.critical / totalThreats) * 100);
  const highPct = Math.round((data.high / totalThreats) * 100);
  const medPct = Math.round((data.medium / totalThreats) * 100);
  const lowPct = Math.round((data.low / totalThreats) * 100);

  // Generate 47 visual matrix nodes representing system assets
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
          <h3 className="panel-title">🔥 Threat Severity Heatmap</h3>
          <p className="panel-subtitle">Visual risk distribution across monitoring perimeter</p>
        </div>
        <div className="total-threat-pill">
          <strong>{totalThreats}</strong> Total Active Incidents
        </div>
      </div>

      {/* Severity Stat Badges */}
      <div className="severity-grid">
        <div
          className={`severity-box critical ${selectedSeverity === "critical" ? "active" : ""}`}
          onClick={() => setSelectedSeverity(selectedSeverity === "critical" ? null : "critical")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Critical</span>
          </div>
          <div className="sev-count">{data.critical}</div>
          <div className="sev-sub">{criticalPct}% of total</div>
        </div>

        <div
          className={`severity-box high ${selectedSeverity === "high" ? "active" : ""}`}
          onClick={() => setSelectedSeverity(selectedSeverity === "high" ? null : "high")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">High</span>
          </div>
          <div className="sev-count">{data.high}</div>
          <div className="sev-sub">{highPct}% of total</div>
        </div>

        <div
          className={`severity-box medium ${selectedSeverity === "medium" ? "active" : ""}`}
          onClick={() => setSelectedSeverity(selectedSeverity === "medium" ? null : "medium")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Medium</span>
          </div>
          <div className="sev-count">{data.medium}</div>
          <div className="sev-sub">{medPct}% of total</div>
        </div>

        <div
          className={`severity-box low ${selectedSeverity === "low" ? "active" : ""}`}
          onClick={() => setSelectedSeverity(selectedSeverity === "low" ? null : "low")}
        >
          <div className="severity-header">
            <span className="sev-dot"></span>
            <span className="sev-label">Low</span>
          </div>
          <div className="sev-count">{data.low}</div>
          <div className="sev-sub">{lowPct}% of total</div>
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
        <div className="matrix-title">System Node Vulnerability Heatmap</div>
        <div className="matrix-grid">
          {matrixNodes.map((nodeSev, idx) => {
            const isDimmed = selectedSeverity && selectedSeverity !== nodeSev;
            return (
              <div
                key={idx}
                className={`matrix-cell ${nodeSev} ${isDimmed ? "dimmed" : ""}`}
                title={`Node #${100 + idx} - Severity: ${nodeSev.toUpperCase()}`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThreatHeatmap;
