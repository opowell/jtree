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
    return global.jt.Parser.stringifyStrict(data, global.jt.data.dataReplacer, 2);
}

jt.replaceExistingObjectsWithLinks = function(data, existingObjects, path, parents, session) {
    
    if (parents == null) {
        parents = [];

        if (path.includes('.jtg')) {
            debugger;
        }

        let paths = split(path);
        let curParent = session;
        let newPath = '';
        for (let i in paths) {
            newPath = newPath + (i>0?'.':'') + paths[i];
            curParent = curParent[paths[i]];
            // Check if the parent is already stored.
            for (let key in parents) {
                let entry = parents[key];
                // If it is, remove the circular reference.
                if (entry.object === curParent) {
                    newPath = entry.path;
                    break;
                }
            }

            // If not, store the parent.
            for (let key in existingObjects) {
                let entry = existingObjects[key];
                if (curParent === entry.object) {
                    parents.push(entry);
                    break;
                }
            }
        }
        if (path !== newPath) {
            console.log(`found circular reference, changing:\n${path}\nto:\n${newPath}`);
            path = newPath;
        }
    }

    if (path === 'messages.3.state.participants.0.proxy.player.group.players.0.participant.proxy.player') {
        debugger;
    }

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

    if (path === 'messages.3.state.participants.0.proxy.player.group.period.app.subgames.1.periods.0.app.session.participants.0.players.0') {
        debugger;
    }

    let thisObject = {
        object: data,
        path: path,
    };
    existingObjects.push(thisObject);
    let copy = Array.isArray(data) ? [] : {};
    for (let i in data) {
        let newPath = path + '.' + i;
        // Remove any circular references in the path:
        // i.e. x.y.z.y --> x.y
        let newParents = [];
        for (let j=0; j<parents.length; j++) {
            newParents.push(parents[j]);
            if (parents[j].object === data[i]) {
                newPath = parents[j].path;
                break;
            }
        }
        newParents.push(thisObject);
        copy[i] = jt.replaceExistingObjectsWithLinks(data[i], existingObjects, newPath, newParents, session);
    }
    return copy;
}

// var exports = module.exports = jt;
// exports.new = Data;

// export default jt;
