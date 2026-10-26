const {loadNotes} = require('./storage');
const {saveNotes} = require('./storage');



saveNotes([
    { id: 1, text: 'buy bread', secret: 'internal-id-abc' },
    { id: 2, text: 'write API', secret: 'internal-id-xyz' }
])

const notes = loadNotes();
console.log('Notes:', notes);


