const fs = require('fs');
const fsp = require('fs/promises');

const FILE_PATH = './notes.json';

function loadNotes() {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
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

module.exports = { loadNotes, saveNotes, loadNotesAsync };