const {saveNotesAsync} = require('./storage');
const {loadNotesAsync} = require("./storage");

async function main() {
    await saveNotesAsync([{id: 3, text: 'write API', secret: 'internal-id-xyz'}])
    return loadNotesAsync();

}

main().then((result) => console.log(result));