const { Message, MessageEmbed } = require("discord.js");
const Xeno = require("../../framework/src");

// Meta
exports.description = 'This command allows server admins to change the bots behaviour!';
exports.example = 'settings prefix -';
exports.usage = 'settings [setting] [value]';
exports.group = 'admin';

exports.alias = [];
exports.args = [
    {
        name: 'Setting',
        description: 'Setting to modify',
        type: 'string',
        message: 'Please provide a valid setting name.',
        optional: true
    },
    {
        name: 'Value',
        description: 'New setting value',
        type: 'string',
        message: 'Please provide a valid setting value.',
        optional: true
    },
];

exports.permissions = [
    'ADMINISTRATOR'
]

const format_setting_name = name => name.split('_').map(k => k.slice(0, 1).toUpperCase() + k.slice(1).toLowerCase()).join('.');
const format_setting_value = (setting, full_length = false) => {

    const max_length = 25;
    let cbc = full_length ? '```' : '`'; // Code block character(s)

    let display = setting.value;
    if (setting.display) {
        if (RegExp(setting.display.validator).test(setting.value)) display = setting.display.value.replace(/%s/g, setting.value);
    }

    if (!full_length && display.length > max_length) display = display.slice(0, max_length - 3) + '...';
    return setting.code_block === false ? display : cbc + display + cbc;
}

/**
 * Xeno settings command
 * This command allows server admins to change the bots behaviour!
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
        reject(['Error handling settings', error]);
    }

    const servers = new (message.client.services['data'].table)('mc_servers');
    const server = servers.get(message.guild.id);

    const { get_colour, defaults } = message.client.services['colour'];
    get_colour(message.guild.iconURL(defaults) || message.client.user.displayAvatarURL(defaults)).then(colour => {

        // List settings
        if (!args[0]) {

            let embed = new MessageEmbed()
                .setTitle(`Guild settings for ${message.guild.name}`)
                .setAuthor(`${xeno.client.user.username} • Admin`, xeno.embed.trans_icon)
                .setColor(colour)
                .setThumbnail(message.guild.iconURL() || message.client.user.displayAvatarURL())
                .setTimestamp();

            let description = [];
            Object.keys(server.settings).forEach(k => {

                description.push(`— **${format_setting_name(k)}**: ${format_setting_value(server.settings[k])}`);

            });

            embed.setDescription(description.join('\n'));
            resolve(embed);

        }

        // Set setting
        else {

            let key = args[0].toLowerCase().replace(/\./g, '_');

            // Checks
            if (!server.settings[key]) return reject(['No setting with that name', 'Try running the command with no arguments to see the list of settings.']);
            if (!args[1]) {

                let embed = new MessageEmbed()
                    .setTitle(`Guild setting for \`${format_setting_name(key)}\``)
                    .addField(`The currently stored value for \`${format_setting_name(key)}\` is:`, format_setting_value(server.settings[key], true))
                    .setColor(colour)

                return resolve(embed);

            }

            // Get value
            let new_value = args.slice(1).join(' ').trim();
            if (!RegExp(server.settings[key].validator).test(new_value)) return reject(['Invalid value provided', server.settings[key].message || `The value you provided didn't pass the required validation check: \`/${server.settings[key].validator}/\`.`]);

            // Use mentions id's before new value
            if (message.mentions.members.first()) new_value = message.mentions.members.first().id;
            if (message.mentions.channels.first()) new_value = message.mentions.channels.first().id;
            if (message.mentions.everyone) return reject(['Invalid value provided', '@everyone is not a valid option.']);


            // Save
            server.settings[key].value = new_value;
            servers.set(message.guild.id, server);

            // Log
            let embed = new MessageEmbed()
                .setTitle(`Guild settings updated!`)
                .setDescription(`${format_setting_name(key)} was updated to ${format_setting_value(server.settings[key])} on ${message.guild.name}!`)
                .setColor(colour)

            resolve(embed);

        }

    }).catch(err => error(err));

})