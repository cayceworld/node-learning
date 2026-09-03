const fs = require('fs');
const fsp = require('fs/promises');

const FILE_PATH = './notes.json';

class NotesParseError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'NotesParseError';
    }
}

function loadNotes() {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch (err) {
        throw new NotesParseError(`Could not parse ${FILE_PATH}: file contains invalid JSON`, { cause: err });
    }
}

function saveNotes(notes) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2))
}

async function loadNotesAsync() {
    try {
        const raw = await fsp.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
}

async function saveNotesAsync(notes) {
    try {
        await fsp.writeFile(FILE_PATH, JSON.stringify(notes, null, 2))
    } catch (err) {
        throw err;
    }
}

module.exports = {loadNotes, saveNotes, loadNotesAsync, saveNotesAsync, NotesParseError};