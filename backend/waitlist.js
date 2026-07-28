// waitlist.js
// Captures real signups from the landing page into MongoDB. This is the
// "real user evidence" the hackathon submission requirements ask for —
// export this collection when filling out the P&L / user-evidence sections.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Waitlist {
  constructor(db) {
    this.collection = db.collection("waitlist_signups");
  }

  async add({ email, companyName, teamSize, source }) {
    if (!email || !EMAIL_RE.test(email)) {
      throw Object.assign(new Error("A valid email is required."), { status: 400 });
    }

    const doc = {
      email: email.toLowerCase().trim(),
      companyName: companyName || null,
      teamSize: teamSize || null,
      source: source || "landing_page",
      createdAt: new Date(),
    };

    // Idempotent on email — re-signing up updates instead of duplicating.
    await this.collection.updateOne(
      { email: doc.email },
      { $setOnInsert: { createdAt: doc.createdAt }, $set: { companyName: doc.companyName, teamSize: doc.teamSize, source: doc.source } },
      { upsert: true }
    );

    return doc;
  }

  async count() {
    return this.collection.countDocuments();
  }

  async list(limit = 200) {
    return this.collection
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = { Waitlist };
