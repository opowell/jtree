const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../Utils.js');

/** Logging utility */
class Logger {

    constructor(jt) {

        this.jt = jt;

        let logPath = path.join(this.jt.path, jt.settings.logPath);
        fs.ensureDirSync(logPath);

        this.logStream = fs.createWriteStream(path.join(logPath, jt.settings.getLogFilename()), {'flags': 'a'});

        // Add logging function to app controller.
        jt.log = function(text, forceConsole) {
            jt.logger.log(text, forceConsole);
        }

        if (jt.settings.logMessage != null) {
            this.log(jt.settings.logMessage);
        }
    }

    /**
    * Writes the given text with a timestamp to the log given by {@link Settings#logPath}.
    * If {@link Settings#logToConsole} is true, then also logs to console.
    * @param text The text to be written.
    */
    log(text, forcePrintToConosle) {
        var time = new Date().toString();
        this.logStream.write(time + ': ' + text + '\n');

        if (this.jt.settings.logToConsole === true || forcePrintToConosle == true) {
            console.log(time + ': ' + text);
        }
    }



}

var exports = module.exports = {};
exports.new = Logger;
