# AI Agent Context / Memory

This folder is the long-lived memory for AI agents working on Taleem ka Safar.
Unlike `.kiro/steering/` (which is auto-loaded guidance on conventions), this is
the **working journal**: what's been decided, what's done, and where we left off.

## How to use (for agents)
1. **At the start of a task**, read `progress.md` and `decisions.md` to get
   current state before exploring the codebase.
2. **As you make meaningful decisions** (schema, libraries, architecture),
   append to `decisions.md` with a date.
3. **When you finish a chunk of work**, update `progress.md` (what's done,
   what's next).

## Files
- `progress.md` — running status: done / in-progress / next steps.
- `decisions.md` — architectural & technical decisions with rationale + date.

Keep entries short and factual. This is a journal, not documentation.
