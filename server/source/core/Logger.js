const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../Utils.js');

class Logger {

    constructor(jt) {

        this.jt = jt;

        let logPath = path.join(this.jt.path, jt.settings.logPath);
        fs.ensureDirSync(logPath);

        this.logStream = fs.createWriteStream(path.join(logPath, jt.settings.getLogFilename()), {'flags': 'a'});

        // Add logging function to app controller.
        jt.log = function(text) {
            jt.logger.log(text);
        }
    }

    log(text) {
        var time = new Date().toString();
        this.logStream.write(time + ': ' + text + '\n');

        if (this.jt.settings.logToConsole === true) {
            console.log(time + ': ' + text);
        }
    }

}

var exports = module.exports = {};
exports.new = Logger;
