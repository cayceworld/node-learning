# Node.js Learning Progress

## Now
**Stage B — Rock-Paper-Scissors server**, step 5: JSON response with correct `Content-Type`
Status: not started · Pending exercise: none

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
- [x] Step 1 — Minimal server that answers "hello" — `server.js`: `http.createServer(handleRequest)`, logs `Request #N`, reached from phone via LAN IP
- [x] Step 2 — Read URL and method — logs `Request #N: GET /play`, skips counting `/favicon.ico`, non-GET gets "Only GET is supported"
- [x] Step 3 — Parse the query string — `new URL()` + `searchParams.get('move')`; `/play?move=rock` answers "You played: rock", missing/empty move gets a hint
- [x] Step 4 — Game logic in its own module — `game.js` exports `MOVES`, `pickComputerMove()`, `decideWinner()`; `/play?move=rock` answers "You: rock, computer: scissors -> win"
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
- Exit codes: didn't know what `process.exitCode` is for (re-explained, understood the CI case)
- `searchParams.get`: missing key -> `null`, empty `?move=` -> `''` (recall check said both `null`)
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
- Stage B Step 1: Minimal server — `rps-server/server.js`, `http.createServer(handleRequest)` + `server.listen(3000)`, user added module-level `requestCounter` (correctly outside the handler) and `response.end('hello\n')`. Recall check: Q1/Q2 ok, Q3 failed (exit codes; tutor had added `process.exitCode` in Stage A without explaining) — re-explained via CI, check answered correctly. Confusions resolved: expected logs without any request (handler is called by Node, not by our code; server vs client terminal); where `localhost` comes from; phone couldn't connect — first used tutor's example IP `192.168.1.25` (real one `192.168.0.130`, `hostname -I`), then `ufw` was active and dropped the connection; fixed with `sudo ufw allow 3000/tcp` (remind to remove later). Bugs: `'/n'` instead of `'\n'`, forgot to restart server after editing. Leftover: missing semicolons, counter declared between comment and function.
- Stage B Step 2: URL and method, done as two parts. Bridge question "why +2 per browser load?" — guessed "connection check, then response"; explained `/favicon.ico`. Part 1: `request.url`; task was log the path + don't count favicon. First draft did the favicon `if` but forgot to put the path in the log, and used an unneeded `.trim()` (explained URLs never contain raw spaces, `%20`). Part 2: `request.method`; log `GET /play`, non-GET answers a text message (status codes deferred to Step 6). Correct first try except typo `supporter`. Tutor didn't edit user's file this time — gave the change as a task instead (per memory rule). User skipped optional cleanup (semicolons/counter position) twice; told them it's their choice, stop mentioning it.
- Stage B Step 3: Query string — demoed `new URL(path, 'http://localhost')` via `node -e` (no file). Problem-first: `request.url` includes `?move=rock`, so `=== '/play'` breaks. User's task: parse URL, log pathname + move, favicon check on pathname, `/play` with/without move. First draft correct for all listed cases; bugs: `?move=` (empty string) passed the `!== null` check -> "You played: "; `searchParams.get('move')` called 4 times and a redundant `=== null` else-if. Fixed: `const move`, nested `if (url.pathname === '/play') { if (move) ... }` — falsy check covers `null` and `''`. Typo `supporter` from Step 2 fixed.
- Stage B Step 4: Logic module — tutor's starter `rps-server/game.js` gave `MOVES` + `pickComputerMove()`; user wrote `decideWinner(playerMove, computerMove)` and wired `require('./game')` into `server.js` (renamed `move` -> `playerMove`, plain-text answer). Learned `node -e` for quick module checks. Bug: joined the three win conditions with commas inside `else if (...)` -> comma operator, only the last condition counted (1 win out of 9 matchups instead of 3); fixed with `||`. Running server wasn't restarted after the fix (curl still gave `paper vs rock -> lose`). Recall check before the step: Q1 claimed `request.url === '/play'` doesn't fail (it does with a query string), Q2 ok, Q3 said `?move=` gives `null` (it's `''`) — re-explained with `node -e` output.
