// Filename: api-routes.js
// Initialize express router
const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
// const jt        = require('../jtree.js')


let router = require('express').Router();

router.get('/files', function (req, res) {

    var jt = {};
    if (process.argv[0].indexOf('node') > -1) {
      jt.path         = process.cwd();
  } else {
      jt.path         = path.dirname(process.execPath);
  }
  
    var dir = path.join(jt.path, 'apps');
    let out = getNode(dir, 'apps');
    out.rootPath = jt.path;
    res.json(out);
});

router.post('/renameFile', function (req, res) {
    let rootPath = path.join.apply(null, req.body.path);
    let oldPath = path.join(rootPath, req.body.oldName);
    let newPath = path.join(rootPath, req.body.newName);
    fs.renameSync(oldPath, newPath);
    res.json(true);
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

    var jt = {};
    if (process.argv[0].indexOf('node') > -1) {
      jt.path         = process.cwd();
  } else {
      jt.path         = path.dirname(process.execPath);
  }
  
    var dir = path.join(jt.path, 'apps');
    if (Utils.isDirectory(dir)) {
        var dirContents = fs.readdirSync(dir);
        for (var i in dirContents) {
            var curPath = path.join(dir, dirContents[i]);
            out.push(
                {
                    name: dirContents[i],
                    isFolder: fs.lstatSync(curPath).isDirectory()
                }
            );
        }
    }
    res.json(out);
});
// Export API routes
module.exports = router;