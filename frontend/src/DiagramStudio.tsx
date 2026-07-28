import { useState, useEffect, useRef } from "react";
import { cyberAudio } from "./cyberAudio";

interface DiagramPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  mermaidCode: string;
}

const DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: "ransomware_blast",
    title: "Ransomware Blast Radius & Incident Chain",
    category: "Incident Analysis",
    description: "Visualizes the lateral movement path of event evt-9041 from Tor exit node to host volume encryption.",
    mermaidCode: `graph TD
  Attacker["🌐 Attacker IP: 185.220.101.4 (Tor Exit Node)"] -->|Exploit Port 22| GW["🛡️ SSH Gateway (ssh-gateway)"]
  GW -->|Privilege Escalation T1068| App["💻 App Server (app-server-03)"]
  App -->|Lateral Movement| File["📁 File Server (fileserver-01)"]
  File -->|Drop Ransom Note| Encr["🔒 Encrypted Volume (.locked)"]
  File -->|Data Exfiltration T1048| Exf["⚠️ Storage Endpoint (103.224.182.9)"]

  style Encr fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
  style Attacker fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff
  style Exf fill:#7c2d12,stroke:#f59e0b,stroke-width:2px,color:#ffffff
  style GW fill:#064e3b,stroke:#10b981,color:#ffffff
  style File fill:#1e1b4b,stroke:#00f2fe,color:#ffffff`,
  },
  {
    id: "exfiltration_sequence",
    title: "Data Exfiltration Incident Sequence",
    category: "Attacker Timeline",
    description: "Timeline sequence of off-hours database exfiltration and automated ThreatLens 1-Click mitigation.",
    mermaidCode: `sequenceDiagram
  autonumber
  actor Attacker as 🌐 Attacker (103.224.182.9)
  participant DB as 🗄️ DB (db-prod-02)
  participant ThreatLens as 🤖 ThreatLens AI Copilot
  participant Founder as 👤 SecOps Founder

  Attacker->>DB: Query Sensitive Financial Records (Off-Hours)
  DB-->>Attacker: Exfiltrates 2.3GB via HTTPS Port 443
  ThreatLens-->>DB: Detects Off-Hours Anomaly & High Entropy
  ThreatLens-->>Founder: Flags Critical Alert (evt-9043)
  Founder->>ThreatLens: 1-Click "Block IP & Quarantine Host"
  ThreatLens->>DB: Enforces IP Firewall Rule & Quarantines Host`,
  },
  {
    id: "defense_topology",
    title: "Cloud Infrastructure Security Architecture",
    category: "Target Architecture",
    description: "Ideal multi-layer cloud defense perimeter with ThreatLens autonomous AI copilot integration.",
    mermaidCode: `graph LR
  Users["👤 Internet Traffic"] --> WAF["🛡️ Cloud WAF & Edge Firewall"]
  WAF --> ALB["⚖️ Application Load Balancer"]
  ALB --> Web1["💻 Web Service 01"]
  ALB --> Web2["💻 Web Service 02"]
  Web1 --> DB[("🗄️ Production Database")]
  Web2 --> DB
  WAF -.->|Real-Time Audit Stream| ThreatLens["🤖 ThreatLens AI Security Engine"]
  ThreatLens -.->|Auto Playbook Escalation| Slack["📢 Slack Webhook Alerts"]

  style ThreatLens fill:#1e1b4b,stroke:#00f2fe,stroke-width:2px,color:#ffffff
  style WAF fill:#064e3b,stroke:#10b981,color:#ffffff
  style DB fill:#1e293b,stroke:#94a3b8,color:#ffffff`,
  },
  {
    id: "mitre_chain",
    title: "MITRE ATT&CK® Execution Chain Taxonomy",
    category: "MITRE ATT&CK",
    description: "Complete taxonomy mapping of attack vectors detected in current telemetry.",
    mermaidCode: `graph TD
  T1["1. Initial Access: T1110.001 Password Guessing"] --> T2["2. Execution: T1204 User Execution"]
  T2 --> T3["3. Privilege Escalation: T1068 Vulnerability Exploit"]
  T3 --> T4["4. Exfiltration: T1048 Exfiltration Over Protocol"]
  T4 --> T5["5. Impact: T1486 Data Encrypted for Impact"]

  style T1 fill:#3b0764,stroke:#a855f7,color:#fff
  style T3 fill:#7c2d12,stroke:#f59e0b,color:#fff
  style T5 fill:#7f1d1d,stroke:#ef4444,color:#fff`,
  },
];

