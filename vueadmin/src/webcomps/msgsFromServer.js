// INCOMING MESSAGES FROM SERVER
import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import Utils from '@/webcomps/utilsFns.js'
import server from '@/webcomps/msgsToServer.js'
import store from '@/store.js'
const {parse} = require('flatted/cjs');

let findById = Utils.findById
let objLength = Utils.objLength

var msgs = {};

jt.msgs = msgs;

msgs.addSession = function(session) {
  var index = findById(window.vue.$store.state.sessions, session.id);
  if (index === null) {
    window.vue.$store.state.sessions.push(session);
  }
}
msgs.deleteSession = function(id) {
    for (let i in jt.data.sessions) {
        var session = jt.data.sessions[i];
        if (id === session.id) {
            jt.data.sessions.splice(i, 1);
            i--;
            jt.showSessions();
        }
    }
}

msgs.updateAppPreview = function(appPreview) {
    jt.showAppPreview(appPreview);
    store.commit('setValue', {path: 'appPreview', value: appPreview});
}

msgs.reloadApps = function(apps) {
    jt.setApps(apps);
}

msgs.createRoom = function(room) {
    jt.data.rooms.push(room);
    jt.showRoom(room);
}

msgs.dataUpdate = function(dataChanges) {
    for (let i=0; i<dataChanges.length; i++) {
        // eslint-disable-next-line no-unused-vars
        let change = dataChanges[i];
        // let obj = jt.getObject(change.roomId);
        // obj[change.field] = change.value;
    }
}

msgs.createUser = function(user) {
    jt.data.users.push(user);
    this.showUser(user);
}

msgs.createApp = function(app) {
    window.vue.$store.state.appInfos[app.id] = app;
    jt.openApp(app.id);
}

msgs.createQueue = function(queue) {
    // jt.data.queues.push(queue);
    window.vue.$store.state.queues.unshift(queue);
    jt.openQueue(queue);
}

msgs.setSessionId = function(data) {
    window.vue.$store.commit('setSessionId', data.oldId, data.newId);
}

msgs.appSaved = function(app) {
    delete jt.data.appInfos[app.origId];
    jt.data.appInfos[app.id] = app;
    var curId = $('#view-app-id').text();
    if (curId === app.origId) {
        jt.openApp(app.id);
    }
}

msgs.addRoomClient = function(client) {
    var room = jt.getRoom(client.roomId);
    for (var i in room.participants) {
        var part = room.participants[i];
        part.roomId = client.roomId;
        if (part.id === client.pId) {
            part.clients.push(client);
            jt.viewRoomUpdateLabel(part);
            return;
        }
    }
}

msgs.removeRoomClient = function(client) {
    var room = jt.getRoom(client.roomId);
    for (var i in room.participants) {
        var part = room.participants[i];
        if (part.id === client.pId) {
            for (var j in part.clients) {
                var cl = part.clients[j];
                if (cl.id === client.cId) {
                    part.clients.splice(j, 1);
                    jt.viewRoomUpdateLabel(part);
                    return;
                }
            }
        }
    }
}

msgs.openSession = function(session) {

    jt.addLog('Open Session ' + session.id + '.');

    for (let i in jt.participantTimers) {
        clearInterval(jt.participantTimers[i]);
    }

    const prevSession = jt.data.session;
    jt.data.session = session;
    if (objLength(session.participants) === 0 && prevSession !== undefined) {
        server.setNumParticipants(objLength(prevSession.participants));
    }

    if (prevSession !== undefined && prevSession.id !== session.id) {
        server.reloadClients();
    }

    store.commit('setSessionId', session.id);

    store.dispatch('showSessionWindow2', session.id);

    if (session !== undefined) {
        // jt.showPanel("#panel-session-info");
        window.vue.$store.commit('setSession', session);
        jt.sessionSetAutoplay(false);
        jt.viewAllParticipants();
        jt.updateSessionApps();
    }

    // jt.view.updateNumParticipants();
}

msgs.addClient = function(md) {
    if (md.session == null || md.session.id == null) {
        return;
    }
    if (md.pId == null) {
        return;
    }

    let participant = jt.data.session.participants[md.pId];

    if (participant == null) {
        return;
    }

    participant.numClients++;

    $('.participant-' + md.pId + '-numClients').text(participant.numClients);
}

msgs.updateSessionId = function(d) {
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        jt.showSessions();
    }
    if (jt.data.session.id === d.sId) {
        jt.updateSessionUsers();
    }
}

msgs.participantSetAppIndex = function(md) {
    var participant = jt.data.session.participants[md.participantId];
    participant.appIndex = md.appIndex;
    jt.showPlayerCurApp(participant);
}

msgs.participantSetGroupId = function(md) {
    $('.participant-' + jt.safePId(md.participantId) + '-groupId').text(md.groupId);
}

msgs.participantSetPeriodIndex = function(md) {
    var participant = jt.data.session.participants[md.participantId];
    participant.periodIndex = md.periodIndex;
    $('.participant-' + jt.safePId(md.participantId) + '-periodIndex').text(participant.periodIndex+1);
}

