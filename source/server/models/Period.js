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

    constructor(id, app) {
        /**
         * Unique identifier for this participant.
         * @type {String}
         */
        this.id = id;

        /**
         * @type {Game}
         */
        this.app = app;
        this.game = app;

        /**
         * List of groups for this period.
         * @type Array
         * @default []
         */
        this.groups = [];

        this.superPeriod = null;

        // Link to parent period, if any.
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
    }

    roomId() {
        return this.app.roomId() + '_period_' + this.id;
    }

    /**
     * participantEnd - description
     *
     * Called from:
     * - {@link App#participantMoveToNextPeriod}
     *
     * @param  {type} participant description
     * @return {type}             description
     */
    participantEnd(participant) {
        for (var i=0; i<participant.clients.length; i++) {
            var client = participant.clients[i];
            client.getSocket().leave(this.roomId());
            client.getSocket().leave(participant.player.roomId());
            client.getSocket().leave(participant.player.group.roomId());
        }
        participant.period = null;
        participant.player = null;
    }

    playerByParticipantId(id) {
        for (var g in this.groups) {
            if (this.groups[g].playerByParticipantId(id) !== null) {
                return this.groups[g].playerByParticipantId(id);
            }
        }
        return null;
    }

    numGroups() {
        var ng = null;
        if (this.app.groupSize !== undefined) {
            ng = Math.floor((this.session().participants.length - 1) / this.app.groupSize) + 1;
        } else {
            ng = this.app.numGroups;
            if (ng === undefined) {
                ng = 1; // by default, everyone in same group
            }
        }
        return ng;
    }

    maxPlayersPerGroup() {
        //var this.app.session.participants.length;
    }

    /**
     * participantBegin - description
     *
     * Called from:
     * - {@link participantBeginPeriod}
     *
     * @param  {type} participant description
     * @return {type}             description
     */
    participantBegin(participant) {
        var groupId = this.getParticipantGroupId(participant);
        if (groupId === null) {
            console.log('Error: no group defined for ' + participant.id + ' in ' + this.roomId());
        }

        var gr = null;
        for (var g in this.groups) {
            var group = this.groups[g];
            if (group.id === groupId) {
                gr = group;
                break;
            }
        }
        if (gr === null) {
            gr = new Group.new(groupId, this);
            // gr.save();
            this.groups.push(gr);
        }
        var player = gr.playerWithParticipant(participant);
        if (player === null) {
            // create player
            player = new Player.new(participant.id, participant, gr, gr.players.length+1);
            participant.players.push(player);
            // player.save();
            // participant.save();
            gr.players.push(player);
            //            if (gr.players.length this.)
        }
        participant.setPlayer(player);

        if (participant.player === null) {
            console.log('APP: error assigning group for participant ' + participant.id);
        }

        player.stageIndex = 0;
        player.stage = this.game.subgames[player.stageIndex];
        player.game = this.game.subgames[player.stageIndex];
        player.status = 'ready';
        player.startStage(player.stage);
    }

    getParticipantGroupId(participant) {
        if (this.groups.length !== this.numGroups()) {
            this.createGroups();
        }
        for (var g in this.groups) {
            var group = this.groups[g];
            if (group.playerWithParticipant(participant) !== null) {
                return group.id;
            }
        }
        return null;
    }

    getGameTreePath() {
        let out = [];
        if (this.superPeriod != null) {
            out = this.superPeriod.getGameTreePath();
        }
        out.push(this.game.id);
        out.push(this.id);
        return out;
    }

    // splits players into groups.
    // participants: list of participants, player.group variable points to a list of players in the current group
    // numGroups: number of groups into which players are split
    createGroups() {
        const app = this.app;
        const participants = app.session.participants;
        const numGroups = this.numGroups();
        const gIds = app.getGroupIdsForPeriod(this);

        // Create groups
        var pIds = [];
        for (let i=0; i<participants.length; i++) {
            pIds.push(participants[i].id);
        }

        for (var g=this.groups.length; g<numGroups; g++) {
            var group = new Group.new(g+1, this);
            // group.save();
            this.groups.push(group);
            for (var i=0; i<gIds[g].length; i++) {
                var pId = gIds[g][i];
                var participant = null;
                for (let j=0; j<participants.length; j++) {
                    if (participants[j].id === pId) {
                        participant = participants[j];
                        break;
                    }
                }
                var player = new Player.new(pId, participant, group, i+1);
                participant.addPlayer(player);
                group.players.push(player);
            }
            group.allPlayersCreated = true;
            // group.save();
//            if (this.app.stages[0].canGroupPlay(group)) {
            //    this.app.stages[0].groupPlayDefault(group);
//            }
        }
    }

    groupIds() {
        var gIds = [];
        for (var g=0; g<this.groups.length; g++) {
            gIds.push([]);
            var group = this.groups[g];
            for (var i=0; i<group.players.length; i++) {
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
        for (var g=numCurrentGroups; g<numGroups; g++) {
            for (var i=0; i<m; i++) {
                if (pIds.length < 1) {
                    return;
                }
                var rand = Utils.randomInt(0, pIds.length);
                gIds[g].push(pIds[rand]);
                pIds.splice(rand, 1);
            }
        }
    }

    addClient(client) {
        client.getSocket().join(this.roomId());
    }

    session() {
        return this.app.session;
    }

    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                !Utils.isFunction(this[prop]) &&
                !this.outputHide.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    server() {
        return this.session().jt;
    }

    getOutputDir() {
        return this.app.getOutputFN() + '/periods/' + this.id;
    }

    // autoSave() {
    //     Utils.writeJSON(this.app.getOutputFN() + '/periods/' + id + '/period.json', this.shell());
    //     for (var i in this.groups) {
    //         this.groups[i].autoSave();
    //     }
    // }

    // shellWithParent() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.app = this.app.shellWithParent();
    //     return out;
    // }

    // shellWithChildren() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.app = this.app.id;
    //     out.groups = [];
    //     for (var i in this.groups) {
    //         out.groups[i] = this.groups[i].shellWithChildren();
    //     }
    //     return out;
    // }

    // shell() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.appIndex = this.app.indexInSession();
    //     return out;
    // }

    /**
     * save - description
     *
     */
    save() {
        try {
            this.server().log('Period.save: ' + this.id);
            var toSave = this.shell();
            this.session().saveDataFS(toSave, 'PERIOD');
        } catch (err) {
            console.log('Error saving period ' + this.id + ': ' + err);
        }
    }

    /**
     * @static load - description
     *
     * CALLED FROM:
     * - {@link Session#load}
     *
     * @param  {type} json    description
     * @param  {type} session description
     * @return {type}         description
     */
    static load(json, session) {
        var id = json.id;
        var app = session.apps[json.appIndex-1];
        var newPeriod = new Period(id, app);
        if (app.periods.length > id-1) {
            var curPeriod = app.periods[id-1];
            newPeriod.groups = curPeriod.groups;
        }
        for (var j in json) {
            newPeriod[j] = json[j];
        }
        app.periods[id-1] = newPeriod;
    }

}

var exports = module.exports = {};
exports.new = Period;
exports.load = Period.load;
