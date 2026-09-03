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