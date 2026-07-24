# Bushel & Bone

*A dark alt-1800s survival management game. Stardew Valley × Oregon Trail × ethical horror.*

You inherit a plot of land and a promise. Grow crops. Buy farmhand clones grown by strange 1800s pseudo-science. Survive the winter. The land keeps a ledger of every kindness and every cruelty you spend on the vessels that work it — and when the ledger is heavy, the land collects.

## Status

**In design.** Code has not started. The foundational Game Design Document is complete (see `docs/GDD_v0.1.pdf`). Deep mechanics and narrative work is in progress.

## Structure

- `docs/` — design documents (GDD, mechanics bible, narrative bible, balance model)
- `context/` — project state files read by Claude sessions across machines
- `src/` — code (empty until deep design pass completes)
- `CLAUDE.md` — read by Claude Code at session start; carries context across machines

## Continuing work

This repo is designed for cross-machine continuity through Claude Code. Sync via git, open a new Claude session in the repo root, and Claude will read `CLAUDE.md` and pick up context automatically.

## Tech stack (planned)

Next.js 15 · React · TypeScript · Tailwind · Zustand + Immer · Drizzle · Neon · Better Auth · Vercel · Capacitor (iOS + Android)

## License

TBD.
