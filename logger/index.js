const $ = require('chalk');
const { existsSync, writeFileSync, appendFileSync } = require('fs');

module.exports = class Logger {

    constructor(opts = {}) {

        this.time = opts.time || false;
        this.logfile = opts.logfile || false;
        this.logdir = opts.logdir || null;

        if(this.logdir && !existsSync(this.logdir)) throw new Error(`Folder at ${this.logdir} doesn't exist`);

        if(this.logfile) {

            this.log_file_name = new Date().toLocaleString().replace(/(\/|:)/g, '-').replace(', ', ' ').replace(/ (AM|PM)/, '-$1') + '.log';
            this.log_path = require('path').join(this.logdir, this.log_file_name);
            writeFileSync(this.log_path, '');

            this.info(`Created logfile '${this.log_file_name}'`);

        }

    }

    __enact_log = (...data) => {

        let compiled = this.time ? `[${new Date().toLocaleTimeString()}] ` : ' ';
        compiled += data.map((v, i) => i % 2 != 0 ? $[data[i-1]](v) : '').join('');

        if(this.logfile) {
            appendFileSync(this.log_path, (this.time ? `[${new Date().toLocaleTimeString()}] ` : ' ') + data.filter((_, i) => i % 2 != 0).join('') + '\n');
        }

        console.log(compiled);

    }

    warn = message => this.__enact_log('white', '(', 'yellowBright',  '-', 'white', ') ', 'yellowBright',  message);
    info = message => this.__enact_log('white', '(', 'magentaBright', '!', 'white', ') ', 'magentaBright', message);
    log  = message => this.__enact_log('white', '(', 'cyanBright',    '+', 'white', ') ', 'cyanBright',    message);

}