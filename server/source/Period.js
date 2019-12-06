const Player = require('./Player.js');
const Status = require('./Status.js');
const Group = require('./Group.js');
const Utils = require('./Utils.js');
const fs        = require('fs-extra');
const path      = require('path');

/**
* Period object - test link {@link Session} {@link Session.clients}.
* @param  {App} app The app that this period belongs to.
*/
class Period {

    constructor(id, app) {
        /**
         * Unique identifier for this participant.
         * @type {String}
         */
        this.id = id;

        /**
         * @type {App}
         */
        this.app = app;
        this.game = app;

        /**
         * List of groups for this period.
         * @type Array
         * @default []
         */
        this.groups = [];
        
        /**
         * 'outputHide' fields are not included in output
         * @type {String[]}
         */
        this.outputHide = ['stage', 'status', 'this', 'curAppId', 'periodTemp',
        'periodPerm', 'periodPermAuto', 'outputHide', 'app', 'groups', 'type',
        'stageTimerStart','stageTimerDuration','stageTimerTimeLeft','stageTimerStageIndex','stageTimerCallback','periodId','appIndex', 'gIds'];

        this.waitToEnd = true;
        this.waitToStart = true;
    }

    roomId() {
        return this.app.roomId() + '_period_' + this.id;
    }

    playerByParticipantId(id) {
        for (let g in this.group.subGroups) {
            let subGroup = this.group.subGroups[g];
            if (subGroup.playerByParticipantId(id) !== null) {
                return subGroup.playerByParticipantId(id);
            }
        }
        return null;
    }

    // maxPlayersPerGroup() {
    //     //let this.app.session.participants.length;
    // }

    // groupBegin(group) {
    //      if (group.status === Status.READY_TO_START) {
    //          group.status = Status.STARTED;
    //         //  global.jt.log('START PERIOD - GROUP: ' + this.app.id + ', ' + this.id + ', ' + group.id);

    //          for (let p in group.players) {
    //              this.playerBegin(group.players[p]);
    //          }
    //      }
    //  }

    //  recordPlayerEndTime(player) {
    //     let timeStamp = Utils.timeStamp();
    //     player['timeEnd'] = timeStamp;
    //     if (player['timeStart'] == null) {
    //         global.jt.log('Player ERROR, missing period start time!');
    //         player['msInPeriod'] = 0;
    //     } else {
    //         player['msInPeriod'] = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player['timeStart']);
    //     }
    //     // global.jt.log('END PERIOD - PLAYER: ' + this.app.id + ', ' + this.id + ', ' + player.id);
    // }

    //  recordPlayerStartTime(player) {
    //     let timeStamp = Utils.timeStamp();
    //     // global.jt.log('START PERIOD - SUBPLAYER: ' + this.app.id + ', ' + this.id + ', ' + player.id);
    //     player['timeStart'] = timeStamp;
    // }

    // playerEnd(player) {}

    // groupEnd(group) {}

    // groupEndInternal(group) {

    //     if (!this.canGroupEnd(group)) {
    //         return;
    //     }

    //     try {
    //         global.jt.log('END PERIOD - GROUP : ' + this.app.id + ', ' + this.id + ', ' + group.id);
    //         group.endedPeriod = true;
    //         this.groupEnd(group);
    //     } catch (err) {
    //         global.jt.log(err.stack);
    //     }
    //     for (let p in group.players) {
    //         this.playerEndInternal(group.players[p]);
    //     }

    // }

    // canPlayerEnd(player) {
        
    //     if (player.endedPeriod) {
    //         return false;
    //     }

    //     if (this.waitToEnd) {
    //         for (let i in player.group.players) {
    //             let plyr = player.group.players[i];
    //             if (
    //                 ['done', 'finished'].includes(plyr.status) === false
    //                 || plyr.gameIndex < this.app.subgames.length - 1
    //             ) {
    //                 return false;
    //             }
    //         }
    //     }

    //     return true;
    // }

    // canGroupPlayersEnd(group) {

    //     if (!group.startedPeriod) {
    //         return false;
    //     }

    //     // If Group has already finished, do not allow players to finish. 
    //     if (!group.endedPeriod) {
    //         return false;
    //     }

    //     // If do not need to wait for all players, return true.
    //     if (!this.waitToEnd) {
    //         return true;
    //     }

    //     // If any player is not finished playing, return false.
    //     for (let p in group.players) {
    //         let player = group.players[p];
    //         if (
    //             ['done', 'finished'].includes(player.status) === false
    //             || player.gameIndex < this.app.subgames.length - 1
    //         ) {
    //             return false;
    //         }
    //     }
                        
    //     // Otherwise, return true.
    //     return true;
    // }

    // canGroupEnd(group) {
    //     return this.canGroupEndDefault(group);
    // }

    // canGroupEndDefault(group) {

    //     if (group.endedPeriod) {
    //         return false;
    //     }

    //     if (this.waitToEnd) {
    //         for (let i in group.players) {
    //             if (group.players[i].endedPeriod) {
    //                 return false;
    //             }
    //         }
    //     }

    //     if (this.waitToEnd) {
    //         // If any player is not in this stage, then return false.
    //         for (let p in group.players) {
    //             let player = group.players[p];
    //             if (player.gameIndex < this.app.subgames.length - 1
    //              || player.status != 'done'
    //             ) {
    //                 return false;
    //             }
    //         }
    //     } 

    //     // Otherwise, return true.
    //     return true;
    // }

    // playerEndInternal(player) {
    //     player.status = 'done';
    //     this.groupEndInternal(player.group);
    //     if (!this.canPlayerEnd(player)) {
    //         return;
    //     }
    //     if (this.canGroupPlayersEnd(player.group)) {
    //         this.recordPlayerEndTime(player);
    //         player.endedPeriod = true;
    //         try {
    //             this.playerEnd(player);
    //         } catch(err) {
    //             global.jt.log(err + '\n' + err.stack);
    //         }
    //         player.superPlayer.endGame();
    //     }
    //     player.emitUpdate2();        
    // }

    groupIds() {
        let gIds = [];
        let groups = this.group.subGroups;
        for (let g=0; g<groups.length; g++) {
            gIds.push([]);
            let group = groups[g];
            for (let i=0; i<group.players.length; i++) {
                gIds[g].push(group.players[i].id);
            }
        }
        return gIds;
    }

    prevPeriod() {
        if (this.id < 2) {
            return null;
        }
        else {
            return this.app.periods[this.id-2];
        }
    }

    getStrangerMatching(numGroups, pIds, gIds, m, numCurrentGroups) {
        for (let g=numCurrentGroups; g<numGroups; g++) {
            for (let i=0; i<m; i++) {
                if (pIds.length < 1) {
                    return;
                }
                let rand = Utils.randomInt(0, pIds.length);
                gIds[g].push(pIds[rand]);
                pIds.splice(rand, 1);
            }
        }
    }

    addClient(client) {
        client.socket.join(this.roomId());
    }

    session() {
        return this.app.session;
    }

    outputFields() {
        let fields = [];
        for (let prop in this) {
            if (
                !Utils.isFunction(this[prop]) &&
                !this.outputHide.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    getOutputDir() {
        return this.app.getOutputFN() + '/periods/' + this.id;
    }

    /**
     * save - description
     *
     */
    save() {
        try {
            // global.jt.log('Period.save: ' + this.id);
            let toSave = this;
            this.session().saveDataFS(toSave, 'PERIOD');
        } catch (err) {
            console.log('Error saving period ' + this.id + ': ' + err);
        }
    }

}

var exports = module.exports = {};
exports.new = Period;
