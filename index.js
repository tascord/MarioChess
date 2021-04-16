/* Dependencies */
const { Client, Intents } = require("discord.js");
const { Game } = require('./classes/game');
const Opponent = require("./classes/opponent");
const { prefix, channel_identifier_pattern } = require('./constants')
const { readdirSync } = require('fs');

/* Create client */
const client = new Client({
    intents: Intents.NON_PRIVILEGED
});

/* Login & setup client */
client.login('chess token here lol');
client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('chess')
    client.user.setPresence('dnd');
})

/* Keep track of games */
let games = [];

/* Game's bots */
const bots = {};
readdirSync('./classes/bots').forEach(file => bots[file.slice(0, -3)] = require('./classes/bots/' + file));

/* Handle games */
client.on('message', message => {

    let game = games.find(g => g.players.white.id == message.author.id || g.players.black.id == message.author.id);
    if(game) return game.move(message);

    if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();

    switch(command) {

        case 'start':

            let target = message.mentions.members.first();
            if(target ? target.bot : true) return message.reply('Invalid target.');

            games.push(new Game(
                [
                    new Opponent({
                        name: message.author.username,
                        id: message.author.id
                    }),

                    new Opponent({
                        name: target.user.username,
                        id: target.user.id
                    })
                ], message.guild
            ))

        break;

        case 'clear':

            // message.reply('Removing all removable left over chess channels!');
            message.guild.channels.cache.filter(c => channel_identifier_pattern.test(c.topic) && c.deletable).forEach(c => c.delete());

        break;

        case 'ai':

            let bot = args[0].toLowerCase();
            if(!bots[bot]) return message.reply('Invalid bot, list below:\n- ' + bots.join('\n- '));
            else games.push(new Game([
                new Opponent({
                    name: message.author.username,
                    id: message.author.id
                }),
                new bots[bot]()
            ], message.guild));

        break;

        case 'cage':

            games.push(new Game([
                new bots['toad'](),
                new bots['toad']()
            ], message.guild));

        break;

    }

})
