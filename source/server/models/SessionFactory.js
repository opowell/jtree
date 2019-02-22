const Participant   = require('./Participant.js');
const Game           = require('./Game.js');
const Period        = require('./Period.js');
const Group         = require('./Group.js');
const Player        = require('./Player.js');
const Client        = require('./Client.js');
const Table         = require('./Table.js');
const Utils         = require('./Utils.js');
const fs            = require('fs-extra');
const path          = require('path');
const async         = require('async');
const Observer = require('micro-observer').Observer;
const deepcopy = require('deepcopy');

/**
* A session is a collection of apps and players.
*/
class SessionFactory {


    /**
    * Adds a particular number of participants to this session.
    * @param  {number} num The number of participants to add.
    */
    static addParticipants(num) {
        let partsAdded = 0;

        // Search through the list of participantIds until one is found for which
        // no participant already exists.
        for (var i=0; i<this.potentialParticipantIds.length; i++) {
            let pId = this.potentialParticipantIds[i];
            let ptcptAlreadyExists = this.participants[pId] !== undefined;

            // No participant already exists, so create one.
            if (!ptcptAlreadyExists) {
                this.participantCreate(pId);
                partsAdded++;

                // Check if enough participants have been created. If yes, exit.
                if (partsAdded >= num) {
                    return;
                }
            }
        }
    }

    static setNumParticipants(num) {
        let change = num - Object.keys(this.participants).length;
        if (change > 0) {
            this.addParticipants(change);
        } else if (change < 0) {
            this.removeParticipants(-change);
        }
    }

    static removeParticipants(num) {
        const parts = this.participants;
        for (let i=0; i<num; i++) {
            let len = Object.keys(parts).length;

            if (len < 1) {
                return;
            }

            let part = parts[Object.keys(parts)[len-1]];
            let pId = part.id;
            this.deleteParticipant(pId);
        }
    }

    static deleteParticipant(pId) {
        delete this.participants[pId];
        this.addMessage(
            'deleteParticipant',
            pId,
        );
    }
    
    static createNewParticipant() {
        let i = 0;
        let pId;
        let participant = {};
        while (participant != null) {
            i++;
            pId = 'P' + i;
            participant = this.participants[pId];
        }
        this.participantCreate(pId);
    }

    /**
    * participantCreate - description
    *
    * @param  {type} pId description
    * @return {type}     description
    */
   static participantCreate(pId) {
        if (!this.isValidPId(pId)) {
            return null;
        }

        this.addMessage(
            'createParticipant',
            pId,
        );
    }


}

var exports = module.exports = {};
exports.new         = Session;
exports.load        = Session.load;
