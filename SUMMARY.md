# Notes

## Modules (CommonJS)

```js
// storage.js
function loadNotes() { /* ... */ }
function saveNotes(notes) { /* ... */ }
module.exports = { loadNotes, saveNotes };

// notes.js
const { loadNotes, saveNotes } = require('./storage');
```

A module is a file with its own private scope; `module.exports` is the
object it shares, `require()` pulls it into another file. `require('fs')`
(no `./`) resolves a core module by name; `require('./storage')` resolves
by relative path. Each module is executed once and cached — later
`require()` calls for the same path return the same cached object, not a
fresh run.

`module.exports = {...}` **replaces** the whole exports object, it does
not merge with a previous assignment — reassigning it twice in one file
silently drops whatever the first assignment exported.

## Filesystem API: sync vs async

```js
// sync — blocks the event loop until the read finishes
const raw = fs.readFileSync(FILE_PATH, 'utf-8');

// async/promise — returns immediately, resolves later
async function loadNotesAsync() {
    try {
        const raw = await fsp.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}
```

A sync fs call parks Node's single JS thread until the OS finishes the
disk I/O; an async call hands the I/O to libuv's thread pool and returns
immediately, running the callback/resolving the promise later. Proven by
running code after the call before the result — it executes first.

Prefer try/catch on `err.code === 'ENOENT'` over `existsSync()` +
`readFile()` — checking then reading is a race (the file can vanish
between the two calls); try/catch checks and reads in one step.

## async/await vs .then()/.catch()

```js
async function main() {
    await saveNotesAsync([{ id: 3, text: 'write API' }]);
    return loadNotesAsync();
}

main().then((result) => console.log(result));
```

Inside an `async function`, use `await` + `try/catch` to consume a
promise — mixing in `.then()` there is legal but redundant, since `await`
already does that job. `.then()`/`.catch()` are for code that is *not*
itself inside an `async function` (a plain callback, top-level script
code) and so can't use `await`. A callback passed to a callback-style API
(e.g. `fs.writeFile`'s 3rd arg) must be an error-first `(err) => {...}`
function — passing an unrelated function there silently breaks (Node
calls it with the wrong argument shape).

## Error handling: custom Error classes + cause

```js
class NotesParseError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'NotesParseError';
    }
}

try {
    return JSON.parse(raw);
} catch (err) {
    throw new NotesParseError('Could not parse notes.json: invalid JSON', { cause: err });
}

// at the call site:
try {
    loadNotes();
} catch (err) {
    if (err instanceof NotesParseError) { /* handle it */ }
    else { throw err; } // don't swallow errors you don't recognize
}
```

Operational errors (missing file, corrupted data, bad input) get caught
and handled; programmer errors (bugs) should crash, not be silenced.
`super(message, { cause: err })` is native `Error` behavior (ES2022+)
that stores the original error as `.cause` for free. Only catch what you
know how to handle — re-throw anything else so bugs stay visible instead
of vanishing silently.

## Nested try/catch: telling apart two failure modes in one async flow

```js
async function loadNotesAsync() {
    try {
        const raw = await fsp.readFile(FILE_PATH, 'utf-8');
        try {
            return JSON.parse(raw);
        } catch (e) {
            throw new NotesParseError('...invalid JSON', { cause: e });
        }
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err; // rethrows NotesParseError untouched (no .code on it)
    }
}
```

`readFile` and `JSON.parse` can each fail for a different reason, and
they need different handling — `ENOENT` means "no file, return `[]`",
bad JSON means "wrap and throw". A `SyntaxError` from `JSON.parse` has no
`.code`, so it can't be mistaken for `ENOENT` in the outer `catch`; a
`NotesParseError` thrown from the inner `catch` propagates up through the
outer `catch` too, but `err.code === 'ENOENT'` is `undefined` for it, so
it falls through to `throw err` and comes out the other side unchanged.
## Data modules: exporting an array

```js
// verbs.js
module.exports = ['ate', 'bought', 'read', 'wrote', 'watched'];

// index.js
const verbs = require('./verbs'); // verbs is the array itself
```

`module.exports` can be any value, not just an object of functions.
Keeping data in its own module means adding words never touches the logic.

## Entry file: wiring modules together

```js
// index.js — run with `node index.js`
const nouns = require('./nouns');
function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }
console.log('The ' + pickRandom(nouns) + '...');
```

The entry file is the one you start with `node`; it requires the other
modules and does the visible work. The other modules only export, so
requiring them has no side effects.

## `process.argv`: reading CLI arguments

```js
// node index.js 3
process.argv; // ['/path/to/node', '/path/to/index.js', '3']
const count = Number(process.argv[2]); // 3 — args always arrive as strings
```

`process.argv` is a global array of the words typed in the terminal; your
own arguments start at index 2. Watch out: `Number('banana')` is `NaN`, and
`typeof NaN === 'number'`, so `typeof` can't tell good input from bad.

## Validating CLI input + exit codes

```js
function parseCount(arg) {
    const count = Number(arg);
    if (arg === undefined) throw new InvalidCountError('No argument was given.');
    if (!Number.isInteger(count)) throw new InvalidCountError(`${arg} is not a valid input.`);
    if (count < 1) throw new InvalidCountError('Argument is less than 1.');
    return count;
}
// in the catch: console.error(err.message); process.exitCode = 1;
```

Bad input should fail loudly, not silently: a clear message on the error
output, plus a non-zero exit code (`0` = success, anything else = failure)
so scripts and CI can tell the program failed.

## Minimal HTTP server

```js
const http = require('http');
let requestCounter = 0; // outside: survives between requests

function handleRequest(request, response) {
    requestCounter++;
    console.log(`Request #${requestCounter}`); // shows in the SERVER terminal
    response.end('hello\n');                   // shows in the CLIENT (curl/browser)
}

