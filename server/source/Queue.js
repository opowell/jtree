const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('./Utils.js');
const Session   = require('./Session.js');


/**
 * A queue is an app made of other apps: a .jtq file that, when added to a session, adds its apps
 * to that session in its place. It sits in the app catalogue next to the apps, and is added to a
 * session with {@link Session#addApp} like any app.
 *
 * A .jtq file is a script run with the session in scope as `session`. Paths it gives to
 * `session.addApp` are relative to the .jtq file, and may name other queues. The script can also
 * declare session options (`session.addNumberOption(...)`) and set session fields and hooks
 * (`session.getApp = ...`), as these act on the whole session.
 *
 * An older format is JSON, `{displayName, apps: [appId | {appId, options}]}`, where an appId
 * without an extension is a .jtt file next to the queue.
*/
class Queue {

    constructor(id, jt) {
        this.jt             = jt;
        this.id             = id;
        this.appPath        = id;
        this.shortId        = path.basename(id, '.jtq');
        this.displayName    = this.shortId;
        this.description    = undefined;
        /** The file's contents. */
        this.appjs          = '';
        /** For a JSON queue, its parsed contents, otherwise null. */
        this.json           = null;
        /** The apps this queue adds, as {appId, options}, with appId resolved to a full path. */
        this.apps           = [];
        /** The session options this queue declares. */
        this.options        = [];
        this.optionValues   = {};
        this.hasError       = false;
    }

    /** Reads the .jtq file at filePath, and lists the apps and options it declares. */
    static load(filePath, jt) {
        var queue = new Queue(filePath, jt);
        try {
            queue.appjs = Utils.readJS(filePath);
        } catch (err) {
            queue.setError(err);
            return queue;
        }
        if (queue.appjs.trim().startsWith('{')) {
            try {
                queue.json = JSON.parse(queue.appjs);
                if (queue.json.displayName != null) {
                    queue.displayName = queue.json.displayName;
                }
            } catch (err) {
                // Not JSON after all: run it as a script.
            }
        }
        var recorder = new QueueRecorder(queue);
        try {
            queue.run(recorder);
        } catch (err) {
            queue.setError(err);
        }
        queue.apps = recorder.apps;
        queue.options = recorder.options;
        queue.optionValues = recorder.optionValues;
        return queue;
    }

    /** The folder this queue's app paths are relative to. */
    dir() {
        return path.dirname(this.id);
    }

    resolve(appPath) {
        return path.isAbsolute(appPath) ? appPath : path.join(this.dir(), appPath);
    }

    /**
     * Runs this queue against target, a {@link Session} or a {@link QueueRecorder}, whose addApp
     * resolves paths relative to this queue.
     */
    run(target) {
        if (this.json != null) {
            var entries = this.json.apps || [];
            for (let i=0; i<entries.length; i++) {
                let appId = entries[i];
                let options = {};
                if (appId.appId != null) {
                    options = appId.options || {};
                    appId = appId.appId;
                }
                if (path.extname(appId) === '') {
                    appId += '.jtt';
                }
                target.addApp(appId, options);
            }
        } else {
            // The script refers to its target as `session`.
            let session = target; // jshint ignore:line
            eval(this.appjs); // jshint ignore:line
        }
    }

    /** Adds an app at the end of this queue's file. Reload the queue to see it. */
    addApp(appPath, options) {
        if (options == null) {
            options = {};
        }
        var relPath = path.relative(this.dir(), appPath).split(path.sep).join('/');
        if (this.json != null) {
            if (this.json.apps == null) {
                this.json.apps = [];
            }
            this.json.apps.push(Object.keys(options).length > 0 ? {appId: relPath, options: options} : relPath);
            fs.writeJSONSync(this.id, this.json, {spaces: 4});
        } else {
            var line = 'session.addApp(' + JSON.stringify(relPath);
            if (Object.keys(options).length > 0) {
                line += ', ' + JSON.stringify(options);
            }
            line += ');\n';
            var contents = this.appjs;
            if (contents.length > 0 && !contents.endsWith('\n')) {
                contents += '\n';
            }
            fs.writeFileSync(this.id, contents + line);
        }
    }

    setFileContents(contents) {
        fs.writeFileSync(this.id, contents);
    }

    reload() {
        return Queue.load(this.id, this.jt);
    }

    setError(err) {
        this.hasError = true;
        this.errorMessage = String(err);
        this.jt.log('Error loading queue ' + this.id + ': ' + err);
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

    /** What the admin interfaces read about an app, see {@link App#metaData}. */
    metaData() {
        return {
            id:             this.id,
            shortId:        this.shortId,
            title:          this.displayName,
            description:    this.description,
            appPath:        this.appPath,
            isQueue:        true,
            apps:           this.apps,
            options:        this.options,
            hasError:       this.hasError,
            errorMessage:   this.errorMessage,
            isStandaloneApp: true,
            stages:         [],
            appjs:          this.appjs,
        };
    }

    shellWithChildren() {
        return this.metaData();
    }

    /** The shape older admin interfaces read from their list of queues. */
    shell() {
        var out = {}
        out.id              = this.id;
        out.displayName     = this.displayName;
        out.apps            = this.apps;
        out.options         = this.options;
        out.optionValues    = this.optionValues;
        return out;
    }

}

/**
 * Stands in for a session when a queue is read for the catalogue: records the apps and options
 * the queue declares, without loading them or writing anything to disk.
 */
class QueueRecorder {

    constructor(queue) {
        this.queue          = queue;
        this.apps           = [];
        this.options        = [];
        this.optionValues   = {};
    }

    addApp(appPath, options) {
        this.apps.push({
            appId: this.queue.resolve(appPath),
            options: options || {},
            indexInQueue: this.apps.length + 1,
        });
    }

    setNumParticipants(num) {
        this.suggestedNumParticipants = num;
    }

}

for (const name of ['addNumberOption', 'addTextOption', 'addSelectOption', 'setOptionValue']) {
    QueueRecorder.prototype[name] = Session.new.prototype[name];
}

var exports = module.exports = {};
exports.new = Queue;
exports.load = Queue.load;
