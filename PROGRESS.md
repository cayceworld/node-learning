# Progress

## Current
Phase: 0 — Core
Module: Buffers & Streams
Status: not started

## Pending exercise
None.

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
- Phase 0: Error Handling — custom `NotesParseError` class (`extends
  Error`, sets `this.name`, uses native `{ cause }`) in `storage.js`.
  `loadNotes()` (sync) separates the `existsSync` check from the parse so
  a corrupt file throws `NotesParseError` instead of a raw `SyntaxError`;
  `demo-error.js` proves it's caught cleanly via
  `err instanceof NotesParseError` (unrecognized errors rethrown, not
  swallowed). Exercise: fixed `loadNotesAsync()`, which originally wrapped
  both `readFile` and `JSON.parse` in one `try/catch` so a corrupt-JSON
  `SyntaxError` fell through the `ENOENT` check unwrapped. Solution: nest
  a second `try/catch` around just `JSON.parse` that wraps parse failures
  into `NotesParseError`; the outer `catch` still branches only on
  `err.code === 'ENOENT'`, so the rethrown `NotesParseError` (no `.code`)
  passes through unchanged. Verified against both a corrupt-JSON file and
  a missing file. Bug hit and fixed: first draft's inner `catch (e)`
  passed the wrong variable (`err`, out of scope) into
  `{ cause: err }` instead of `{ cause: e }`.

## Not started yet
Phase 0 remainder (Buffers, Streams — including the large-file
readFile-vs-Stream milestone; Events), Phase 1 (Package Managers, CLI,
Debugging, Profiling), Phase 2 (Network/API), Phase 3 (Data), Phase 4
(Security), Phase 5 (Quality), Phase 6 (Scale), Phase 7 (Ship).
