const { Message, MessageEmbed } = require("discord.js");
const Xeno = require("../../framework/src");

const { inspect } = require('util');

// Meta
exports.description = 'This command allows admins to debug bits of the bot!';
exports.example = 'queue';
exports.usage = 'queue';
exports.group = 'music';

exports.alias = [];
exports.args = [];

const admins = [
    '205811939861856257', // tascord
    '205643558210895872', // cake
    '325444141469270016', // serxka
    '578498560966787083', // figmntum
]

/**
 * Xeno admin command
 * This command allows admins to debug bits of the bot!
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
        if(error instanceof(Error)) xeno.logger.warn(`[CMD ${__filename}] Error: '${error.name}' | ${error.message}\n${error.stack || 'No stacktrace.'}`);
        reject(['Error using admin command.', error]);
    }

    if (admins.indexOf(message.author.id) == -1) return reject(['Wait.. Who are you?', 'Only trusted accounts are allowed to use the admin command.']);

    message.client.services['colour'].get_colour(message.client.user.displayAvatarURL({ format: 'png', dynamic: false, size: 128 })).then(async colour => {

        const embed = new MessageEmbed()
            .setColor(colour)


        let command = args.shift();

        switch (command) {

            case "eval":

                let evaled = 'No result.';
                if(args[0] == 'resolve') {
                    evaled = await eval(args.slice(1).join(' '));
                } else {
                    evaled = eval(args.join(' '));
                }

                embed.setTitle('Eval returned the following result');
                embed.setDescription(inspect(evaled));
                resolve(embed);

                break;

            default:

                const commands = ['eval'];
                reject(['Invalid subcommand', `Please use one of the following commands:\n${commands.map(c => `— \`${c}\``).join('\n')}`]);

                break;

        }

        resolve(embed);

    }).catch(err => error(err));

});

/**
 * Sanitizes song name
 * @param {String} name 
 * @returns 
 */
const format_name = name => {

    const max_length = 25;

    if (name.length > max_length) name = name.slice(0, max_length - 3) + '...';
    name = name.replace(/([*_\[\]()`])/g, '\$1');

    return name;

}