import React from "react";

export interface AgentCardData {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Standby" | "Running" | "Idle";
  tasksCompleted: number;
  revenueGenerated: string;
  icon: string;
  accentColor: string;
}

const defaultAgents: AgentCardData[] = [
  {
    id: "threat-agent",
    name: "Threat Agent",
    role: "Log & Attack Vector Analysis",
    status: "Active",
    tasksCompleted: 142,
    revenueGenerated: "12.5 USDC",
    icon: "🛡️",
    accentColor: "#3b82f6",
  },
  {
    id: "malware-agent",
    name: "Malware Agent",
    role: "Payload Dissection & Quarantining",
    status: "Active",
    tasksCompleted: 89,
    revenueGenerated: "8.0 USDC",
    icon: "🦠",
    accentColor: "#ef4444",
  },
  {
    id: "report-agent",
    name: "Report Agent",
    role: "Executive PDF & Audit Summaries",
    status: "Standby",
    tasksCompleted: 56,
    revenueGenerated: "5.0 USDC",
    icon: "📄",
    accentColor: "#a855f7",
  },
  {
    id: "payment-agent",
    name: "Payment Agent",
    role: "x402 Micropayments & Verification",
    status: "Active",
    tasksCompleted: 31,
    revenueGenerated: "24.5 USDC",
    icon: "💰",
    accentColor: "#10b981",
  },
];

export const MultiAgentCards: React.FC<{ agents?: AgentCardData[] }> = ({
  agents = defaultAgents,
}) => {
  return (
    <div className="multi-agent-section">
      <div className="section-header">
        <h3 className="section-title">🤖 Multi-Agent Swarm Intelligence</h3>
        <p className="section-subtitle">Active specialized autonomous security agents</p>
      </div>

      <div className="agent-cards-grid">
        {agents.map((agent) => (
          <div key={agent.id} className="agent-card" style={{ borderTopColor: agent.accentColor }}>
            <div className="agent-card-header">
              <span className="agent-icon" style={{ backgroundColor: `${agent.accentColor}20` }}>
                {agent.icon}
              </span>
              <div className="agent-info">
                <h4 className="agent-name">{agent.name}</h4>
                <span className="agent-role">{agent.role}</span>
              </div>
              <span className={`agent-status-badge ${agent.status.toLowerCase()}`}>
                <span className="dot"></span> {agent.status}
              </span>
            </div>

            <div className="agent-card-stats">
              <div className="agent-stat">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-num">{agent.tasksCompleted}</span>
              </div>
              <div className="agent-stat">
                <span className="stat-label">Revenue Generated</span>
                <span className="stat-num revenue">{agent.revenueGenerated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiAgentCards;