msgs.playerSetStageIndex = function(md) {
    try {
        var participant = jt.data.session.participants[md.participantId];
        participant.player.stageIndex = md.stageIndex;
        var app = jt.data.session.apps[participant.appIndex-1];
        if (app == null) {
            return;
        }
        var stage = app.stages[participant.player.stageIndex];
        var stageText = '';
        if (stage !== undefined) {
            stageText = stage.id;
        }
        $('.participant-' + jt.safePId(md.participantId) + '-stageId').text(stageText);
    // eslint-disable-next-line no-empty
    } catch (err) {}
}
msgs.participantSetPlayer = function(md) {
    var participant = jt.data.session.participants[md.participantId];
    participant.player = md.player;
    $('.participant-' + jt.safePId(md.participantId) + '-groupId').text(participant.player.group.id);
}
msgs.playerUpdate = function(player) {
//    var decompId = decomposeId(player.roomId);
//    if (decompId.sessionId === jt.data.session.id) {

    if (typeof player == 'string') {
        player = parse(player);
    }

    if (player.player != null) {
        player = player.player;
    }

    if (player.group.period.app.session.id === jt.data.session.id) {
        // var div = $('tr.participant-' + jt.safePId(player.id));

        // // Re-establish object links.
        // player.participant.session = player.group.period.app.session;
        // if (player.stage !== undefined) {
        //     player.stage.app = player.group.period.app;
        // }
        // player.participant.player = player;

        let participant = player.participant;
        participant.player = player;
        delete player.participant;
        // jt.data.session.participants[player.id] = participant;
        window.vue.$store.commit('setParticipant', participant);

        // jt.setParticipantPlayer(player.id, player, div);
//        $('.participant-' + player.id + '-periodIndex').text(decompId.periodId);
        // $('.participant-' + jt.safePId(player.id) + '-periodIndex').text(player.group.period.id);
    }
}

msgs.refreshAdmin = function(ag) {
    jt.refresh(ag);
}

msgs.sessionAddApp = function(d) {
    if (jt.data.session.id === d.sId) {
        jt.data.session.apps.push(d.app);
        jt.updateSessionApps();
    }
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.appSequence.push(d.app.id);
        session.numApps++;
        jt.showSessions();
    }
};

msgs.sessionAddUser = function(d) {
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        jt.showSessions();
    }
    if (jt.data.session.id === d.sId) {
        jt.updateSessionUsers();
    }
}

msgs.roomAddApp = function(d) {
    var room = jt.getRoom(d.roomId);
    room.apps.push(d.appId);
    jt.viewRoomShowApp(d.appId);
};

msgs.deleteQueue = function(id) {
    for (var i=0; i<jt.data.queues.length; i++) {
        if (jt.data.queues[i].id === id) {
            jt.data.queues.splice(i, 1);
        }
    }
    $('#view-queues-table').find('[queueId="' + id + '"]').remove();
    if ($('#view-queue-id').text() === id) {
        jt.setView('queues');
    }
}

msgs.deleteApp = function(id) {
    delete window.vue.$store.state.appInfos[id];
}

msgs.queueAddApp = function(d) {
    var queue = jt.queue(d.queueId);
    queue.apps.push(d.app);
    jt.viewQueueShowApp(d.app);
};

msgs.sessionSetActive = function(msgData) {
    if (jt.data.session.id === msgData.sId) {
        jt.data.session.active = msgData.active;
        jt.updateSessionActive(jt.data.session);
    }
    var session = findById(jt.data.sessions, msgData.sId);
    if (session !== null) {
        session.active = msgData.active;
        jt.showSessions();
    }
}

msgs.sessionSetRunning = function(msgData) {
    if (jt.data.session.id === msgData.sId) {
        jt.data.session.isRunning = msgData.isRunning;
        jt.updateSessionRunning(jt.data.session);
    }
    var session = findById(jt.data.sessions, msgData.sId);
    if (session !== null) {
        session.canPlay = msgData.canPlay;
        jt.showSessions();
    }
}

msgs.sessionDeleteApp = function(md) {
    if (jt.data.session.id === md.sId &&
        jt.data.session.apps[md.i].id === md.aId) {
            jt.data.session.apps.splice(md.i, 1);
            jt.updateSessionApps();
    }
}

msgs.sessionDeleteParticipant = function(md) {
    if (jt.data.session.id === md.sId) {
        jt.deleteParticipant(md.pId);
        // jt.view.updateNumParticipants();
    }
}

msgs.addParticipant = function(participant) {
    store.commit('setParticipant', participant);
}

msgs.setAllowNewParts = function(md) {
    if (jt.data.session.id === md.sId) {
        jt.data.session.allowNewParts = md.value;
        jt.updateAllowNewParts();
    }
};

msgs.setAllowAdminPlay = function(md) {
    // let session = store.state.openSessions[md.sId];
    // if (session == null) {
    //     return;
    // }
    // session.allowAdminClientsToPlay = md.value;

    store.commit('setValue', {path: 'openSessions["' + md.sId + '"].allowAdminClientsToPlay', value: md.value});
}

msgs.setCaseSensitiveLabels = function(md) {
    if (jt.data.session.id === md.sId) {
        jt.data.session.caseSensitiveLabels = md.value;
        jt.updateCaseSensitiveLabels();
    }
};

export default msgs