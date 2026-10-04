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
 *
 * Run directly (node jtree.js, or the packaged executable), it starts its own server.
 * Required from another program, it exports {@link start}, which can attach to an
 * HTTP server that program owns instead, e.g. JAS (see apps/jtree/server.js).
 *
 * @param  {Object} [options]
 * @param  {string} [options.path] Location of the client folder (apps, sessions, settings.json).
 * @param  {string} [options.basePath] Route to serve under, instead of settings.basePath.
 * @param  {http.Server} [options.httpServer] Server to attach to, instead of listening on settings.port.
 * @return {Object} jt
 */
function start(options) {
    options = options || {};

    var jt = {};

    // The version of jtree, should match what is in buildJTree.bat
    jt.version = '0.8.7';

    /** Location of the server executable. All files should be relative to this.
    */
    jt.path = options.path;
    if (jt.path === undefined) {
        if (process.argv[0].indexOf('node') > -1) {
            jt.path         = process.cwd();
        } else {
            jt.path         = path.dirname(process.execPath);
        }
    }

    /**
     * Route everything is served under, e.g. '/jtree'. Set by the hosting program,
     * otherwise by {@link Settings#basePath}.
     * @type {string}
     */
    jt.basePath = options.basePath;

    /**
     * Server owned by a hosting program, if any.
     * @type {http.Server}
     */
    jt.httpServer = options.httpServer;

    /**
     * The settings
     * @type {Settings}
     */
    jt.settings     = new Settings.new(jt);
    if (jt.basePath === undefined) {
        jt.basePath = jt.settings.basePath;
    }
    // One leading slash, no trailing one; '' serves at the root.
    jt.basePath = String(jt.basePath).replace(/^\/+|\/+$/g, '');
    if (jt.basePath !== '') {
        jt.basePath = '/' + jt.basePath;
    }

    /**
     * The utility for writting logs.
     * @type {Logger}
     */
    jt.logger       = new Logger.new(jt);

    /**
     * The Data object
     * @type {Data}
     */
    jt.data = new Data.new(jt);

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

    return jt;
}

module.exports = { start };

if (require.main === module) {
    start();
}
