const express   = require('express');
const path      = require('path');
const fs        = require('fs-extra');
const os        = require('os');
const Utils     = require('../Utils.js');
const http      = require('http');
const https     = require('https');
const { spawn } = require('child_process');
const selfsigned = require('selfsigned');
const exporters = require('../exporters/index.js');

const AdminAuth = require('./AdminAuth.js');

/** Opens a URL in the default browser. */
function openUrl(url) {
    var command = { darwin: 'open', win32: 'cmd' }[process.platform] || 'xdg-open';
    var args = process.platform === 'win32' ? ['/c', 'start', '""', url] : [url];
    var child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.on('error', function(err) {
        console.log('jtree: could not open a browser (' + err.message + '), open ' + url);
    });
    child.unref();
}


/**
 * Rewrites root-absolute URLs (src="/shared/...", href='/admin/...', action="/admin") in HTML
 * responses to sit under basePath, so pages written for the root work wherever jtree is served.
 * Applies to every HTML page: jtree's own, and experiment apps' stages.
 */
function prefixHtmlUrls(basePath) {
    if (basePath === '') {
        return function(req, res, next) { next(); };
    }
    var escaped = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var rootUrl = new RegExp('\\b(src|href|action)(\\s*=\\s*)(["\'])\\/(?!\\/|' + escaped.substring(1) + '\\/)', 'gi');
    return function(req, res, next) {
        var write = res.write;
        var end = res.end;
        var chunks = [];
        var isHtml = function() {
            return /^text\/html/.test(res.getHeader('Content-Type') || '');
        };
        res.write = function(chunk, encoding) {
            if (!isHtml()) {
                return write.apply(res, arguments);
            }
            chunks.push(Buffer.from(chunk, encoding));
            return true;
        };
        res.end = function(chunk, encoding) {
            if (!isHtml() || req.method === 'HEAD') {
                return end.apply(res, arguments);
            }
            if (chunk != null && typeof chunk !== 'function') {
                chunks.push(Buffer.from(chunk, encoding));
            }
            var html = Buffer.concat(chunks).toString('utf8').replace(rootUrl, '$1$2$3' + basePath + '/');
            if (!res.headersSent) {
                res.setHeader('Content-Length', Buffer.byteLength(html));
            }
            return end.call(res, html);
        };
        next();
    };
}

/**
 * The first non-internal IPv4 address, so links given to participants work from other machines
 * on the network. Loopback aliases (e.g. 10.x addresses on lo0) count as internal.
 */
function lanAddress() {
    var interfaces = os.networkInterfaces();
    for (var name in interfaces) {
        var addresses = interfaces[name] || [];
        for (var i = 0; i < addresses.length; i++) {
            if (addresses[i].family === 'IPv4' && !addresses[i].internal) {
                return addresses[i].address;
            }
        }
    }
    return 'localhost';
}

/** Server for static files */
class StaticServer {

