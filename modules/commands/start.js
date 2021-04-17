const { Message } = require('discord.js');

exports.description = "This command starts a chess game with the mentioned user!";
exports.example = "start @Clyde#0000";
exports.usage = "start <user>";
exports.group = "chess";

exports.alias = [];
exports.args = [
    {
        name: 'Member',
        description: 'Member you wish to challenge',
        type: 'member',
        message: 'Please provide a valid member to challenge.'
    }
]

/**
 * Mario chess start game command
 * This command starts a chess game with the mentioned user!
 * @param {Array} args Message arguments
 * @param {Message} message Discord message reference
 * @param {Xeno} xeno Xeno framework reference
 */
exports.run = (args, message, xeno) => new Promise((resolve, reject) => {

    /**
     * Error handling
     * @param {Error} error 
     */
    const error = (error) => {
        if (error instanceof (Error)) xeno.logger.warn(`[CMD ${__filename}] Error: '${error.name}' | ${error.message}\n${error.stack || 'No stacktrace.'}`);
        reject(['Error starting chess match', error]);
    }

    message.client.services['chess'].start_game(message.member, args[0], message.guild);

});