# Build with Gemini XPRIZE — Submission Checklist for ThreatLens

This maps the Official Rules' Submission Requirements to what this repo
already gives you vs. what only *you* (running the actual business) can
supply. Nothing about revenue, users, or expenses can be filled in by code —
it has to reflect what really happened during the Submission Period
(May 19 – Aug 17, 2026).

See `RESOURCES.md` for the official Google Cloud free trial, Antigravity,
orientation videos, FAQ/Discord, and the P&L template linked below.

## Already covered by this repo
- [x] Category selection → **Entrepreneurship & Job Creation**
- [x] Uses at least one Google Cloud product → Gemini API + Vertex AI embeddings (+ optionally Cloud Run/Firebase Hosting)
- [x] LLM functionality uses the Gemini API for at least one call → every `/chat` turn (`backend/genaiClient.js`)
- [x] Public code repository with all source (this repo)
- [x] Explanation of how AI transforms the workflow → `README.md` "AI-Native Operations" section + demo video script below

## You still need to supply (per Official Rules §4)
- [ ] **Text description** tying the Project to the Category (draft a paragraph from the README's "Why this fits" section, in your own words)
- [ ] **Demo video** (<3 min, publicly visible on YouTube/Vimeo/Youku) showing ThreatLens running live — no third-party trademarks or copyrighted music unless licensed
- [ ] **Total Revenue** earned from arms-length third-party customers, in USD, during the Hackathon period
- [ ] **Revenue by Month** — May / June / July / August 2026 breakdown
- [ ] **Total Expenses** — hosting, Gemini API usage, contractor fees, etc., with a description of what each covers
- [ ] **Marketing/Customer Acquisition Spend** — disclose even if $0
- [ ] **Related-Party Revenue** — anything from team members, family, or pre-existing customers, reported separately
- [ ] **User evidence** — real user count, a high-level breakdown of who they are, and testimonials (with their consent to share)
- [ ] **Evidence the product is running** — Cloud Run logs, MongoDB Atlas usage dashboards, `/threats/recent` screenshots, API usage records
- [ ] **P&L**, filled out from the Hackathon's provided template and uploaded with the submission
- [ ] Corporate ID, if entering as an Organization
- [ ] Testing access — a live URL or credentials so judges can use ThreatLens directly

## A note on honesty
The Official Rules explicitly require arms-length, real revenue and real
users, and separately call out related-party revenue for disclosure — the
judging criteria weight actual business viability, not simulated numbers.
Treat the checklist above as a to-do list for actually running ThreatLens as
a business (e.g. selling it to a few early-stage founders or dev teams you
know aren't team members/family) rather than something to backfill with
invented figures.
