const express   = require('express');
const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
const ip        = require('ip');
const http      = require('http');
const https     = require('https');
const replace   = require("replace");
const bodyParser = require("body-parser");
const session   = require('express-session');
// const history   = require('connect-history-api-fallback');
const openurl       = require('openurl');

const selfsigned = require('selfsigned');


/** Server for static files */
class StaticServer {

    constructor(jt) {
        this.jt = jt;
        var expApp = express();
        expApp.use(bodyParser.urlencoded({extended : true}));
        // expApp.use(history());
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

        //////////////////////////////
        // FILES TO SERVE
        expApp.use('', express.static(path.join(this.jt.path, jt.settings.participantUI)));
        expApp.use('/help', express.static(path.join(this.jt.path, jt.settings.helpPath)));
        expApp.use('/source', express.static(path.join(this.jt.path, jt.settings.adminUIsSharedPath)));
        expApp.use('/admin', express.static(this.defaultAdminUIPath()));
        // expApp.use('/adminShared', express.static(this.adminUIsSharedPath()));
        var adminUIs = fs.readdirSync(this.adminUIsPath());
        for (var i in adminUIs) {
            // Skip shared folder.
            // if (adminUIs[i] == 'shared') {
            //     continue;
            // }
            var pathToFolder = path.join(this.adminUIsPath(), adminUIs[i]);
            if (fs.lstatSync(pathToFolder).isDirectory()) {
                expApp.use('/admin/' + adminUIs[i], express.static(pathToFolder));
            }
        }
        expApp.use('/participant', express.static(path.join(this.jt.path, jt.settings.participantUI)));
        expApp.use('/shared', express.static(path.join(this.jt.path, jt.settings.sharedUI)));
        for (let i in jt.data.queues) {
            let queue = jt.data.queues[i];
            jt.log('serving files from ' + queue.parentFolderFullName() + ' as /' + queue.parentFolderName());
            expApp.use('/' + queue.parentFolderName(), express.static(queue.parentFolderFullName()));
        }
        // expApp.use(history());

        // END FILE SERVING
        //////////////////////////////

        //////////////////////////////
        // REQUESTS
        expApp.get('/', function(req, res) {
            let pId = null;
            if (req.query.id != null) {
                pId = req.query.id;
            }
            self.sendParticipantPage(req, res, pId, undefined);
        });

        expApp.get('/api/sessions', function(req, res) {
            let sessions = self.jt.data.loadSessions();
            let out = [];
            for (let i=0; i<sessions.length; i++) {
                out.push(sessions[i].shell());
            }
            res.send(out);
        });

        expApp.get('/api/apps', function(req, res) {
            let apps = self.jt.data.getApps();
            let out = [];
            for (let i=0; i<apps.length; i++) {
                out.push(apps[i].metaData());
            }
            res.send(out);
        });

        expApp.get('/api/clients', function(req, res) {
            let clients = self.jt.data.getClients(req.params.sessionId);
            // let out = [];
            // for (let i=0; i<clients.length; i++) {
            //     out.push(clients[i].shell());
            // }
            res.send(clients);
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
            res.setHeader('Content-disposition', 'attachment; filename=' + session.csvFN());
            res.set('Content-Type', 'text/csv');
            res.status(200).send(out);
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
        for (let i in adminUIs) {
            let pathToFolder = path.join(this.adminUIsPath(), adminUIs[i]);
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
        // END REQUESTS
        //////////////////////////////


        //////////////////////////////
        // START SERVER
        this.port = jt.settings.port;
        this.ip = ip.address();


        if (jt.settings.useHTTPS == false) {
            this.server = http.Server(expApp);
        } else {

            var attrs = [{ name: 'commonName', value: this.ip }];
            var pems = selfsigned.generate(attrs, { days: 365 });
            let options = {
                key: pems.private,
                cert: pems.cert,
            }

            this.server = https.createServer(options, expApp);
        }

        this.server.on('listening', () => {
            let protocol = 'http://';
            if (jt.settings.useHTTPS) {
                protocol = 'https://';
            }
            console.log('###############################################');
            jt.settings.server.ip = self.ip;
            jt.settings.server.port = self.port;
            console.log('jtree ' + jt.version + ', listening on ' + protocol + self.ip + ':' + self.port + '/admin');

            // pkg cannot include part of 'opn' package in executable.
            // const opn           = require('opn');
            if (jt.settings.openAdminOnStart) {
                //    opn('http://' + jt.staticServer.ip + ':' + jt.staticServer.port + '/admin');
                    try {
                        let protocol = 'http://';
                        if (jt.settings.useHTTPS) {
                            protocol = 'https://';
                        }
                        openurl.open(protocol + this.ip + ':' + this.port + '/admin');
                    } catch (err) {
                        console.error(err);
                    }
                }
  
        });

        let portsTried = [];

        this.server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                portsTried.push(jt.settings.port);
              this.server.close();
              let nextPort = 80;
              // On many OSses, ports below 1024 require admin access.
                for (let i=1025; i<9999; i++) {
                    if (!portsTried.includes(i)) {
                        nextPort = i;
                        break;
                    }
                }
              console.log('Something is already running on port ' + jt.settings.port + '. Retrying on port ' + nextPort + '...');
                jt.settings.port = nextPort;
                this.port = jt.settings.port;
                this.server.listen(this.port);
            }
          });

        this.server.listen(this.port);
        //////////////////////////////
        // Generate files used by clients.
        this.generateSharedJS(this.jt.settings.clientJSTemplateFile, this.jt.settings.clientJSFile);
        //////////////////////////////

    }

//     generateClientModels() {
// //        var file = babel.transformFileSync(path.join(this.jt.path, "../server/source/App.js"), {});
// //        fs.writeFileSync(path.join(this.jt.path, 'internal/clients/admin/shared/models.js'), file.code);
//     }

