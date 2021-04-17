const { Message, MessageEmbed } = require("discord.js");
const Xeno = require("../../framework/src");

// Meta
exports.description = 'This command allows users to see all the commands the bot has to offer!';
exports.example = 'commands play';
exports.usage = 'commands [command]';
exports.group = 'chat';

exports.alias = ['cmd', 'cmds', 'command'];
exports.args = [
    {
        name: 'Command',
        description: 'Command name to see specific information on',
        type: 'string',
        message: 'Please provide a valid command name.',
        optional: true
    }
];


/**
 * Xeno commands command
 * This command allows users to see the up next queue!
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
        reject(['Error getting command list', error]);
    }

    const servers = new (message.client.services['data'].table)('mc_servers');
    const server = servers.get(message.guild.id);
    const colour = xeno.embed.default_colour;

    // Command list
    if (!args[0]) {

        let embed = new MessageEmbed()

            .setTitle(`${message.client.user.username + (message.client.user.username.match(/[sz]$/) ? '\'' : '\'s')} Command list`)
            .setDescription(`To see more detail on a specific command, run \`${server.settings.prefix.value}commands <command> \`!`)
            .setAuthor(`${xeno.client.user.username} • Chat`, xeno.embed.trans_icon)
            .setColor(colour)
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp();

        let command_list = xeno.command_list;
        let longest_group_length = Object.keys(command_list).map(k => command_list[k].length).sort((a, b) => b - a)[0];

        for (let group of Object.keys(command_list)) {
            embed.addField(group[0].toUpperCase() + group.slice(1), '```\n' + Array(longest_group_length).fill().map((_, i) => command_list[group][i]).map(command => command ? command.name : ' ').join('\n') + '\n```', true);
        }

        resolve(embed);

    }

    // Specific command
    else {

        let command = xeno.get_command_by_name(args[0]);
        if (!command) return reject(["Hmm, couldn't find it!", "Sorry, but theres no command on this bot with that name or alias!"]);

        let embed = new MessageEmbed()
            .addField('Description:', command.description)
            .addField('Key:', '`<>` = Mandatory, `[]` = Optional, `()` = Permissions')
            .addField('Usage:', '`' + command.usage + '`', true)
            .addField('Example', '`' + command.example + '`', true)
            .setTitle(`${message.client.user.username + (message.client.user.username.match(/[sz]$/) ? '\'' : '\'s')} Command list`)
            .setAuthor(`${xeno.client.user.username} • Chat`, xeno.embed.trans_icon)
            .setColor(colour)
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp();

        if (command.alias.length > 0) {
            embed.addField('Alias\'', '`' + command.alias.join(', ') + '`', true);
        }

        resolve(embed);

    }



})