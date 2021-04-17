
// Imports
const { testing } = require('../../config.json');
const { unlinkSync, existsSync } = require('fs');

// Database location
const location = require('path').join(__dirname, '../', '../', 'mario_chess' + (testing ? '-testing' : '-dist') + '.sqlite');

// Delete database if testing
if(testing && existsSync(location)) require('fs').unlinkSync(location);

// Export database
module.exports = require('quick.db')(location);
