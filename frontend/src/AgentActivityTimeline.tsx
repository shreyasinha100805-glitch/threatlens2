import React from "react";

export interface TimelineEvent {
  id: string;
  time: string;
  agent: string;
  action: string;
  type: "threat" | "malware" | "payment" | "report";
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    time: "10:01 AM",
    agent: "Threat Agent",
    action: "analyzed log.",
    type: "threat",
  },
  {
    id: "2",
    time: "10:02 AM",
    agent: "Malware Agent",
    action: "flagged ransomware.",
    type: "malware",
  },
  {
    id: "3",
    time: "10:03 AM",
    agent: "Payment Agent",
    action: "charged 1 USDC.",
    type: "payment",
  },
  {
    id: "4",
    time: "10:04 AM",
    agent: "Report Agent",
    action: "generated PDF.",
    type: "report",
  },
];

export const AgentActivityTimeline: React.FC<{ events?: TimelineEvent[] }> = ({
  events = defaultEvents,
}) => {
  const getBadgeStyle = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "threat":
        return { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.3)", icon: "🛡️" };
      case "malware":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "rgba(239, 68, 68, 0.3)", icon: "🦠" };
      case "payment":
        return { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)", icon: "💰" };
      case "report":
        return { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "rgba(168, 85, 247, 0.3)", icon: "📄" };
    }
  };

  return (
    <div className="timeline-panel card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">⚡ Agent Activity Timeline</h3>
          <p className="panel-subtitle">Real-time autonomous agent actions & audit trail</p>
        </div>
        <span className="live-indicator">
          <span className="pulsing-dot"></span> Live Log Feed
        </span>
      </div>

      <div className="timeline-container">
        {events.map((event) => {
          const style = getBadgeStyle(event.type);
          return (
            <div key={event.id} className="timeline-item">
              <div className="timeline-time">{event.time}</div>
              <div className="timeline-node" style={{ borderColor: style.color, backgroundColor: style.bg }}>
                <span>{style.icon}</span>
              </div>
              <div className="timeline-content">
                <span
                  className="agent-pill"
                  style={{
                    backgroundColor: style.bg,
                    color: style.color,
                    borderColor: style.border,
                  }}
                >
                  {event.agent}
                </span>
                <span className="action-text">{event.action}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivityTimeline;
