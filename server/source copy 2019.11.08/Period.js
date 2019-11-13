const Player = require('./Player.js');
const Group = require('./Group.js');
const Utils = require('./Utils.js');
const fs        = require('fs-extra');
const path      = require('path');

/**
* Period object - test link {@link Session} {@link Session.clients}.
* @param  {App} app The app that this period belongs to.
*/
class Period {

    constructor(id, app, superGroup) {
        /**
         * Unique identifier for this participant.
         * @type {String}
         */
        this.id = id;

        this.superGroup = superGroup;
        // for (let p in superGroup.players) {
        //     superGroup.players[p].subPlayers.push([]);
        // }

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
        this.group = new Group.new(id, this, this.superGroup);
        this.superGroup.subGroups.push(this.group);
        for (let p in this.superGroup.players) {
            let sp = this.superGroup.players[p];
            let player = new Player.new(sp.id, sp, this.group, p+1);
            this.group.players.push(player);
        }
        
        this.superPeriod = null;
        if (app.superGame != null) {
            this.superPeriod = app.superGame.periods[app.superGame.periods.length-1];
        }
        
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

    numGroups() {
        let ng = null;
        if (this.app.groupSize !== undefined) {
            ng = Math.floor((this.superGroup.players.length - 1) / this.app.groupSize) + 1;
        } else if (this.app.numGroups != null) {
            ng = this.app.numGroups;
        } else {
            ng = 1; // by default, everyone in same group
        }
        return ng;
    }

    maxPlayersPerGroup() {
        //let this.app.session.participants.length;
    }

     groupBegin(group) {
         if (!group.startedPeriod) {
             group.startedPeriod = true;
             global.jt.log('START PERIOD - GROUP: ' + this.app.id + ', ' + this.id + ', ' + group.id);
             for (let p in group.players) {
                 this.playerBegin(group.players[p]);
             }
         }
     }

     recordPlayerEndTime(player) {
        let timeStamp = Utils.timeStamp();
        player['timeEnd'] = timeStamp;
        if (player['timeStart'] == null) {
            global.jt.log('Player ERROR, missing period start time!');
            player['msInPeriod'] = 0;
        } else {
            player['msInPeriod'] = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player['timeStart']);
        }
        global.jt.log('END PERIOD - PLAYER: ' + this.app.id + ', ' + this.id + ', ' + player.id);
    }

     recordPlayerStartTime(player) {
        let timeStamp = Utils.timeStamp();
        global.jt.log('START PERIOD - PLAYER: ' + this.app.id + ', ' + this.id + ', ' + player.id);
        player['timeStart'] = timeStamp;
    }

    playerEnd(player) {}

    groupEnd(group) {}

    groupEndInternal(group) {

        if (!this.canGroupEnd(group)) {
            return;
        }

        try {
            global.jt.log('END PERIOD - GROUP : ' + this.app.id + ', ' + this.id + ', ' + group.id);
            group.endedPeriod = true;
            this.groupEnd(group);
        } catch (err) {
            global.jt.log(err.stack);
        }
        for (let p in group.players) {
            this.playerEndInternal(group.players[p]);
        }

    }