    constructor(jt) {
        this.jt = jt;
        var expApp = express();
        expApp.use(express.urlencoded({extended : true}));

        /** Who may use the admin interface, see {@link AdminAuth}. */
        this.auth = new AdminAuth.new(jt);
        expApp.use(this.auth.sessionMiddleware);
        // After the session, whose own res.end wrapper sends the headers early: this one must run first.
        expApp.use(prefixHtmlUrls(jt.basePath));

        var self = this;
        this.expApp = expApp;

        //////////////////////////////
        // ADMIN LOGIN
        expApp.get('/admin/login', (req, res) => this.auth.sendLoginPage(req, res));
        // Older login forms post to /admin.
        expApp.post(['/admin/login', '/admin'], (req, res) => this.auth.login(req, res));
        expApp.use(['/admin', '/api', '/session-download', '/source'], this.auth.requireAdmin());
        //////////////////////////////

        //////////////////////////////
        // FILES TO SERVE
        expApp.use(express.static(path.join(this.jt.path, jt.settings.participantUI)));
        expApp.use('/help', express.static(path.join(this.jt.path, jt.settings.helpPath)));
        expApp.use('/source', express.static(path.join(this.jt.path, jt.settings.adminUIsSharedPath)));
        // Admin interfaces may be TypeScript and Vue files that the browser compiles (admin/v2),
        // which would otherwise go out as video/mp2t and application/octet-stream.
        var adminStatic = (dir) => express.static(dir, {
            setHeaders: (res, filePath) => {
                if (/\.(ts|vue)$/.test(filePath)) {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                }
            },
        });
        expApp.use('/admin', adminStatic(this.defaultAdminUIPath()));
        var adminUIs = this.adminUIs();
        for (var i in adminUIs) {
            expApp.use('/admin/' + adminUIs[i], adminStatic(path.join(this.adminUIsPath(), adminUIs[i])));
        }
        expApp.use('/participant', express.static(path.join(this.jt.path, jt.settings.participantUI)));
        console.log('serving shared', path.join(this.jt.path, jt.settings.sharedUI))
        expApp.use('/shared', express.static(path.join(this.jt.path, jt.settings.sharedUI)));
        for (let i in jt.data.queues) {
            let queue = jt.data.queues[i];
            jt.log('serving files from ' + queue.parentFolderFullName() + ' as /' + queue.parentFolderName());
            expApp.use('/' + queue.parentFolderName(), express.static(queue.parentFolderFullName()));
        }

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
            res.send(Object.values(self.jt.data.appsMetaData));
        });

        expApp.get('/api/clients', function(req, res) {
            let clients = self.jt.data.getClients(req.params.sessionId);
            // let out = [];
            // for (let i=0; i<clients.length; i++) {
            //     out.push(clients[i].shell());
            // }
            res.send(clients);
        });

        // The default admin interface, when its folder has no index.html for express.static to find.
        expApp.get(['/admin', '/admin/'], (req, res) => {
            res.sendFile(path.join(this.defaultAdminUIPath(), 'admin.html'));
        });

        expApp.get('/:pId', this.handleRequest.bind(this));
        expApp.post('/:pId', this.handleRequest.bind(this));

        expApp.get('/room/:rId', function(req, res) {
            var room = self.jt.data.room(req.params.rId);
            if (room == null) {
                return self.sendNoRoom(res, req.params.rId);
            }
            res.cookie('roomId', req.params.rId);
            res.cookie('roomDN', room.displayName);
            res.cookie('hasSecret', room.useSecureURLs);
            res.sendFile(path.join(self.jt.path, self.jt.settings.clientUI, '/room.html'));
        });

        // A session's data, in one of the formats of server/source/exporters (jtree's by default).
        expApp.get(['/session-download/:sId', '/session-download/:sId/:format'], function(req, res) {
            var session = self.jt.data.session(req.params.sId);
            if (session == null) {
                return res.status(404).type('text').send('There is no session "' + req.params.sId + '".');
            }
            var format = exporters.exporter(session, req.params.format || 'jtree');
            if (format == null) {
                return res.status(404).type('text').send('Session "' + req.params.sId + '" has no data as "' + req.params.format + '".');
            }
            res.setHeader('Content-disposition', 'attachment; filename=' + format.filename(session));
            res.set('Content-Type', format.contentType);
            res.status(200).send(format.write(session));
        });

        expApp.get('/room/:rId/:pId', function(req, res) {
            var room = self.jt.data.room(req.params.rId);
            if (room == null) {
                return self.sendNoRoom(res, req.params.rId);
            }
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
                return res.redirect(jt.basePath + '/admin');
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

        // Admin interfaces without an index.html, e.g. /admin/multiuser.
        for (let i in adminUIs) {
            let adminHtml = path.join(this.adminUIsPath(), adminUIs[i], 'admin.html');
            expApp.get('/admin/' + adminUIs[i], function(req, res, next) {
                if (!fs.existsSync(adminHtml)) {
                    return next();
                }
                res.sendFile(adminHtml);
            });
        }
        // END REQUESTS
        //////////////////////////////


        //////////////////////////////
        // START SERVER
        // Hosted by another program (see jtree.js), attach to its server; otherwise listen on our own.
        if (jt.httpServer != null) {
            this.attach(jt.httpServer);
        } else {
            this.listen();
        }
        //////////////////////////////

    }

    /**
     * Serve from a server owned by a hosting program (e.g. JAS), which mounts {@link StaticServer#expApp}
     * and decides the port.
     */
    attach(httpServer) {
        var jt = this.jt;
        this.server = httpServer;
        this.ip = lanAddress();
        if (jt.settings.useHTTPS) {
            console.log('jtree: useHTTPS is ignored, the hosting server decides the protocol');
        }
        this.server.on('listening', () => {
            this.port = this.server.address().port;
            jt.settings.port = this.port;
            jt.settings.server.ip = this.ip;
            jt.settings.server.port = this.port;
            let protocol = this.server instanceof https.Server ? 'https://' : 'http://';
            let adminUrl = protocol + 'localhost:' + this.port + jt.basePath + '/admin/';
            console.log('jtree ' + jt.version);
            console.log('  admin:        ' + adminUrl);
            console.log('  participants: ' + protocol + this.ip + ':' + this.port + jt.basePath + '/');
            this.generateSharedJS(jt.settings.clientJSTemplateFile, jt.settings.clientJSFile);
            if (jt.settings.openAdminOnStart) {
                openUrl(adminUrl);
            }
        });
    }

    listen() {
        var jt = this.jt;
        var self = this;
        var expApp = this.expApp;

        // Serve under jt.basePath, and send visitors to the root there.
        if (jt.basePath !== '') {
            expApp = express();
            expApp.use(jt.basePath, this.expApp);
            expApp.get('/', function(req, res) {
                res.redirect(jt.basePath + '/');
            });
        }

        this.port = jt.settings.port;
        this.ip = lanAddress();
        let protocol = jt.settings.useHTTPS ? 'https://' : 'http://';

        // HTTPS gets a self-signed certificate, made before listening; the server is
        // made now so that socket.io can attach to it.
        let ready = Promise.resolve();
        if (jt.settings.useHTTPS) {
            this.server = https.createServer(expApp);
            ready = selfsigned.generate([{ name: 'commonName', value: this.ip }], { days: 365 }).then((pems) => {
                this.server.setSecureContext({ key: pems.private, cert: pems.cert });
            });
        } else {
            this.server = http.createServer(expApp);
        }

        this.server.on('listening', () => {
            jt.settings.server.ip = self.ip;
            jt.settings.server.port = self.port;
            // Admin opens from this computer without a password (see AdminAuth), so point it at localhost.
            let adminUrl = protocol + 'localhost:' + this.port + jt.basePath + '/admin/';
            console.log('###############################################');
            console.log('jtree ' + jt.version);
            console.log('  admin:        ' + adminUrl);
            console.log('  participants: ' + protocol + this.ip + ':' + this.port + jt.basePath + '/');
            // After listening: an occupied port moves this.port.
            this.generateSharedJS(jt.settings.clientJSTemplateFile, jt.settings.clientJSFile);
            if (jt.settings.openAdminOnStart) {
                openUrl(adminUrl);
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

        ready.then(() => this.server.listen(this.port), (err) => {
            console.error('jtree: could not make an HTTPS certificate: ' + err);
            process.exit(1);
        });
    }

//     generateClientModels() {
// //        var file = babel.transformFileSync(path.join(this.jt.path, "../server/source/App.js"), {});
// //        fs.writeFileSync(path.join(this.jt.path, 'internal/clients/admin/shared/models.js'), file.code);
//     }

    handleRequest(req, res) {
        if (req.params.pId === 'favicon.ico') {
            return res.status(404).end();
        }
        this.sendParticipantPage(req, res, req.params.pId, undefined);
    }

    sendNoRoom(res, rId) {
        res.status(404).type('text').send('There is no room "' + rId + '".');
    }

    /** Names of the admin interfaces: the folders in {@link Settings#adminUIsPath}. */
    adminUIs() {
        return fs.readdirSync(this.adminUIsPath()).filter((name) => {
            return fs.statSync(path.join(this.adminUIsPath(), name)).isDirectory();
        });
    }

    /** The admin interface served at /admin: {@link Settings#defaultAdminUI}, or multiuser if that one is missing. */
    defaultAdminUIPath() {
        var ui = path.join(this.adminUIsPath(), this.jt.settings.defaultAdminUI);
        if (!fs.existsSync(ui)) {
            if (!this.warnedNoDefaultAdminUI) {
                this.warnedNoDefaultAdminUI = true;
                console.log('jtree: there is no admin interface "' + this.jt.settings.defaultAdminUI + '" in ' + this.adminUIsPath() + ', serving multiuser at /admin');
            }
            return path.join(this.adminUIsPath(), 'multiuser');
        }
        return ui;
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
     * Copies 'sharedTemplate.js', filling in this machine's IP, the port and the route.
     */
    generateSharedJS(inFile, outFile) {
        var fn = path.join(this.jt.path, inFile) // file with marker
        var newFN = path.join(this.jt.path, outFile) // actual file to be sent to clients and admins
        try {
            var text = fs.readFileSync(fn, 'utf8')
                .replaceAll('{{{SERVER_IP}}}', this.ip)
                .replaceAll('{{{SERVER_PORT}}}', String(this.port))
                .replaceAll('{{{BASE_PATH}}}', this.jt.basePath);
            fs.writeFileSync(newFN, text);
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
