const fs = require('fs');
const path = require('path');

const stream = fs.createReadStream(path.join(__dirname, '../../notes-api/notes.json'));

stream.on('data', (chunk)=> {
    console.log(chunk.toString());
})