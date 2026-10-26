const {saveNotesAsync} = require('../../notes-api/storage');
const {loadNotesAsync} = require("../../notes-api/storage");

async function main() {
    await saveNotesAsync([{id: 3, text: 'write API', secret: 'internal-id-xyz'}])
    return loadNotesAsync();

}

main().then((result) => console.log(result));