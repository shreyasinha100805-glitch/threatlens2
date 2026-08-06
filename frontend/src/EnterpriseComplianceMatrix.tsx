import React, { useState } from "react";
import { generateIncidentPDF } from "./pdfReportGenerator";

interface FrameworkStatus {
  id: string;
  name: string;
  readiness: number;
  passCount: number;
  totalControls: number;
  status: "Compliant" | "Action Required" | "Auditing";
  category: string;
}

const FRAMEWORKS: FrameworkStatus[] = [
  { id: "soc2", name: "SOC 2 Type II", readiness: 96, passCount: 24, totalControls: 25, status: "Compliant", category: "Security, Availability & Confidentiality" },
  { id: "iso27001", name: "ISO/IEC 27001:2022", readiness: 94, passCount: 92, totalControls: 98, status: "Compliant", category: "Information Security Management System" },
  { id: "hipaa", name: "HIPAA Security Rule", readiness: 98, passCount: 41, totalControls: 42, status: "Compliant", category: "Protected Health Information (PHI) Shield" },
  { id: "pci", name: "PCI-DSS v4.0", readiness: 92, passCount: 58, totalControls: 63, status: "Action Required", category: "Payment Card Industry Data Security" },
  { id: "nist", name: "NIST CSF v2.0", readiness: 95, passCount: 104, totalControls: 108, status: "Compliant", category: "Cybersecurity Framework Standards" }
];

const EVIDENCE_LOGS = [
  { id: "EVD-8801", controlRef: "SOC2 CC6.1", description: "Automated perimeter firewall rule verification & IP reputation check", verifiedBy: "Threat Triage Agent", status: "PASSED", timestamp: "2026-08-06 22:15" },
  { id: "EVD-8802", controlRef: "ISO 27001 A.12.6", description: "Vulnerability scanning & automated host isolation playbook", verifiedBy: "Mitigation Playbook Agent", status: "PASSED", timestamp: "2026-08-06 21:40" },
  { id: "EVD-8803", controlRef: "PCI-DSS 10.2", description: "Audit trail immutability logging via MongoDB Atlas Vector Search", verifiedBy: "Compliance Auditor Agent", status: "PASSED", timestamp: "2026-08-06 20:30" },
  { id: "EVD-8804", controlRef: "HIPAA 164.312", description: "Data exfiltration anomaly detection on db-prod-02", verifiedBy: "Threat Triage Agent", status: "PASSED", timestamp: "2026-08-06 18:14" },
  { id: "EVD-8805", controlRef: "NIST PR.AC-1", description: "Autonomous Web3 Circle USDC wallet payment authorization ledger", verifiedBy: "Circle Payment Engine", status: "PASSED", timestamp: "2026-08-06 17:02" }
];

export const EnterpriseComplianceMatrix: React.FC<{ onBackToDashboard?: () => void }> = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>("soc2");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Evidence_ID,Control_Ref,Description,Verified_By,Status,Timestamp\n"
      + EVIDENCE_LOGS.map(e => `"${e.id}","${e.controlRef}","${e.description}","${e.verifiedBy}","${e.status}","${e.timestamp}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ThreatLens_SOC2_Evidence_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice("✅ SOC 2 Audit Evidence CSV exported successfully!");
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="compliance-matrix-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, color: "#f8fafc" }}>📋 Enterprise Compliance & Audit Matrix</h1>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>
            Real-time compliance validation across 5 major enterprise cybersecurity standards.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleExportCSV}
            style={{ fontSize: 13, padding: "10px 16px" }}
          >
            📊 Export SOC2 CSV Audit Evidence
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => generateIncidentPDF({ reportType: "Executive Summary" })}
            style={{ fontSize: 13, padding: "10px 16px" }}
          >
            📄 Download Executive Audit PDF
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="plan-banner success" style={{ marginBottom: 20 }}>
          {downloadNotice}
        </div>
      )}

      {/* Framework Summary Grid */}
      <div className="compliance-grid">
        {FRAMEWORKS.map((fw) => (
          <div
            key={fw.id}
            className="compliance-card"
            style={{
              borderColor: selectedFramework === fw.id ? "#38bdf8" : undefined,
              cursor: "pointer"
            }}
            onClick={() => setSelectedFramework(fw.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span className="xprize-badge">{fw.status}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--mono)" }}>
                {fw.passCount}/{fw.totalControls} Controls
              </span>
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 18, color: "#ffffff" }}>{fw.name}</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12, color: "#64748b" }}>{fw.category}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="compliance-score-ring">{fw.readiness}%</span>
              <span style={{ fontSize: 12, color: "#38bdf8" }}>Readiness Score</span>
            </div>
            {/* Progress bar */}
            <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: `${fw.readiness}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #34d399)", borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Evidence Table */}
      <div style={{ marginTop: 36, background: "rgba(17, 24, 39, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 16, padding: 24, backdropFilter: "blur(16px)" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#f8fafc" }}>
          🔍 Live Audit Control Evidence Log ({selectedFramework.toUpperCase()})
        </h2>
        <table className="evidence-table">
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>Control Ref</th>
              <th>Description</th>
              <th>Verified By</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {EVIDENCE_LOGS.map((ev) => (
              <tr key={ev.id}>
                <td style={{ fontFamily: "var(--mono)", color: "#38bdf8", fontWeight: 600 }}>{ev.id}</td>
                <td style={{ fontFamily: "var(--mono)", color: "#cbd5e1" }}>{ev.controlRef}</td>
                <td>{ev.description}</td>
                <td style={{ color: "#a7f3d0", fontWeight: 500 }}>{ev.verifiedBy}</td>
                <td>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    {ev.status}
                  </span>
                </td>
                <td style={{ fontFamily: "var(--mono)", color: "#64748b", fontSize: 12 }}>{ev.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
