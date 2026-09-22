const fs = require('fs');
const path = require('path');

const stream = fs.createReadStream(path.join(__dirname, '../../src/notes.json'));

stream.on('data', (chunk)=> {
    console.log(chunk.toString());
})