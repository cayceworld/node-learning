// Entry file: the one you run with `node index.js`.
// The word modules only export data; this file wires them together and prints.
const nouns = require('./nouns');
const verbs = require('./verbs');
const adjectives = require('./adjectives');

function pickRandom(list) {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

function makeSentence() {
    return 'The ' + pickRandom(adjectives) + ' ' + pickRandom(nouns) + ' ' + pickRandom(verbs) + ' the ' + pickRandom(adjectives) + ' ' + pickRandom(nouns) + '.';
}

class InvalidCountError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCountError';
    }
}

// Turns the raw CLI argument (a string or undefined) into a valid count.
function parseCount(arg) {
    const count = Number(arg);
    if (arg === undefined) {
        throw new InvalidCountError('No argument was given.');
    } else if (!Number.isInteger(count)) {
        throw new InvalidCountError(`${arg} is not a valid input.`);
    } else if (count < 1) {
        throw new InvalidCountError('Argument is less than 1.');
    }
    return count;
}

try {
    const count = parseCount(process.argv[2]);
    for (let i = 0; i < count; i++) {
        console.log(makeSentence());
    }
} catch (err) {
    if (err instanceof InvalidCountError) {
        console.error(err.message);
        console.error('Usage: node index.js <count>   (example: node index.js 3)');
        process.exitCode = 1;
    } else {
        throw err;
    }
}
