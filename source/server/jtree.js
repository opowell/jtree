// @flow

// pkg cannot include part of 'opn' package in executable.
// const opn           = require('opn');
const openurl       = require('openurl');
const path          = require('path');
const split         = require('split-string');

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
    return JSON.stringify(data, global.jt.data.dataReplacer, 2);
    // return global.jt.Parser.stringifyStrict(data, global.jt.data.dataReplacer, 2);
}

/**
* object - the object to replace
* existingObjects - array of objects, after processing
* originalExistingObjects - array of objects, no processing
*
* Returns:
* - The processed object.
* - A list of objects to add to existing objects.
**/
jt.replaceExistingObjectsWithLinks = function(object, existingObjects, originalExistingObjects) {
    
    let objectsToAdd = [];
    let originalObjectsToAdd = [];

    try {
    
        // Get out of proxies.
        while (object != null && object.__target != null) {
            object = object.__target;
        }
    
        // If not an object, return original object.
        let type = typeof(object);
        if (type !== 'object' || object == null) {
            return object;
        }
    
        // If existing object, return link to that object.
        if (object.nonObs != null && object.nonObs.storageIndex != null) {
            return '__link__' + object.nonObs.storageIndex;
        }
    
        // Otherwise, add this object to the list of existing objects, and parse its fields.
        // Create copy of object (so as to not modify original).
        let copy = Array.isArray(object) ? [] : {};
    
        // console.log('storing object ' + existingObjects.length);
        let index = existingObjects.length;
        if (object.nonObs == null) {
            Object.defineProperty(object, "nonObs", {
                enumerable: false,
                value: {}
            });
        }
        object.nonObs.storageIndex = index;
        existingObjects.push(copy);
        originalExistingObjects.push(object);

        // Store object prototypes.
        if (object.__proto__ != null) {
            copy.__proto__ = object.__proto__;
        }
        for (let i in object) {
            let child = object[i];
            let newChild = jt.replaceExistingObjectsWithLinks(child, existingObjects, originalExistingObjects);
            copy[i] = newChild;
        }

        return '__link__' + index;
    
    } catch (err) {
        console.log(err);
        debugger;
    }
    
}