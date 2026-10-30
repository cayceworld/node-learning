// Rock-Paper-Scissors rules.
// This module knows nothing about HTTP: moves go in, a result comes out.
const MOVES = ['rock', 'paper', 'scissors'];

function pickComputerMove() {
    const index = Math.floor(Math.random() * MOVES.length);
    return MOVES[index];
}

// Returns 'win', 'lose' or 'draw', from the player's point of view.
function decideWinner(playerMove, computerMove) {
    if (playerMove === computerMove) {
        return 'draw'
    } else if (playerMove === 'rock' && computerMove === 'scissors' ||
        playerMove === 'paper' && computerMove === 'rock' ||
        playerMove === 'scissors' && computerMove === 'paper') {
        return 'win'
    } else {
        return 'lose'
    }
}

module.exports = {MOVES, pickComputerMove, decideWinner};
