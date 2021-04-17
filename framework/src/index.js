const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const { testing } = require('../../config.json');

module.exports = class Xeno {

    /**
     * Xeno framework constructor
     * @param {Object} opts Bot settings
     */
    constructor(opts = {}) {

        if (typeof opts !== "object") throw new Error("Non-Object provided as parameters");

        if (!opts.paths) opts.paths = {};

        this.paths = {

            base: opts.paths.base || '',
            commands: opts.paths.commands || 'commands',
            events: opts.paths.events || 'events',
            services: opts.paths.services || 'services',

        }

        this.services = opts.services || 'services';

        if (!opts.client) throw new Error("No Client provided");
        this.client = opts.client;

        this._setup_modules();

        this.logger = new (require('../../logger'))({
            time: true,
            logfile: !testing,
            logdir: join(__dirname, '../', '../', 'logs')
        });

    }

    /**
     * Internal function to register commands, events and services
     */
    _setup_modules = () => {

        this.absolute_paths = {

            commands: join(this.paths.base, this.paths.commands),
            events: join(this.paths.base, this.paths.events),
            services: join(this.paths.base, this.paths.services),

        }

        Object.keys(this.absolute_paths).forEach(folder => {

            if (!fs.existsSync(this.absolute_paths[folder])) throw new Error(`Location does not exist '${this.absolute_paths[folder]}'`);

        })

        // Commands
        this.alias = {}, this.commands = {}, this.command_list = {};
        fs.readdirSync(this.absolute_paths.commands)
            .filter(file => file.match(/\.js$/))
            .forEach(file => {

                let command = require(join(this.absolute_paths.commands, file));

                if (!command.run) throw new Error(`No 'run' function found in command '${file}'`);
                if (!command.args) throw new Error(`No 'args' array found in command '${file}'`);

                if (!command.description || !command.example || !command.usage || !command.group) console.warn(`Command '${file}' is missing some meta properties (description, example, usage or group)`);

                if (command.alias) this.alias[file.slice(0, -3)] = command.alias;
                this.commands[file.slice(0, -3)] = command.run;

                let group = command.group || 'Unsorted';
                if (!this.command_list[group]) this.command_list[group] = [];

                this.command_list[group].push({
                    name: file.slice(0, -3),
                    description: command.description || 'No description provided',
                    usage: command.usage || 'No usage provided',
                    example: command.example || 'No example provided',
                    alias: command.alias || [],
                    runas: command.runas || [],
                    args: command.args,
                    permissions: command.permissions || []
                })

            });

        // Events
        fs.readdirSync(this.absolute_paths.events)
            .filter(file => file.match(/\.js$/))
            .forEach(file => {

                let event = require(join(this.absolute_paths.events, file));

                if (!event.run) throw new Error(`No 'run' function found in event '${file}'`);
                this.client.on(file.slice(0, -3), (...args) => { args.push(this); event.run(...args); });

            });

        // Services
        this.client[this.services] = {};
        fs.readdirSync(this.absolute_paths.services)
            .filter(file => file.match(/\.js$/))
            .forEach(file => {

                this.client[this.services][file.slice(0, -3)] = require(join(this.absolute_paths.services, file));

            })

    }

    /**
     * Run a command from the commands folder
     * @param {String} prefix The bot's prefix
     * @param {String} string The incoming message content
     * @param {Message} message Message object which is passed to commands
     */
    run_command = (prefix, string, message) => {

        if (!string.startsWith(prefix)) return;

        let args = string.trim().slice(prefix.length).split(/ +/g);
        let command = args.shift().toLowerCase();
        let run = this.get_command_by_name(command);

        if (!run && testing) return this.logger.log(`No command named '${command}'.`);
        if (run.runas[command]) args = run.runas[command].concat(args);

        // Permission only commands
        if(run.permissions[0]) {
            
            if(!message.member.permissions.has(run.permissions)) {

                let error_embed = new MessageEmbed()
                    .setColor(0xff006a)
                    .setTitle(`❌ No permissions to run '${run.name}'`)
                    .setDescription('You don\'t have the needed permissions to run that command.');

                return message.channel.send(error_embed);
    
            }

        }

        args = this.format_args(args, command, message);
        if (!args) return;

        this.commands[run.name](args, message, this)
            .then(embed => message.channel.send(embed))
            .catch(data => {

                if(data instanceof(Error)) this.logger.warn(`[CMD ${run.name} • FRAMEWORK] Error: '${data.name}' | ${data.message}\n${data.stack || 'No stacktrace.'}`);

                let title = data, description;

                if(typeof(data) == 'object') {
                    title = data[0];
                    description = data[1];

                    if(!description) {
                        description = title;
                        title = null;
                    }

                }

                const embed = new MessageEmbed()
                    .setColor(0xff006a)
                    .setTitle(title ? '❌ ' + title : `❌ Error running '${run.name}' command.`)
                    .setDescription(description ? description : 'Unknown error. Try again or [contact us](https://discord.gg/NeqVuSy) if this continues.');

                message.channel.send(embed);

            });

    }

    /**
     * Returns the command object or null if not found
     * @param {String} name Name or alias of command
     * @returns {Object|null}
     */
    get_command_by_name = name => {

        for (let section of Object.keys(this.command_list)) {

            for (let command of this.command_list[section]) {

                if (command.name == name || command.alias.indexOf(name) > -1 || command.runas[name]) return command;

            }

        }

    }

    /**
     * Formats arguments for specific command. Errors on error.
     * @param {Array<String>} args Message arguments
     * @param {Object} command Command object
     * @param {Message} message Discord message reference
     * @returns {Array}
     */
    format_args = (args, command, message) => {

        let error_embed = new MessageEmbed()
            .setColor(0xff006a)
            .setTitle(`❌ Invalid arguments for '${command}' command.`)

        const command_args = this.get_command_by_name(command).args;
        const error = (i, m) => {
            error_embed.setDescription(m || command_args[i].message);
            message.channel.send(error_embed);
        }

        let formatted = [];

        for (let i in command_args) {

            if (!args[i] && command_args[i].optional !== true) return error(i);
            else if (!args[i]) break;

            switch (command_args[i].type) {

                case "string":
                    if (typeof (args[i]) !== command_args[i].type) return error(i);
                    formatted.push(args[i]);
                    break;

                case "number":
                    if (isNaN(args[i])) return error(i);
                    formatted.push(Number(args[i]));
                    break;

                case "member":
                    let user = message.mentions.members.get((/([0-9]{18})/.exec(args[i]) || [])[0]);
                    if (!user) return error(i);
                    formatted.push(user);
                    break;

                case "channel":
                    let channel = message.mentions.channels.get((/([0-9]{18})/.exec(args[i]) || [])[0]);
                    if (!channel) return error(i);
                    formatted.push(user);
                    break;

                default:
                    this.logger.warn(`Unknown argument type '${command_args[i].type}'. Value: ${args[i]}.`);
                    break;

            }

            if (command_args[i].choices) {

                let arg = formatted[formatted.length - 1];
                let choices = command_args[i].choices;

                if (choices.indexOf(arg) == -1) return error(i, `'${arg}' is not a valid option. Please choose from the following:\n${choices.map(c => '• ' + c).join('\n')}`);

            }

        }

        // Add any extra args on the end
        formatted = formatted.concat(args.slice(formatted.length));

        return formatted;

    }

}