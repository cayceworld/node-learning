const { loadNotesAsync } = require('../../src/storage');

console.log('1: calling loadNotesAsync()');
loadNotesAsync().then((notes) => {
    console.log('3: notes arrived:', notes);
});
console.log('2: this line runs before the notes arrive');