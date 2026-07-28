// mongoMCP.js
// A lightweight MongoDB "MCP" tool server: exposes generic database
// operations as callable tools (find_documents, aggregate_documents,
// count_documents, get_collections), independent of the 4 higher-level
// security-agent tools in tools.js. This mirrors the MCP protocol shape
// (list tools / execute tool) without requiring the full MCP SDK.

const TOOL_DEFINITIONS = [
  {
    name: "find_documents",
    description: "Find MongoDB documents in a collection with an optional filter, projection, sort, and limit.",
    parameters: {
      collection: "string (required)",
      filter: "object (optional, default {})",
      projection: "object (optional)",
      sort: "object (optional)",
      limit: "number (optional, default 20, max 200)",
    },
  },
  {
    name: "aggregate_documents",
    description: "Run a MongoDB aggregation pipeline against a collection.",
    parameters: {
      collection: "string (required)",
      pipeline: "array (required)",
    },
  },
  {
    name: "count_documents",
    description: "Count documents in a collection matching an optional filter.",
    parameters: {
      collection: "string (required)",
      filter: "object (optional, default {})",
    },
  },
  {
    name: "get_collections",
    description: "List all collection names in the database.",
    parameters: {},
  },
];

class MongoMCPServer {
  constructor(db) {
    this.db = db;
  }

  listTools() {
    return TOOL_DEFINITIONS;
  }

  async execute(toolName, params = {}) {
    switch (toolName) {
      case "find_documents": {
        const { collection, filter = {}, projection, sort, limit = 20 } = params;
        this._requireCollection(collection);
        const cursor = this.db
          .collection(collection)
          .find(filter, projection ? { projection } : undefined)
          .limit(Math.min(limit, 200));
        if (sort) cursor.sort(sort);
        return await cursor.toArray();
      }
      case "aggregate_documents": {
        const { collection, pipeline = [] } = params;
        this._requireCollection(collection);
        if (!Array.isArray(pipeline)) throw new Error("pipeline must be an array");
        return await this.db.collection(collection).aggregate(pipeline).toArray();
      }
      case "count_documents": {
        const { collection, filter = {} } = params;
        this._requireCollection(collection);
        return await this.db.collection(collection).countDocuments(filter);
      }
      case "get_collections": {
        const collections = await this.db.listCollections().toArray();
        return collections.map((c) => c.name);
      }
      default:
        throw new Error(`Unknown MCP tool: ${toolName}`);
    }
  }

  _requireCollection(collection) {
    if (!collection || typeof collection !== "string") {
      throw new Error("collection (string) is required");
    }
  }
}

module.exports = { MongoMCPServer, TOOL_DEFINITIONS };
