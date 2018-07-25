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

/**
 * @class jtree
 * Entrypoint of the server. Maintains links between different processes, allowing for interaction.
 * If requested, opens the admin interface in the browser.
 */
var jt = {};

/** The version of jtree, should match what is in buildJTree.bat
* v.x.y.z
* x / y / z indicates major / moderate / minor changes in stability and features.
*/
jt.version      = '0.6.0';

/** Location of the server executable. All files should be relative to this.
*/
jt.path = undefined;
if (process.argv[0].indexOf('node') > -1) {
    jt.path         = process.cwd();
} else {
    jt.path         = path.dirname(process.execPath);
}

/** The {@link Settings}. */
jt.settings     = new Settings.new(jt);

/** The {@link Logger} utility. */
jt.logger       = new Logger.new(jt);

/** The {@link Data} object. */
jt.data         = new Data.new(jt);

/**
 * @type {StaticServer}
 * The process that serves static files to clients.
 */
jt.staticServer = new StaticServer.new(jt);

/**
 * @type {SocketServer}
 * The process that receives and sends messages to clients.
 */
jt.socketServer = new SocketServer.new(jt);

if (jt.settings.openAdminOnStart) {
//    opn('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
    openurl.open('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
}
