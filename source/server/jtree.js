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

/**
* data - the object to replace
* existingObjects - array of objects that should already be present on the client
* path - the path to the data object
* parents - parent objects
* rootParent - 
*
**/
jt.replaceExistingObjectsWithLinks = function(data, existingObjects, path, parents, rootParent, funcName) {
    
try {

    // Get out of proxies.
    while (data != null && data.__target != null) {
        data = data.__target;
    }

    let storedPath = path;

    // Load parents if necessary.
    // Also remove any circularity in the path.
    if (parents == null) {
        parents = [{
            object: rootParent,
            path: ''
        }];
        let paths = split(path);
        let curParent = rootParent;
        let newPath = '';
        nextPath: for (let i in paths) {
            let curPath = paths[i];
            curParent = curParent[curPath];

            // Check for circularity
            for (let j in parents) {
                if (parents[j].object === curParent) {
                    newPath = parents[j].path;
                    parents.splice(j+1, parents.length - j - 1);
                    continue nextPath;
                }
            }

            // Check for existing object, which presumably has shorter path
            for (let j in existingObjects) {
                if (existingObjects[j].object === curParent) {
                    newPath = existingObjects[j].path;
                    parents = [existingObjects[j]];
                    continue nextPath;
                }
            }

            // No circularity, add the current parent.
            newPath = newPath + (newPath.length>0 ? '.' : '') + curPath;
            parents.push({
                object: curParent,
                path: newPath
            });
        }

        path = newPath;

        storedPath = path;
        // If pushing to an array, add the array index to the end of the path.
        if (funcName === 'push') {
            storedPath = storedPath + (path.length>0 ? '.' : '') + curParent.length;
        }

    }

    // If object is its own ancestor, store path to ancestor.
    for (let i in parents) {
        let parent = parents[i];
        if (data === parent.object) {
            path = parent.path;
            break;    
        }
    }

    // If not an object, return original object.
    let type = typeof(data);
    if (type !== 'object' || data == null) {
        return {
            object: data,
            path: path
        };
    }

    // If existing object, return link to that object.
    for (let key in existingObjects) {
        let entry = existingObjects[key];
        if (data === entry.object) {
            return {
                object: '__link__' + entry.path,
                path: path
            };
        }
    }

    // Otherwise, add this object to the list of existing objects, and parse its fields.
    let thisObject = {
        object: data,
        path: storedPath,
    };
    console.log('storing ' + thisObject.path);
    existingObjects.push(thisObject);

    // Create copy of object (so as to not modify original).
    let copy = Array.isArray(data) ? [] : {};
    parents.push({
        object: data,
        path: storedPath
    });
    for (let i in data) {
        if (i === 'nonObs') {
            continue;
        }
        let child = data[i];
        let newPath = storedPath + '.' + i;
        let newChild = jt.replaceExistingObjectsWithLinks(child, existingObjects, newPath, parents, rootParent, null);
        copy[i] = newChild.object;
    }
    parents.splice(parents.length-1, 1);

    // Return copy.
    return {
        object: copy,
        path: storedPath
    };

} catch (err) {
    console.log(err);
    debugger;
}

}

// If object is not already stored in objectList, add it and repeat for all of children's fields.
jt.addExistingObjects = function(object, objectList, path) {

    while (object != null && object.__target != null) {
        object = object.__target;
    }

    // If object is not an "object", do nothing.
    let type = typeof(object);
    if (type !== 'object' || type == null) {
        return;
    }

    // If object is already in list, do nothing.
    for (let key in objectList) {
        let entry = objectList[key];
        if (path === entry.path) {
            console.log('found same path, objects same?');
        }
        if (object === entry.object) {
            return;
        }
    }

    // Object is not in list. Store it and its fields.
    console.log('Storing ' + path);
    objectList.push({
        object,
        path
    });
    for (let i in object) {
        // Skip "nonObs" properties.
        if (i === 'nonObs') {
            continue;
        }
        let child = object[i];
        let newPath = path + (path.length>0 ? '.' : '') + i;
        jt.addExistingObjects(child, objectList, newPath);
    }
}

// var exports = module.exports = jt;
// exports.new = Data;

// export default jt;
