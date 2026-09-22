const fs = require('fs');
const path = require('path');

function mb(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

console.log('Before stream, rss:', mb(process.memoryUsage().rss));

const stream = fs.createReadStream(path.join(__dirname, 'big-notes.json'), { highWaterMark: 64 * 1024 });

let chunkCount = 0;
let totalBytes = 0;

stream.on('data', (chunk) => {
    chunkCount++;
    totalBytes += chunk.length;
    if (chunkCount <= 3 || chunkCount % 200 === 0) {
        console.log(
            `chunk #${chunkCount}, size: ${chunk.length} bytes, rss: ${mb(process.memoryUsage().rss)}`
        );
    }
});

stream.on('end', () => {
    console.log('--- stream ended ---');
    console.log('Total chunks:', chunkCount);
    console.log('Total bytes read:', mb(totalBytes));
    console.log('After stream, rss:', mb(process.memoryUsage().rss));
});

stream.on('error', (err) => {
    console.error('Stream error:', err.message);
});
