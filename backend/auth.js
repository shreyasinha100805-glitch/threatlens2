// auth.js
// Real account authentication: bcrypt-hashed passwords, JWT sessions.
// Replaces the anonymous browser-generated clientId with a persistent
// account that survives across devices/browsers once logged in.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const JWT_EXPIRY = "30d";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!process.env.JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET is not set — using an insecure development default. " +
      "Set a real random JWT_SECRET in backend/.env before deploying anywhere real users can reach."
  );
}

class Auth {
  constructor(db) {
    this.users = db.collection("users");
  }

  async ensureIndexes() {
    await this.users.createIndex({ email: 1 }, { unique: true });
  }

  async signup({ email, password, companyName }) {
    if (!email || !EMAIL_RE.test(email)) {
      throw Object.assign(new Error("A valid email is required."), { status: 400 });
    }
    if (!password || password.length < 8) {
      throw Object.assign(new Error("Password must be at least 8 characters."), { status: 400 });
    }

    const existing = await this.users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw Object.assign(new Error("An account with that email already exists. Try logging in instead."), { status: 409 });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = {
      userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      companyName: companyName || null,
      createdAt: new Date(),
    };
    await this.users.insertOne(doc);

    return { token: this._sign(userId), user: this._publicUser(doc) };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw Object.assign(new Error("Email and password are required."), { status: 400 });
    }
    const user = await this.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw Object.assign(new Error("No account with that email. Check the address or sign up."), { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Incorrect password."), { status: 401 });
    }
    return { token: this._sign(user.userId), user: this._publicUser(user) };
  }

  async getUser(userId) {
    const user = await this.users.findOne({ userId });
    return user ? this._publicUser(user) : null;
  }

  _sign(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  _publicUser(doc) {
    return { userId: doc.userId, email: doc.email, companyName: doc.companyName };
  }

  /** Express middleware: requires a valid Bearer token, sets req.userId/req.userEmail. */
  requireAuth() {
    return (req, res, next) => {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: "Log in required.", authRequired: true });
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        next();
      } catch {
        return res.status(401).json({ error: "Your session has expired. Please log in again.", authRequired: true });
      }
    };
  }

  /** Like requireAuth, but doesn't reject — just sets req.userId if a valid token is present. */
  optionalAuth() {
    return (req, _res, next) => {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (token) {
        try {
          const payload = jwt.verify(token, JWT_SECRET);
          req.userId = payload.sub;
        } catch {
          // ignore — treated as anonymous
        }
      }
      next();
    };
  }
}

module.exports = { Auth };
