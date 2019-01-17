// Filename: api-routes.js
// Initialize express router
const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
// const jt        = require('../jtree.js')
const formidable = require('formidable');

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

router.post('/file/create', function (req, res) {
    let rootPath = path.join.apply(null, req.body.path);
    let filePath = path.join(rootPath, req.body.newName);
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            res.json(false);
            throw err;
        }
        console.log(filePath + " succesfully created.");
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

router.post('/file/delete', function (req, res) {
    let filePath = path.join.apply(null, req.body.path);

    if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmdir(filePath, (err) => {
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
        form.parse(req, function (err, fields, files) {
            try {
                var oldpath = files.file.path;
                let filePath = path.join.apply(null, fields.folderPath.split(','));
                filePath = path.join(filePath, files.file.name);
                fs.rename(oldpath, filePath, function (err) {
                    if (err) throw err;
                    res.json(true);
                });
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