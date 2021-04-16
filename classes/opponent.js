module.exports = class Opponent {

    constructor(opts) {

        this.name = 'name' in opts ? opts.name : null;
        if(this.name == null) throw new Error('No name provided');

        this.id = 'id' in opts ? opts.id : 0;
        this.computer = 'computer' in opts ? opts.computer : false;

    }

    on_turn = (board) => Promise.reject();

}