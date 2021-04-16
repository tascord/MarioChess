module.exports = class Toad extends require('../opponent') {

    constructor() {

        super({
            name: '[AI] Toad',
            id: 0,
            computer: true
        })

    }

    on_turn = (board) => new Promise((resolve, reject) => {

        console.trace('Move');

        let moves = board.moves();
        let move = moves.find(m => m.indexOf('+') > -1) || moves.find(m => m.indexOf('x') > -1) || moves[Math.floor(Math.random() * moves.length)];
        resolve(move, console.log);

    })

}