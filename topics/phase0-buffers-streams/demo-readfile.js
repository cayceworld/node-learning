const fs = require('fs');
const path = require('path');

function mb(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

console.log('Before read, rss:', mb(process.memoryUsage().rss));

const data = fs.readFileSync(path.join(__dirname, 'big-notes.json'));

console.log('Loaded whole file as one Buffer, length:', mb(data.length));
console.log('After read, rss:', mb(process.memoryUsage().rss));
