const http = require('http');
const game = require('./game');

const PORT = 3000;

// Node calls this function once for EVERY request that arrives.
// request  = what the client asked for (we'll look inside it in Step 2)
// response = what we send back
let requestCounter = 0;

function handleRequest(request, response) {
    const url = new URL(request.url, 'http://localhost');
    const playerMove = url.searchParams.get('move');

    if (url.pathname !== '/favicon.ico') {
        requestCounter++;
        console.log(`Request #${requestCounter}: ${request.method} ${url.pathname} move=${playerMove}`);
    }

    if (request.method !== 'GET') {
        response.end('Only GET is supported\n');
    } else {
        if (url.pathname === '/play') {
            if (playerMove) {
                const responseData = {playerMove: '', computerMove: '', result: ''};
                response.setHeader('Content-Type', 'application/json');

                const computerMove = game.pickComputerMove();
                responseData.playerMove = playerMove;
                responseData.computerMove = computerMove;
                responseData.result = game.decideWinner(playerMove, computerMove);

                response.end(JSON.stringify(responseData) + '\n');
            } else {
                response.end('Please send a move, e.g. /play?move=rock\n');
            }

        } else {
            response.end('hello\n');
        }

    }
}

const server = http.createServer(handleRequest);

server.listen(PORT);
console.log(`Server listening on http://localhost:${PORT}`);
