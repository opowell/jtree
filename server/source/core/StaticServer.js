const express   = require('express');
const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
const ip        = require('ip');
const http      = require('http');
const replace   = require("replace");
const bodyParser = require("body-parser");
const session   = require('express-session');



class StaticServer {

    constructor(jt) {
        this.jt = jt;
        var expApp = express();
        expApp.use(bodyParser.urlencoded({extended : true}));
        expApp.use(session(
            {
                secret: 'keyboard cat',
                cookie: { maxAge: 60000 },
                resave: false,
                saveUninitialized: true
            }
        ))

        var self = this;
        this.expApp = expApp;

        // FILES TO SERVE
        expApp.use('', express.static(path.join(this.jt.path, jt.settings.participantUI)));
        expApp.use('/help', express.static(path.join(this.jt.path, jt.settings.helpPath)));
        expApp.use('/admin', express.static(this.defaultAdminUIPath()));
        var adminUIs = fs.readdirSync(this.adminUIsPath());
        for (var i in adminUIs) {
            var pathToFolder = path.join(this.adminUIsPath(), adminUIs[i]);
            if (fs.lstatSync(pathToFolder).isDirectory()) {
                expApp.use('/admin/' + adminUIs[i], express.static(pathToFolder));
            }
        }
        expApp.use('/participant', express.static(path.join(this.jt.path, jt.settings.participantUI)));
        expApp.use('/shared', express.static(path.join(this.jt.path, jt.settings.sharedUI)));

        for (var i in jt.data.appsMetaData) {
            let metaData = jt.data.appsMetaData[i];
            expApp.use('/' + metaData.id, express.static(path.parse(metaData.appPath).dir));
        }

        // REQUESTS
        expApp.get('/', function(req, res) {
            self.sendParticipantPage(req, res, 'test', undefined);
        });

        expApp.get('/:pId', this.handleRequest.bind(this));
        expApp.post('/:pId', this.handleRequest.bind(this));

        expApp.get('/room/:rId', function(req, res) {
            res.cookie('roomId', req.params.rId);
            var room = self.jt.data.room(req.params.rId);
            res.cookie('roomDN', room.displayName);
            res.cookie('hasSecret', room.useSecureURLs);
            res.sendFile(path.join(self.jt.path, self.jt.settings.clientUI, '/room.html'));
        });

        expApp.get('/session-download/:sId', function(req, res) {
            var session = self.jt.data.session(req.params.sId);
            var out = session.saveOutput();
            res.send(out);
        });

        expApp.get('/room/:rId/:pId', function(req, res) {
            var room = self.jt.data.room(req.params.rId);
            if (room.isValidPId(req.params.pId, req.params.hash)) {
                res.sendFile(path.join(self.jt.path, self.jt.settings.participantUI + '/readyClient.html'));
            } else {
                res.cookie('roomId', req.params.rId);
                res.cookie('participantId', req.params.pId);
                res.cookie('roomDN', room.displayName);
                res.cookie('hasSecret', room.useSecureURLs);
                res.sendFile(path.join(self.jt.path, self.jt.settings.clientUI, '/room.html'));
            }

        });

        // GET /logout
        expApp.get('/users/logout', function(req, res, next) {
          if (req.session) {

              for (var i in self.jt.data.users) {
                  var user = self.jt.data.users[i];
                  if (user.id === req.session.userId) {
                      var ind = user.sessionIds.indexOf(req.session.id);
                      user.sessionIds.splice(ind, 1);
                  }
              }

            // delete session object
            req.session.destroy(function(err) {
              if(err) {
                return next(err);
              } else {
                return res.redirect('/admin');
              }
            });
          }
        });

        // expApp.get('/', function(req, res) {
        //     self.sendParticipantPage(req, res, req.query.id, undefined);
        // });
        //
        expApp.get('/session/:sId/:pId', function(req, res) {
            self.sendParticipantPage(req, res, req.params.pId, req.params.sId);
        });

        // Admin interfaces
        var adminUIs = fs.readdirSync(this.adminUIsPath());
        for (var i in adminUIs) {
            var pathToFolder = path.join(this.adminUIsPath(), adminUIs[i]);
            if (fs.lstatSync(pathToFolder).isDirectory()) {
                expApp.get('/admin/' + adminUIs[i], function(req, res) {
                    var ui = req.originalUrl.substring('/admin/'.length);
                    var id = req.query.id;
                    var pwd = req.query.pwd;
                    var admin = jt.data.getAdmin(id, pwd);
                    if (admin == null && jt.settings.adminLoginReq === true) {
                        res.sendFile(path.join(jt.staticServer.adminUIsPath(), ui, 'invalidAdminLogin.html'));
                    } else {
                        res.sendFile(path.join(jt.staticServer.adminUIsPath(), ui, 'admin.html'));
                    }
                });
            }
        }

        this.port = jt.settings.port;
        this.ip = ip.address();

        this.server = http.Server(expApp);
        var self = this;
        try {
            this.server.listen(this.port, function() {
                console.log('###############################################');
                console.log('jtree ' + jt.version + ', listening on ' + self.ip + ':' + self.port);
            });
        } catch (err) {
            if (jt.settings.port === 80) {
                jt.settings.port = 3000;
                this.port = jt.settings.port;
                this.server.listen(this.port, function() {
                    console.log('###############################################');
                    console.log('jtree ' + jt.version + ', listening on ' + self.ip + ':' + self.port);
                });
            }
        }

        this.generateSharedJS();

    }

