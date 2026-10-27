# Node.js Learning Progress

## Now
**Stage B — Rock-Paper-Scissors server**, step 1: minimal server that answers "hello"
Status: not started · Pending exercise: none
(Tutor: begin with a 3-question recall check on Stage A: `process.argv`, `NaN`/`Number.isInteger`, exit codes.)

## Roadmap
Target dates: not set yet (add once weekly study hours are known).

### Stage 0 — Notes API foundations (done earlier with the tutor)
- [x] Modules — `storage.js` / `notes.js`, `module.exports`, `require`
- [x] Filesystem API — sync vs async, `fs/promises`, `ENOENT` handling
- [x] Error Handling — custom `NotesParseError`, `{ cause }`, `instanceof`

### Stage A — Message Mixer (modules in a mini program) · folder `message-mixer/`
- [x] Step 1 — Word lists split into modules — `nouns.js`, `verbs.js`, `adjectives.js` each export an array
- [x] Step 2 — One entry file combining them — `index.js` builds random sentences with `pickRandom()` + `makeSentence()`
- [x] Step 3 — Sentence count from `process.argv` — `node index.js 3` prints 3 sentences
- [x] Step 4 — Bad input -> clear error message — `parseCount()` throws `InvalidCountError`, usage hint, exit code 1

### Stage B — Rock-Paper-Scissors server (HTTP) · folder `rps-server/`
- [ ] Step 1 — Minimal server that answers "hello"
- [ ] Step 2 — Read URL and method
- [ ] Step 3 — Parse the query string
- [ ] Step 4 — Game logic in its own module
- [ ] Step 5 — JSON response with correct `Content-Type`
- [ ] Step 6 — 400 / 404 errors
- [ ] Step 7 — Read a POST body (Buffers, Streams, Events)

### Stage C — Task/Notes API, EPAM colleague's list (steps get defined when reached)
- [ ] Phase 0 remainder: Buffers, Streams (large-file readFile vs Stream), Events
- [ ] Phase 1 Tooling: Package Managers, CLI, Debugging, Profiling
- [ ] Phase 2 Network/API: Network, Frameworks (Express/Fastify), Node.js API, Libs
- [ ] Phase 3 Data: Database Experience, ORM/ODM
- [ ] Phase 4 Security: Security, Security Libs, Crypto
- [ ] Phase 5 Quality: Testing, Loggers
- [ ] Phase 6 Scale: Performance, Multithreading, Clusterization, V8
- [ ] Phase 7 Ship: Service Development

## Shaky topics (re-check later)
- `NaN` is of type `'number'` — `typeof` can't detect bad numeric input
- `util.promisify` — idea understood, needed many explanations; low priority
- Event loop ordering (`setImmediate` vs `setTimeout` vs I/O callbacks)
- Streams: Writable, `pipe`, backpressure not covered yet
- Buffers / Streams / Events: theory only, no own code yet

## Background (theory only, little own code)
Codecademy "Learn Node.js" free part + chat: back-end basics, Node as a
runtime (V8 + host objects), REPL, core modules (console, process, os),
require vs import, EventEmitter, Buffers and encodings, setImmediate,
Error types / `err.code` / error-first callbacks, stdin/stdout, Streams
started (Readable, data/end, chunks).

---

## Detailed log (tutor reference — what was built and which bugs were hit)

- Phase 0: Modules — `storage.js` exports `loadNotes`/`saveNotes` via `module.exports`, required from `notes.js`. Covered CommonJS require/module.exports, core vs. relative module resolution, module caching. Exercise: implement `saveNotes` with `fs.writeFileSync` + `JSON.stringify(notes, null, 2)`. Bugs hit and fixed: `JSON.stringify` arg order, `module.exports` overwrite instead of merge, array-vs-object call-site mismatch.
- Phase 0: Filesystem API (sync vs async) — `loadNotesAsync()` in `storage.js` using `fs/promises`, try/catch on `err.code === 'ENOENT'` instead of `existsSync` + read (avoids check-then-read race); `demo-async.js` proves the call is non-blocking. Exercise: added `saveNotesAsync(notes)` (`fsp.writeFile`) and `demo-async2.js` (`async function main()`, awaits save then load, proving read happens only after write resolves). Bugs hit and fixed: used callback-based `fs.writeFile` instead of `fsp.writeFile` so there was nothing to `await`; passed the wrong callback shape (`saveNotes` instead of an error-first `(err) => {}`) to `fs.writeFile`; `main()` had no `return` so it always resolved `undefined`; redundant `.then()` mixed with `await` inside `main()` — clarified `await`/try-catch is for inside `async function`s, `.then()`/`.catch()` is for code that isn't.
- Phase 0: Error Handling — custom `NotesParseError` class (`extends Error`, sets `this.name`, uses native `{ cause }`) in `storage.js`. `loadNotes()` (sync) separates the `existsSync` check from the parse so a corrupt file throws `NotesParseError` instead of a raw `SyntaxError`; `demo-error.js` proves it's caught cleanly via `err instanceof NotesParseError` (unrecognized errors rethrown, not swallowed). Exercise: fixed `loadNotesAsync()`, which originally wrapped both `readFile` and `JSON.parse` in one `try/catch` so a corrupt-JSON `SyntaxError` fell through the `ENOENT` check unwrapped. Solution: nest a second `try/catch` around just `JSON.parse` that wraps parse failures into `NotesParseError`; the outer `catch` still branches only on `err.code === 'ENOENT'`, so the rethrown `NotesParseError` (no `.code`) passes through unchanged. Verified against both a corrupt-JSON file and a missing file. Bug hit and fixed: first draft's inner `catch (e)` passed the wrong variable (`err`, out of scope) into `{ cause: err }` instead of `{ cause: e }`.
- Stage A Step 1: Word lists as data modules — `message-mixer/nouns.js` (starter), `verbs.js`, `adjectives.js` each `module.exports = [...]` an array; `index.js` requires and prints all three. Done correctly first try; only leftover TODO comments and a missing `;`. Recall check: Q1 ok (one `module.exports` object), Q2 missed (didn't recall `existsSync`) — re-explained check-then-read race, then answered correctly; Q3 right idea, imprecise (outer catch checks `.code`, NotesParseError has none).
- Stage A Step 2: Entry file — `message-mixer/index.js` requires the three word modules; starter gave `pickRandom(list)`, user wrote `makeSentence()` (string concatenation, "The adj noun verb the adj noun."). First draft missed the final period (user didn't know the English word "period" — explain English terms simply); fixed and cleaned up TODO comments.
- Stage A Step 3: `process.argv` — `Number(process.argv[2])` + `for` loop prints N sentences. Bug: added `if (typeof targetCalls === 'number')` guard, which is always true (`typeof NaN === 'number'`); with no/bad arg it silently printed nothing. Used as the motivation for Step 4.
- Stage A Step 4: Input validation — starter gave `InvalidCountError`, try/catch with `console.error` + `process.exitCode = 1`; user wrote `parseCount(arg)`: `undefined` check first, then `!Number.isInteger(count)`, then `count < 1`. First draft left a debug `console.log(count)` and missing semicolons; fixed, and the error message now includes the bad value. Note: tutor replaced the user's Step 3 `if (typeof ...)` block in the Step 4 starter without discussing it first — user objected. Always review/discuss the user's own code before replacing it in a starter.
