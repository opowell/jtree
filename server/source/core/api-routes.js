// Filename: api-routes.js
// Initialize express router
const path      = require('path');
const fs        = require('fs-extra');
// const Utils     = require('../models/Utils.js');
// const jt        = require('../jtree.js')
const formidable = require('formidable');
// const Game = require('../models/Game.js');
// const rimraf = require("rimraf");
const {stringify} = require('flatted/cjs');

let router = require('express').Router();

router.get('/files', function (req, res) {

    var jt = global.jt;
    var dir = path.join(jt.path, 'apps');
    let out = getNode(dir, 'apps');
    out.rootPath = jt.path;
    res.json(out);
});

router.post('/file/create', function (req, res) {
    let rootPath = path.join.apply(null, req.body.path);
    let filePath = path.join(rootPath, req.body.newName);
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            res.json(false);
            throw err;
        }
        console.log('File ' + filePath + " succesfully created.");
        res.json(true);
    });
});

router.post('/file/createFolder', function (req, res) {
    let rootPath = path.join.apply(null, req.body.path);
    let filePath = path.join(rootPath, req.body.newName);
    fs.mkdir(filePath, (err) => {
        if (err) {
            res.json(false);
            throw err;
        }
        console.log('Folder ' + filePath + " succesfully created.");
        res.json(true);
    });
});

router.post('/session/create', function (req, res) {
    global.jt.data.createSession();
});

router.post('/session/delete', function (req, res) {
    let sessionId = req.body.sessionId;
    let session = global.jt.data.getSession(sessionId);
    if (session == null) {
        console.log('Error deleting session ' + sessionId);
        return;
    }

    // fs.close(session.fileStream.fd, function() {
    //     let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath);
    //     rimraf(filePath, (err) => {
    //         if (err) {
    //             console.log('Error deleting session: \n' + err);
    //             res.json(false);
    //             return;
    //         }
    //         console.log('Session ' + filePath + " succesfully deleted.");
    //         global.jt.data.deleteSession(sessionId);
    //         res.json(true);
    //     });
    // });

    
    // let endFunc = function() {
    //     let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath);
    //     fs.remove(filePath, (err) => {
    //         if (err) {
    //             console.log('Error deleting session: \n' + err);
    //             res.json(false);
    //             return;
    //         }
    //         console.log('Session ' + filePath + " succesfully deleted.");
    //         global.jt.data.deleteSession(sessionId);
    //         res.json(true);
    //     });
    //     session.fileStream.removeListener('finish', endFunc);
    // };
    // session.fileStream.on("finish", endFunc);
    // session.fileStream.end();

    // let endFunc = function() {
    //     let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath, req.body.sessionPath + '.gsf');
    //     fs.unlink(filePath, (err) => {
    //         if (err) {
    //             console.log(err);
    //             res.json(false);
    //             return;
    //         }
    //         console.log('File ' + filePath + " succesfully deleted.");
    //         res.json(true);
    //     });
    //     session.fileStream.removeListener('finish', endFunc);
    // };
    // session.fileStream.on("finish", endFunc);
    // session.fileStream.end();
    // let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath, req.body.sessionPath + '.gsf');
    let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath);
    fs.remove(filePath, (err) => {
        if (err) {
            console.log('Error deleting session: \n' + err);
            res.json(false);
            return;
        }
        console.log('Session ' + filePath + " succesfully deleted.");
        global.jt.data.deleteSession(sessionId);
        res.json(true);
    });

    // let endFunc = function() {
    //     let filePath = path.join(global.jt.path, 'sessions', req.body.sessionPath);
    // };
    // try {
    //     session.asyncQueue.kill();
    //     session.fileStream.on("close", endFunc);
    //     session.fileStream.destroy();
    // } catch (err) {
    //     console.log(err);
    //     endFunc();
    // }
});

router.post('/session/addGame', function (req, res) {
    let appPath = path.join.apply(null, req.body.filePath);
    let options = {};
    if (fs.lstatSync(appPath).isDirectory()) {
    } else {
        var app = null;
        let session = {};
        // app = new Game.new(session, global.jt, appPath);
        app.givenOptions = options;
     //   app.shortId = id;

        // Set options before running code.
         for (var i in options) {
            app.setOptionValue(i, options[i]);
        }

        let filePath = appPath;
        if (!fs.existsSync(appPath) && session.queuePath != null) {
            filePath = path.join(session.queuePath, appPath);
        }

        try {
            app.appjs = fs.readFileSync(filePath) + '';
            let treatment = app;
            let game = app;
            eval(app.appjs); // jshint ignore:line
            // console.log('loaded app ' + filePath);
        } catch (err) {
            global.jt.log('Error loading app: ' + filePath);
            global.jt.log(err);
            app = null;
        }
        let json = {
            success: true,
            game: stringify(app),
        }
        res.json(json);
    }
});

router.post('/file/delete', function (req, res) {
    let filePath = path.join.apply(null, req.body.path);

    if (fs.lstatSync(filePath).isDirectory()) {
        fs.rimraf(filePath, (err) => {
            if (err) {
                res.json(false);
                throw err;
            }
            console.log('Folder ' + filePath + " succesfully deleted.");
            res.json(true);
        });
    } else {
        fs.unlink(filePath, (err) => {
            if (err) {
                res.json(false);
                throw err;
            }
            console.log('File ' + filePath + " succesfully deleted.");
            res.json(true);
        });
    }
});

router.post('/file/rename', function (req, res) {
    let rootPath = path.join.apply(null, req.body.path);
    let oldPath = path.join(rootPath, req.body.oldName);
    let newPath = path.join(rootPath, req.body.newName);
    fs.renameSync(oldPath, newPath);
    res.json(true);
});

router.post('/file/upload', function (req, res) {
    try {
        var form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            try {
                for (let i=0; i<fields.numFiles; i++) {
                    let file = files['files[' + i + ']'];
                    var oldpath = file.path;
                    let filePath = path.join.apply(null, fields.folderPath.split(','));
                    filePath = path.join(filePath, file.name);
                    await fs.rename(oldpath, filePath);
                }
                res.json(true);
            } catch (err) {
                res.json(false);
            }
        });
    } catch (err) {
        res.json(false);
    }
});

function getNode(dir, title) {
    let node = {
        title: title,
    }
    if (fs.lstatSync(dir).isDirectory()) {
        node.children = [];
        var dirContents = fs.readdirSync(dir);
        for (var i in dirContents) {
            var curPath = path.join(dir, dirContents[i]);
            let child = getNode(curPath, dirContents[i]);
            node.children.push(child);
        }
    }
    return node;
}

router.get('/games', function (req, res) {
    let out = [];
    var dir = path.join(global.jt.path, 'apps');
    // if (Utils.isDirectory(dir)) {
    if (true) {
        var dirContents = fs.readdirSync(dir);
        for (var i in dirContents) {
            var curPath = path.join(dir, dirContents[i]);
            out.push(
                {
                    name: dirContents[i],
                    isFolder: fs.lstatSync(curPath).isDirectory(),
                    fullPath: curPath,
                }
            );
        }
    }
    res.json(out);
});

router.get('/sessions', function (req, res) {
    let out = [];
    let sessions = global.jt.data.sessions;
    for (let i=0; i<sessions.length; i++) {
        out.push(stringify(sessions[i]));
    }
    res.json(out);
});

router.get('/session/:sessionId', function (req, res) {
    let sessionId = req.params.sessionId;
    let session = global.jt.data.getSession(sessionId);
    res.json({
        success: true,
        session: strinfiy(session),
    });
});


// Export API routes
module.exports = router;
