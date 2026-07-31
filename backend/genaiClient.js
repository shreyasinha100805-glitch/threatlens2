// genaiClient.js
// Thin wrapper around the Google Gemini API (Generative Language API).
// This is the single required LLM call point for the Build with Gemini XPRIZE
// hackathon: every agent turn and every embedding routes through here.
//
// Every call retries on transient failures (429 rate limit, 500/502/503/504
// server errors) with exponential backoff, so a brief hiccup doesn't turn
// into "Agent failed to produce a response" for the user — it just takes
// slightly longer to get a real Gemini-generated answer.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs `fn` (an async function returning a fetch Response) with retries on
 * transient failures. Respects the API's own Retry-After / retryDelay hint
 * when present, otherwise backs off exponentially with jitter.
 */
async function fetchWithRetry(fn, { label }) {
  let lastErr;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fn();
    } catch (networkErr) {
      // Network-level failure (DNS, connection reset, etc.) — also retryable.
      lastErr = networkErr;
      if (attempt === MAX_RETRIES) break;
      await sleep(BASE_DELAY_MS * 2 ** attempt + Math.random() * 250);
      continue;
    }

    if (res.ok) return res;

    if (!RETRYABLE_STATUS.has(res.status) || attempt === MAX_RETRIES) {
      const errText = await res.text().catch(() => "");
      throw new Error(`${label} error (${res.status}): ${errText}`);
    }

    // Parse Gemini's suggested retryDelay (e.g. "18s") if present, else backoff.
    const bodyText = await res.text().catch(() => "");
    const retryMatch = bodyText.match(/"retryDelay":\s*"(\d+)s"/);
    const suggestedMs = retryMatch ? parseInt(retryMatch[1], 10) * 1000 : null;

    if (res.status === 429 && suggestedMs && suggestedMs > 4000) {
      throw new Error(`Gemini API 429 Rate Limit Exceeded: ${bodyText}`);
    }

    const delay = Math.min(suggestedMs ?? BASE_DELAY_MS * 2 ** attempt + Math.random() * 250, 4000);

    console.warn(`[genaiClient] ${label} got ${res.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    lastErr = new Error(`${label} error (${res.status}): ${bodyText}`);
    await sleep(delay);
  }

  throw lastErr;
}

class GenAIClient {
  constructor({
    apiKey = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_MODEL || "gemini-2.5-flash",
    embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  } = {}) {
    if (!apiKey) {
      console.warn("[genaiClient] GEMINI_API_KEY is not set — chat/embedding calls will fail.");
    }
    this.apiKey = apiKey;
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  /**
   * Single LLM call used by the agent loop. Supports Gemini function-calling
   * (tools) so the agent can decide which of the 4 security tools to invoke.
   * Retries automatically on rate limits / transient server errors.
   *
   * @param {Array<{role: string, parts: Array<object>}>} contents
   * @param {Array<object>} [tools] - Gemini functionDeclarations
   * @param {string} [systemInstruction]
   */
  async generate({ contents, tools, systemInstruction }) {
    const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents,
      ...(systemInstruction
        ? { systemInstruction: { role: "system", parts: [{ text: systemInstruction }] } }
        : {}),
      ...(tools ? { tools: [{ functionDeclarations: tools }] } : {}),
    };

    const res = await fetchWithRetry(
      () =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      { label: "Gemini API" }
    );

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const functionCalls = parts
      .filter((p) => p.functionCall)
      .map((p) => p.functionCall);

    const text = parts
      .filter((p) => typeof p.text === "string")
      .map((p) => p.text)
      .join("\n");

    // Gemini 3.x models attach a `thoughtSignature` to function-call parts.
    // It MUST be echoed back verbatim on the next turn's model-role content
    // or the API rejects the request (400 INVALID_ARGUMENT). Older 2.x
    // models simply omit this field, so this is a no-op for them.
    return { text, functionCalls, parts, raw: data };
  }

  /**
   * Embeddings for the semantic_search tool (MongoDB Atlas Vector Search).
   * Retries automatically on rate limits / transient server errors.
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    const url = `${GEMINI_API_BASE}/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;

    const res = await fetchWithRetry(
      () =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${this.embeddingModel}`,
            content: { parts: [{ text }] },
          }),
        }),
      { label: "Gemini embedding" }
    );

    const data = await res.json();
    return data?.embedding?.values || [];
  }
}

module.exports = { GenAIClient };