http.createServer(handleRequest).listen(3000);
```

A server doesn't exit: `listen` keeps it waiting, and Node calls the handler
once per incoming request (like an event listener). `localhost` means "this
machine"; other devices need its LAN IP (`hostname -I`) and an open firewall
port. Restart the server after every code change.

## Reading the request: `request.url` and `request.method`

```js
function handleRequest(request, response) {
    console.log(`${request.method} ${request.url}`); // e.g. "GET /play"
    if (request.method !== 'GET') {
        response.end('Only GET is supported\n');
    } else {
        response.end('hello\n');
    }
}
```

`request.url` is the path after host and port (`/play`, `/favicon.ico`), and
`request.method` is the uppercase action word (`GET`, `POST`, ...). Browsers
also ask for `/favicon.ico` (the tab icon) on their own; curl doesn't.

## Query string: `new URL` + `searchParams`

```js
// request.url === '/play?move=rock'
const url = new URL(request.url, 'http://localhost'); // base fills in the missing host
url.pathname;                       // '/play'
const move = url.searchParams.get('move'); // 'rock', or null if missing, '' if "?move="
if (move) { /* null and '' are both falsy */ }
```

The query string is the `key=value&key2=value2` part after `?`: extra details
for the request. `request.url` contains it, so compare paths with
`url.pathname`, never with the raw `request.url`.

## Logic module: rules separate from HTTP

```js
// game.js: knows nothing about request/response
function decideWinner(playerMove, computerMove) {
    if (playerMove === computerMove) return 'draw';
    if (playerMove === 'rock' && computerMove === 'scissors' ||
        playerMove === 'paper' && computerMove === 'rock' ||
        playerMove === 'scissors' && computerMove === 'paper') return 'win';
    return 'lose';
}
module.exports = { MOVES, pickComputerMove, decideWinner };

// server.js: only reads the move and sends the answer
const game = require('./game');
```

Keeping the rules in their own module means you can test them without a
server: `node -e "const g = require('./game'); console.log(g.decideWinner('rock', 'scissors'))"`.
Careful: a comma inside `if (a, b, c)` is the comma operator and checks only
`c`. Use `||` for "or".

## JSON response: `Content-Type` header

```js
response.setHeader('Content-Type', 'application/json'); // before end()
response.end(JSON.stringify({ playerMove, computerMove, result }));
```

A response header is a `Name: value` line sent before the body that describes
it; `Content-Type` names the body's format. Set it only on responses that
really are JSON, or clients like `fetch(...).then(r => r.json())` will fail.
Check headers with `curl -i`.
