// agent.js
// The Gemini-powered agent loop: takes a user question, lets Gemini decide
// (via function calling) which of the 4 security tools to invoke, executes
// the tool against MongoDB Atlas, feeds the result back to Gemini, and
// returns a plain-English answer. This is the required Gemini API LLM call
// for the hackathon's LLM Model Use rule.

const { AgentTools } = require("./tools");

const SYSTEM_INSTRUCTION = `You are ThreatLens, a security intelligence copilot built for early-stage
startups and small engineering teams that can't yet afford a dedicated security hire.
Answer security questions by calling the tools available to you rather than guessing.
Be concise, be concrete (cite IPs, hosts, timestamps, risk scores when relevant), and
always translate technical findings into plain English a non-security founder can act on.
If a question implies urgency (e.g. ransomware, active exfiltration), lead with the
single most important next action.`;

const MAX_TOOL_HOPS = 4;

class Agent {
  constructor(genai, tools) {
    this.genai = genai;
    /** @type {AgentTools} */
    this.tools = tools;
    this.toolDefs = AgentTools.definitions();
  }

  /**
   * @param {string} userMessage
   * @param {Array<{role: 'user'|'model', text: string}>} [history]
   */
  async chat(userMessage, history = []) {
    const contents = [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const toolTrace = [];

    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const { text, functionCalls, parts } = await this.genai.generate({
        contents,
        tools: this.toolDefs,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      if (!functionCalls || functionCalls.length === 0) {
        return { reply: text, toolTrace };
      }

      // Record the model's tool-call turn exactly as received (this preserves
      // any thoughtSignature Gemini 3.x attaches to functionCall parts —
      // required for the API to accept the next turn).
      contents.push({
        role: "model",
        parts,
      });

      const responseParts = [];
      for (const call of functionCalls) {
        let result;
        try {
          result = await this._runTool(call.name, call.args || {});
        } catch (err) {
          result = { error: err.message };
        }
        toolTrace.push({ tool: call.name, args: call.args, result });
        responseParts.push({
          functionResponse: { name: call.name, response: { result } },
        });
      }

      contents.push({ role: "user", parts: responseParts });
    }

    return {
      reply: "I gathered several pieces of evidence but need a narrower question to give a confident final answer — try asking about a specific IP, event type, or severity.",
      toolTrace,
    };
  }

  async _runTool(name, args) {
    switch (name) {
      case "query_logs":
        return await this.tools.query_logs(args);
      case "semantic_search":
        return await this.tools.semantic_search(args);
      case "get_ip_reputation":
        return await this.tools.get_ip_reputation(args);
      case "suggest_remediation":
        return await this.tools.suggest_remediation(args);
      default:
        throw new Error(`Agent tried to call unknown tool: ${name}`);
    }
  }
}

module.exports = { Agent };
