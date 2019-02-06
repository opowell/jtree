const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../models/Utils.js');

/** Logging utility */
class Logger {

    constructor(jt) {

        this.jt = jt;

        try {
            let logPath = path.join(this.jt.path, jt.settings.logPath);
            fs.ensureDirSync(logPath);
    
            this.logStream = fs.createWriteStream(path.join(logPath, jt.settings.getLogFilename()), {'flags': 'a'});
    
            if (jt.settings.logMessage != null) {
                this.log(jt.settings.logMessage);
            }
        } catch (err) {
            console.log('Unable to start logger.');
        }

        // Add logging function to app controller.
        jt.log = function(text) {
            jt.logger.log(text);
        }

    }

    /**
    * Writes the given text with a timestamp to the log given by {@link Settings#logPath}.
    * If {@link Settings#logToConsole} is true, then also logs to console.
    * @param text The text to be written.
    */
    log(text) {
        try {
            var time = new Date().toString();
            if (this.jt.settings.logToConsole === true) {
                console.log(time + ': ' + text);
            }
            this.logStream.write(time + ': ' + text + '\n');
        } catch (err) {
            console.log('unable to write to log');
        }
    }



}

var exports = module.exports = {};
exports.new = Logger;