    handleRequest(req, res) {
        var jt = this.jt;
        let pId = req.params.pId;
        let adminCall = req.originalUrl === '/admin/' || req.originalUrl === '/admin';
        var adminUIs = fs.readdirSync(this.adminUIsPath());
        for (let i in adminUIs) {
            let pathToFolder = path.join(this.adminUIsPath(), adminUIs[i]);
            if (fs.lstatSync(pathToFolder).isDirectory()) {
                if (req.originalUrl === '/admin/' + adminUIs[i]) {
                    adminCall = true;
                    break;
                }
            }
        }
        if (adminCall) {
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
                    res.sendFile(this.getAdminPath(req) + '/admin.html');
                } else {
                    if (jt.settings.multipleUsers) {
                        res.sendFile(this.defaultAdminUIPath() + '/adminLogin.html');
                    } else {
                        res.sendFile(this.defaultAdminUIPath() + '/defaultAdminLogin.html');
                    }
                }
        } else if (pId === 'favicon.ico') {
            jt.log('asking for favicon.ico');
        } else {
            this.sendParticipantPage(req, res, req.params.pId, undefined);
        }
    }

    getAdminPath(req) {
        let defaultUI = req.originalUrl === '/admin/' || req.originalUrl === '/admin';
        if (defaultUI) {
            return path.join(this.defaultAdminUIPath());
        } else {
            return path.join(this.adminUIsPath(), req.originalUrl);
        }
    }

    defaultAdminUIPath() {
        return path.join(this.adminUIsPath(), this.jt.settings.defaultAdminUI);
    }

    adminUIsPath() {
        return path.join(this.jt.path, this.jt.settings.adminUIsPath);
    }

    /**
     * Folder containing content common to all admin UIs.
     */
    adminUIsSharedPath() {
        return path.join(this.adminUIsPath(), this.jt.settings.adminUIsSharedPath);
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
    generateSharedJS(inFile, outFile) {
        var fn = path.join(this.jt.path, inFile) // file with marker
        var newFN = path.join(this.jt.path, outFile) // actual file to be sent to clients and admins
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

        // If asked for a particular session, and that session:
        // - does not exists, send invalid session page.
        // - does exist, send participant page for that session.
        // If did not ask for particular session,
        // - send default start page.
        if (sessionId != null && session === null) {
            res.sendFile(path.resolve(this.jt.path, './' + this.jt.settings.participantUI + '/invalidSession.html'));
        } else {
            if (session != null) {
                session.sendParticipantPage(req, res, pId);
            } else {
                res.sendFile(path.join(this.jt.path, this.jt.settings.participantUI + '/readyClient.html'));
            }
        }
    }

}

var exports = module.exports = {};
exports.new = StaticServer;