export function VisualMermaid({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    // Load mermaid dynamically from cdn or fallback visual generator
    const renderDiagram = async () => {
      try {
        if (!(window as any).mermaid) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
          script.async = true;
          document.head.appendChild(script);
          await new Promise((res) => (script.onload = res));
        }

        const mermaid = (window as any).mermaid;
        if (mermaid) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              darkMode: true,
              background: "#07090e",
              primaryColor: "#141a26",
              primaryTextColor: "#f0f4f8",
              primaryBorderColor: "#00f2fe",
              lineColor: "#00f2fe",
              secondaryColor: "#1c2436",
              tertiaryColor: "#0d111a",
            },
          });
          const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, code);
          if (isMounted) setSvgContent(svg);
        }
      } catch (err) {
        if (isMounted) {
          setSvgContent(`<div class="diagram-render-fallback">Visualizing diagram structure...</div>`);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="mermaid-render-box"
      dangerouslySetInnerHTML={{ __html: svgContent || `<div class="loading-diagram">Generating Security Diagram...</div>` }}
    />
  );
}

export function DiagramStudio({ initialMermaid }: { initialMermaid?: string }) {
  const [selectedPreset, setSelectedPreset] = useState<DiagramPreset>(DIAGRAM_PRESETS[0]);
  const [customCode, setCustomCode] = useState<string>(initialMermaid || DIAGRAM_PRESETS[0].mermaidCode);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeCode = isEditing ? customCode : selectedPreset.mermaidCode;

  const handleSelectPreset = (preset: DiagramPreset) => {
    cyberAudio.playClick();
    setSelectedPreset(preset);
    setCustomCode(preset.mermaidCode);
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    cyberAudio.playSuccess();
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="diagram-studio-container">
      {/* Studio Header */}
      <div className="studio-header glass-panel">
        <div className="studio-title-area">
          <div className="studio-badge">
            <span className="pulse-dot" />
            VISUAL INCIDENT & ARCHITECTURE STUDIO
          </div>
          <h2 className="studio-heading">Security Diagram Generator</h2>
          <p className="studio-sub">
            Generate, edit, and export visual threat flow diagrams, ransomware blast radiuses, and infrastructure topology maps.
          </p>
        </div>

        <div className="studio-actions">
          <button
            className={`btn-cyber ${!isEditing ? "active" : ""}`}
            onClick={() => {
              cyberAudio.playClick();
              setIsEditing(false);
            }}
          >
            📋 Presets Gallery
          </button>
          <button
            className={`btn-cyber ${isEditing ? "active" : ""}`}
            onClick={() => {
              cyberAudio.playClick();
              setIsEditing(true);
            }}
          >
            ✏️ Live Editor
          </button>
          <button className="btn-cyber-outline" onClick={handleCopyCode}>
            {copied ? "✓ Copied Code!" : "🔗 Copy Mermaid Code"}
          </button>
        </div>
      </div>

      {/* Preset Selector Ribbon */}
      {!isEditing && (
        <div className="preset-cards-grid">
          {DIAGRAM_PRESETS.map((p) => (
            <div
              key={p.id}
              className={`preset-card glass-panel ${selectedPreset.id === p.id ? "preset-card-selected" : ""}`}
              onClick={() => handleSelectPreset(p)}
            >
              <div className="preset-cat">{p.category}</div>
              <div className="preset-title">{p.title}</div>
              <div className="preset-desc">{p.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="studio-workspace">
        {/* Editor Pane if in Edit Mode */}
        {isEditing && (
          <div className="editor-pane glass-panel">
            <div className="pane-header">
              <span className="pane-title">Mermaid Diagram Code</span>
              <span className="pane-hint">Live SVG preview updates automatically</span>
            </div>
            <textarea
              className="diagram-textarea"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Write Mermaid diagram syntax (e.g. graph TD...)"
              rows={16}
            />
          </div>
        )}

        {/* Visual Render Pane */}
        <div className="render-pane glass-panel">
          <div className="pane-header">
            <span className="pane-title">
              {isEditing ? "Live Visual Render" : selectedPreset.title}
            </span>
            <span className="pane-hint">High-Contrast Cyber SOC Theme</span>
          </div>

          <div className="diagram-canvas-viewport">
            <VisualMermaid code={activeCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
