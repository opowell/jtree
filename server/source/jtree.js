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

/*
 * Creates instances of:
 * {@link Settings}
 * {@link Logger}
 * {@link Data}
 * {@link StaticServer}
 * {@link SocketServer}
 *
 * If requested, opens the admin interface.
 * @module jtree
 *
 */
var jt = {};

/** The version of jtree, should match what is in buildJTree.bat
* v.x.y.z
* x / y / z indicates major / moderate / minor changes in stability and features.
*/
jt.version      = '0.6.0';

/** Location of the server executable. All files should be relative to this. */
if (process.argv[0].indexOf('node') > -1) {
    jt.path         = process.cwd();
} else {
    jt.path         = path.dirname(process.execPath);
}

/** The server settings */
jt.settings     = new Settings.new(jt);

jt.logger       = new Logger.new(jt);
jt.data         = new Data.new(jt);
jt.staticServer = new StaticServer.new(jt);
jt.socketServer = new SocketServer.new(jt);
if (jt.settings.openAdminOnStart) {
//    opn('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
    openurl.open('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
}
