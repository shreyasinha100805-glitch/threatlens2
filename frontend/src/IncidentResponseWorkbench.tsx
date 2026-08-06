import React, { useState } from "react";
import { cyberAudio } from "./cyberAudio";
import { generateIncidentPDF } from "./pdfReportGenerator";

export interface IncidentItem {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "new" | "investigating" | "mitigated" | "resolved";
  sourceIp: string;
  targetHost: string;
  createdAt: string;
  assignedAgent: string;
  playbookExecuted: boolean;
}

const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: "INC-2026-9041",
    title: "Ransomware Activity (.locked files) on fileserver-01",
    severity: "critical",
    status: "investigating",
    sourceIp: "185.220.101.4",
    targetHost: "fileserver-01",
    createdAt: "2026-08-06T22:30:12Z",
    assignedAgent: "Mitigation Playbook Agent",
    playbookExecuted: true
  },
  {
    id: "INC-2026-9042",
    title: "SSH Brute-Force Rate Anomaly (412 failed attempts)",
    severity: "high",
    status: "mitigated",
    sourceIp: "45.142.212.61",
    targetHost: "ssh-gateway",
    createdAt: "2026-08-06T22:15:40Z",
    assignedAgent: "IP Reputation Bot",
    playbookExecuted: true
  },
  {
    id: "INC-2026-9043",
    title: "Outbound Data Exfiltration Anomaly (2.3GB payload)",
    severity: "critical",
    status: "investigating",
    sourceIp: "103.224.182.9",
    targetHost: "db-prod-02",
    createdAt: "2026-08-06T21:45:02Z",
    assignedAgent: "Threat Triage Agent",
    playbookExecuted: false
  },
  {
    id: "INC-2026-9044",
    title: "Unclassified Sudoers Privilege Escalation Exploit",
    severity: "high",
    status: "new",
    sourceIp: "10.0.0.44",
    targetHost: "app-server-03",
    createdAt: "2026-08-06T21:10:18Z",
    assignedAgent: "Threat Triage Agent",
    playbookExecuted: false
  }
];

export const IncidentResponseWorkbench: React.FC<{
  onOpenConsoleWithPrompt?: (prompt: string) => void;
}> = ({ onOpenConsoleWithPrompt }) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, newStatus: IncidentItem["status"]) => {
    cyberAudio.playSuccess();
    setIncidents(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus, playbookExecuted: true } : item))
    );
    setNotice(`Updated ticket ${id} status to ${newStatus.toUpperCase()}`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportJira = (incident: IncidentItem) => {
    cyberAudio.playClick();
    const jiraIssue = {
      fields: {
        project: { key: "SEC" },
        summary: `[ThreatLens Security] ${incident.title}`,
        description: `Source IP: ${incident.sourceIp}\nTarget Host: ${incident.targetHost}\nSeverity: ${incident.severity}\nAssigned Agent: ${incident.assignedAgent}\nLogged: ${incident.createdAt}`,
        issuetype: { name: "Incident" }
      }
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jiraIssue, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `Jira_Ticket_${incident.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice(`jira Ticket payload for ${incident.id} exported successfully.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="incident-workbench-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, color: "#f8fafc" }}>🚨 Incident Response Workbench & SLA Analytics</h1>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>
            Enterprise security incident queue, real-time SLA metrics, and 1-click mitigation playbooks.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => generateIncidentPDF({ reportType: "Incident Report" })}
            style={{ fontSize: 13, padding: "10px 16px" }}
          >
            📄 Export Incident PDF Audit
          </button>
        </div>
      </div>

      {notice && (
        <div className="plan-banner success" style={{ marginBottom: 20 }}>
          {notice}
        </div>
      )}

      {/* SLA Metric Cards */}
      <div className="compliance-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 32 }}>
        <div className="sla-metric-card">
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>Mean Time to Detect (MTTD)</span>
          <span className="sla-metric-val">1.2 min</span>
          <span style={{ fontSize: 11, color: "#34d399" }}>⚡ 85% faster than industry benchmark</span>
        </div>
        <div className="sla-metric-card">
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>Mean Time to Respond (MTTR)</span>
          <span className="sla-metric-val" style={{ color: "#34d399" }}>4.5 min</span>
          <span style={{ fontSize: 11, color: "#34d399" }}>🛡️ Automated playbook containment</span>
        </div>
        <div className="sla-metric-card">
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>Active Critical Incidents</span>
          <span className="sla-metric-val" style={{ color: "#ef4444" }}>
            {incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length}
          </span>
          <span style={{ fontSize: 11, color: "#f87171" }}>Requires active monitoring</span>
        </div>
        <div className="sla-metric-card">
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>SLA Resolution Pass Rate</span>
          <span className="sla-metric-val" style={{ color: "#a7f3d0" }}>99.4%</span>
          <span style={{ fontSize: 11, color: "#34d399" }}>SOC2 Compliant SLA</span>
        </div>
      </div>

      {/* Incident Queue */}
      <h2 style={{ fontSize: 18, color: "#f8fafc", marginBottom: 16 }}>📋 Active Incident Tickets</h2>
      <div>
        {incidents.map((inc) => (
          <div key={inc.id} className={`incident-row-card severity-${inc.severity}`}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#38bdf8", fontWeight: 700 }}>{inc.id}</span>
                <span className={`badge ${inc.severity}`} style={{ fontSize: 11, padding: "2px 8px" }}>
                  {inc.severity.toUpperCase()}
                </span>
                <span className="xprize-badge" style={{ fontSize: 11, padding: "2px 8px" }}>
                  Status: {inc.status.toUpperCase()}
                </span>
              </div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: 16, color: "#f8fafc" }}>{inc.title}</h3>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>
                <span>Host: <strong style={{ color: "#e2e8f0" }}>{inc.targetHost}</strong></span>
                <span>IP: <strong style={{ color: "#e2e8f0" }}>{inc.sourceIp}</strong></span>
                <span>Agent: <strong style={{ color: "#a7f3d0" }}>{inc.assignedAgent}</strong></span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180, alignItems: "flex-end" }}>
              <button
                type="button"
                className="btn-jira-export"
                onClick={() => handleExportJira(inc)}
              >
                📤 Export to Jira / ServiceNow
              </button>

              {inc.status !== "resolved" && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleUpdateStatus(inc.id, "resolved")}
                  style={{ fontSize: 11, padding: "6px 12px", width: "100%" }}
                >
                  ✓ Mark as Resolved
                </button>
              )}

              {onOpenConsoleWithPrompt && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onOpenConsoleWithPrompt(`Investigate incident ${inc.id} on host ${inc.targetHost}`)}
                  style={{ fontSize: 11, padding: "6px 12px", width: "100%" }}
                >
                  💬 Investigate with Copilot
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
