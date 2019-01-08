// Filename: api-routes.js
// Initialize express router
const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
// const jt        = require('../jtree.js')

let router = require('express').Router();
// Set default API response
router.get('/test', function (req, res) {
    res.json(
        [      {
            id: 'Game1',
            description: 'this is game 1',
          },
          {
            id: 'Game2',
            description: 'this is game 2',
          },
          {
            id: 'Game3',
            description: 'this is game 3',
          },
    ]
    );
});

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