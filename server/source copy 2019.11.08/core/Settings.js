const path      = require('path');
const fs        = require('fs-extra');
//const getportsync  = require('get-port-sync');
const openport  = require('openport');
const Utils     = require('../Utils.js');

/** Settings that can be set in the settings.json file */
class Settings {

     constructor() {

         this.admins                 = {};
         this.adminLoginReq          = false; // whether or not admins need to login.
         this.autoSaveFreq           = 100000; // how often to save active sessions, in ms.
         this.logToConsole           = false;
         this.openAdminOnStart       = true; // whether or not the admin page should be opened when the server starts.
         this.multipleUsers          = false;
         this.reloadApps             = true; // load apps every time they are accessed.

         this.clientJSFile           = 'internal/clients/shared/shared.js';
         this.clientJSTemplateFile   = 'internal/sharedTemplate.js';
         this.clientJSModuleFile           = '../vueadmin/src/webcomps/shared.js';
         this.clientJSModuleTemplateFile   = 'internal/sharedTemplateModule.js';
         this.defaultAdminUI         = 'vue';
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
         this.httpsCertificateFile   = 'certificate.pem';
         this.defaultAdminPwd        = undefined;
         this.sessionShowFullLinks   = false;
         this.loadSettings           = false;
         this.session = {};
         this.session.suggestedNumParticipants = 4;
         this.session.allowClientsToCreateParticipants = true;
         this.session.isValidPId = function(id) { // return true if the participant id is valid, false otherwise.
             return (
                this.isValidPIdPxx(id) ||
                this.isValidPIdIP(id)
             );
         }
         this.session.isValidPIdPxx = function(id) {
             if (id == null) {
                 return false;
             }
             let regexp = /([P][0-9]+$)/i
             return id.match(regexp) != null;
         }
         this.session.isValidPIdIP = function(id) {
             if (id == null) {
                 return false;
             }
             let regexp = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/
             return id.match(regexp) != null;
         }
         this.session.getNextAvailablePId = function(id) {
            for (var i=0; i<10000; i++) {
                let pId = 'P' + (i+1);
                let ptcptAlreadyExists = false;
                for (let j in this.proxy.state.participants) {
                    if (this.proxy.state.participants[j].id === pId) {
                        ptcptAlreadyExists = true;
                        break;
                    }
                }
                if (!ptcptAlreadyExists) {
                    // No participant already exists, so create one.
                    return pId;
                }
            }
            return null;
         }

        /**
         * Whether or not admin windows can play.
         * Generally, during testing this can be true.
         */
        this.session.allowAdminClientsToPlay = true;

 
         this.valsToSave = {};

         this.server = {};

         this.logMessage = null;

         // On Linux / Mac, ports below 1024 require sudo access.
         var isWin = process.platform === "win32";
         if (isWin) {
             this.port               = 80;
         } else {
             this.port               = 3000;
         }

         var settings = this; // so that settings can be modified without using 'jt.' prefix.
         try {
            let settingsJSONPath = path.join(global.jt.path, 'settings.json');
            if (fs.existsSync(settingsJSONPath)) {
                var json = fs.readJSONSync(settingsJSONPath);
                for (var i in json) {
                    console.log('loading custom setting: ' + i + ' = ' + json[i]);
                    this[i] = json[i];
                }
            }
         } catch (err) {
             console.log('Error loading settings JSON file: ' + err);
             this.logMessage = err;
         }
         try {
             let settingsJSPath = path.join(global.jt.path, 'settings.js');
            if (fs.existsSync(settingsJSPath)) {
                var settingsFile = fs.readSync(path.join(global.jt.path, 'settings.js'));
                console.log('loading custom settings from settings.js');
                eval(settingsFile);
            }
        } catch (err) {
            console.log('Error reading settings JS file: ' + err);
            this.logMessage = err;
        }

         if (this.port === undefined) {
         //     try {
         //         this.port = getPortSync();
         //     } catch (err) {
         //         this.port = 3000;
         //     }
            openport.find(function(err, port) {
                if (err) { console.log(err); return; }
                this.port = port;
            });
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
         Utils.writeJSON(path.join(global.jt.path, 'settings.json'), this.valsToSave);
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
                 !Utils.isFunction(this[prop])
             )
             fields.push(prop);
         }
         return fields;
     }

}

var exports = module.exports = {};
exports.new = Settings;
