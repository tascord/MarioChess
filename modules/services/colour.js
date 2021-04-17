
const colour = require('colorthief');

const cache = {};

exports.defaults = { format: 'png', dynamic: false, size: 128};
exports.get_colour = (url) => new Promise(async (resolve, reject) => {
    
    if(cache[url]) resolve(cache[url]);
    else colour.getColor(url).then(rgb => {
        cache[url] = ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
        resolve(cache[url]);
    }).catch(reject);

});
