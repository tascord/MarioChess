const Xeno = require("../../framework/src");

/**
 * Xeno ready event
 * Triggers when bot is logged in
 * @param {Xeno} xeno Xeno framework reference
 */
exports.run = (xeno) => {

    // Simplify
    const client = xeno.client;

    // Log
    xeno.logger.log(`Logged in! [${client.user.tag}]`);

    // Status
    xeno.client.user.setStatus('dnd');
    xeno.client.user.setActivity('mario chess');

}