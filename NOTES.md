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