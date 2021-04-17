module.exports = class Opponent extends require('events').EventEmitter {

    /**
     * Game opponent constructor 
     * @param {String} name Opponent's name.
     * @param {Number} id Opponent's ID.
     * @param {String} icon Opponent's icon (URL to image).
     */
    constructor(name, id, icon) {

        // Setup emitter
        super();

        // Data
        this.name = name;
        this.id = id;
        this.icon = icon || 'https://cdn.discordapp.com/attachments/815492895846694912/832621182310023168/unknown.png';

        // Data verification
        if(this.name == undefined || this.id == undefined) throw new Error(`Invalid player data | ${JSON.stringify(this)}`);

    }

}