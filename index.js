const { Intents } = require('discord.js');

// Instantiate client
const client = new (require('discord.js').Client)({ intents: Intents.NON_PRIVILEGED });

// Login client
client.login(require('./config.json').token);

// Create client
const xeno = new (require('./framework'))({

    client, paths: { base: require('path').join(__dirname, 'modules') }

});

// Mixins
xeno.embed = {

    error_colour: '#ff006a',
    error_icon: 'https://toppng.com/uploads/preview/mario-discord-emoji-super-mario-run-wink-11563646919o32jilcf2p.png',
    trans_icon: 'https://i.pinimg.com/originals/4e/75/fa/4e75fa5ea0bfced209b8d7830b1bd450.png',
    default_colour: '#FE0104'

}

xeno.progress = (value, max, min = 0, length = 10) => {

    // Create character buffer
    let scaled = ((value - min) * (length - 0) / (max - min) + 0);
    let character_set = Array(length).fill().map((_, i) => i < scaled ? xeno.emoji.s_middle : i == scaled ? xeno.emoji.s_end : xeno.emoji.u_middle);

    // Add ends
    character_set[0] = character_set[0] == xeno.emoji.s_middle ? xeno.emoji.s_start : xeno.emoji.u_start;
    character_set[length] = character_set[length] == xeno.emoji.s_middle ? xeno.emoji.s_end : xeno.emoji.u_end;

    return character_set.join('');

}
