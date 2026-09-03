# Progress

## Current
Phase: 0 — Core
Module: Error Handling
Status: exercise pending

## Pending exercise
Working example already built and run: `storage.js` has a custom
`NotesParseError` class (`extends Error`, sets `this.name`, uses the
native `{ cause }` option to preserve the original error). `loadNotes()`
(sync) now catches `JSON.parse` failures and rethrows `NotesParseError`
instead of letting a raw `SyntaxError` crash the process.
`demo-error.js` corrupts `notes.json`, calls `loadNotes()`, and shows the
error caught cleanly via `err instanceof NotesParseError` (unrecognized
errors are re-thrown, not swallowed).

Exercise not yet done, resume here:
`loadNotesAsync()` in `storage.js` still has its old single `try/catch`
around both the read and the parse, so a corrupt-JSON `SyntaxError` falls
through the `ENOENT` check and gets re-thrown raw (same bug the sync
version had before the fix). Task: make `loadNotesAsync` throw
`NotesParseError` (with `cause`) on bad JSON, while still returning `[]`
on a missing file (`ENOENT`) — decide whether one `try/catch` around both
operations can distinguish the two failure modes, or whether the read and
the parse need to be separated.

Review the solution when brought back, then move to Streams/Buffers
(remaining Phase 0 topics: Events, Buffers, Streams — Streams/Buffers
tied together via the large-file readFile-vs-Stream milestone, Events
separately).

## Completed
- Phase 0: Modules — `storage.js` exports `loadNotes`/`saveNotes` via
  `module.exports`, required from `notes.js`. Covered CommonJS
  require/module.exports, core vs. relative module resolution, module
  caching. Exercise: implement `saveNotes` with `fs.writeFileSync` +
  `JSON.stringify(notes, null, 2)`. Bugs hit and fixed: `JSON.stringify`
  arg order, `module.exports` overwrite instead of merge, array-vs-object
  call-site mismatch.
- Phase 0: Filesystem API (sync vs async) — `loadNotesAsync()` in
  `storage.js` using `fs/promises`, try/catch on `err.code === 'ENOENT'`
  instead of `existsSync` + read (avoids check-then-read race);
  `demo-async.js` proves the call is non-blocking. Exercise: added
  `saveNotesAsync(notes)` (`fsp.writeFile`) and `demo-async2.js`
  (`async function main()`, awaits save then load, proving read happens
  only after write resolves). Bugs hit and fixed: used callback-based
  `fs.writeFile` instead of `fsp.writeFile` so there was nothing to
  `await`; passed the wrong callback shape (`saveNotes` instead of an
  error-first `(err) => {}`) to `fs.writeFile`; `main()` had no `return`
  so it always resolved `undefined`; redundant `.then()` mixed with
  `await` inside `main()` — clarified `await`/try-catch is for inside
  `async function`s, `.then()`/`.catch()` is for code that isn't.

## Not started yet
Phase 0 remainder (Filesystem API exercise in progress, then Async
programming details, Events, Buffers, Streams, Error Handling), Phase 1
(Package Managers, CLI, Debugging, Profiling), Phase 2 (Network/API),
Phase 3 (Data), Phase 4 (Security), Phase 5 (Quality), Phase 6 (Scale),
Phase 7 (Ship).