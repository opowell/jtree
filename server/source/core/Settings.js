const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');

/** Settings that can be set in the settings.json file */
class Settings {

     constructor(jt) {

         this.jt = jt;

         // Admin access, see AdminAuth: without a password, only from the computer running jtree.
         this.admins                 = {}; // extra admin logins, {id: {pwd: '...'}}
         this.allowClientsToCreateParticipants = true; // default for new sessions
         this.autoSaveFreq           = 100000; // how often to save active sessions, in ms.
         this.logToConsole           = false;
         this.openAdminOnStart       = true; // whether or not the admin page should be opened when the server starts.
         this.multipleUsers          = false;
         this.reloadApps             = true; // load apps every time they are accessed.

         this.clientJSFile           = 'internal/clients/shared/shared.js';
         this.clientJSTemplateFile   = 'internal/sharedTemplate.js';
         this.defaultAdminUI         = 'v2'; // folder in adminUIsPath served at /admin; others at /admin/<folder>
         this.participantUI          = 'internal/clients/participant';
         this.clientUI               = 'internal/clients/participant';
         this.adminUIsPath           = 'internal/clients/admin';
         this.adminUIsSharedPath     = 'internal/clients/admin/shared';
         this.appFolders             = ['apps']; // the location of apps folders
         this.roomsPath              = 'rooms';
         this.usersPath              = 'users';
         this.helpPath               = 'internal/docs'; // location of help documents.
         this.logPath                = 'internal/logs';
         this.sessionsFolder         = 'sessions';
         this.sharedUI               = 'internal/clients/shared/';
         this.serverTimeInfoFilename = 'internal/serverState.json'; // location of file that stores last time server was active.
         this.autoplayDelay          = 'randomInt(4,8)*1000';
         this.outputDelimiter        = ';';
         this.useHTTPS               = false;
         this.basePath               = '/jtree'; // route everything is served under; '' for the root. JAS sets it from the app's route.
         this.httpsCertificateFile   = 'certificate.pem';
         this.defaultAdminPwd        = undefined; // admin password; set it to use the admin from other computers
         this.sessionShowFullLinks   = false;
         this.loadSettings           = false;
         this.session = {};
         this.session.suggestedNumParticipants = 4;
 
         this.valsToSave = {};

         this.server = {};

         this.logMessage = null;

         /**
          * Pre-specified participant IDs.
          */
         this.participantIds         = [];
         for (let i=1; i<100; i++) {
             this.participantIds.push('P' + i);
         }

         // On Linux / Mac, ports below 1024 require sudo access.
         var isWin = process.platform === "win32";
         if (isWin) {
             this.port               = 80;
         } else {
             this.port               = 3000;
         }

         var settings = this; // so that settings can be modified without using 'jt.' prefix.
         try {
            let settingsJSONPath = path.join(this.jt.path, 'settings.json');
            if (fs.existsSync(settingsJSONPath)) {
                var json = fs.readJSONSync(settingsJSONPath);
                for (var i in json) {
                    console.log('loading custom setting: ' + i + ' = ' + (/pwd|password/i.test(i) ? '********' : JSON.stringify(json[i])));
                    this[i] = json[i];
                }
            }
         } catch (err) {
             console.log('Error loading settings JSON file: ' + err);
             this.logMessage = err;
         }
         try {
             let settingsJSPath = path.join(this.jt.path, 'settings.js');
            if (fs.existsSync(settingsJSPath)) {
                var settingsFile = fs.readFileSync(settingsJSPath, 'utf8');
                console.log('loading custom settings from settings.js');
                eval(settingsFile);
            }
        } catch (err) {
            console.log('Error reading settings JS file: ' + err);
            this.logMessage = err;
        }

         // PORT, as JAS and the launchers use, wins over settings.json.
         if (process.env.PORT) {
             this.port               = parseInt(process.env.PORT);
         }
     }

     /**
      * Filename of log file. By default, returns YYYYMMDD-HHmmss-SSS log.txt
      */
     getLogFilename() {
         return Utils.getDate(new Date()) + '.txt';
     }

     getConsoleTimeStamp() {
         return Utils.getDate(new Date());
     }

     /**
      * Return the i-th participant ID.
      *
      * @param  {type} num description
      * @return {type}     description
      */
     getParticipantId(num) {
         return this.participantIds[num];
     }

     save() {
         Utils.writeJSON(path.join(this.jt.path, 'settings.json'), this.valsToSave);
     }

     setDefaultAdminPwd(curPwd, newPwd) {
         if (this.defaultAdminPwd === undefined || curPwd === this.defaultAdminPwd) {
             this.defaultAdminPwd = newPwd;
             this.valsToSave.defaultAdminPwd = newPwd;
             this.save();
         }
     }

     setMultipleUsers(b) {
         this.multipleUsers = b;
         this.valsToSave.multipleUsers = b;
         this.save();
     }

     outputFields() {
         var fields = [];
         for (var prop in this) {
             if (
                 !Utils.isFunction(this[prop]) &&
                 prop !== 'jt'
             )
             fields.push(prop);
         }
         return fields;
     }

     /** The settings sent to admin pages, without passwords. */
     shell() {
         var out = {};
         var fields = this.outputFields();
         for (var i in fields) {
             var field = fields[i];
             out[field] = this[field];
         }
         out.defaultAdminPwd = this.defaultAdminPwd ? '********' : undefined;
         out.admins = {};
         for (var id in this.admins) {
             out.admins[id] = { pwd: '********' };
         }
         out.valsToSave = Object.assign({}, this.valsToSave);
         delete out.valsToSave.defaultAdminPwd;
         return out;
     }

}

var exports = module.exports = {};
exports.new = Settings;
