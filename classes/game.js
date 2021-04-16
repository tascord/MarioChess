const { Chess } = require("chess.js");
const { Message, MessageEmbed, GuildMember, Guild } = require("discord.js");
const Opponent = require('./opponent');
const { channel_identifier } = require('../constants')

class Game {

    /**
     * Create a chess game
     * @param {Array<Opponent>} players Chess players. 2 required, first supplied is white.
     * @param {Guild} guild Guild in which chess match is taking place.
     * @param {String} opening Custom FEN opening. 
     */
    constructor(players, guild, opening = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1') {

        // Players
        this.players = {
            white: players[0],
            black: players[1]
        }

        // Throw errors (for funsies)
        if (!this.players.white || !this.players.black) throw new Error('Invalid players provided');

        // Message to edit (if sent)
        this.message = null;

        // Chess.js game
        this.game = new Chess(opening);
        this.game.header('White', this.players.white.name, 'Black', this.players.black.name);

        // Guild
        this.guild = guild;

        // Create the channel
        this.guild.channels.create(`${this.players.white.name}-vs-${this.players.black.name}`).then(channel => {

            this.channel = channel;
            this.channel.setTopic(channel_identifier());

            // Send header
            const embed = new MessageEmbed()
                .setTitle(`Chess game — ${this.players.white.name} vs ${this.players.black.name}.`)
                .setColor('#ff006a')
                .setTimestamp()
                .setDescription(`A new game is afoot; ${this.players.white.name} [White] vs ${this.players.black.name} [Black].`);

            // this.channel.send(embed);
            this.send_board();

        });

        // Initiate game
        this.players.white.on_turn(this.game)
            .then((move, cb) => cb(this.__raw_move(move)))
            .catch(() => { });

    }

    /**
     * Handle move messages from discord
     * @param {Message} message 
     */
    move = message => {

        if (message.channel !== this.channel) return;

        // Helper
        const timed_delete = response => setTimeout(() => {
            message.delete();
            response.delete()
        }, 2000);

        // Move
        let response = this.__raw_move(message.content, message.author.id);
        if (response !== true) return message.reply(response).then(timed_delete);

        // Delete move message
        if (message.deletable) message.delete();
        else this.message = null;

    }

    __raw_move = (move, id) => {

        // Ensure correct turn
        let turn = this.game.turn();
        if ((id == this.players.white.id && turn != 'w') || (id == this.players.black.id && turn != 'b')) return 'Invalid incorrect turn';

        // Ensure valid move
        if (this.game.moves().indexOf(move) == -1) return 'Invalid move';

        // Move
        this.game.move(move);

        // Game over
        if (this.game.game_over()) {

            let winner =
                this.game.in_draw() ? 'Draw!' :
                this.game.in_stalemate() ? 'Stalemate!' :
                this.game.turn() == 'b' ? this.players.white.name + ' wins!' : this.players.black.name + ' wins!'

            const embed = new MessageEmbed()
                .setTitle(`Chess game — ${winner}`)
                .setColor('#ff006a')
                .setTimestamp()

                .setDescription('```' + this.game.ascii() + '```')
                .addField('Game', this.game.pgn());
                
            if(this.message) this.message.edit(embed);
            return true;

        }

        // Update/Send board
        this.send_board();

        // Computer responses
        (this.game.turn() == 'w' ?
            this.players.white :
            this.players.black).on_turn(this.game)

            .then((move, cb) => cb(this.__raw_move(move)))
            .catch(() => { });

        return true;

    }

    send_board = async () => {

        // Update board
        const embed = new MessageEmbed()
            .setTitle(`Chess game — ${this.game.turn() == 'w' ? this.players.white.name : this.players.black.name} to move.`)
            .setColor('#ff006a')
            .setTimestamp()

            .setDescription('```' + this.game.ascii() + '```')
            .addField('Valid next moves', '- ' + this.game.moves().join('\n- '));

        if (!this.channel) return;
        if (!this.message) this.channel.send(embed).then(message => this.message = message);
        else this.message.edit(embed);

    }

}

const id_string = ([...ids]) => ids.sort().join('-');

exports.id_string = id_string;
exports.Game = Game;