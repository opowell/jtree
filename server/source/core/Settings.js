const path      = require('path');
const fs        = require('fs-extra');
//const getportsync  = require('get-port-sync');
const openport  = require('openport');
const Utils     = require('../Utils.js');

/** Settings that can be set in the settings.js file */
class Settings {

     constructor(jt) {

         this.jt = jt;

         this.admins                 = {};
         this.adminLoginReq          = false; // whether or not admins need to login.
         this.allowClientsToCreateParticipants = true; // default for new sessions
         this.autoSaveFreq           = 100000; // how often to save active sessions, in ms.
         this.logToConsole           = false;
         this.openAdminOnStart       = true; // whether or not the admin page should be opened when the server starts.
         this.multipleUsers          = false;
         this.reloadApps             = true; // load apps every time they are accessed.

         this.clientJSFile           = 'internal/clients/shared/shared.js';
         this.clientJSTemplateFile   = 'internal/sharedTemplate.js';
         this.defaultAdminUI         = 'multiuser';
         this.participantUI          = 'internal/clients/participant';
         this.clientUI               = 'internal/clients/participant';
         this.adminUIsPath           = 'internal/clients/admin';
         this.adminUIsSharedPath     = '/shared'; // relative to adminUIsPath.
         this.appFolders             = ['apps']; // the location of apps folders
         this.queuesPath             = 'queues';
         this.roomsPath              = 'rooms';
         this.usersPath              = 'users';
         this.helpPath               = 'internal/docs'; // location of help documents.
         this.logPath                = 'internal/logs';
         this.sessionsFolder         = 'sessions';
         this.sharedUI               = 'internal/clients/shared/';
         this.serverTimeInfoFilename = 'internal/serverState.json'; // location of file that stores last time server was active.
         this.autoplayDelay          = 'randomInt(4,8)*1000';

         this.valsToSave = {};

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
             var json = fs.readJSONSync(path.join(this.jt.path, 'internal/settings.js'));
             for (var i in json) {
                 this[i] = json[i];
             }
         } catch (err) {
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
         Utils.writeJSON(path.join(this.jt.path, 'internal/settings.js'), this.valsToSave);
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

     shell() {
         var out = {};
         var fields = this.outputFields();
         for (var i in fields) {
             var field = fields[i];
             out[field] = this[field];
         }
         return out;
     }

}

var exports = module.exports = {};
exports.new = Settings;
