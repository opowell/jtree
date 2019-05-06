// @flow

// pkg cannot include part of 'opn' package in executable.
// const opn           = require('opn');
const openurl       = require('openurl');
const path          = require('path');

const Logger        = require('./core/Logger.js');
const Settings      = require('./core/Settings.js');
const Data          = require('./core/Data.js');
const SocketServer  = require('./core/SocketServer.js');
const StaticServer  = require('./core/StaticServer.js');
// require('@google-cloud/debug-agent').start();

/**
 * @class jtree
 * Entrypoint of the server. Maintains links between different processes, allowing for interaction.
 * If requested, opens the admin interface in the browser.
 */
var jt = {};

global.jt = jt;

// The version of jtree, should match what is in buildJTree.bat
jt.version = '0.8.0';

/** Location of the server executable. All files should be relative to this. Should be a folder containing 'apps' and 'internal' folders.
*/
jt.path = undefined;
if (process.argv[0].indexOf('node') > -1) {
    jt.path         = process.cwd();
} else {
    jt.path         = path.dirname(process.execPath);
}

/**
 * The settings
 * @type {Settings}
 */
jt.settings     = new Settings.new(jt);

/**
 * The utility for writting logs.
 * @type {Logger}
 */
jt.logger       = new Logger.new(jt);

/**
 * The Data object
 * @type {Data}
 */
jt.data         = new Data.new(jt);

/**
 * The process that serves static files to clients.
 * @type {StaticServer}
 */
jt.staticServer = new StaticServer.new(jt);

/**
 * The process that receives and sends messages to clients.
 * @type {SocketServer}
 */
jt.socketServer = new SocketServer.new(jt);

if (jt.settings.openAdminOnStart) {
//    opn('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
    openurl.open('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
}

jt.flatten = function(data) {
    return global.jt.Parser.stringifyStrict(data, global.jt.data.dataReplacer, 2);
}

jt.replaceExistingObjectsWithLinks = function(data, existingObjects, path) {
    
    while (data != null && data.__target != null) {
        data = data.__target;
    }

    let type = typeof(data);
    if (type !== 'object' || data == null) {
        return data;
    }

    // Objects and Arrays.
    // If existing object, return that object's path.
    for (let key in existingObjects) {
        let entry = existingObjects[key];
        if (data === entry.object) {
            // console.log('found object, adding path');
            // if (path.includes('.players')) {
            //     // debugger;
            // }
            console.log(`replacing "${path}" with "${entry.path}"`);
            return '__link__' + entry.path;
        }
    }
    // Otherwise, add this object to the list, and parse its fields.
    existingObjects.push({
        object: data,
        path: path,
    });
    let copy = Array.isArray(data) ? [] : {};
    for (let i in data) {
        let newPath = path + '.' + i;
        copy[i] = jt.replaceExistingObjectsWithLinks(data[i], existingObjects, newPath);
    }
    return copy;
}

// var exports = module.exports = jt;
// exports.new = Data;

// export default jt;
