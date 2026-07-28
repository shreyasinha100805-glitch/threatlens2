import React, { useState } from "react";
import circlePaymentEngine from "./circlePaymentEngine";
import { generateIncidentPDF } from "./pdfReportGenerator";

export interface AgentCardData {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Standby" | "Running" | "Idle";
  tasksCompleted: number;
  revenueGeneratedNum: number;
  icon: string;
  accentColor: string;
  costUsdc: number;
  taskDescription: string;
}

const initialAgents: AgentCardData[] = [
  {
    id: "threat-agent",
    name: "Threat Agent",
    role: "Log & Attack Vector Analysis",
    status: "Active",
    tasksCompleted: 142,
    revenueGeneratedNum: 12.5,
    icon: "🛡️",
    accentColor: "#3b82f6",
    costUsdc: 2.0,
    taskDescription: "Run Deep Log & IP Vector Scan",
  },
  {
    id: "malware-agent",
    name: "Malware Agent",
    role: "Payload Dissection & Quarantining",
    status: "Active",
    tasksCompleted: 89,
    revenueGeneratedNum: 8.0,
    icon: "🦠",
    accentColor: "#ef4444",
    costUsdc: 0.5,
    taskDescription: "Execute Ransomware Sandbox Scan",
  },
  {
    id: "report-agent",
    name: "Report Agent",
    role: "Executive PDF & Audit Summaries",
    status: "Standby",
    tasksCompleted: 56,
    revenueGeneratedNum: 5.0,
    icon: "📄",
    accentColor: "#a855f7",
    costUsdc: 1.0,
    taskDescription: "Generate Executive PDF Incident Audit",
  },
  {
    id: "payment-agent",
    name: "Payment Agent",
    role: "x402 Micropayments & Verification",
    status: "Active",
    tasksCompleted: 31,
    revenueGeneratedNum: 24.5,
    icon: "💰",
    accentColor: "#10b981",
    costUsdc: 1.0,
    taskDescription: "Verify Circle x402 Ledger Settlement",
  },
];

export const MultiAgentCards: React.FC<{
  onAgentAction?: (agentName: string, actionMsg: string, cost: number) => void;
}> = ({ onAgentAction }) => {
  const [agents, setAgents] = useState<AgentCardData[]>(initialAgents);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAgentTask = (agent: AgentCardData) => {
    setErrorMsg(null);
    setRunningAgentId(agent.id);

    setTimeout(() => {
      try {
        // Execute Circle USDC payment via state engine
        const tx = circlePaymentEngine.executeAutonomousPayment(
          agent.name,
          agent.costUsdc,
          agent.taskDescription
        );

        // Update card stats
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agent.id) {
              return {
                ...a,
                tasksCompleted: a.tasksCompleted + 1,
                revenueGeneratedNum: parseFloat((a.revenueGeneratedNum + agent.costUsdc).toFixed(2)),
                status: "Active",
              };
            }
            return a;
          })
        );

        // Special action for Report Agent: generate PDF report
        if (agent.id === "report-agent") {
          generateIncidentPDF({
            txHash: tx.txHash,
            costUsdc: tx.amount,
          });
        }

        if (onAgentAction) {
          onAgentAction(agent.name, `${agent.taskDescription} (Charged ${agent.costUsdc} USDC)`, agent.costUsdc);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to execute agent task.");
      } finally {
        setRunningAgentId(null);
      }
    }, 600);
  };

  return (
    <div className="multi-agent-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">🤖 Multi-Agent Swarm Intelligence</h3>
          <p className="section-subtitle">Active specialized autonomous security agents</p>
        </div>
      </div>

      {errorMsg && (
        <div className="plan-banner warning" style={{ marginBottom: "14px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="agent-cards-grid">
        {agents.map((agent) => {
          const isRunning = runningAgentId === agent.id;
          return (
            <div key={agent.id} className="agent-card" style={{ borderTopColor: agent.accentColor }}>
              <div className="agent-card-header">
                <span className="agent-icon" style={{ backgroundColor: `${agent.accentColor}20` }}>
                  {agent.icon}
                </span>
                <div className="agent-info">
                  <h4 className="agent-name">{agent.name}</h4>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <span className={`agent-status-badge ${isRunning ? "running" : agent.status.toLowerCase()}`}>
                  <span className="dot"></span> {isRunning ? "Running" : agent.status}
                </span>
              </div>

              <div className="agent-card-stats">
                <div className="agent-stat">
                  <span className="stat-label">Tasks Completed</span>
                  <span className="stat-num">{agent.tasksCompleted}</span>
                </div>
                <div className="agent-stat">
                  <span className="stat-label">Revenue Generated</span>
                  <span className="stat-num revenue">{agent.revenueGeneratedNum.toFixed(1)} USDC</span>
                </div>
              </div>

              <div className="agent-card-action">
                <button
                  type="button"
                  className="btn-agent-task"
                  disabled={isRunning}
                  onClick={() => handleRunAgentTask(agent)}
                  aria-label={`Run task for ${agent.name}`}
                >
                  {isRunning ? "Executing..." : `⚡ ${agent.taskDescription}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiAgentCards;
