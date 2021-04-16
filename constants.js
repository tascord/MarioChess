const ltm = new (require('quick.db').table)('ltm'); // Long term memory

let _;
do { _ = Math.random(); } while ( _ == ltm.get('seed') );

const seed = _;
ltm.set('seed', seed);


module.exports = {

    prefix: 'c-',
    channel_identifier: () => `-- CCI: ${seed.toString().replace('.', '')} -- (Please Don\'t Edit Channel Topic)`,
    channel_identifier_pattern: /-- CCI: [0-9]+ -- \(Please Don\'t Edit Channel Topic\)/

}