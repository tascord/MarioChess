const { Message, MessageEmbed, Channel } = require("discord.js");
const Xeno = require("../../framework/src");
const { testing } = require('../../config.json');
const emoji_regex = require('fs').readFileSync(require('path').join(__dirname, 'emojiRegex')).toString()

/**
 * Xeno message event
 * Triggers when a message is received
 * @param {Message} message Discord message reference
 * @param {Xeno} xeno Xeno framework reference
 */
exports.run = (message, xeno) => {

    // Debug
    if(testing && message.content) xeno.logger.log(`[${message.channel.id} | ${message.channel.name}] ${message.author.tag}: ${message.content}`);

    // Ignore DM's and messages from bots
    if(message.author.bot || !message.guild) return;

    // Get all servers data
    const servers = new (message.client.services['data'].table)('mc_servers');

    // Create server config if none exists
    if(!servers.has(message.guild.id)) servers.set(message.guild.id, {
        id: message.guild.id,
        owner: message.guild.ownerID,
        roles: message.guild.roles.cache.map(r => { return {name: r.name, id: r.id} }),
        channels: message.guild.channels.cache.map(c => { return {type: c.type, name: c.name, id: c.id} }),
        settings: {
            prefix: {
                message: 'Please provide a valid prefix (string with no spaces, less than 10 characters).',
                validator: '^([^ ]{0,10})$',
                value: 'mc-',
            },
            match_category: {
                message: 'Please tag a valid category.',
                validator: '^(<#[0-9]{18}>)$',
                value: 'unset',
                code_block: false,
                display: { validator: '^[0-9]{18}$', value: '<#%s>' }
            },

        }
    });

    // Get server config
    const server = servers.get(message.guild.id);

    // Inform users of the prefix
    if(message.content.startsWith(`<@!${message.client.user.id}>`)) {

        message.reply(`i am mario. prefix for mario chess is \`${server.settings.prefix.value}\`.`)

    }

    // Run moves
    if(message.client.services['chess'].message(message.content, message)) return;

    // Run commands
    xeno.run_command(server.settings.prefix.value, message.content, message);

}