    handleRequest(req, res) {
        var jt = this.jt;
        if (req.params.pId === 'admin') {
                var id = req.body.uId;
                var pwd = req.body.pwd;
                var adminUser = jt.data.isValidAdmin(id, pwd);
                if (
                    adminUser !== null
                ) {
                    if (adminUser !== 'defaultAdmin') {
                        adminUser.sessionIds.push(req.session.id);
                        req.session.userId = adminUser.id;
                        res.cookie('userId', adminUser.id);
                    }
                    res.sendFile(jt.staticServer.defaultAdminUIPath() + '/admin.html');
                } else {
                    if (jt.settings.multipleUsers) {
                        res.sendFile(jt.staticServer.defaultAdminUIPath() + '/adminLogin.html');
                    } else {
                        res.sendFile(jt.staticServer.defaultAdminUIPath() + '/defaultAdminLogin.html');
                    }
                }
        } else {
                this.sendParticipantPage(req, res, req.params.pId, undefined);
        }
    }

    defaultAdminUIPath() {
        return path.join(this.adminUIsPath(), this.jt.settings.defaultAdminUI);
    }

    adminUIsPath() {
        return path.join(this.jt.path, this.jt.settings.adminUIsPath);
    }

    /**
     * Generates "shared.js", to be used by all clients to connect to server.
     * 1. Create a copy of 'sharedTemplate.js'.
     * 2. Overwrite the serverURL variable with the IP + port of the current machine.
     *
     * References:
     * http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
     * http://stackoverflow.com/questions/14177087/replace-a-string-in-a-file-with-nodejs
     */
    generateSharedJS() {
        var fn = path.join(this.jt.path, this.jt.settings.clientJSTemplateFile) // file with marker
        var newFN = path.join(this.jt.path, this.jt.settings.clientJSFile) // actual file to be sent to clients and admins
        try {
            fs.copySync(fn, newFN);
            replace({
                regex: '{{{SERVER_IP}}}',
                replacement: this.ip,
                paths: [newFN],
                recursive: true,
                silent: true,
            });
            replace({
                regex: '{{{SERVER_PORT}}}',
                replacement: this.port,
                paths: [newFN],
                recursive: true,
                silent: true,
            });
        } catch (err) {
            console.error(err);
        }
    }

    sendParticipantPage(req, res, pId, sessionId) {
        var session = null;
        if (sessionId == null || sessionId == undefined) {
            session = this.jt.data.getMostRecentActiveSession();
        } else {
            session = Utils.findByIdWOJQ(this.jt.data.sessions, sessionId);
        }
        if (session === null) {
            res.sendFile(path.resolve(this.jt.path, './' + this.jt.settings.participantUI + '/invalidSession.html'));
        } else {
            session.sendParticipantPage(req, res, pId);
        }
    }

}

var exports = module.exports = {};
exports.new = StaticServer;
