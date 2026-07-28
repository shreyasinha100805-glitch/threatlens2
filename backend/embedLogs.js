// embedLogs.js
// Generates a Gemini embedding (gemini-embedding-001, 3072 dims by default) for every log event that
// doesn't have one yet, and stores it back on the document for use with
// MongoDB Atlas Vector Search (see mongoMCP.js / tools.semantic_search).
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { GenAIClient } = require("./genaiClient");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "threatlens";

function toEmbeddingText(doc) {
  return [doc.eventType, doc.severity, doc.sourceIp, doc.targetHost, doc.description]
    .filter(Boolean)
    .join(" | ");
}

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  const genai = new GenAIClient();

  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection("security_logs");

    const docs = await collection.find({ embedding: { $exists: false } }).toArray();
    console.log(`Found ${docs.length} events without embeddings.`);

    for (const doc of docs) {
      const embedding = await genai.embed(toEmbeddingText(doc));
      await collection.updateOne({ _id: doc._id }, { $set: { embedding } });
      console.log(`Embedded ${doc.eventId} (${embedding.length} dims)`);
    }

    console.log("Done. Create an Atlas Vector Search index named 'vector_index' on the 'embedding' field to enable semantic_search.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Embedding generation failed:", err);
  process.exit(1);
});
