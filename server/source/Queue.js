const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('./Utils.js');
const Session   = require('./Session.js');


/**
 * A Queue definition for sessions.
*/
class Queue {

    constructor(id, jt) {
        this.jt             = jt;
        this.id             = id;
        this.shortId        = path.basename(id);
        this.displayName    = this.shortId;
        this.apps           = [];
        this.dummy          = false;
    }

    /** Deprecated 2018.10.11. Replaced by Queue.loadJTQ. */
    static load(fn, id, jt) {
        var queue = new Queue(id, jt);
        
        // Read fields, if any.
        if (fs.existsSync(fn)) {
            var json = Utils.readJSON(fn);
            if (json.displayName !== undefined) {
                queue.displayName = json.displayName;
            }
            if (json.apps !== undefined) {
                queue.apps = json.apps;
            }
        }

        return queue;
    }

    static loadJTQ(id, jt, folder) {
        var queue = new Queue(id, jt);
        if (fs.existsSync(id)) {
            var json = Utils.readJSON(id);
            if (json === 'JSON error') {
                // let session = new Session.new(jt, id, {createFolder: false});
                queue.code = Utils.readJS(id);
                // eval(queue.code);
                // for (let i=0; i<session.apps.length; i++) {
                //     let app = session.apps[i];
                //     queue.addApp(app.appPath, app.givenOptions);
                // }
            } else {
                if (json.displayName !== undefined) {
                    queue.displayName = json.displayName;
                }
                if (json.apps !== undefined) {
                    for (let i=0; i<json.apps.length; i++) {
                        let curJSON = json.apps[i];
                        let appId = curJSON;
                        let options = {};
                        if (curJSON.appId != null) {
                            appId = curJSON.appId;
                            options = curJSON.options;
                        }
                        queue.addApp(path.join(folder, appId + '.jtt'), options);
                    }
                }
            }
        }
        return queue;
    }

    /**
    * Add the app with the given ID to this session.
    *
    * FUNCTIONALITY:
    * - load the given app {@link Session#loadApp}
    * - add app to this session's apps field.
    * - copy app source files {@link Utils#copyFiles}.
    * - save app and its stages {@link App#saveSelfAndChildren}.
    * - emit 'sessionAddApp' message.
    *
    * @param  {string} appId The ID of the app to add to this session.
    */
    addApp(appId, options) {
        if (options == null) {
            options = {};
        }
        var app = {
            appId: appId, 
            options: options, 
            indexInQueue: this.apps.length + 1
        };
        this.apps.push(app);
        if (!this.dummy && this.jt.socketServer != null) {
            this.save();
            this.jt.socketServer.sendOrQueueAdminMsg(null, 'queueAddApp', {queueId: this.id, app: app});
        }
    }

    parentFolderName() {
        let x = this.id.split('\\');
        if (x.length < 2) {
            return 'noFolderSeparatorFound';
        }
        return x[x.length-2];
    }

    parentFolderFullName() {
        let x = this.id.lastIndexOf('\\');
        if (x === -1) {
            return this.id;
        }
        return this.id.substring(0, x);
    }

    shell() {
        var out = {}
        out.id              = this.id;
        out.displayName     = this.displayName;
        out.apps            = this.apps;
        out.options         = this.options;
        out.optionValues    = this.optionValues;
        return out;
    }

    /**
    * this - description
    *
    * @return {type}  description
    */
    save() {
        try {
            fs.writeJSONSync(this.jt.data.queuePath(this.id), this.shell(), {spaces: 4});
        } catch (err) {
            console.log(err);
        }
    }

}

var exports = module.exports = {};
exports.new = Queue;
exports.load = Queue.load;
exports.loadJTQ = Queue.loadJTQ;
