const { Guild, PermissionOverwrites, Collection } = require("discord.js");
const { Chess } = require('chess.js');
const Opponent = require("./opponent");

module.exports = class Game {

    /**
     * Chess game constructor
     * @param {Object} players Players playing.
     * @param {Guild} guild Guild in which game will partake in.
     */
    constructor(players, guild) {

        // Setup basics
        this.players = players;
        this.guild = guild;

        // Verify basics
        if (this.guild == null || this.players == null ? true : this.players.white == null || this.players.black == null) throw new Error(`Invalid game data | ${JSON.stringify(this, null, 4)}`);

        // Create chess.js game
        this.game = new Chess();

        // Get server settings
        const servers = new (this.guild.client.services['data'].table)('mc_servers');
        const server = servers.get(this.guild.id);

        let category = server.settings['match_category'].value;
        category = this.guild.channels.cache.find(c => c.id == category && c.type == 'category');

        // Update invalid channel settings
        if (!category) {

            category = null;
            server.settings['match_category'].value = 'unset';
            servers.set(this.guild.id, server);

        }

        // Channel permissions        
        let permissions = category ? category.permissionOverwrites : new Collection();
        permissions.set(this.players.white.id, { id: this.players.white.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] });
        permissions.set(this.players.black.id, { id: this.players.black.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] });

        // Create channel
        this.guild.channels.create(`Chess-${Date.now()}`, {
            parent: category,
            reason: "New chess match started.",
            permissionOverwrites: permissions
        })
            .then(channel => this.channel = channel)
            .catch(console.warn);

    }

    /**
     * Make a move
     * @param {Opponent} player Player making move.
     * @param {String} move Move the player makes
     */
    __raw_turn = (player, move) => {

        

    }

    turn = (player, move) => {

    }

}