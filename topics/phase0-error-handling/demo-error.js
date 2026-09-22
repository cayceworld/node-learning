const { loadNotes, NotesParseError } = require('../../src/storage');

try {
    loadNotes();
} catch (err) {
    if (err instanceof NotesParseError) {
        console.log('Handled cleanly:', err.message);
        console.log('Underlying cause:', err.cause.message);
    } else {
        throw err;
    }
}
