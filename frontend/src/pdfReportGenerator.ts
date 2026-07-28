// pdfReportGenerator.ts
// Formats & downloads executive ThreatLens PDF incident reports

export interface PDFReportData {
  reportId: string;
  generatedAt: string;
  agent: string;
  txHash: string;
  costUsdc: string;
  threatsAnalyzed: number;
  criticalCount: number;
  highCount: number;
  ipTrace: string;
  mitreTechniques: string[];
  remediationSteps: string[];
}

export function generateIncidentPDF(data?: Partial<PDFReportData>) {
  const dateStr = new Date().toLocaleString();
  const reportId = data?.reportId || `TL-PDF-${Math.floor(100000 + Math.random() * 900000)}`;
  const txHash = data?.txHash || "0x123";
  const cost = data?.costUsdc || "1 USDC";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ThreatLens Executive Incident Audit Report - ${reportId}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #0d111a;
      color: #f0f4f8;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #00f2fe;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #00f2fe;
      letter-spacing: 1px;
    }
    .title {
      font-size: 20px;
      margin: 10px 0 5px 0;
      color: #ffffff;
    }
    .badge {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .meta-box {
      background: #141a26;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #94a3b8;
      font-size: 11px;
      text-transform: uppercase;
    }
    .meta-val {
      font-family: monospace;
      color: #60a5fa;
      font-weight: bold;
    }
    .section-title {
      font-size: 16px;
      border-left: 4px solid #ff6a3d;
      padding-left: 10px;
      margin: 25px 0 15px 0;
      color: #ffffff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 10px 14px;
      text-align: left;
      font-size: 13px;
    }
    th {
      background: #1c2436;
      color: #94a3b8;
      font-weight: 600;
    }
    .critical { color: #ef4444; font-weight: bold; }
    .high { color: #f59e0b; font-weight: bold; }
    .footer {
      margin-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🔐 ThreatLens Security SOC</div>
      <div class="title">Executive Incident Audit Report</div>
    </div>
    <span class="badge">Verified x402 Micropayment: ${cost}</span>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <div class="meta-label">Report Reference</div>
      <div class="meta-val">${reportId}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Generated Timestamp</div>
      <div class="meta-val">${dateStr}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Generating Agent</div>
      <div class="meta-val">Report Agent (Autonomous Swarm)</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Circle Settlement Tx</div>
      <div class="meta-val">${txHash}</div>
    </div>
  </div>

  <div class="section-title">Incident Summary & Risk Metrics</div>
  <table>
    <thead>
      <tr>
        <th>Incident Type</th>
        <th>Source Vector</th>
        <th>Target Host</th>
        <th>Severity</th>
        <th>Risk Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ransomware Encryption Vector</td>
        <td>185.220.101.4 (TOR Exit Node)</td>
        <td>fileserver-01</td>
        <td><span class="critical">CRITICAL</span></td>
        <td>98/100</td>
      </tr>
      <tr>
        <td>Unauthorized DB Data Exfiltration</td>
        <td>103.224.182.9</td>
        <td>db-prod-02</td>
        <td><span class="high">HIGH</span></td>
        <td>84/100</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">MITRE ATT&CK Mapping & Mitigation Audit</div>
  <ul>
    <li><strong>T1486 (Data Encrypted for Impact)</strong>: Isolated host <code>fileserver-01</code> from VPC subnet.</li>
    <li><strong>T1071 (Application Layer Protocol)</strong>: Blocked malicious egress IP <code>185.220.101.4</code> at edge firewall.</li>
    <li><strong>T1552 (Unsecured Credentials)</strong>: Triggered automated secret rotation for <code>db-prod-02</code>.</li>
  </ul>

  <div class="footer">
    ThreatLens Autonomous Security Copilot • Powered by Circle USDC Micropayments & Gemini AI
  </div>
</body>
</html>
  `;

  // Create printable Blob & trigger download
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ThreatLens_Incident_Report_${reportId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
