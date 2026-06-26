# AI Agent Context / Memory

This folder is the long-lived memory for AI agents working on Taleem ka Safar.
Unlike `.kiro/steering/` (which is auto-loaded guidance on conventions), this is
the **working journal**: what's been decided, what's done, and where we left off.

## Two tiers (this is the important part)
Memory is split so sessions stay cheap on tokens:

- **Global context (committed, shared)** — the curated, durable record. Worth
  keeping for the team and for future sessions on any machine.
  - `progress.md` — running status: done / in-progress / next steps.
  - `decisions.md` — architectural & technical decisions with rationale + date.
  - `csv-cleanup-plan.md` — the data-pipeline running log.
- **Local context (gitignored, per-machine)** — a fast, volatile scratchpad for
  the current session. Read it FIRST to recover state cheaply, then read only
  the targeted files a task needs.
  - `local/session.md` — "where we left off" + quick facts + scratch notes.

## How to use (for agents)
1. **At the start of a task**, read `local/session.md` first, then
   `progress.md` + `decisions.md`. Do NOT re-scan the whole repo.
2. **During the task**, jot volatile notes in `local/session.md` (cheap, messy ok).
3. **As you make meaningful decisions** (schema, libraries, architecture),
   append to `decisions.md` with a date.
4. **When you finish a chunk of work**, promote durable facts from the local
   scratchpad up to `progress.md`, then trim `local/session.md` back down.

Keep entries short and factual. This is a journal, not documentation.
