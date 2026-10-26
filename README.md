# Task/Notes API — Node.js Learning Project

A single project that grows step by step while working through a
Node.js learning plan, using Claude Code as an interactive tutor.

## Files

- **CLAUDE.md** — the tutor role and full curriculum (topics, phases,
  project milestones, teaching loop), loaded automatically by Claude
  Code.
- **PROGRESS.md** — current state: active phase/module, any pending
  exercise, and what's already completed. Updated by the tutor after
  each module so sessions can resume where they left off.
- **SUMMARY.md** — compact English study notes appended by the tutor
  after each module.

## How to use

`CLAUDE.md` applies to every Claude Code session in this folder.

1. Keep this folder as your project root and run Claude Code inside it.
2. Run `claude` in this folder and say "start".
3. Work through the concept → example → exercise → review loop for each
   module.
4. Stop anytime — `PROGRESS.md` will reflect exactly where you left off.
5. Next time, repeat step 2; the tutor resumes from the pending exercise
   or the next module, without re-asking what to learn.

## Project scope

The project evolves through 8 phases, from a plain CLI script with no
network layer up to a small backend service with a database, auth,
tests, logging, and performance/scaling work. The full breakdown is in
`CLAUDE.md`.

## Status

Not started yet — see `PROGRESS.md`.