    canPlayerEnd(player) {
        
        if (player.endedPeriod) {
            return false;
        }

        if (this.waitToEnd) {
            for (let i in player.group.players) {
                let plyr = player.group.players[i];
                if (
                    ['done', 'finished'].includes(plyr.status) === false
                    || plyr.stageIndex < this.app.subgames.length - 1
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    canGroupPlayersEnd(group) {

        if (!group.startedPeriod) {
            return false;
        }

        // If Group has already finished, do not allow players to finish. 
        if (!group.endedPeriod) {
            return false;
        }

        // If do not need to wait for all players, return true.
        if (!this.waitToEnd) {
            return true;
        }

        // If any player is not finished playing, return false.
        for (let p in group.players) {
            let player = group.players[p];
            if (
                ['done', 'finished'].includes(player.status) === false
                || player.stageIndex < this.app.subgames.length - 1
            ) {
                return false;
            }
        }
                        
        // Otherwise, return true.
        return true;
    }

    canGroupEnd(group) {
        return this.canGroupEndDefault(group);
    }

    canGroupEndDefault(group) {

        if (group.endedPeriod) {
            return false;
        }

        if (this.waitToEnd) {
            for (let i in group.players) {
                if (group.players[i].endedPeriod) {
                    return false;
                }
            }
        }

        if (this.waitToEnd) {
            // If any player is not in this stage, then return false.
            for (let p in group.players) {
                let player = group.players[p];
                if (player.stageIndex < this.app.subgames.length - 1
                 || player.status != 'done'
                ) {
                    return false;
                }
            }
        } 

        // Otherwise, return true.
        return true;
    }

    playerEndInternal(player) {
        player.status = 'done';
        this.groupEndInternal(player.group);
        if (!this.canPlayerEnd(player)) {
            return;
        }
        if (this.canGroupPlayersEnd(player.group)) {
            this.recordPlayerEndTime(player);
            player.endedPeriod = true;
            try {
                this.playerEnd(player);
            } catch(err) {
                global.jt.log(err + '\n' + err.stack);
            }
            player.superPlayer.endStage();
        }
        player.emitUpdate2();        
    }

    playerBegin(player) {

        this.groupBegin(player.group);

        if (player.startedPeriod) {
            return;
        }
        player.startedPeriod = true;
        this.recordPlayerStartTime(player);

        player.superGame = this.game;
        player.game = player.superGame;
        if (this.game.subgames.length > 0) {
            player.stageIndex = 0;
            player.subGame = this.game.subgames[player.stageIndex];
            player.stage = player.subGame;
            player.status = 'ready';
            player.participant().setPlayer(player);
            player.stage.playerStartInternal(player);
        } else {
            player.status = 'playing';
            player.participant().setPlayer(player);
        }
    }

    getPlayerGroupId(player) {
        if (this.group.subGroups.length !== this.numGroups()) {
            this.createGroups();
        }
        for (let g in this.group.subGroups) {
            let group = this.group.subGroups[g];
            if (group.playerWithParticipant(player) !== null) {
                return group.id;
            }
        }
        return null;
    }

    // splits players into groups.
    // participants: list of participants, player.group variable points to a list of players in the current group
    // numGroups: number of groups into which players are split
    createGroups() {
        const app = this.app;
        const players = this.group.players;
        const gIds = app.getGroupIdsForPeriod(this);

        // Create groups
        let pIds = [];
        for (let p in players) {
            pIds.push(players[p]);
        }

        let numGroups = this.numGroups();
        if (gIds[0].length != null) {
            numGroups = gIds.length;
        } else {
            for (let i in gIds) {
                numGroups = Math.max(numGroups, gIds[i]);
            }
        }
        for (let g=this.group.subGroups.length; g<numGroups; g++) {
            let group = new Group.new(g+1, this, this.group);

            if (gIds[g].length != null) {
                // Label format
                // [['P1', 'P2'], ['P3', 'P4'], ...]
                for (let i=0; i<gIds[g].length; i++) {
                    let pId = gIds[g][i];
                    let superPlyr = Utils.findById(players, pId);
                    let player = new Player.new(pId, superPlyr, group, i+1);
                    if (superPlyr == null) {
                        debugger;
                    }
                    superPlyr.subPlayers.push(player);
                    group.players.push(player);
                }
                group.allPlayersCreated = true;
                group.save();    
            } else {
                // Numerical format
                // [['P1', 'P2'], ['P3', 'P4'], ...]
                for (let i=0; i<gIds.length; i++) {
                    if (gIds[i] == group.id) {
                        let participant = Utils.findById(participants, pIds[i]);
                        let player = new Player.new(pIds[i], participant, group, group.players.length+1);
                        // participant.addPlayer(player);
                        player.save();
                        participant.save();
                        group.players.push(player);
                    }
                }
                group.allPlayersCreated = true;
                group.save();    
            }
        }

    }

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
