# Progress

## Current
Phase: 0 — Core
Module: Filesystem API (async variants, error handling)
Status: exercise pending

## Pending exercise
Continue the Filesystem API module (sync vs async, error-first callbacks
vs promises, ENOENT handling). Working example already built and run:
`storage.js` has `loadNotesAsync()` (using `fs/promises`, try/catch on
`err.code === 'ENOENT'` instead of `existsSync` + read, to avoid a
check-then-read race); `demo-async.js` shows the call is non-blocking
(`.then()` callback fires after synchronous code that follows the call).

Exercise not yet done, resume here:
1. Add `saveNotesAsync(notes)` to `storage.js` — async function using
   `fsp.writeFile`, same `JSON.stringify(notes, null, 2)` formatting as
   the sync `saveNotes`. Export it from `module.exports`.
2. Write a new script `demo-async2.js` with an `async function main() {...}`
   (called at the end, not `.then()` chaining) that: awaits
   `saveNotesAsync` with one new note, then awaits `loadNotesAsync`, then
   logs the result — proving the read happens only after the write
   resolves.

Review the solution when brought back, then continue to Error Handling
(remaining Phase 0 Filesystem topic) before moving to Streams/Buffers.

## Completed
- Phase 0: Modules — `storage.js` exports `loadNotes`/`saveNotes` via
  `module.exports`, required from `notes.js`. Covered CommonJS
  require/module.exports, core vs. relative module resolution, module
  caching. Exercise: implement `saveNotes` with `fs.writeFileSync` +
  `JSON.stringify(notes, null, 2)`. Bugs hit and fixed: `JSON.stringify`
  arg order, `module.exports` overwrite instead of merge, array-vs-object
  call-site mismatch.

## Not started yet
Phase 0 remainder (Filesystem API exercise in progress, then Async
programming details, Events, Buffers, Streams, Error Handling), Phase 1
(Package Managers, CLI, Debugging, Profiling), Phase 2 (Network/API),
Phase 3 (Data), Phase 4 (Security), Phase 5 (Quality), Phase 6 (Scale),
Phase 7 (Ship).