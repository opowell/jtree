const Observer = require('micro-observer').Observer;
const deepcopy = require('deepcopy');
const Utils         = require('./Utils.js');
const Participant   = require('./Participant.js');

class SessionV2 {

    constructor(jt) {
        this.jt = jt;
        this.id = Utils.getDate();
        this.initialState = {
            participants: [],
            gameTree: [],
        };
        this.proxyObj = {
            id: this.id,
            messages: [],
            messageLatest: true,
            messageIndex: -1,
            initialState: this.initialState,
            state: this.initialState,
        }

        this.proxy = Observer.create(this.proxyObj, function(change) {
            let msg = {
                arguments: change.arguments,
                function: change.function,
                path: change.path,
                property: change.property,
                type: change.type,
                newValue: change.newValue,
            }
            if (change.type === 'function-call' && !['splice', 'push', 'unshift'].includes(change.function)) {
                return true;
            }
            msg.newValue = jt.data.toShell(msg.newValue);
            msg.arguments = jt.data.toShell(msg.arguments);
            console.log('emit message: \n' + JSON.stringify(msg));
            jt.socketServer.io.to(jt.socketServer.ADMIN_TYPE).emit('objChange', msg);
            return true; // to apply changes locally.
        });

    }

    setSessionLatest(value) {
        this.proxy.messageLatest = value;
        if (this.proxy.messageLatest) {
            this.setMessageIndex(this.proxy.messages.length);
        }
    }

    addParticipants(num) {
        let partsAdded = 0;

        // Search through the list of participantIds until one is found for which
        // no participant already exists.
        for (var i=0; i<this.potentialParticipantIds.length; i++) {
            let pId = this.potentialParticipantIds[i];
            let ptcptAlreadyExists = this.participants[pId] !== undefined;

            // No participant already exists, so create one.
            if (!ptcptAlreadyExists) {
                this.addMessage(
                    'participantCreate',
                    pId,
                );
                partsAdded++;

                // Check if enough participants have been created. If yes, exit.
                if (partsAdded >= num) {
                    return;
                }
            }
        }
    }

    getState() {
        return this.loadMessageState(this.proxy.messageIndex);
    }

    setNumParticipants(num) {
        let change = num - Object.keys(this.getState().participants).length;
        if (change > 0) {
            this.addParticipants(change);
        } else if (change < 0) {
            this.removeParticipants(-change);
        }
    }

    removeParticipants(num) {
        const parts = this.getState().participants;
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

    deleteParticipant(pId) {
        delete this.getState().participants[pId];
        this.addMessage(
            'deleteParticipant',
            pId,
        );
    }
    
    createNewParticipant() {
        let i = 0;
        let pId;
        let participant = {};
        while (participant != null) {
            i++;
            pId = 'P' + i;
            participant = this.getState().participants[pId];
        }
        this.addMessage(
            'participantCreate',
            pId,
        );

    }

    isValidPId(pId) {
        return true;
    }

    /**
    * participantCreate - description
    *
    * @param  {type} pId description
    * @return {type}     description
    */
   participantCreate(state, pId) {
        if (!this.isValidPId(pId)) {
            return null;
        }
        var participant = new Participant.new(pId, this);
        state.participants.push(participant.proxy);
    }

    addMessage(name, content) {
        console.log('adding message: ' + name + ', ' + content);
        this.proxy.messages.push({
            id: this.proxy.messages.length + 1,
            name,
            content,
            state: null,
        });
        if (this.proxy.messageLatest) {
            return this.setMessageIndex(this.proxy.messages.length);
        }
    }

    setMessageIndex(index) {
        this.proxy.messageIndex = index;
        this.proxy.state = this.loadMessageState(index-1);
    }

    loadMessageState(index) {

        if (index >= this.proxy.messages.length) {
            console.log('Error: asking for state ' + index + ' when only ' + this.proxy.messages.length + ' messages.');
            return null;
        }

        if (index == -1) {
            return this.initialState;
        }

        if (this.proxy.messages[index].state == null) {
            // Copy of previous state.
            let newState = deepcopy(this.loadMessageState(index-1));
            this.processMessage(newState, this.proxy.messages[index]);
            this.proxy.messages[index].state = newState;
        }

        return this.proxy.messages[index].state;
    }

    processMessage(state, message) {
        debugger;
        // let that = this.__target;
        let func = eval('this["' + message.name + '"]').bind(this);
        func(state, message.content);
    }

    shell() {
        return this.proxyObj;
    }

    shellWithChildren() {
        return this.proxyObj;
    }

    roomId() {
        return 'session_' + this.id;
    }
}

var exports = module.exports = {};
exports.new         = SessionV2;
