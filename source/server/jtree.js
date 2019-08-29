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
 * Adds 'object' to list of existing objects, both with and without object references.
 * 
* object - the object to replace
* existingObjects - array of objects, after processing
* originalExistingObjects - array of objects, no processing
*
* Proxied lists emit a single change event with all the new objects. This is achieved by operating in two steps
* when the object lists are proxies. First, adds all objects to the proxy targets,
* then after all objects have been added, it adds them to the proxy object.
*
* Returns:
* - The processed object.
* - A list of objects to add to existing objects.
**/
jt.replaceExistingObjectsWithLinks = function(object, existingObjects, originalExistingObjects) {
    
    let twoStep = false;
    let initialNumObjects = existingObjects.length;
    let existingObjectsTarget = existingObjects;

    if (existingObjects.__target != null) {
        twoStep = true;
        existingObjectsTarget = existingObjects.__target;
    }

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
        existingObjectsTarget.push(copy);
        originalExistingObjects.push(object);

        // Store object prototypes.
        if (object.__proto__ != null) {
            copy.__proto__ = object.__proto__;
        }
        for (let i in object) {
            let child = object[i];
            let newChild = jt.replaceExistingObjectsWithLinks(child, existingObjectsTarget, originalExistingObjects);
            copy[i] = newChild;
        }

        if (twoStep) {
            // Trigger change to objects list.
            let newNumObjects = existingObjects.length;
            if (initialNumObjects < newNumObjects) {
                let newObjectsOL = existingObjectsTarget.splice(initialNumObjects, newNumObjects - initialNumObjects);
                existingObjects.push(...newObjectsOL);
            }
        }
        

        return '__link__' + index;
    
    } catch (err) {
        console.log(err);
        debugger;
    }
    
}