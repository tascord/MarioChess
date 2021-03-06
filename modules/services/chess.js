const { GuildMember, Guild, Message } = require("discord.js");
const Opponent = require("./classes/opponent");
const Game = require('./classes/game');

const Games = {};

/**
 * Start a chess game between two Opponents/GuildMembers
 * @param {GuildMember|Opponent} white White player data.
 * @param {GuildMember|Opponent} black Black player data.
 * @param {Guild} guild Guild in which game is taking place.
 */
exports.start_game = (white, black, guild) => {

    let players = { white, black };

    // Create opponents
    if(!(players.white instanceof Opponent)) players.white = new Opponent(players.white.user.username, players.white.id, players.white.user.displayAvatarURL());
    if(!(players.black instanceof Opponent)) players.black = new Opponent(players.black.user.username, players.black.id, players.black.user.displayAvatarURL());

    Games[Object.keys(Games).length] = new Game(players, guild);

}

/**
 * Make a move from a discord.js message
 * @param {String} content Message content. 
 * @param {Message} message Message object.
 * @returns 
 */
exports.message = (content, message) => {

    let game = Object.entries(message.client.services.chess.Games).find(e => Object.entries(e[1].players).find(e => e[1].id == message.author.id));
    
    if(!game) return false;
    game = game[1];

    if(message.channel !== game.channel) return false;
    game.turn(Object.entries(game.players).find(e => e[1].id == message.author.id), content);

    return true;

}

exports.Games = Games;